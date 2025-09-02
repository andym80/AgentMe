"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RefreshCw, AlertCircle, CheckCircle, Info } from "lucide-react"
import NewsSelector from "./news-selector"
import AdaptedMessage from "./adapted-message"
import LegislativeInfo from "./legislative-info"
import LegislativeDebate from "./legislative-debate"
import HistoricalContrast from "./historical-contrast"
import TopicOpinion from "./topic-opinion"
import AdaptedSolutions from "./adapted-solutions"
import VotePredictions from "./vote-predictions"
import CircularInterface from "./circular-interface"
import PoliticalContextView from "./political-context-view"
import AdvancedAnalysisView from "./advanced-analysis-view"
import TechnicalDictionaryView from "./technical-dictionary-view"
import TechnicalAnalysisView from "./technical-analysis-view"
import QuickResponse from "./quick-response"
import { generateAIResponse } from "@/lib/ai-fallback-service"
import type { NewsItem, PoliticalParty, AdaptationFunction } from "@/lib/types"

export default function PressManager() {
  const [selectedNews, setSelectedNews] = useState<NewsItem[]>([])
  const [selectedParty, setSelectedParty] = useState<PoliticalParty>("libertad-avanza")
  const [selectedFunction, setSelectedFunction] = useState<AdaptationFunction>("adapted-message")
  const [generatedContent, setGeneratedContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)

  // Verificar si hay claves API configuradas
  useEffect(() => {
    const openaiKey = localStorage.getItem("openai_api_key")
    const anthropicKey = localStorage.getItem("anthropic_api_key")
    setApiKeyConfigured(!!(openaiKey || anthropicKey))
  }, [])

  const handleGenerateResponse = async () => {
    if (selectedNews.length === 0) {
      setError("Por favor, selecciona al menos una noticia para analizar.")
      return
    }

    if (!apiKeyConfigured) {
      setError(
        "No hay claves API configuradas. Por favor, configura al menos una clave API en la sección de configuración.",
      )
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedContent("")

    try {
      // Preparar el prompt según la función seleccionada
      let prompt = ""

      if (selectedFunction === "adapted-message") {
        prompt = `Adapta la siguiente noticia para el partido político ${selectedParty.replace("-", " ")}: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      } else if (selectedFunction === "legislative-info") {
        prompt = `Proporciona información legislativa detallada sobre: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      } else if (selectedFunction === "historical-contrast") {
        prompt = `Compara históricamente la siguiente noticia desde la perspectiva del partido ${selectedParty.replace("-", " ")}: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      } else if (selectedFunction === "topic-opinion") {
        prompt = `Genera una opinión sobre el tema: ${selectedNews[0].title}, desde la perspectiva del partido ${selectedParty.replace("-", " ")}.`
      } else if (selectedFunction === "adapted-solutions") {
        prompt = `Proporciona soluciones adaptadas al problema mencionado en: ${selectedNews[0].title}. ${selectedNews[0].summary}, desde la perspectiva del partido ${selectedParty.replace("-", " ")}.`
      } else if (selectedFunction === "vote-predictions") {
        prompt = `Predice cómo votaría el partido ${selectedParty.replace("-", " ")} en una ley relacionada con: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      } else if (selectedFunction === "political-context") {
        prompt = `Analiza el contexto político de la siguiente noticia desde la perspectiva del partido ${selectedParty.replace("-", " ")}: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      } else if (selectedFunction === "advanced-analysis") {
        prompt = `Realiza un análisis avanzado de la siguiente noticia, incluyendo narrativas, sesgos y posibles impactos: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      } else if (selectedFunction === "technical-dictionary") {
        prompt = `Identifica y explica los términos técnicos en la siguiente noticia: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      } else if (selectedFunction === "technical-analysis") {
        prompt = `Analiza la complejidad técnica y accesibilidad de la siguiente noticia: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      } else if (selectedFunction === "quick-response") {
        prompt = `Genera una respuesta rápida a la siguiente noticia desde la perspectiva del partido ${selectedParty.replace("-", " ")}: ${selectedNews[0].title}. ${selectedNews[0].summary}`
      }

      const response = await generateAIResponse(prompt)
      setGeneratedContent(response)
    } catch (err) {
      console.error("Error al generar respuesta:", err)
      setError(`Error al generar respuesta: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const renderSelectedComponent = () => {
    if (!generatedContent && !isGenerating) {
      return null
    }

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-center text-gray-600">Generando contenido adaptado...</p>
          <Progress value={45} className="w-full max-w-md mt-4" />
        </div>
      )
    }

    switch (selectedFunction) {
      case "adapted-message":
        return <AdaptedMessage content={generatedContent} party={selectedParty} news={selectedNews[0]} />
      case "legislative-info":
        return <LegislativeInfo content={generatedContent} news={selectedNews[0]} />
      case "legislative-debate":
        return <LegislativeDebate content={generatedContent} news={selectedNews[0]} />
      case "historical-contrast":
        return <HistoricalContrast content={generatedContent} party={selectedParty} news={selectedNews[0]} />
      case "topic-opinion":
        return <TopicOpinion content={generatedContent} party={selectedParty} news={selectedNews[0]} />
      case "adapted-solutions":
        return <AdaptedSolutions content={generatedContent} party={selectedParty} news={selectedNews[0]} />
      case "vote-predictions":
        return <VotePredictions content={generatedContent} party={selectedParty} news={selectedNews[0]} />
      case "circular-interface":
        return <CircularInterface news={selectedNews[0]} party={selectedParty} />
      case "political-context":
        return <PoliticalContextView content={generatedContent} news={selectedNews[0]} party={selectedParty} />
      case "advanced-analysis":
        return <AdvancedAnalysisView content={generatedContent} news={selectedNews[0]} />
      case "technical-dictionary":
        return <TechnicalDictionaryView content={generatedContent} news={selectedNews[0]} />
      case "technical-analysis":
        return <TechnicalAnalysisView content={generatedContent} news={selectedNews[0]} />
      case "quick-response":
        return <QuickResponse content={generatedContent} party={selectedParty} news={selectedNews[0]} />
      default:
        return <Textarea value={generatedContent} readOnly className="min-h-[200px]" />
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Press Manager AI</CardTitle>
          <CardDescription>Selecciona noticias, elige un partido político y genera contenido adaptado</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="news">Noticias</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
            </TabsList>

            <TabsContent value="news">
              <NewsSelector onSelectNews={setSelectedNews} selectedNews={selectedNews} />
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Partido Político</label>
                  <Select value={selectedParty} onValueChange={(value) => setSelectedParty(value as PoliticalParty)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un partido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="libertad-avanza">La Libertad Avanza</SelectItem>
                      <SelectItem value="union-patria">Unión por la Patria</SelectItem>
                      <SelectItem value="juntos-cambio">Juntos por el Cambio</SelectItem>
                      <SelectItem value="frente-izquierda">Frente de Izquierda</SelectItem>
                      <SelectItem value="otros">Otros partidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Función de Adaptación</label>
                  <Select
                    value={selectedFunction}
                    onValueChange={(value) => setSelectedFunction(value as AdaptationFunction)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una función" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adapted-message">Mensaje Adaptado</SelectItem>
                      <SelectItem value="legislative-info">Información Legislativa</SelectItem>
                      <SelectItem value="historical-contrast">Contraste Histórico</SelectItem>
                      <SelectItem value="topic-opinion">Opinión sobre el Tema</SelectItem>
                      <SelectItem value="adapted-solutions">Soluciones Adaptadas</SelectItem>
                      <SelectItem value="vote-predictions">Predicciones de Voto</SelectItem>
                      <SelectItem value="political-context">Contexto Político</SelectItem>
                      <SelectItem value="advanced-analysis">Análisis Avanzado</SelectItem>
                      <SelectItem value="technical-dictionary">Diccionario Técnico</SelectItem>
                      <SelectItem value="technical-analysis">Análisis Técnico</SelectItem>
                      <SelectItem value="quick-response">Respuesta Rápida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!apiKeyConfigured && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuración requerida</AlertTitle>
                    <AlertDescription>
                      No hay claves API configuradas. Por favor, configura al menos una clave API en la sección de
                      configuración.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGenerateResponse}
                  disabled={isGenerating || selectedNews.length === 0 || !apiKeyConfigured}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    "Generar Contenido"
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="results">
              <div className="space-y-4">
                {selectedNews.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Sin noticias seleccionadas</AlertTitle>
                    <AlertDescription>
                      Por favor, selecciona al menos una noticia en la pestaña "Noticias".
                    </AlertDescription>
                  </Alert>
                ) : generatedContent ? (
                  <div className="space-y-4">
                    <Alert variant="default" className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle>Contenido generado</AlertTitle>
                      <AlertDescription>
                        Se ha generado contenido adaptado para la noticia seleccionada.
                      </AlertDescription>
                    </Alert>
                    {renderSelectedComponent()}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Pendiente de generación</AlertTitle>
                    <AlertDescription>
                      Configura los parámetros en la pestaña "Configuración" y haz clic en "Generar Contenido".
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-gray-500">
                  {selectedNews.length} {selectedNews.length === 1 ? "noticia seleccionada" : "noticias seleccionadas"}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Selecciona noticias en la pestaña "Noticias"</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="text-xs text-gray-500">
            Partido: {selectedParty.replace("-", " ")} | Función: {selectedFunction.replace("-", " ")}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
