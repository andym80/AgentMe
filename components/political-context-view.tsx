"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { analyzePoliticalContext, getCommunicationRecommendations } from "@/lib/political-context-analyzer"

interface PoliticalContextViewProps {
  newsItems: NewsItem[]
  selectedParty: PoliticalParty
}

export default function PoliticalContextView({ newsItems, selectedParty }: PoliticalContextViewProps) {
  const [activeTab, setActiveTab] = useState("analysis")
  const [politicalContext, setPoliticalContext] = useState<ReturnType<typeof analyzePoliticalContext> | null>(null)
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getCommunicationRecommendations> | null>(
    null,
  )

  // Analizar la coyuntura política cuando cambian las noticias o el partido seleccionado
  useEffect(() => {
    if (newsItems.length > 0) {
      const context = analyzePoliticalContext(newsItems)
      setPoliticalContext(context)

      if (selectedParty) {
        const partyRecommendations = getCommunicationRecommendations(selectedParty, context)
        setRecommendations(partyRecommendations)
      }
    }
  }, [newsItems, selectedParty])

  if (!politicalContext || !recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Coyuntura Política</CardTitle>
          <CardDescription>No hay suficientes noticias para realizar un análisis</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Obtener el nombre del partido seleccionado
  const partyName =
    selectedParty === "libertad-avanza"
      ? "La Libertad Avanza"
      : selectedParty === "union-patria"
        ? "Unión por la Patria"
        : selectedParty === "juntos-cambio"
          ? "Juntos por el Cambio"
          : selectedParty === "frente-izquierda"
            ? "Frente de Izquierda"
            : "Otros Partidos"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Coyuntura Política</CardTitle>
        <CardDescription>Análisis del contexto político actual y recomendaciones para {partyName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="analysis">Análisis General</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <div className="space-y-4">
              {/* Temas principales */}
              <div>
                <h3 className="text-sm font-medium mb-2">Temas principales en la agenda:</h3>
                <div className="flex flex-wrap gap-2">
                  {politicalContext.mainTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actores clave */}
              <div>
                <h3 className="text-sm font-medium mb-2">Actores clave mencionados:</h3>
                <div className="flex flex-wrap gap-2">
                  {politicalContext.keyActors.map((actor, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50">
                      {actor}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Temas controversiales */}
              <div>
                <h3 className="text-sm font-medium mb-2">Temas controversiales:</h3>
                <div className="flex flex-wrap gap-2">
                  {politicalContext.controversialTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 text-red-800">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sentimiento actual */}
              <div>
                <h3 className="text-sm font-medium mb-2">Sentimiento general:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Card className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Gobierno</span>
                      {politicalContext.currentSentiment.government === "positive" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : politicalContext.currentSentiment.government === "negative" ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </Card>
                  <Card className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Economía</span>
                      {politicalContext.currentSentiment.economy === "positive" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : politicalContext.currentSentiment.economy === "negative" ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </Card>
                  <Card className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Social</span>
                      {politicalContext.currentSentiment.social === "positive" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : politicalContext.currentSentiment.social === "negative" ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </Card>
                  <Card className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Internacional</span>
                      {politicalContext.currentSentiment.international === "positive" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : politicalContext.currentSentiment.international === "negative" ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              {/* Alerta de recomendaciones */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Recomendaciones para {partyName}</AlertTitle>
                <AlertDescription>
                  Estas recomendaciones están diseñadas para optimizar la comunicación política según la coyuntura
                  actual
                </AlertDescription>
              </Alert>

              {/* Temas a enfatizar */}
              <div>
                <h3 className="text-sm font-medium mb-2">Temas a enfatizar:</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.emphasize.map((topic, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-800">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Temas a evitar */}
              <div>
                <h3 className="text-sm font-medium mb-2">Temas a evitar:</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.avoid.length > 0 ? (
                    recommendations.avoid.map((topic, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50 text-red-800">
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">No hay temas específicos a evitar</span>
                  )}
                </div>
              </div>

              {/* Temas a reencuadrar */}
              <div>
                <h3 className="text-sm font-medium mb-2">Temas a reencuadrar:</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.reframe.length > 0 ? (
                    recommendations.reframe.map((topic, index) => (
                      <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-800">
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">No hay temas específicos a reencuadrar</span>
                  )}
                </div>
              </div>

              {/* Tono recomendado */}
              <div>
                <h3 className="text-sm font-medium mb-2">Tono recomendado:</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                  {recommendations.tone}
                </Badge>
              </div>

              {/* Palabras clave */}
              <div>
                <h3 className="text-sm font-medium mb-2">Palabras clave recomendadas:</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
