"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Globe } from "lucide-react"
import type { NewsItem } from "@/lib/types"
import { fetchNews } from "@/lib/news-service" // Corregido: fetchNews en lugar de fetchLatestNews
import { scrapeWebsite } from "@/lib/scrape-action"

interface NewsSelectorProps {
  onSelectNews: (news: NewsItem[]) => void
  selectedNews: NewsItem[]
}

export default function NewsSelector({ onSelectNews, selectedNews }: NewsSelectorProps) {
  const [availableNews, setAvailableNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [scrapeUrl, setScrapeUrl] = useState("")
  const [isScraping, setIsScraping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar noticias al montar el componente
  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Corregido: Usar fetchNews en lugar de fetchLatestNews
      const news = await fetchNews(category === "all" ? "politics" : category)
      setAvailableNews(news)
    } catch (err) {
      console.error("Error al cargar noticias:", err)
      setError("Error al cargar noticias. Por favor, inténtalo de nuevo.")
      // Cargar noticias de ejemplo si falla la carga
      setAvailableNews(getMockNews())
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar noticias cuando cambia la categoría
  useEffect(() => {
    if (category !== "all" && category !== "scraped") {
      loadNews()
    }
  }, [category])

  const handleScrape = async () => {
    if (!scrapeUrl) {
      setError("Por favor, ingresa una URL para hacer scraping")
      return
    }

    setIsScraping(true)
    setError(null)
    try {
      const scrapedContent = await scrapeWebsite(scrapeUrl)

      if (scrapedContent && scrapedContent.title) {
        const newItem: NewsItem = {
          id: `scraped-${Date.now()}`,
          title: scrapedContent.title,
          summary: scrapedContent.content,
          source: new URL(scrapeUrl).hostname,
          category: "scraped",
          publishedAt: new Date().toISOString(),
          url: scrapeUrl,
          acceptance: { positive: 50, neutral: 30, negative: 20 },
          shareMetrics: { total: 0, facebook: 0, twitter: 0, whatsapp: 0, other: 0 },
        }

        setAvailableNews((prev) => [newItem, ...prev])
        setScrapeUrl("")
      } else {
        setError("No se pudo extraer contenido de la URL proporcionada")
      }
    } catch (err) {
      console.error("Error al hacer scraping:", err)
      setError("Error al hacer scraping. Verifica la URL e inténtalo de nuevo.")
    } finally {
      setIsScraping(false)
    }
  }

  const handleSelectNews = (news: NewsItem) => {
    // Usar title como identificador único ya que algunas noticias podrían no tener id
    const isSelected = selectedNews.some((item) => item.title === news.title)

    if (isSelected) {
      onSelectNews(selectedNews.filter((item) => item.title !== news.title))
    } else {
      onSelectNews([...selectedNews, news])
    }
  }

  const filteredNews = availableNews.filter((news) => {
    const matchesSearch =
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (news.summary || "").toLowerCase().includes(searchTerm.toLowerCase())

    // Si la categoría es "all", mostrar todas; si es "scraped", mostrar solo las de scraping
    const matchesCategory =
      category === "all" || (category === "scraped" ? news.category === "scraped" : news.category === category)

    return matchesSearch && matchesCategory
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selección de Noticias</CardTitle>
        <CardDescription>Selecciona noticias para analizar o haz scraping de un sitio web</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <select className="p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Todas las categorías</option>
            <option value="politics">Política</option>
            <option value="business">Economía</option>
            <option value="technology">Tecnología</option>
            <option value="health">Salud</option>
            <option value="environment">Medio Ambiente</option>
            <option value="nacional">Nacional</option>
            <option value="provincial">Provincial</option>
            <option value="municipal">Municipal</option>
            <option value="local">Local</option>
            <option value="scraped">Scraping</option>
          </select>
          <Button onClick={loadNews} disabled={isLoading} variant="outline" size="icon">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="scrape-url" className="block text-sm font-medium text-gray-700 mb-1">
              URL para scraping
            </label>
            <Input
              id="scrape-url"
              placeholder="https://ejemplo.com/noticia"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl}>
            {isScraping ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Obtener Contenido
              </>
            )}
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredNews.map((news, index) => (
            <div
              key={index}
              className={`border rounded p-3 cursor-pointer transition-colors ${
                selectedNews.some((item) => item.title === news.title)
                  ? "bg-blue-50 border-blue-300"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelectNews(news)}
            >
              <h3 className="font-medium text-sm">{news.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{news.summary || "Sin descripción"}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{news.category || "Sin categoría"}</span>
                <span className="text-xs text-gray-500">{news.source || "Fuente desconocida"}</span>
              </div>
            </div>
          ))}

          {filteredNews.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No se encontraron noticias que coincidan con tu búsqueda
            </div>
          )}

          {isLoading && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Cargando noticias...
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-gray-500">
          {selectedNews.length} {selectedNews.length === 1 ? "noticia seleccionada" : "noticias seleccionadas"}
        </div>
      </CardFooter>
    </Card>
  )
}

// Función para obtener noticias de ejemplo si falla la carga
function getMockNews(): NewsItem[] {
  return [
    {
      title: "El gobierno anuncia nuevas medidas económicas",
      summary:
        "El Ministerio de Economía presentó un paquete de medidas para controlar la inflación y estabilizar la moneda.",
      source: "Clarín",
      category: "business",
      publishedAt: new Date().toISOString(),
      url: "https://example.com/news/1",
      acceptance: { positive: 45, neutral: 30, negative: 25 },
      shareMetrics: { total: 1200, facebook: 500, twitter: 300, whatsapp: 350, other: 50 },
    },
    {
      title: "Debate en el Congreso sobre la reforma judicial",
      summary: "Diputados y senadores debaten los puntos clave de la reforma judicial propuesta por el Ejecutivo.",
      source: "La Nación",
      category: "politics",
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      url: "https://example.com/news/2",
      acceptance: { positive: 38, neutral: 42, negative: 20 },
      shareMetrics: { total: 2500, facebook: 1200, twitter: 800, whatsapp: 400, other: 100 },
    },
    {
      title: "Tensiones diplomáticas con países vecinos",
      summary:
        "El canciller se reunió con embajadores para discutir las recientes tensiones diplomáticas en la región.",
      source: "Infobae",
      category: "politics",
      publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
      url: "https://example.com/news/3",
      acceptance: { positive: 30, neutral: 35, negative: 35 },
      shareMetrics: { total: 1800, facebook: 700, twitter: 600, whatsapp: 450, other: 50 },
    },
    {
      title: "Avances en tecnología de energías renovables",
      summary:
        "Investigadores argentinos desarrollaron un nuevo sistema de almacenamiento de energía solar más eficiente.",
      source: "Ámbito",
      category: "technology",
      publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
      url: "https://example.com/news/4",
      acceptance: { positive: 75, neutral: 20, negative: 5 },
      shareMetrics: { total: 3200, facebook: 1500, twitter: 1000, whatsapp: 600, other: 100 },
    },
    {
      title: "Protestas por aumento de tarifas en transporte público",
      summary: "Organizaciones sociales y sindicatos convocaron a una manifestación contra el aumento de tarifas.",
      source: "Página 12",
      category: "politics",
      publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 días atrás
      url: "https://example.com/news/5",
      acceptance: { positive: 25, neutral: 30, negative: 45 },
      shareMetrics: { total: 4500, facebook: 2000, twitter: 1500, whatsapp: 800, other: 200 },
    },
  ]
}
