"use server"

import type { NewsItem } from "./types"

// Función para obtener noticias de un sitio web
export async function scrapeWebsite(url: string): Promise<NewsItem[]> {
  try {
    // En una implementación real, aquí usaríamos una biblioteca de web scraping
    // o un servicio de terceros para extraer noticias del sitio web proporcionado

    // Para esta demostración, devolvemos datos simulados basados en el sitio web
    const mockNews: NewsItem[] = generateMockNews(url)

    return mockNews
  } catch (error) {
    console.error(`Error al hacer scraping de ${url}:`, error)
    throw new Error(
      `No se pudo hacer scraping del sitio web: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// Función para generar noticias simuladas basadas en el sitio web
function generateMockNews(url: string): NewsItem[] {
  const now = new Date()
  const mockNews: NewsItem[] = []

  // Determinar el nombre del sitio basado en la URL
  let siteName = "Noticias"
  if (url.includes("clarin")) {
    siteName = "Clarín"
  } else if (url.includes("lanacion")) {
    siteName = "La Nación"
  } else if (url.includes("infobae")) {
    siteName = "Infobae"
  } else if (url.includes("pagina12")) {
    siteName = "Página 12"
  } else if (url.includes("ambito")) {
    siteName = "Ámbito Financiero"
  } else if (url.includes("perfil")) {
    siteName = "Perfil"
  }

  // Generar categorías comunes en noticias argentinas
  const categories = ["política", "economía", "sociedad", "internacional", "deportes", "cultura", "tecnología"]

  // Títulos de noticias simuladas por categoría
  const newsTitles = {
    política: [
      "El Gobierno anunció nuevas medidas económicas",
      "La oposición criticó el proyecto de ley del oficialismo",
      "Tensión en el Congreso por el debate del presupuesto",
      "El Presidente se reunió con gobernadores para discutir la coparticipación",
      "Polémica por declaraciones del ministro sobre la inflación",
      "Diputados aprobó la ley de reforma judicial",
      "El oficialismo busca consenso para aprobar el paquete fiscal",
      "La Corte Suprema falló contra el decreto presidencial",
    ],
    economía: [
      "La inflación alcanzó el 5% mensual según el INDEC",
      "El dólar blue subió y amplió la brecha con el oficial",
      "El FMI aprobó el desembolso para Argentina",
      "Empresarios advierten sobre el impacto de las nuevas regulaciones",
      "El Banco Central modificó la política cambiaria",
      "Récord de emisión monetaria en el último trimestre",
      "Caen las reservas internacionales por intervención en el mercado",
      "Anuncian plan de incentivos para pequeñas y medianas empresas",
    ],
    sociedad: [
      "Protestas en el centro porteño por aumento de tarifas",
      "Gremios docentes anunciaron un paro nacional",
      "Polémica por el protocolo de regreso a clases presenciales",
      "Organizaciones sociales reclaman mayor asistencia alimentaria",
      "Aumenta la preocupación por la inseguridad en el conurbano",
      "Récord de contagios en la última semana",
      "Controversia por la implementación del nuevo DNI digital",
      "Jubilados marcharon en reclamo de mejoras en las pensiones",
    ],
    internacional: [
      "Tensión diplomática entre Argentina y países vecinos",
      "El presidente participará en la cumbre del G20",
      "Crisis política en Brasil impacta en la economía regional",
      "Argentina firmó acuerdo comercial con China",
      "Preocupación por el conflicto en Ucrania y su impacto global",
      "La ONU criticó políticas migratorias restrictivas",
      "Elecciones en Estados Unidos: posibles consecuencias para Latinoamérica",
      "Mercosur en crisis: diferencias entre los países miembros",
    ],
    deportes: [
      "La selección argentina se prepara para las eliminatorias",
      "River derrotó a Boca en un superclásico vibrante",
      "Polémica arbitral en el torneo de la Liga Profesional",
      "Atleta argentino consiguió medalla en competencia internacional",
      "El técnico de la selección anunció la lista de convocados",
      "Escándalo en el fútbol por denuncias de amaño de partidos",
      "Tenista argentino avanzó a semifinales del Grand Slam",
      "Debate sobre la privatización de los clubes de fútbol",
    ],
    cultura: [
      "Película argentina nominada a los premios Oscar",
      "Polémica por los recortes en el presupuesto cultural",
      "Exitoso festival de cine independiente en Buenos Aires",
      "Artista argentino expone su obra en prestigioso museo internacional",
      "Debate sobre la ley de mecenazgo cultural",
      "Récord de asistencia en la Feria del Libro",
      "Falleció reconocido escritor argentino",
      "Controversia por la restauración de monumento histórico",
    ],
    tecnología: [
      "Argentina lanzó su primer satélite de comunicaciones",
      "Polémica por la regulación de criptomonedas",
      "Empresas tecnológicas anuncian inversiones en el país",
      "Debate sobre la privacidad de datos en redes sociales",
      "El Gobierno presentó plan de desarrollo tecnológico",
      "Aumenta el comercio electrónico en Argentina",
      "Preocupación por ciberataques a instituciones públicas",
      "Nueva ley de economía del conocimiento genera expectativas",
    ],
  }

  // Generar entre 5 y 15 noticias aleatorias
  const newsCount = Math.floor(Math.random() * 10) + 5

  for (let i = 0; i < newsCount; i++) {
    // Seleccionar una categoría aleatoria
    const category = categories[Math.floor(Math.random() * categories.length)]

    // Seleccionar un título aleatorio de la categoría
    const titles = newsTitles[category as keyof typeof newsTitles]
    const title = titles[Math.floor(Math.random() * titles.length)]

    // Generar una fecha aleatoria en las últimas 24 horas
    const hoursAgo = Math.floor(Math.random() * 24)
    const publishedAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString()

    // Generar un resumen aleatorio
    const summary = `Este es un resumen simulado de la noticia sobre ${category}. La información completa estaría disponible en el sitio web original.`

    // Crear el objeto de noticia
    const newsItem: NewsItem = {
      title,
      source: siteName,
      url: `${url}/noticias/${category}/${i}`,
      summary,
      category,
      publishedAt,
    }

    mockNews.push(newsItem)
  }

  return mockNews
}
