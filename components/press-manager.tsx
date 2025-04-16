"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { adaptNewsForParty } from "@/lib/ai-service"
import { scrapeWebsite } from "@/lib/scrape-action"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import AdaptedMessage from "@/components/adapted-message"
import TopicOpinion from "@/components/topic-opinion"
import CustomScraper from "@/components/custom-scraper"
import CircularInterface from "@/components/circular-interface"
import LegislativeDebate from "@/components/legislative-debate"

export default function PressManager() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdapting, setIsAdapting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adaptedMessages, setAdaptedMessages] = useState<Record<PoliticalParty, string>>(
    {} as Record<PoliticalParty, string>,
  )
  const [topicOpinions, setTopicOpinions] = useState<Record<PoliticalParty, Record<string, string>>>(
    {} as Record<PoliticalParty, Record<string, string>>,
  )
  const [selectedParty, setSelectedParty] = useState<PoliticalParty>("libertad-avanza")
  const [progress, setProgress] = useState(0)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [useSimulatedContent, setUseSimulatedContent] = useState(false)
  const [activeView, setActiveView] = useState<"classic" | "circular">("circular")
  const [activeTab, setActiveTab] = useState("general")
  const [lawsNews, setLawsNews] = useState<NewsItem[]>([])

  // Verificar si hay un indicador de cuota excedida en localStorage
  useEffect(() => {
    const hasQuotaExceeded = localStorage.getItem("openai_quota_exceeded") === "true"
    setQuotaExceeded(hasQuotaExceeded)
    setUseSimulatedContent(hasQuotaExceeded)
  }, [])

  // Función para obtener noticias
  const handleScrapeNews = async () => {
    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Using default news websites for scraping
      const defaultNewsWebsites = [
        "https://www.clarin.com",
        "https://www.lanacion.com.ar",
        "https://www.infobae.com",
        "https://www.pagina12.com.ar",
      ]

      let allNews: NewsItem[] = []

      // Try to scrape from each website
      for (const website of defaultNewsWebsites) {
        try {
          const news = await scrapeWebsite(website)
          if (news && news.length > 0) {
            allNews = [...allNews, ...news]
          }
        } catch (err) {
          console.error(`Error scraping ${website}:`, err)
          // Continue with other websites even if one fails
        }
      }

      if (allNews.length > 0) {
        setNewsItems(allNews)

        // Filter news related to laws
        const lawsRelatedNews = allNews.filter(
          (item) =>
            item.title.toLowerCase().includes("ley") ||
            item.title.toLowerCase().includes("legisla") ||
            item.category === "politics" ||
            item.category === "nacional",
        )
        setLawsNews(lawsRelatedNews)
      } else {
        setError("No se pudieron obtener noticias de los sitios predeterminados. Intente con el scraper personalizado.")
      }
    } catch (err) {
      console.error("Error al obtener noticias:", err)
      setError("Error al cargar las noticias. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para adaptar noticias para todos los partidos
  const handleAdaptForAllParties = async () => {
    if (newsItems.length === 0) {
      setError("No hay noticias para adaptar. Por favor, obtén noticias primero.")
      return
    }

    setIsAdapting(true)
    setError(null)
    setProgress(0)

    const parties: PoliticalParty[] = ["libertad-avanza", "union-patria", "juntos-cambio", "frente-izquierda", "otros"]
    const totalParties = parties.length
    let completedParties = 0
    const newAdaptedMessages: Record<PoliticalParty, string> = {} as Record<PoliticalParty, string>
    const newTopicOpinions: Record<PoliticalParty, Record<string, string>> = {} as Record<
      PoliticalParty,
      Record<string, string>
    >

    try {
      // Obtener la clave API del localStorage como respaldo
      const clientApiKey = localStorage.getItem("openai_api_key")

      for (const party of parties) {
        try {
          // Actualizar progreso
          setProgress(Math.round((completedParties / totalParties) * 100))

          // Adaptar noticias para el partido actual
          let result
          try {
            result = await adaptNewsForParty(newsItems, party, useSimulatedContent ? null : clientApiKey)
          } catch (adaptError) {
            console.error(`Error específico al adaptar noticias para ${party}:`, adaptError)

            // Verificar si es un error de cuota excedida
            const errorMessage = adaptError instanceof Error ? adaptError.message : String(adaptError)
            if (errorMessage.includes("QUOTA_EXCEEDED")) {
              // Marcar que se ha excedido la cuota
              localStorage.setItem("openai_quota_exceeded", "true")
              setQuotaExceeded(true)
              setUseSimulatedContent(true)

              // Mostrar mensaje de error específico
              setError(
                `Se ha excedido la cuota de OpenAI. Se utilizará contenido simulado para los partidos restantes.`,
              )
            }

            // Usar contenido simulado para este partido
            result = await adaptNewsForParty(newsItems, party, null)
          }

          newAdaptedMessages[party] = result.generalMessage
          newTopicOpinions[party] = result.topicOpinions

          completedParties++
        } catch (err) {
          console.error(`Error general al procesar partido ${party}:`, err)

          // Para cualquier error, usar contenido simulado para este partido
          try {
            const result = await adaptNewsForParty(newsItems, party, null)
            newAdaptedMessages[party] = result.generalMessage
            newTopicOpinions[party] = result.topicOpinions
          } catch (fallbackError) {
            console.error(`Error en fallback para ${party}:`, fallbackError)
            // Si incluso el fallback falla, usar contenido vacío
            newAdaptedMessages[party] = `No se pudo generar contenido para ${party} debido a un error.`
            newTopicOpinions[party] = {}
          }

          completedParties++
        } finally {
          // Actualizar progreso incluso si hay errores
          setProgress(Math.round((completedParties / totalParties) * 100))
        }
      }

      // Actualizar estado con todos los mensajes adaptados
      setAdaptedMessages(newAdaptedMessages)
      setTopicOpinions(newTopicOpinions)
      setProgress(100)
    } catch (err) {
      console.error("Error al adaptar noticias:", err)
      setError("Error al adaptar noticias. Por favor, inténtalo de nuevo.")
    } finally {
      setIsAdapting(false)
    }
  }

  // Función para alternar entre contenido simulado y generado por IA
  const toggleContentMode = () => {
    setUseSimulatedContent(!useSimulatedContent)
  }

  // Función para limpiar el indicador de cuota excedida
  const resetQuotaExceeded = () => {
    localStorage.removeItem("openai_quota_exceeded")
    setQuotaExceeded(false)
    setUseSimulatedContent(false)
  }

  // Función para manejar el contenido generado desde la interfaz circular
  const handleGeneratedContent = (party: PoliticalParty, contentType: string, content: any) => {
    setSelectedParty(party)

    if (contentType === "news" || contentType === "opinions") {
      // Update adapted messages and topic opinions
      setAdaptedMessages((prev) => ({
        ...prev,
        [party]: content.generalMessage,
      }))

      setTopicOpinions((prev) => ({
        ...prev,
        [party]: content.topicOpinions,
      }))

      setActiveTab("general")
    } else if (contentType === "laws") {
      // Update adapted messages and topic opinions for laws
      setAdaptedMessages((prev) => ({
        ...prev,
        [party]: content.generalMessage,
      }))

      setTopicOpinions((prev) => ({
        ...prev,
        [party]: content.topicOpinions,
      }))

      setLawsNews(content.lawsNews || [])
      setActiveTab("laws")
    } else {
      // For other content types
      setAdaptedMessages((prev) => ({
        ...prev,
        [party]: content.generalMessage,
      }))

      setTopicOpinions((prev) => ({
        ...prev,
        [party]: content.topicOpinions,
      }))

      setActiveTab(contentType)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestor de Prensa con IA</CardTitle>
              <CardDescription>
                Obtén noticias actuales y genera mensajes adaptados para diferentes partidos políticos
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView("classic")}
                className={activeView === "classic" ? "bg-gray-100" : ""}
              >
                Clásico
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView("circular")}
                className={activeView === "circular" ? "bg-gray-100" : ""}
              >
                Circular
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {quotaExceeded && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Cuota de OpenAI excedida</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>
                  Se ha detectado que la cuota de OpenAI ha sido excedida. Actualmente se está utilizando contenido
                  simulado.
                </p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={resetQuotaExceeded}>
                    Reintentar con API
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button onClick={handleScrapeNews} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Obteniendo noticias...
                </>
              ) : (
                "Obtener noticias automáticamente"
              )}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleAdaptForAllParties}
                    disabled={isAdapting || newsItems.length === 0}
                    className="w-full sm:w-auto"
                  >
                    {isAdapting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Adaptando ({Math.round(progress)}%)
                      </>
                    ) : (
                      "Adaptar para todos los partidos"
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Genera mensajes adaptados para todos los partidos políticos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">Modo:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleContentMode}
                disabled={quotaExceeded || isAdapting}
                className={useSimulatedContent ? "bg-yellow-100" : "bg-green-100"}
              >
                {useSimulatedContent ? "Simulado" : "IA"}
              </Button>
            </div>
          </div>

          {isAdapting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Adaptando noticias...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Noticias obtenidas ({newsItems.length})</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : newsItems.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                {newsItems.map((item, index) => (
                  <div key={index} className="p-2 border rounded-md bg-gray-50">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.source} | {item.category}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border rounded-md bg-gray-50">
                No hay noticias disponibles. Haz clic en "Obtener noticias" para comenzar.
              </div>
            )}
          </div>

          <CustomScraper onNewsFound={setNewsItems} />
        </CardContent>
      </Card>

      {/* Circular Interface */}
      {activeView === "circular" && newsItems.length > 0 && (
        <CircularInterface newsItems={newsItems} onGenerateContent={handleGeneratedContent} />
      )}

      {/* Content Display */}
      {Object.keys(adaptedMessages).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contenido Adaptado</CardTitle>
            <CardDescription>
              Contenido generado para{" "}
              {selectedParty && selectedParty === "libertad-avanza"
                ? "La Libertad Avanza"
                : selectedParty === "union-patria"
                  ? "Unión por la Patria"
                  : selectedParty === "juntos-cambio"
                    ? "Juntos por el Cambio"
                    : selectedParty === "frente-izquierda"
                      ? "Frente de Izquierda"
                      : "Otros Partidos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="laws">Leyes</TabsTrigger>
                <TabsTrigger value="opinions">Opiniones</TabsTrigger>
                <TabsTrigger value="historical">Historia</TabsTrigger>
                <TabsTrigger value="philosophical">Filosofía</TabsTrigger>
                <TabsTrigger value="solutions">Soluciones</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <AdaptedMessage
                  content={adaptedMessages[selectedParty] || ""}
                  party={selectedParty}
                  isLoading={false}
                  topicOpinions={topicOpinions[selectedParty] || {}}
                />
              </TabsContent>

              <TabsContent value="laws">
                <div className="space-y-4">
                  <AdaptedMessage
                    content={adaptedMessages[selectedParty] || ""}
                    party={selectedParty}
                    isLoading={false}
                    topicOpinions={topicOpinions[selectedParty] || {}}
                  />

                  {lawsNews.length > 0 &&
                    lawsNews.map((item, index) => <LegislativeDebate key={index} newsItem={item} />)}

                  {lawsNews.length === 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>No hay noticias sobre leyes</AlertTitle>
                      <AlertDescription>
                        No se encontraron noticias relacionadas con leyes o debates legislativos.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="opinions">
                <div className="space-y-4">
                  {topicOpinions[selectedParty] &&
                    Object.entries(topicOpinions[selectedParty]).map(([newsId, opinion], index) => {
                      const newsIndex = Number.parseInt(newsId.split("-")[1])
                      const newsItem = newsIndex < newsItems.length ? newsItems[newsIndex] : null

                      return (
                        <TopicOpinion
                          key={newsId}
                          title={newsItem?.title || "Opinión sobre tema"}
                          content={opinion}
                          party={selectedParty}
                          category={newsItem?.category || "general"}
                          newsItem={newsItem}
                        />
                      )
                    })}
                </div>
              </TabsContent>

              <TabsContent value="historical">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Análisis Histórico</CardTitle>
                      <CardDescription>
                        Contexto histórico desde la perspectiva de{" "}
                        {selectedParty === "libertad-avanza"
                          ? "La Libertad Avanza"
                          : selectedParty === "union-patria"
                            ? "Unión por la Patria"
                            : selectedParty === "juntos-cambio"
                              ? "Juntos por el Cambio"
                              : selectedParty === "frente-izquierda"
                                ? "Frente de Izquierda"
                                : "Otros Partidos"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {adaptedMessages[selectedParty]?.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {topicOpinions[selectedParty] &&
                    Object.entries(topicOpinions[selectedParty])
                      .slice(0, 3)
                      .map(([newsId, opinion], index) => {
                        const newsIndex = Number.parseInt(newsId.split("-")[1])
                        const newsItem = newsIndex < newsItems.length ? newsItems[newsIndex] : null

                        return (
                          <TopicOpinion
                            key={newsId}
                            title={newsItem?.title || "Contexto histórico"}
                            content={opinion}
                            party={selectedParty}
                            category={newsItem?.category || "general"}
                            newsItem={newsItem}
                            showHistorical={true}
                          />
                        )
                      })}
                </div>
              </TabsContent>

              <TabsContent value="philosophical">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fundamentos Filosóficos</CardTitle>
                      <CardDescription>
                        Análisis filosófico desde la perspectiva de{" "}
                        {selectedParty === "libertad-avanza"
                          ? "La Libertad Avanza"
                          : selectedParty === "union-patria"
                            ? "Unión por la Patria"
                            : selectedParty === "juntos-cambio"
                              ? "Juntos por el Cambio"
                              : selectedParty === "frente-izquierda"
                                ? "Frente de Izquierda"
                                : "Otros Partidos"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {adaptedMessages[selectedParty]?.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="solutions">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Propuestas de Soluciones</CardTitle>
                      <CardDescription>
                        Soluciones propuestas desde la perspectiva de{" "}
                        {selectedParty === "libertad-avanza"
                          ? "La Libertad Avanza"
                          : selectedParty === "union-patria"
                            ? "Unión por la Patria"
                            : selectedParty === "juntos-cambio"
                              ? "Juntos por el Cambio"
                              : selectedParty === "frente-izquierda"
                                ? "Frente de Izquierda"
                                : "Otros Partidos"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {adaptedMessages[selectedParty]?.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {topicOpinions[selectedParty] &&
                    Object.entries(topicOpinions[selectedParty])
                      .slice(0, 3)
                      .map(([newsId, opinion], index) => {
                        const newsIndex = Number.parseInt(newsId.split("-")[1])
                        const newsItem = newsIndex < newsItems.length ? newsItems[newsIndex] : null

                        return (
                          <TopicOpinion
                            key={newsId}
                            title={`Solución: ${newsItem?.title || "Propuesta"}`}
                            content={opinion}
                            party={selectedParty}
                            category={newsItem?.category || "general"}
                            newsItem={newsItem}
                          />
                        )
                      })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Modo: {useSimulatedContent ? "Contenido simulado" : "Generado por IA"}
            </div>
            {quotaExceeded && (
              <div className="text-sm text-yellow-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Cuota de OpenAI excedida
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
