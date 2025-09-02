"use client"

import { useMemo, useState, useCallback } from "react"
import { FixedSizeList as List } from "react-window"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar, ExternalLink } from "lucide-react"
import type { NewsItem } from "@/lib/types"

interface VirtualizedNewsListProps {
  newsItems: NewsItem[]
  onSelectNews: (news: NewsItem) => void
  selectedNews: NewsItem[]
  height?: number
  itemHeight?: number
}

// Componente individual de noticia optimizado
const NewsItemComponent = ({ index, style, data }: any) => {
  const { newsItems, onSelectNews, selectedNews } = data
  const news = newsItems[index]
  const isSelected = selectedNews.some((item: NewsItem) => item.title === news.title)

  const handleClick = useCallback(() => {
    onSelectNews(news)
  }, [news, onSelectNews])

  return (
    <div style={style}>
      <Card
        className={`m-2 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-sm line-clamp-2 flex-1 mr-2">{news.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {news.legislativeInfo?.isLegislative && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">Ley</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {news.category}
              </Badge>
            </div>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{news.summary || "Sin descripción disponible"}</p>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>{news.source}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(news.publishedAt).toLocaleDateString()}
              </span>
            </div>

            {news.url && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Métricas de aceptación si están disponibles */}
          {news.acceptance && (
            <div className="mt-2 flex gap-1">
              <div className="flex-1 bg-green-100 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${news.acceptance.positive}%` }} />
              </div>
              <div className="flex-1 bg-yellow-100 rounded-full h-1">
                <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${news.acceptance.neutral}%` }} />
              </div>
              <div className="flex-1 bg-red-100 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full" style={{ width: `${news.acceptance.negative}%` }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VirtualizedNewsList({
  newsItems,
  onSelectNews,
  selectedNews,
  height = 600,
  itemHeight = 180,
}: VirtualizedNewsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "relevance" | "title">("date")

  // Filtrar y ordenar noticias
  const filteredAndSortedNews = useMemo(() => {
    const filtered = newsItems.filter((news) => {
      const matchesSearch =
        searchTerm === "" ||
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (news.summary || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.source.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || news.category === categoryFilter

      return matchesSearch && matchesCategory
    })

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "relevance":
          // Ordenar por relevancia (noticias legislativas primero, luego por aceptación)
          if (a.legislativeInfo?.isLegislative && !b.legislativeInfo?.isLegislative) return -1
          if (!a.legislativeInfo?.isLegislative && b.legislativeInfo?.isLegislative) return 1

          const aAcceptance = a.acceptance?.positive || 0
          const bAcceptance = b.acceptance?.positive || 0
          return bAcceptance - aAcceptance
        default:
          return 0
      }
    })

    return filtered
  }, [newsItems, searchTerm, categoryFilter, sortBy])

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = Array.from(new Set(newsItems.map((news) => news.category)))
    return cats.sort()
  }, [newsItems])

  // Datos para el componente virtualizado
  const itemData = {
    newsItems: filteredAndSortedNews,
    onSelectNews,
    selectedNews,
  }

  return (
    <div className="space-y-4">
      {/* Controles de filtrado y búsqueda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Explorar Noticias ({filteredAndSortedNews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título, contenido o fuente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Categoría:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "relevance" | "title")}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="date">Fecha</option>
                <option value="relevance">Relevancia</option>
                <option value="title">Título</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              <strong>{selectedNews.length}</strong> seleccionadas
            </span>
            <span>
              <strong>{filteredAndSortedNews.filter((n) => n.legislativeInfo?.isLegislative).length}</strong> leyes
            </span>
            <span>
              <strong>{categories.length}</strong> categorías
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lista virtualizada */}
      <Card>
        <CardContent className="p-0">
          {filteredAndSortedNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Search className="h-12 w-12 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No se encontraron noticias</h3>
              <p className="text-sm text-center max-w-md">
                {searchTerm || categoryFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay noticias disponibles en este momento"}
              </p>
            </div>
          ) : (
            <List
              height={height}
              itemCount={filteredAndSortedNews.length}
              itemSize={itemHeight}
              itemData={itemData}
              overscanCount={5} // Renderizar 5 elementos adicionales fuera de la vista
            >
              {NewsItemComponent}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      {selectedNews.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{selectedNews.length} noticias seleccionadas</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => selectedNews.forEach(onSelectNews)}>
                  Deseleccionar todas
                </Button>
                <Button size="sm">Generar análisis</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
