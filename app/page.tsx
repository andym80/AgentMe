"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Settings,
  Newspaper,
  BarChart2,
  Scale,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap,
  TrendingUp,
} from "lucide-react"
import { fetchNews } from "@/lib/news-service"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { ModeToggle } from "@/components/mode-toggle"
import StreamlinedPressManager from "@/components/streamlined-press-manager"
import DashboardView from "@/components/dashboard-view"
import CircularInterface from "@/components/circular-interface"
import TechnicalAnalysisView from "@/components/technical-analysis-view"
import AdvancedFeaturesPanel from "@/components/advanced-features-panel"

// Componente de estadísticas de rendimiento
function PerformanceStats() {
  const [stats, setStats] = useState({
    componentsLoaded: 0,
    totalComponents: 8,
    cacheHits: 0,
    cacheMisses: 0,
    loadTime: 0,
  })

  useEffect(() => {
    const startTime = performance.now()

    // Simular carga progresiva de componentes
    const interval = setInterval(() => {
      setStats((prev) => {
        if (prev.componentsLoaded < prev.totalComponents) {
          return {
            ...prev,
            componentsLoaded: prev.componentsLoaded + 1,
            loadTime: performance.now() - startTime,
          }
        }
        clearInterval(interval)
        return prev
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const loadingPercentage = (stats.componentsLoaded / stats.totalComponents) * 100

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Rendimiento de la Aplicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs">
          <span>
            Componentes cargados: {stats.componentsLoaded}/{stats.totalComponents}
          </span>
          <span>{Math.round(loadingPercentage)}%</span>
        </div>
        <Progress value={loadingPercentage} className="h-2" />

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-medium text-green-700">Cache Hits</div>
            <div className="text-green-600">{stats.cacheHits}</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="font-medium text-yellow-700">Cache Misses</div>
            <div className="text-yellow-600">{stats.cacheMisses}</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-medium text-blue-700">Tiempo (ms)</div>
            <div className="text-blue-600">{Math.round(stats.loadTime)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  // Estados principales
  const [selectedParty, setSelectedParty] = useState<PoliticalParty>("libertad-avanza")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messagesGenerated, setMessagesGenerated] = useState(0)
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false)

  // Verificar configuración de API keys
  const checkApiKeys = useCallback(() => {
    if (typeof window === "undefined") return false

    const openaiKey = localStorage.getItem("openai_api_key")
    const anthropicKey = localStorage.getItem("anthropic_api_key")
    return !!(openaiKey || anthropicKey)
  }, [])

  // Inicializar estado de API keys
  useEffect(() => {
    setApiKeysConfigured(checkApiKeys())
  }, [checkApiKeys])

  // Cargar noticias iniciales
  const loadInitialNews = useCallback(async () => {
    setIsLoadingNews(true)
    setError(null)

    try {
      const news = await fetchNews("politics")
      setNewsItems(news)
    } catch (err) {
      console.error("Error loading initial news:", err)
      setError("Error al cargar noticias iniciales")
      // Cargar noticias de ejemplo como fallback
      setNewsItems(getMockNews())
    } finally {
      setIsLoadingNews(false)
    }
  }, [])

  // Cargar noticias al montar el componente
  useEffect(() => {
    loadInitialNews()
  }, [loadInitialNews])

  // Manejar actualización de noticias
  const handleRefreshNews = useCallback(async () => {
    await loadInitialNews()
  }, [loadInitialNews])

  // Manejar generación de mensajes
  const handleMessageGenerated = useCallback(
    (party: PoliticalParty, message: string, opinions: Record<string, string>) => {
      setMessagesGenerated((prev) => prev + 1)
      console.log("Message generated for party:", party)
    },
    [],
  )

  // Manejar generación de contenido
  const handleGenerateContent = useCallback((party: PoliticalParty, contentType: string, content: any) => {
    setSelectedParty(party)
    setMessagesGenerated((prev) => prev + 1)
    console.log("Content generated:", { party, contentType, content })
  }, [])

  // Memoizar componentes pesados para evitar re-renders innecesarios
  const memoizedDashboard = useMemo(
    () => (
      <DashboardView
        newsItems={newsItems}
        onRefreshNews={handleRefreshNews}
        onMessageGenerated={handleMessageGenerated}
        isLoading={isLoadingNews}
        messagesGenerated={messagesGenerated}
      />
    ),
    [newsItems, handleRefreshNews, handleMessageGenerated, isLoadingNews, messagesGenerated],
  )

  const memoizedStreamlinedManager = useMemo(() => <StreamlinedPressManager />, [])

  const memoizedCircularInterface = useMemo(
    () => <CircularInterface newsItems={newsItems} onGenerateContent={handleGenerateContent} />,
    [newsItems, handleGenerateContent],
  )

  const memoizedTechnicalAnalysis = useMemo(() => <TechnicalAnalysisView news={newsItems} />, [newsItems])

  const memoizedAdvancedFeatures = useMemo(() => <AdvancedFeaturesPanel />, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto py-6 px-4">
        {/* Header con estadísticas de rendimiento */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">Press Manager AI</h1>
              <p className="text-muted-foreground">Gestor de Prensa Inteligente con Análisis Político Avanzado</p>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>

          <PerformanceStats />
        </div>

        {/* Alertas de estado */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!apiKeysConfigured && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuración Requerida</AlertTitle>
            <AlertDescription>
              Configure al menos una clave API (OpenAI o Anthropic) en la sección de configuración para usar todas las
              funcionalidades.
            </AlertDescription>
          </Alert>
        )}

        {/* Navegación principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="manager" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Manager</span>
            </TabsTrigger>
            <TabsTrigger value="circular" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Circular</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Avanzado</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Contenido de las pestañas */}
          <TabsContent value="dashboard" className="space-y-4">
            {memoizedDashboard}
          </TabsContent>

          <TabsContent value="manager" className="space-y-4">
            {memoizedStreamlinedManager}
          </TabsContent>

          <TabsContent value="circular" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Interfaz Circular Interactiva
                </CardTitle>
              </CardHeader>
              <CardContent>{memoizedCircularInterface}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  Análisis Técnico Avanzado
                </CardTitle>
              </CardHeader>
              <CardContent>{memoizedTechnicalAnalysis}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {memoizedAdvancedFeatures}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Estado del Sistema</AlertTitle>
                    <AlertDescription>
                      {apiKeysConfigured
                        ? "Sistema configurado correctamente. Todas las funcionalidades están disponibles."
                        : "Configure al menos una clave API para habilitar todas las funcionalidades."}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Estadísticas de Uso</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Mensajes generados:</span>
                          <Badge variant="outline">{messagesGenerated}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Noticias cargadas:</span>
                          <Badge variant="outline">{newsItems.length}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Partido seleccionado:</span>
                          <Badge variant="outline">{selectedParty}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                          onClick={handleRefreshNews}
                          disabled={isLoadingNews}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNews ? "animate-spin" : ""}`} />
                          Actualizar Noticias
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                          onClick={() => {
                            localStorage.clear()
                            window.location.reload()
                          }}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Limpiar Cache
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Función para obtener noticias de ejemplo
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
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
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
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      url: "https://example.com/news/3",
      acceptance: { positive: 30, neutral: 35, negative: 35 },
      shareMetrics: { total: 1800, facebook: 700, twitter: 600, whatsapp: 450, other: 50 },
    },
  ]
}
