"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ThumbsUp, ThumbsDown, Share2, BarChart2, GitCompare } from "lucide-react"
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

  // Calcular el color de la barra de aceptación basado en el porcentaje positivo
  const getAcceptanceColor = (positive: number): string => {
    if (positive >= 70) return "bg-green-500"
    if (positive >= 50) return "bg-green-400"
    if (positive >= 30) return "bg-yellow-400"
    return "bg-red-400"
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
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
