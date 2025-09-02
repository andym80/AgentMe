"use server"

import type { NewsItem } from "./types"
import * as cheerio from "cheerio"

// Lista ampliada de medios nacionales e internacionales
const MEDIA_SOURCES = {
  // Medios nacionales
  nacionales: [
    { url: "https://www.clarin.com", name: "Clarín" },
    { url: "https://www.lanacion.com.ar", name: "La Nación" },
    { url: "https://www.infobae.com", name: "Infobae" },
    { url: "https://www.pagina12.com.ar", name: "Página/12" },
    { url: "https://www.ambito.com", name: "Ámbito Financiero" },
    { url: "https://www.perfil.com", name: "Perfil" },
    { url: "https://www.cronista.com", name: "El Cronista" },
    { url: "https://www.telam.com.ar", name: "Télam" },
    { url: "https://www.tiempoar.com.ar", name: "Tiempo Argentino" },
    { url: "https://www.diariopopular.com.ar", name: "Diario Popular" },
  ],
  // Agencias internacionales - Removidas las que tienen protección anti-scraping
  internacionales: [
    { url: "https://www.bbc.com/mundo", name: "BBC Mundo" },
    { url: "https://cnnespanol.cnn.com", name: "CNN en Español" },
    // Reuters removido por bloqueo 401
    { url: "https://www.efe.com/efe/espana/1", name: "EFE" },
    { url: "https://www.dw.com/es/", name: "Deutsche Welle" },
    { url: "https://www.france24.com/es/", name: "France 24" },
    { url: "https://www.elmundo.es", name: "El Mundo" },
    { url: "https://elpais.com", name: "El País" },
    // NYT y WP removidos por posibles bloqueos
  ],
}

// Función para determinar la categoría de una noticia basada en palabras clave
function determineCategory(title: string, url: string): string {
  title = title.toLowerCase()
  url = url.toLowerCase()

  // Mapeo de palabras clave a categorías
  const categoryKeywords = {
    politics: ["política", "gobierno", "congreso", "diputados", "senadores", "presidente", "elecciones"],
    nacional: ["argentina", "nacional", "país", "nación"],
    provincial: ["provincia", "gobernador", "provincial"],
    municipal: ["municipio", "intendente", "municipal", "ciudad"],
    local: ["barrio", "vecinos", "local", "comunidad"],
    business: ["economía", "empresas", "negocios", "mercado", "bolsa", "acciones", "finanzas"],
    economy: ["inflación", "dólar", "peso", "banco central", "impuestos", "fiscal"],
    technology: ["tecnología", "digital", "internet", "app", "aplicación", "software", "inteligencia artificial"],
    health: ["salud", "hospital", "médicos", "enfermedad", "pandemia", "virus", "vacuna"],
    environment: ["ambiente", "clima", "contaminación", "ecología", "sustentable", "verde"],
    education: ["educación", "escuela", "universidad", "estudiantes", "docentes"],
    security: ["seguridad", "policía", "crimen", "delito", "inseguridad"],
  }

  // Verificar categoría por palabras clave en el título
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => title.includes(keyword))) {
      return category
    }
  }

  // Verificar categoría por sección en la URL
  const urlSections = {
    politics: ["politica", "gobierno", "poder", "elecciones"],
    business: ["economia", "negocios", "finanzas", "mercados"],
    technology: ["tecnologia", "tech", "digital"],
    health: ["salud", "bienestar", "medicina"],
    environment: ["ambiente", "ecologia", "sustentabilidad"],
    education: ["educacion", "universidad", "escuela"],
    security: ["seguridad", "policia", "crimen"],
  }

  for (const [category, sections] of Object.entries(urlSections)) {
    if (sections.some((section) => url.includes(`/${section}/`) || url.includes(`/${section}`))) {
      return category
    }
  }

  // Categoría por defecto
  return "news"
}

// Función para extraer el texto de resumen de un artículo
function extractSummary($: cheerio.CheerioAPI, el: cheerio.Element): string {
  // Intentar diferentes selectores para encontrar el resumen
  const selectors = [
    "p.summary",
    "p.lead",
    "p.description",
    "p.intro",
    "p.excerpt",
    "div.summary",
    "div.lead",
    "div.description",
    "div.intro",
    "h2.summary",
    "h2.lead",
    "h2.description",
    "h2.intro",
    "meta[name='description']",
    "meta[property='og:description']",
  ]

  for (const selector of selectors) {
    const summary =
      $(el).find(selector).first().text().trim() || $(selector).first().text().trim() || $(selector).attr("content")

    if (summary && summary.length > 10) {
      return summary
    }
  }

  // Si no se encuentra un resumen específico, usar el primer párrafo
  const firstParagraph =
    $(el).find("p").first().text().trim() ||
    $("article p").first().text().trim() ||
    $("div.content p").first().text().trim()

  if (firstParagraph && firstParagraph.length > 10) {
    return firstParagraph
  }

  return "No hay resumen disponible"
}

// Función para validar una URL
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (e) {
    return false
  }
}

// Función para intentar una solicitud fetch con reintentos
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Si no es el primer intento, esperar antes de reintentar
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)) // Espera exponencial
      }

      const response = await fetch(url, options)

      // Si la respuesta no es exitosa, lanzar un error
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`Intento ${attempt + 1}/${maxRetries + 1} fallido para ${url}: ${lastError.message}`)
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${maxRetries + 1} attempts`)
}

export async function scrapeWebsite(url: string): Promise<NewsItem[]> {
  try {
    // Validar que la URL sea válida
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    // Verificar si la URL es válida después de la corrección
    if (!isValidUrl(url)) {
      throw new Error(`URL inválida: ${url}`)
    }

    // Configuración mejorada para evitar detección de bots
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    }

    // Intentar obtener el contenido con un timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // Aumentado a 15 segundos

    try {
      // Usar fetchWithRetry en lugar de fetch directamente
      const response = await fetchWithRetry(
        url,
        {
          headers,
          signal: controller.signal,
          next: { revalidate: 3600 }, // Revalidar cada hora
        },
        2, // Máximo 2 reintentos
      )

      clearTimeout(timeoutId)

      const html = await response.text()
      const $ = cheerio.load(html)
      const results: NewsItem[] = []

      // Obtener el dominio base para URLs relativas
      const baseUrl = new URL(url).origin
      const domain = new URL(url).hostname.replace("www.", "")

      // Selectores comunes para artículos de noticias
      const articleSelectors = [
        "article",
        ".article",
        ".news-item",
        ".story",
        ".post",
        ".nota",
        ".entry",
        ".card",
        ".item",
        ".noticia",
        "div[class*='article']",
        "div[class*='news']",
        "div[class*='post']",
        "div[class*='nota']",
        "div[class*='card']",
        "div[class*='item']",
      ]

      // Buscar artículos usando diferentes selectores
      let articles: cheerio.Cheerio<cheerio.Element> = $()

      for (const selector of articleSelectors) {
        const found = $(selector)
        if (found.length > 0) {
          articles = found
          break
        }
      }

      // Si no se encontraron artículos con los selectores comunes, intentar con selectores específicos
      if (articles.length === 0) {
        if (domain.includes("clarin")) {
          articles = $(".content-nota, .nota")
        } else if (domain.includes("lanacion")) {
          articles = $(".mod-article, .com-note")
        } else if (domain.includes("infobae")) {
          articles = $(".article, .nota, .card")
        } else if (domain.includes("pagina12")) {
          articles = $(".article-inner, .article-title")
        } else if (domain.includes("ambito")) {
          articles = $(".article-box, .nota")
        } else if (domain.includes("perfil")) {
          articles = $(".article-box, .card-article")
        } else if (domain.includes("telam")) {
          articles = $(".article-item, .nota")
        } else if (domain.includes("bbc")) {
          articles = $(".bbc-1fxtbkn, .gs-c-promo")
        } else if (domain.includes("cnn")) {
          articles = $(".news__item, .card, .story")
        } else if (domain.includes("efe")) {
          articles = $(".efe-news-item, .article")
        } else if (domain.includes("dw.com")) {
          articles = $(".news-teaser, .penta--teaser")
        } else if (domain.includes("france24")) {
          articles = $(".o-layout-list__item, .article")
        } else if (domain.includes("elmundo")) {
          articles = $(".ue-c-cover-content, .articulo__interior")
        } else if (domain.includes("elpais")) {
          articles = $(".c_a, .articulo")
        } else {
          // Último recurso: buscar elementos que contengan títulos y enlaces
          articles = $("div:has(h1), div:has(h2), div:has(h3), div:has(a)").filter(function () {
            return $(this).find("a").length > 0 && $(this).text().trim().length > 30
          })
        }
      }

      // Si aún no se encuentran artículos, intentar con selectores más genéricos
      if (articles.length === 0) {
        articles = $("div").filter(function () {
          const text = $(this).text().trim()
          return text.length > 100 && text.length < 1000 && $(this).find("a, h1, h2, h3, h4, h5").length > 0
        })
      }

      // Limitar el número de artículos a procesar para evitar sobrecarga
      const maxArticles = 20
      let processedCount = 0

      // Procesar los artículos encontrados
      articles.each((i, el) => {
        if (processedCount >= maxArticles) return false // Salir del bucle después de procesar maxArticles

        // Buscar título en diferentes elementos
        const titleSelectors = [
          "h1",
          "h2",
          "h3",
          "h4",
          ".title",
          ".headline",
          "[class*='title']",
          "[class*='headline']",
        ]
        let title = ""

        for (const selector of titleSelectors) {
          title = $(el).find(selector).first().text().trim()
          if (title) break
        }

        if (!title) return // Sin título, no es un artículo válido

        // Buscar enlace
        let articleUrl = ""
        const linkElement = $(el).find("a").first()

        if (linkElement.length) {
          articleUrl = linkElement.attr("href") || ""
        } else {
          // Buscar enlaces que contengan el título
          $("a").each((_, link) => {
            if ($(link).text().includes(title.substring(0, 20))) {
              articleUrl = $(link).attr("href") || ""
              return false // Salir del bucle
            }
          })
        }

        // Convertir URLs relativas a absolutas
        if (articleUrl && !articleUrl.startsWith("http")) {
          if (articleUrl.startsWith("/")) {
            articleUrl = baseUrl + articleUrl
          } else {
            articleUrl = baseUrl + "/" + articleUrl
          }
        }

        // Extraer resumen
        const summary = extractSummary($, el)

        // Determinar categoría
        const category = determineCategory(title, articleUrl)

        // Crear objeto de noticia
        if (title && (summary || articleUrl)) {
          results.push({
            title,
            summary: summary || "No summary available",
            url: articleUrl,
            source: domain,
            category,
            publishedAt: new Date().toISOString(),
            acceptance: {
              positive: 50 + Math.floor(Math.random() * 30),
              neutral: 20 + Math.floor(Math.random() * 20),
              negative: 10 + Math.floor(Math.random() * 20),
            },
            shareMetrics: {
              total: Math.floor(Math.random() * 10000),
              facebook: Math.floor(Math.random() * 5000),
              twitter: Math.floor(Math.random() * 3000),
              whatsapp: Math.floor(Math.random() * 2000),
              other: Math.floor(Math.random() * 1000),
            },
          })

          processedCount++
        }
      })

      // Si no se encontraron artículos, generar un mensaje de error informativo
      if (results.length === 0) {
        console.warn(`No se encontraron artículos en ${url}. Posiblemente el sitio tiene protección anti-scraping.`)
        // Devolver un artículo simulado para evitar errores
        return [
          {
            title: `No se pudieron extraer noticias de ${domain}`,
            summary:
              "El sitio web podría tener protección contra scraping o su estructura no es compatible con nuestro extractor.",
            url: url,
            source: domain,
            category: "news",
            publishedAt: new Date().toISOString(),
            acceptance: {
              positive: 0,
              neutral: 100,
              negative: 0,
            },
            shareMetrics: {
              total: 0,
              facebook: 0,
              twitter: 0,
              whatsapp: 0,
              other: 0,
            },
          },
        ]
      }

      return results
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    // Mejorar el mensaje de error para facilitar la depuración
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Error scraping website ${url}: ${errorMessage}`)

    // Devolver un artículo de error para evitar que la aplicación se rompa
    return [
      {
        title: `Error al obtener noticias`,
        summary: `No se pudo acceder a la fuente de noticias. Error: ${errorMessage}`,
        url: url,
        source: new URL(url).hostname.replace("www.", ""),
        category: "error",
        publishedAt: new Date().toISOString(),
        acceptance: {
          positive: 0,
          neutral: 100,
          negative: 0,
        },
        shareMetrics: {
          total: 0,
          facebook: 0,
          twitter: 0,
          whatsapp: 0,
          other: 0,
        },
      },
    ]
  }
}

// Función para obtener noticias de múltiples fuentes
export async function scrapeMultipleSources(
  type: "nacionales" | "internacionales" | "all" = "all",
): Promise<NewsItem[]> {
  const sources = type === "all" ? [...MEDIA_SOURCES.nacionales, ...MEDIA_SOURCES.internacionales] : MEDIA_SOURCES[type]

  const allNews: NewsItem[] = []
  let successfulSources = 0
  let failedSources = 0

  // Limitar el número de fuentes para evitar sobrecargar el servidor
  const limitedSources = sources.slice(0, 5) // Limitar a 5 fuentes por solicitud

  // Usar Promise.allSettled para manejar errores individuales sin detener todo el proceso
  const results = await Promise.allSettled(limitedSources.map((source) => scrapeWebsite(source.url)))

  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.length > 0) {
      // Filtrar artículos de error
      const validNews = result.value.filter((news) => news.category !== "error")
      if (validNews.length > 0) {
        allNews.push(...validNews)
        successfulSources++
      } else {
        failedSources++
      }
    } else {
      console.warn(
        `Error scraping ${limitedSources[index].name}: ${
          result.status === "rejected" ? result.reason : "No se encontraron noticias"
        }`,
      )
      failedSources++
    }
  })

  console.log(`Scraping completado: ${successfulSources} fuentes exitosas, ${failedSources} fallidas`)

  // Si no se obtuvieron noticias de ninguna fuente, intentar con noticias simuladas
  if (allNews.length === 0) {
    return generateMockNews(10)
  }

  return allNews
}

// Función para generar noticias simuladas en caso de que todas las fuentes fallen
function generateMockNews(count: number): NewsItem[] {
  const mockNews: NewsItem[] = []
  const categories = ["politics", "economy", "technology", "health", "environment", "education", "security", "nacional"]
  const sources = ["simulado.news", "mock.media", "ejemplo.press", "demo.noticias"]

  const mockTitles = [
    "El gobierno anuncia nuevas medidas económicas",
    "Avances en tecnología de energías renovables",
    "Debate sobre reforma educativa en el Congreso",
    "Nuevas políticas de seguridad en las principales ciudades",
    "Impacto de la inflación en la economía familiar",
    "Desarrollos en inteligencia artificial prometen revolucionar la industria",
    "Crisis climática: expertos advierten sobre consecuencias",
    "Elecciones: los candidatos presentan sus propuestas",
    "Avances en tratamientos médicos para enfermedades crónicas",
    "Debate sobre políticas fiscales y su impacto en el crecimiento",
  ]

  for (let i = 0; i < count; i++) {
    const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)]
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const randomSource = sources[Math.floor(Math.random() * sources.length)]

    mockNews.push({
      title: randomTitle,
      summary: `Este es un resumen simulado para la noticia "${randomTitle}". Se genera automáticamente cuando no es posible obtener noticias reales de las fuentes configuradas.`,
      url: "https://ejemplo.com/noticia-simulada",
      source: randomSource,
      category: randomCategory,
      publishedAt: new Date().toISOString(),
      acceptance: {
        positive: 50 + Math.floor(Math.random() * 30),
        neutral: 20 + Math.floor(Math.random() * 20),
        negative: 10 + Math.floor(Math.random() * 20),
      },
      shareMetrics: {
        total: Math.floor(Math.random() * 10000),
        facebook: Math.floor(Math.random() * 5000),
        twitter: Math.floor(Math.random() * 3000),
        whatsapp: Math.floor(Math.random() * 2000),
        other: Math.floor(Math.random() * 1000),
      },
    })
  }

  return mockNews
}
