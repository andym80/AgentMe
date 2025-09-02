"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Newspaper,
  MessageSquare,
  Zap,
  Users,
  Target,
  Brain,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Download,
  BarChart3,
} from "lucide-react"
import { fetchNews } from "@/lib/news-service"
import { generateAdaptedMessage } from "@/lib/ai-service"
import { evaluateMessage } from "@/lib/message-evaluation"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { useLazyData } from "@/hooks/use-lazy-data"

interface GeneratedMessage {
  id: string
  content: string
  party: PoliticalParty
  timestamp: Date
  evaluation: any
  newsSource: string
  audience: string
}

const POLITICAL_PARTIES: Array<{ value: PoliticalParty; label: string; color: string }> = [
  { value: "libertad-avanza", label: "La Libertad Avanza", color: "bg-purple-100 text-purple-800" },
  { value: "union-patria", label: "Unión por la Patria", color: "bg-blue-100 text-blue-800" },
  { value: "juntos-cambio", label: "Juntos por el Cambio", color: "bg-yellow-100 text-yellow-800" },
  { value: "frente-izquierda", label: "Frente de Izquierda", color: "bg-red-100 text-red-800" },
  { value: "otros", label: "Otros Partidos", color: "bg-gray-100 text-gray-800" },
]

const TARGET_AUDIENCES = [
  { value: "general", label: "Público General" },
  { value: "jovenes", label: "Jóvenes (18-35)" },
  { value: "trabajadores", label: "Trabajadores" },
  { value: "empresarios", label: "Empresarios" },
  { value: "jubilados", label: "Jubilados" },
  { value: "familias", label: "Familias" },
]

export default function StreamlinedPressManager() {
  // Estados principales
  const [selectedParty, setSelectedParty] = useState<PoliticalParty>("libertad-avanza")
  const [selectedAudience, setSelectedAudience] = useState("general")
  const [selectedNews, setSelectedNews] = useState<NewsItem[]>([])
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("news")
  const [customPrompt, setCustomPrompt] = useState("")

  // Referencias para evitar re-renders
  const messagesRef = useRef<GeneratedMessage[]>([])
  const generationCountRef = useRef(0)

  // Cargar noticias con lazy loading
  const {
    data: newsItems,
    isLoading: isLoadingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLazyData(() => fetchNews("politics"), [], {
    cacheKey: "political_news",
    cacheDuration: 10 * 60 * 1000, // 10 minutos
  })

  // Actualizar referencia de mensajes
  useEffect(() => {
    messagesRef.current = generatedMessages
  }, [generatedMessages])

  // Manejar selección de noticias
  const handleNewsSelection = useCallback((news: NewsItem) => {
    setSelectedNews((prev) => {
      const isSelected = prev.some((item) => item.title === news.title)
      if (isSelected) {
        return prev.filter((item) => item.title !== news.title)
      } else {
        return [...prev, news]
      }
    })
  }, [])

  // Generar mensaje adaptado
  const handleGenerateMessage = useCallback(async () => {
    if (selectedNews.length === 0) {
      alert("Por favor selecciona al menos una noticia")
      return
    }

    setIsGenerating(true)

    try {
      const newsContext = selectedNews.map((news) => ({
        title: news.title,
        summary: news.summary || news.title,
        source: news.source,
        category: news.category,
      }))

      const prompt = customPrompt || `Genera un mensaje político para ${selectedParty} dirigido a ${selectedAudience}`

      const generatedContent = await generateAdaptedMessage(newsContext, selectedParty, selectedAudience, prompt)

      // Evaluar el mensaje generado
      const evaluation = evaluateMessage(generatedContent, selectedAudience, "argentina")

      const newMessage: GeneratedMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: generatedContent,
        party: selectedParty,
        timestamp: new Date(),
        evaluation,
        newsSource: selectedNews.map((n) => n.source).join(", "),
        audience: selectedAudience,
      }

      setGeneratedMessages((prev) => [newMessage, ...prev])
      generationCountRef.current += 1

      // Cambiar a la pestaña de mensajes
      setActiveTab("messages")
    } catch (error) {
      console.error("Error generating message:", error)
      alert("Error al generar el mensaje. Por favor intenta de nuevo.")
    } finally {
      setIsGenerating(false)
    }
  }, [selectedNews, selectedParty, selectedAudience, customPrompt])

  // Copiar mensaje al portapapeles
  const handleCopyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // Aquí podrías mostrar una notificación de éxito
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    }
  }, [])

  // Exportar mensaje
  const handleExportMessage = useCallback((message: GeneratedMessage) => {
    const exportData = {
      content: message.content,
      party: message.party,
      audience: message.audience,
      timestamp: message.timestamp.toISOString(),
      evaluation: message.evaluation,
      newsSource: message.newsSource,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mensaje_${message.party}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // Estadísticas memoizadas
  const statistics = useMemo(() => {
    const totalMessages = generatedMessages.length
    const avgScore =
      totalMessages > 0 ? generatedMessages.reduce((sum, msg) => sum + msg.evaluation.score, 0) / totalMessages : 0

    const partyDistribution = generatedMessages.reduce(
      (acc, msg) => {
        acc[msg.party] = (acc[msg.party] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topParty = Object.entries(partyDistribution).sort(([, a], [, b]) => b - a)[0]?.[0] || "ninguno"

    return {
      totalMessages,
      avgScore: Math.round(avgScore * 100) / 100,
      topParty,
      newsSelected: selectedNews.length,
    }
  }, [generatedMessages, selectedNews.length])

  // Renderizar componente de noticias
  const NewsSection = useMemo(
    () => (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Noticias Disponibles ({newsItems?.length || 0})
          </h3>
          <Button variant="outline" size="sm" onClick={refreshNews} disabled={isLoadingNews} className="bg-transparent">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNews ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {newsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error al cargar noticias: {newsError.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {isLoadingNews
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-100 rounded mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))
            : newsItems?.map((news, index) => {
                const isSelected = selectedNews.some((item) => item.title === news.title)
                return (
                  <Card
                    key={`${news.title}_${index}`}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => handleNewsSelection(news)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm line-clamp-2 flex-1 mr-2">{news.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && <CheckCircle className="h-4 w-4 text-blue-500" />}
                          <Badge variant="outline" className="text-xs">
                            {news.source}
                          </Badge>
                        </div>
                      </div>

                      {news.summary && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{news.summary}</p>}

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{news.category}</span>
                        <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>

        {selectedNews.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">{selectedNews.length} noticias seleccionadas</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNews([])}
                  className="text-blue-600 border-blue-300 bg-transparent"
                >
                  Limpiar selección
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    ),
    [newsItems, isLoadingNews, newsError, selectedNews, refreshNews, handleNewsSelection],
  )

  // Renderizar sección de configuración
  const ConfigSection = useMemo(
    () => (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Configuración del Mensaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Partido Político</label>
                <Select value={selectedParty} onValueChange={(value: PoliticalParty) => setSelectedParty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLITICAL_PARTIES.map((party) => (
                      <SelectItem key={party.value} value={party.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${party.color.split(" ")[0]}`} />
                          {party.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Audiencia Objetivo</label>
                <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_AUDIENCES.map((audience) => (
                      <SelectItem key={audience.value} value={audience.value}>
                        {audience.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt Personalizado (Opcional)</label>
              <Textarea
                placeholder="Ej: Enfócate en temas económicos con un tono optimista..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerateMessage}
              disabled={isGenerating || selectedNews.length === 0}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generando mensaje...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generar Mensaje Político
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas de Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{statistics.totalMessages}</div>
                <div className="text-sm text-gray-600">Mensajes Generados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{statistics.avgScore}</div>
                <div className="text-sm text-gray-600">Puntuación Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    [
      selectedParty,
      selectedAudience,
      customPrompt,
      selectedNews.length,
      isGenerating,
      statistics,
      handleGenerateMessage,
    ],
  )

  // Renderizar sección de mensajes
  const MessagesSection = useMemo(
    () => (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensajes Generados ({generatedMessages.length})
          </h3>
          {generatedMessages.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setGeneratedMessages([])} className="bg-transparent">
              Limpiar historial
            </Button>
          )}
        </div>

        {generatedMessages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No hay mensajes generados</h3>
              <p className="text-gray-500 mb-4">Selecciona noticias y genera tu primer mensaje político</p>
              <Button onClick={() => setActiveTab("news")} variant="outline">
                <Newspaper className="h-4 w-4 mr-2" />
                Ir a Noticias
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generatedMessages.map((message) => {
              const partyInfo = POLITICAL_PARTIES.find((p) => p.value === message.party)
              const audienceInfo = TARGET_AUDIENCES.find((a) => a.value === message.audience)

              return (
                <Card key={message.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge className={partyInfo?.color}>{partyInfo?.label}</Badge>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {audienceInfo?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyMessage(message.content)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportMessage(message)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Evaluación del mensaje */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Evaluación del Mensaje
                        </span>
                        <Badge
                          variant={message.evaluation.score > 0.7 ? "default" : "secondary"}
                          className={message.evaluation.score > 0.7 ? "bg-green-100 text-green-800" : ""}
                        >
                          {Math.round(message.evaluation.score * 100)}%
                        </Badge>
                      </div>

                      <Progress value={message.evaluation.score * 100} className="h-2" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-medium text-green-700">Fortalezas:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {message.evaluation.strengths.slice(0, 2).map((strength: string, i: number) => (
                              <li key={i} className="text-gray-600">
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-amber-700">Sugerencias:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {message.evaluation.suggestions.slice(0, 2).map((suggestion: string, i: number) => (
                              <li key={i} className="text-gray-600">
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Fuente: {message.newsSource}</span>
                      <span>{message.timestamp.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    ),
    [generatedMessages, handleCopyMessage, handleExportMessage],
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            Press Manager AI - Generador de Mensajes Políticos
          </CardTitle>
          <p className="text-muted-foreground">
            Genera mensajes políticos adaptativos basados en noticias actuales y análisis de audiencia
          </p>
        </CardHeader>
      </Card>

      {/* Navegación principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Noticias
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensajes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          {NewsSection}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          {ConfigSection}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {MessagesSection}
        </TabsContent>
      </Tabs>
    </div>
  )
}
