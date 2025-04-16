"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ThumbsUp, ThumbsDown, Share2, BarChart2, GitCompare, Info, FileText, Radio } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import IdeologicalSolutions from "./ideological-solutions"
import LegislativeDebate from "./legislative-debate"

interface NewsCardProps {
  newsItem: NewsItem
  selectedParty?: PoliticalParty
}

export default function NewsCard({ newsItem, selectedParty }: NewsCardProps) {
  // Asegurarse de que la URL sea válida
  const hasValidUrl = newsItem.url && (newsItem.url.startsWith("http://") || newsItem.url.startsWith("https://"))
  const [showMetrics, setShowMetrics] = useState(false)
  const [showIdeologicalSolutions, setShowIdeologicalSolutions] = useState(false)
  const [showContext, setShowContext] = useState(false)

  // Verificar si la noticia tiene información legislativa
  const hasLegislativeInfo = newsItem.legislativeInfo?.isLegislative

  // Asegurarse de que las métricas existan
  const acceptance = newsItem.acceptance || { positive: 50, neutral: 30, negative: 20 }
  const shareMetrics = newsItem.shareMetrics || { total: 0, facebook: 0, twitter: 0, whatsapp: 0, other: 0 }

  // Formatear números grandes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    } else {
      return num.toString()
    }
  }

  // Obtener el color para la subcategoría
  const getSubcategoryColor = (subcategory?: string): string => {
    if (!subcategory) return "bg-gray-100 text-gray-800"

    const colors: Record<string, string> = {
      legislative: "bg-amber-100 text-amber-800",
      executive: "bg-blue-100 text-blue-800",
      judicial: "bg-indigo-100 text-indigo-800",
      electoral: "bg-purple-100 text-purple-800",
      diplomatic: "bg-cyan-100 text-cyan-800",
      economic_policy: "bg-green-100 text-green-800",
      fiscal: "bg-emerald-100 text-emerald-800",
      monetary: "bg-teal-100 text-teal-800",
      labor: "bg-lime-100 text-lime-800",
      markets: "bg-yellow-100 text-yellow-800",
      companies: "bg-orange-100 text-orange-800",
      innovation: "bg-rose-100 text-rose-800",
      digital: "bg-fuchsia-100 text-fuchsia-800",
      scientific: "bg-violet-100 text-violet-800",
      public_health: "bg-red-100 text-red-800",
      healthcare: "bg-pink-100 text-pink-800",
      climate: "bg-sky-100 text-sky-800",
      conservation: "bg-green-100 text-green-800",
      pollution: "bg-slate-100 text-slate-800",
      infrastructure: "bg-zinc-100 text-zinc-800",
      housing: "bg-stone-100 text-stone-800",
      transportation: "bg-neutral-100 text-neutral-800",
      other: "bg-gray-100 text-gray-800",
    }

    return colors[subcategory] || "bg-gray-100 text-gray-800"
  }

  // Obtener el color para el tipo de noticia
  const getNewsTypeColor = (newsType?: string): string => {
    if (!newsType) return "bg-gray-100 text-gray-800"

    const colors: Record<string, string> = {
      breaking: "bg-red-100 text-red-800",
      developing: "bg-orange-100 text-orange-800",
      analysis: "bg-blue-100 text-blue-800",
      opinion: "bg-purple-100 text-purple-800",
      interview: "bg-indigo-100 text-indigo-800",
      report: "bg-green-100 text-green-800",
      investigation: "bg-amber-100 text-amber-800",
      announcement: "bg-cyan-100 text-cyan-800",
      statement: "bg-teal-100 text-teal-800",
      other: "bg-gray-100 text-gray-800",
    }

    return colors[newsType] || "bg-gray-100 text-gray-800"
  }

  // Obtener el nombre legible de la subcategoría
  const getSubcategoryName = (subcategory?: string): string => {
    if (!subcategory) return "Otro"

    const names: Record<string, string> = {
      legislative: "Legislativo",
      executive: "Ejecutivo",
      judicial: "Judicial",
      electoral: "Electoral",
      diplomatic: "Diplomático",
      economic_policy: "Política Económica",
      fiscal: "Fiscal",
      monetary: "Monetario",
      labor: "Laboral",
      markets: "Mercados",
      companies: "Empresas",
      innovation: "Innovación",
      digital: "Digital",
      scientific: "Científico",
      public_health: "Salud Pública",
      healthcare: "Sistema de Salud",
      climate: "Clima",
      conservation: "Conservación",
      pollution: "Contaminación",
      infrastructure: "Infraestructura",
      housing: "Vivienda",
      transportation: "Transporte",
      other: "Otro",
    }

    return names[subcategory] || "Otro"
  }

  // Obtener el nombre legible del tipo de noticia
  const getNewsTypeName = (newsType?: string): string => {
    if (!newsType) return "Estándar"

    const names: Record<string, string> = {
      breaking: "Última Hora",
      developing: "En Desarrollo",
      analysis: "Análisis",
      opinion: "Opinión",
      interview: "Entrevista",
      report: "Reportaje",
      investigation: "Investigación",
      announcement: "Anuncio",
      statement: "Declaración",
      other: "Estándar",
    }

    return names[newsType] || "Estándar"
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Mostrar el debate legislativo en la parte superior si la noticia es legislativa */}
      {hasLegislativeInfo && <LegislativeDebate newsItem={newsItem} />}

      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg">{newsItem.title}</CardTitle>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{newsItem.source}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{newsItem.category}</Badge>
              {hasLegislativeInfo && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                  Ley
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-gray-600">{newsItem.summary}</p>

          {/* Mostrar subcategoría y tipo de noticia */}
          <div className="flex flex-wrap gap-2 mt-3">
            {newsItem.subcategory && (
              <Badge className={getSubcategoryColor(newsItem.subcategory)}>
                {getSubcategoryName(newsItem.subcategory)}
              </Badge>
            )}
            {newsItem.newsType && (
              <Badge className={getNewsTypeColor(newsItem.newsType)}>{getNewsTypeName(newsItem.newsType)}</Badge>
            )}
            {newsItem.context && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs flex items-center gap-1"
                onClick={() => setShowContext(!showContext)}
              >
                <Info className="h-3 w-3" />
                Contexto
              </Button>
            )}
          </div>

          {/* Mostrar contexto si está habilitado */}
          {showContext && newsItem.context && (
            <div className="mt-3 p-2 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-200">
              {newsItem.context}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 border-t flex flex-col gap-2">
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-gray-500">{new Date(newsItem.publishedAt).toLocaleDateString()}</span>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowMetrics(!showMetrics)}
                      className={`text-gray-500 hover:text-gray-700 ${showMetrics ? "bg-gray-100 rounded-full" : ""}`}
                    >
                      <BarChart2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showMetrics ? "Ocultar" : "Ver"} métricas de aceptación y share</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {hasValidUrl ? (
                <a
                  href={newsItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  onClick={(e) => {
                    // Prevenir la propagación del evento para asegurar que el enlace funcione
                    e.stopPropagation()
                  }}
                >
                  Leer más <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-xs text-gray-400">No hay enlace disponible</span>
              )}
            </div>
          </div>

          {/* Añadir el nuevo componente de soluciones ideológicas */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIdeologicalSolutions(!showIdeologicalSolutions)}
              className="w-full flex items-center justify-center gap-2"
            >
              <GitCompare className="h-4 w-4" />
              {showIdeologicalSolutions ? "Ocultar soluciones comparadas" : "Ver soluciones por partido"}
            </Button>

            {showIdeologicalSolutions && (
              <div className="mt-2">
                <IdeologicalSolutions newsItem={newsItem} category={newsItem.category} />
              </div>
            )}
          </div>

          {showMetrics && (
            <div className="w-full mt-2 space-y-2 border-t pt-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium">Aceptación pública</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-green-600">
                      <ThumbsUp className="h-3 w-3 mr-1" /> {acceptance.positive}%
                    </span>
                    <span className="flex items-center text-gray-500">{acceptance.neutral}%</span>
                    <span className="flex items-center text-red-600">
                      <ThumbsDown className="h-3 w-3 mr-1" /> {acceptance.negative}%
                    </span>
                  </div>
                </div>
                <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${acceptance.positive}%` }}></div>
                  <div className="bg-gray-400 h-full" style={{ width: `${acceptance.neutral}%` }}></div>
                  <div className="bg-red-500 h-full" style={{ width: `${acceptance.negative}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium">Compartido</span>
                  <span className="flex items-center">
                    <Share2 className="h-3 w-3 mr-1" /> {formatNumber(shareMetrics.total)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs text-center">
                  <div className="bg-blue-100 rounded p-1">
                    <span className="block font-medium">FB</span>
                    <span>{formatNumber(shareMetrics.facebook)}</span>
                  </div>
                  <div className="bg-blue-50 rounded p-1">
                    <span className="block font-medium">TW</span>
                    <span>{formatNumber(shareMetrics.twitter)}</span>
                  </div>
                  <div className="bg-green-100 rounded p-1">
                    <span className="block font-medium">WA</span>
                    <span>{formatNumber(shareMetrics.whatsapp)}</span>
                  </div>
                  <div className="bg-gray-100 rounded p-1">
                    <span className="block font-medium">Otros</span>
                    <span>{formatNumber(shareMetrics.other)}</span>
                  </div>
                </div>
              </div>

              {/* Indicadores de tipo de medio */}
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-medium">Relevancia mediática</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Radio className="h-3 w-3 text-red-600" />
                    <span className="text-gray-700">Alta</span>
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                    <FileText className="h-3 w-3 text-blue-600" />
                    <span className="text-gray-700">Media</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
