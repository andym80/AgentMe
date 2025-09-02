"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  RefreshCw,
  Network,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

import type { NewsItem } from "@/lib/types"
import { performAdvancedNLPAnalysis, type NLPAnalysisResult } from "@/lib/advanced-nlp-engine"
import {
  trackTemporalTrends,
  getAnalysisHistory,
  saveAnalysisToHistory,
  type TemporalAnalysisResult,
} from "@/lib/temporal-analysis"
import { detectEmergingNarratives, type NarrativeAnalysisResult } from "@/lib/narrative-detector"

interface AdvancedAnalysisViewProps {
  newsItems: NewsItem[]
  isLoading?: boolean
}

export default function AdvancedAnalysisView({ newsItems, isLoading = false }: AdvancedAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState("entities")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<NLPAnalysisResult | null>(null)
  const [temporalAnalysis, setTemporalAnalysis] = useState<TemporalAnalysisResult | null>(null)
  const [narrativeAnalysis, setNarrativeAnalysis] = useState<NarrativeAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Realizar análisis cuando cambian las noticias
  useEffect(() => {
    if (newsItems.length > 0 && !isLoading) {
      performAnalysis()
    }
  }, [newsItems, isLoading])

  // Función para realizar el análisis completo
  const performAnalysis = async () => {
    if (newsItems.length === 0) {
      setError("No hay noticias para analizar")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setProgress(0)

    try {
      // Obtener clave API del localStorage
      const apiKey = localStorage.getItem("anthropic_api_key") || ""

      // Paso 1: Realizar análisis NLP
      setProgress(20)
      const nlpResult = await performAdvancedNLPAnalysis(newsItems, apiKey)
      setAnalysisResult(nlpResult)

      // Guardar análisis en historial
      saveAnalysisToHistory(nlpResult)

      // Paso 2: Obtener historial y realizar análisis temporal
      setProgress(50)
      const history = getAnalysisHistory()
      const tempAnalysis = trackTemporalTrends(history)
      setTemporalAnalysis(tempAnalysis)

      // Paso 3: Detectar narrativas emergentes
      setProgress(80)
      const narratives = detectEmergingNarratives(nlpResult, tempAnalysis.trends)
      setNarrativeAnalysis(narratives)

      setProgress(100)
    } catch (err) {
      console.error("Error en el análisis avanzado:", err)
      setError("Error al realizar el análisis avanzado. Por favor, inténtalo de nuevo.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Análisis Avanzado de Coyuntura</CardTitle>
        <CardDescription>Análisis detallado de entidades, temas, narrativas y tendencias temporales</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Analizando datos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={performAnalysis}
                disabled={isAnalyzing || newsItems.length === 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar análisis
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
                <TabsTrigger value="entities">Entidades</TabsTrigger>
                <TabsTrigger value="topics">Temas</TabsTrigger>
                <TabsTrigger value="narratives">Narrativas</TabsTrigger>
                <TabsTrigger value="trends">Tendencias</TabsTrigger>
              </TabsList>

              <TabsContent value="entities">
                {analysisResult ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Políticos mencionados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.entities.politicians.length > 0 ? (
                            analysisResult.entities.politicians.map((politician, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50">
                                {politician}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron políticos</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Organizaciones mencionadas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.entities.organizations.length > 0 ? (
                            analysisResult.entities.organizations.map((org, index) => (
                              <Badge key={index} variant="outline" className="bg-purple-50">
                                {org}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron organizaciones</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Lugares mencionados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.entities.locations.length > 0 ? (
                            analysisResult.entities.locations.map((location, index) => (
                              <Badge key={index} variant="outline" className="bg-green-50">
                                {location}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron lugares</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Análisis de sentimiento por entidad</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.keys(analysisResult.sentimentAnalysis.byEntity).length > 0 ? (
                            Object.entries(analysisResult.sentimentAnalysis.byEntity).map(
                              ([entity, sentiment], index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                  <span className="text-sm">{entity}</span>
                                  <div className="flex items-center">
                                    {sentiment > 0.2 ? (
                                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                    ) : sentiment < -0.2 ? (
                                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                    ) : (
                                      <Minus className="h-4 w-4 text-gray-600 mr-1" />
                                    )}
                                    <span className="text-xs">
                                      {sentiment > 0 ? "+" : ""}
                                      {sentiment.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )
                          ) : (
                            <span className="text-sm text-gray-500">No hay datos de sentimiento por entidad</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">No hay datos de análisis disponibles</div>
                )}
              </TabsContent>

              <TabsContent value="topics">
                {analysisResult ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Temas principales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysisResult.topics.length > 0 ? (
                            analysisResult.topics.map((topic, index) => (
                              <div key={index} className="border rounded-md p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{topic.name}</span>
                                  <Badge
                                    variant="outline"
                                    className={
                                      topic.sentiment > 0.2
                                        ? "bg-green-50 text-green-800"
                                        : topic.sentiment < -0.2
                                          ? "bg-red-50 text-red-800"
                                          : "bg-gray-50 text-gray-800"
                                    }
                                  >
                                    {topic.sentiment > 0 ? "+" : ""}
                                    {topic.sentiment.toFixed(2)}
                                  </Badge>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${topic.relevance * 100}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-gray-500">Relevancia</span>
                                  <span className="text-xs text-gray-500">{(topic.relevance * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron temas</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Sentimiento general</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-2">
                              {analysisResult.sentimentAnalysis.overall > 0 ? "+" : ""}
                              {analysisResult.sentimentAnalysis.overall.toFixed(2)}
                            </div>
                            <div className="flex justify-center">
                              {analysisResult.sentimentAnalysis.overall > 0.2 ? (
                                <Badge className="bg-green-100 text-green-800">Positivo</Badge>
                              ) : analysisResult.sentimentAnalysis.overall < -0.2 ? (
                                <Badge className="bg-red-100 text-red-800">Negativo</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Neutral</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">No hay datos de análisis disponibles</div>
                )}
              </TabsContent>

              <TabsContent value="narratives">
                {narrativeAnalysis ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Narrativas emergentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {narrativeAnalysis.emergingNarratives.length > 0 ? (
                            narrativeAnalysis.emergingNarratives.map((narrative, index) => (
                              <div key={index} className="border rounded-md p-3 bg-yellow-50">
                                <div className="flex items-start gap-2">
                                  <ArrowUpRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium">{narrative.description}</div>
                                    <div className="mt-1 text-sm text-gray-600">
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {narrative.relatedTopics.map((topic, i) => (
                                          <Badge key={i} variant="outline" className="bg-white">
                                            {topic}
                                          </Badge>
                                        ))}
                                      </div>
                                      <div className="mt-2">
                                        <div className="text-xs text-gray-500 mb-1">Evidencia:</div>
                                        <ul className="list-disc list-inside text-xs">
                                          {narrative.supportingEvidence.map((evidence, i) => (
                                            <li key={i}>{evidence}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div className="flex justify-between mt-2">
                                        <span className="text-xs">
                                          Confianza: {(narrative.confidence * 100).toFixed(0)}%
                                        </span>
                                        <span className="text-xs">
                                          Impacto potencial: {(narrative.potentialImpact * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron narrativas emergentes</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Narrativas dominantes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {narrativeAnalysis.dominantNarratives.length > 0 ? (
                            narrativeAnalysis.dominantNarratives.map((narrative, index) => (
                              <div key={index} className="border rounded-md p-3 bg-blue-50">
                                <div className="flex items-start gap-2">
                                  <Network className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium">{narrative.description}</div>
                                    <div className="mt-1 text-sm text-gray-600">
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {narrative.relatedTopics.map((topic, i) => (
                                          <Badge key={i} variant="outline" className="bg-white">
                                            {topic}
                                          </Badge>
                                        ))}
                                      </div>
                                      <div className="flex justify-between mt-2">
                                        <span className="text-xs">
                                          Confianza: {(narrative.confidence * 100).toFixed(0)}%
                                        </span>
                                        <span className="text-xs">
                                          Impacto potencial: {(narrative.potentialImpact * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron narrativas dominantes</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Narrativas en declive</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {narrativeAnalysis.fadingNarratives.length > 0 ? (
                            narrativeAnalysis.fadingNarratives.map((narrative, index) => (
                              <div key={index} className="border rounded-md p-3 bg-gray-50">
                                <div className="flex items-start gap-2">
                                  <ArrowDownRight className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium">{narrative.description}</div>
                                    <div className="mt-1 text-sm text-gray-600">
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {narrative.relatedTopics.map((topic, i) => (
                                          <Badge key={i} variant="outline" className="bg-white">
                                            {topic}
                                          </Badge>
                                        ))}
                                      </div>
                                      <div className="flex justify-between mt-2">
                                        <span className="text-xs">
                                          Confianza: {(narrative.confidence * 100).toFixed(0)}%
                                        </span>
                                        <span className="text-xs">
                                          Impacto potencial: {(narrative.potentialImpact * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron narrativas en declive</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    No hay datos de análisis de narrativas disponibles
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trends">
                {temporalAnalysis ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Temas emergentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {temporalAnalysis.emergingTopics.length > 0 ? (
                            temporalAnalysis.emergingTopics.map((topic, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-green-50">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span>{topic}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron temas emergentes</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Temas en declive</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {temporalAnalysis.fadingTopics.length > 0 ? (
                            temporalAnalysis.fadingTopics.map((topic, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-red-50">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                <span>{topic}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No se detectaron temas en declive</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Cambios de sentimiento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {temporalAnalysis.sentimentShifts.length > 0 ? (
                            temporalAnalysis.sentimentShifts.map((shift, index) => (
                              <div key={index} className="p-2 border rounded-md">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{shift.topic}</span>
                                  <Badge
                                    variant="outline"
                                    className={
                                      shift.change > 0.2
                                        ? "bg-green-50 text-green-800"
                                        : shift.change < -0.2
                                          ? "bg-red-50 text-red-800"
                                          : "bg-gray-50 text-gray-800"
                                    }
                                  >
                                    {shift.change > 0 ? "+" : ""}
                                    {shift.change.toFixed(2)}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                  <span>Anterior: {shift.previousSentiment.toFixed(2)}</span>
                                  <span>→</span>
                                  <span>Actual: {shift.currentSentiment.toFixed(2)}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No se detectaron cambios significativos de sentimiento
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Volatilidad de temas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {temporalAnalysis.topicVolatility.length > 0 ? (
                            temporalAnalysis.topicVolatility.slice(0, 5).map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                <span>{item.topic}</span>
                                <div className="flex items-center">
                                  <span className="text-xs mr-2">Volatilidad:</span>
                                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-orange-500 h-1.5 rounded-full"
                                      style={{ width: `${Math.min(item.volatility * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No hay datos de volatilidad disponibles</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">No hay datos de análisis temporal disponibles</div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
