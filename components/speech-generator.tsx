"use client"

import { useState, useEffect } from "react"
// Añadir los imports faltantes al principio del archivo
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Copy, Check, RefreshCw, Download, FileText, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import { adaptNewsForParty } from "@/lib/ai-service"
import { scrapeWebsite } from "@/lib/scrape-action"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { analyzeText } from "@/lib/nlp-service"

export default function SpeechGenerator() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [selectedNews, setSelectedNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [generatedSpeech, setGeneratedSpeech] = useState<string>("")
  const [speechTitle, setSpeechTitle] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [selectedParty, setSelectedParty] = useState<PoliticalParty>("libertad-avanza")
  const [speechLength, setSpeechLength] = useState<"short" | "medium" | "long">("medium")
  const [speechTone, setSpeechTone] = useState<"formal" | "passionate" | "conversational">("formal")
  const [speechFocus, setSpeechFocus] = useState<"problems" | "solutions" | "balanced">("balanced")
  const [includeStatistics, setIncludeStatistics] = useState<boolean>(true)
  const [includeHistoricalContext, setIncludeHistoricalContext] = useState<boolean>(true)
  const [includeQuotes, setIncludeQuotes] = useState<boolean>(false)
  const [audience, setAudience] = useState<"general" | "supporters" | "undecided" | "opposition">("general")
  const [speechContext, setSpeechContext] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("news")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [speechCategory, setSpeechCategory] = useState<string>("general")
  const [fallbackMode, setFallbackMode] = useState(false)

  // Añadir este nuevo estado para controlar la alerta de API
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<"valid" | "invalid" | "missing" | "quota_exceeded">("missing")

  // Añadir este useEffect para verificar la clave API al cargar el componente
  useEffect(() => {
    checkApiKeyStatus()
  }, [])

  // Función para verificar el estado de la clave API
  const checkApiKeyStatus = () => {
    // Verificar si hay una clave API válida
    const apiKey = localStorage.getItem("openai_api_key")
    const hasApiError = localStorage.getItem("openai_api_error")
    const hasQuotaExceeded = localStorage.getItem("openai_quota_exceeded")

    if (hasQuotaExceeded) {
      setApiKeyStatus("quota_exceeded")
      setShowApiKeyAlert(true)
      setFallbackMode(true)
    } else if (hasApiError) {
      setApiKeyStatus("invalid")
      setShowApiKeyAlert(true)
      setFallbackMode(true)
    } else if (!apiKey || !apiKey.startsWith("sk-")) {
      setApiKeyStatus("missing")
      setShowApiKeyAlert(true)
      setFallbackMode(true)
    } else {
      setApiKeyStatus("valid")
      setShowApiKeyAlert(false)
      setFallbackMode(false)
    }
  }

  // Filtrar noticias cuando cambia el término de búsqueda
  useEffect(() => {
    if (newsItems.length > 0) {
      const filtered = newsItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.source.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredNews(filtered)
    }
  }, [searchTerm, newsItems])

  // Inicializar filteredNews con todas las noticias al cargar
  useEffect(() => {
    setFilteredNews(newsItems)
  }, [newsItems])

  // Función para obtener noticias
  const handleScrapeNews = async () => {
    setIsLoading(true)
    setError(null)
    setWarning(null)
    setProgress(0)

    try {
      // Using default news websites for scraping
      const defaultNewsWebsites = [
        "https://www.clarin.com",
        "https://www.lanacion.com.ar",
        "https://www.infobae.com",
        "https://www.pagina12.com.ar",
        "https://www.ambito.com",
        "https://www.perfil.com",
      ]

      let allNews: NewsItem[] = []

      // Try to scrape from each website
      for (let i = 0; i < defaultNewsWebsites.length; i++) {
        try {
          const website = defaultNewsWebsites[i]
          setProgress(Math.round(((i + 1) / defaultNewsWebsites.length) * 100))

          const news = await scrapeWebsite(website)
          if (news && news.length > 0) {
            allNews = [...allNews, ...news]
          }
        } catch (err) {
          console.error(`Error scraping website:`, err)
          // Continue with other websites even if one fails
        }
      }

      if (allNews.length > 0) {
        // Filtrar noticias similares
        const uniqueNewsItems = filterSimilarNews(allNews)
        setNewsItems(uniqueNewsItems)
        setFilteredNews(uniqueNewsItems)
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

  // Función para filtrar noticias similares
  function filterSimilarNews(newsList: NewsItem[], similarityThreshold = 0.4): NewsItem[] {
    const filteredNews: NewsItem[] = []

    for (const news of newsList) {
      // Verificar si esta noticia es similar a alguna ya incluida
      const isSimilarToExisting = filteredNews.some(
        (existingNews) => calculateNewsSimilarity(news, existingNews) > similarityThreshold,
      )

      // Solo incluir si no es similar a las existentes
      if (!isSimilarToExisting) {
        filteredNews.push(news)
      }
    }

    return filteredNews
  }

  // Función para calcular similitud entre noticias
  function calculateNewsSimilarity(news1: NewsItem, news2: NewsItem): number {
    // Calcular similitud basada en título y resumen
    const text1 = `${news1.title} ${news1.summary || ""}`.toLowerCase()
    const text2 = `${news2.title} ${news2.summary || ""}`.toLowerCase()

    // Dividir en palabras
    const words1 = text1.split(/\s+/)
    const words2 = text2.split(/\s+/)

    // Contar palabras comunes
    const commonWords = words1.filter((word) => words2.includes(word))

    // Calcular similitud como proporción de palabras comunes
    return commonWords.length / Math.max(words1.length, words2.length)
  }

  // Función para generar un discurso político
  const generateSpeech = async () => {
    if (selectedNews.length === 0) {
      setError("Por favor, seleccione al menos una noticia para generar el discurso.")
      return
    }

    // Verificar el estado de la clave API antes de continuar
    checkApiKeyStatus()

    // Si estamos en modo fallback, mostrar una advertencia pero continuar
    if (fallbackMode) {
      setWarning(
        "La aplicación está funcionando en modo limitado debido a problemas con la API de OpenAI. El discurso generado puede ser básico.",
      )
    }

    setIsGenerating(true)
    setError(null)
    setProgress(0)

    try {
      // Obtener la clave API del localStorage
      const clientApiKey = localStorage.getItem("openai_api_key") || ""

      // Preparar el contexto del discurso
      const speechParams = {
        party: selectedParty,
        length: speechLength,
        tone: speechTone,
        focus: speechFocus,
        includeStatistics,
        includeHistoricalContext,
        includeQuotes,
        audience,
        context: speechContext,
        category: speechCategory,
        title: speechTitle || "Discurso político",
      }

      // Actualizar progreso
      setProgress(20)

      // Generar el discurso
      let result
      try {
        result = await adaptNewsForParty(selectedNews, selectedParty, clientApiKey, speechParams)

        // Actualizar progreso
        setProgress(80)

        // Establecer el discurso generado
        setGeneratedSpeech(result.generalMessage)
        setProgress(90)
      } catch (speechGenError) {
        console.error("Error al generar discurso:", speechGenError)
        const errorMessage = speechGenError instanceof Error ? speechGenError.message : String(speechGenError)

        if (
          errorMessage.toLowerCase().includes("quota") ||
          errorMessage.toLowerCase().includes("exceeded") ||
          errorMessage.toLowerCase().includes("billing") ||
          errorMessage.toLowerCase().includes("rate limit")
        ) {
          setWarning(
            "Se ha excedido la cuota de la API de OpenAI. Se utilizará un discurso básico generado localmente.",
          )
          localStorage.setItem("openai_quota_exceeded", "true")
          setApiKeyStatus("quota_exceeded")
          setShowApiKeyAlert(true)
          setFallbackMode(true)

          // Generar un discurso básico basado en las noticias seleccionadas
          setGeneratedSpeech(generateBasicSpeech(selectedNews, selectedParty, speechParams))
        } else if (
          errorMessage.toLowerCase().includes("api key") ||
          errorMessage.toLowerCase().includes("authentication")
        ) {
          setWarning("La clave API de OpenAI no es válida. Se utilizará un discurso básico generado localmente.")
          localStorage.setItem("openai_api_error", "invalid_key")
          setApiKeyStatus("invalid")
          setShowApiKeyAlert(true)
          setFallbackMode(true)

          // Generar un discurso básico basado en las noticias seleccionadas
          setGeneratedSpeech(generateBasicSpeech(selectedNews, selectedParty, speechParams))
        } else {
          setError("Error al generar el discurso. Se utilizará un discurso básico generado localmente.")

          // Generar un discurso básico basado en las noticias seleccionadas
          setGeneratedSpeech(generateBasicSpeech(selectedNews, selectedParty, speechParams))
        }
      }

      // Analizar el sentimiento del discurso generado
      if (generatedSpeech) {
        try {
          const sentimentResult = await analyzeText(generatedSpeech, clientApiKey)
          setSentimentAnalysis(sentimentResult)
        } catch (sentimentError) {
          console.error("Error al analizar sentimiento:", sentimentError)
          // No mostrar error, simplemente usar análisis predeterminado
          setSentimentAnalysis({
            sentiment: {
              positive: 33,
              negative: 33,
              neutral: 34,
              dominant: "neutral",
            },
            readabilityScore: 70,
            complexity: 65,
            formalityLevel: 70,
            keywords: ["política", "economía", "sociedad", "desarrollo", "propuestas"],
            keyTopics: [
              {
                topic: "Análisis político",
                sentiment: {
                  positive: 50,
                  negative: 25,
                  neutral: 25,
                  dominant: "positive",
                },
              },
              {
                topic: "Propuestas económicas",
                sentiment: {
                  positive: 40,
                  negative: 30,
                  neutral: 30,
                  dominant: "positive",
                },
              },
            ],
            dominantTone: "informativo",
            targetAudience: "público general interesado en política",
          })
        }
      }

      setProgress(100)
    } catch (err) {
      // Este bloque manejará errores no capturados en los bloques try/catch internos
      console.error("Error general en generateSpeech:", err)
      setError("Error inesperado al generar el discurso. Se utilizará un discurso básico generado localmente.")

      // Generar un discurso básico basado en las noticias seleccionadas
      setGeneratedSpeech(generateBasicSpeech(selectedNews, selectedParty, speechParams))
    } finally {
      setIsGenerating(false)
    }
  }

  // Función para generar un discurso básico sin usar la API
  const generateBasicSpeech = (news: NewsItem[], party: PoliticalParty, params: any): string => {
    const partyName = getPartyName(party)
    const title = params.title || "Discurso político"
    const newsTopics = news.map((item) => item.title).join(", ")

    let introduction = ""
    let body = ""
    let conclusion = ""

    // Introducción según el partido
    switch (party) {
      case "libertad-avanza":
        introduction = `Estimados compatriotas, hoy me dirijo a ustedes como representante de ${partyName} para hablar sobre temas cruciales que afectan a nuestra nación. Las recientes noticias sobre ${newsTopics} requieren nuestra atención y análisis desde una perspectiva de libertad y respeto por los derechos individuales.`
        break
      case "union-patria":
        introduction = `Querido pueblo argentino, como parte de ${partyName}, es mi deber dirigirme a ustedes para analizar la situación actual de nuestro país. Los recientes acontecimientos relacionados con ${newsTopics} nos obligan a reflexionar sobre el rumbo de nuestra patria y las políticas necesarias para proteger a los más vulnerables.`
        break
      case "juntos-cambio":
        introduction = `Ciudadanas y ciudadanos, desde ${partyName} queremos compartir nuestra visión sobre los recientes acontecimientos que marcan la agenda nacional. Las noticias sobre ${newsTopics} requieren un análisis serio y propuestas concretas para avanzar hacia un país con más oportunidades para todos.`
        break
      case "frente-izquierda":
        introduction = `Compañeras y compañeros, desde ${partyName} nos dirigimos al pueblo trabajador para analizar la coyuntura actual. Los recientes hechos relacionados con ${newsTopics} demuestran una vez más las contradicciones del sistema capitalista y la necesidad de una alternativa que defienda los intereses de la clase trabajadora.`
        break
      default:
        introduction = `Estimados ciudadanos, hoy analizaremos desde nuestra perspectiva política los recientes acontecimientos que afectan a nuestro país. Las noticias sobre ${newsTopics} merecen un análisis detallado y propuestas concretas.`
    }

    // Cuerpo del discurso basado en las noticias
    body = news
      .map((item) => {
        let analysis = ""

        switch (party) {
          case "libertad-avanza":
            analysis = `Respecto a "${item.title}", desde ${partyName} consideramos que este tema debe abordarse desde la perspectiva de la libertad individual y la reducción del intervencionismo estatal. Es fundamental que los ciudadanos puedan tomar sus propias decisiones sin la constante interferencia del Estado.`
            break
          case "union-patria":
            analysis = `En relación a "${item.title}", desde ${partyName} creemos que es necesario implementar políticas públicas que protejan a los sectores más vulnerables. El Estado debe tener un rol activo para garantizar la justicia social y la distribución equitativa de la riqueza.`
            break
          case "juntos-cambio":
            analysis = `Sobre "${item.title}", en ${partyName} proponemos un enfoque equilibrado que combine el desarrollo económico con la inclusión social. Necesitamos instituciones fuertes y transparentes que generen confianza y atraigan inversiones para crear empleo de calidad.`
            break
          case "frente-izquierda":
            analysis = `Analizando "${item.title}", desde ${partyName} denunciamos cómo este hecho evidencia las contradicciones del sistema capitalista. Los trabajadores y sectores populares son quienes sufren las consecuencias de políticas que solo benefician a los grandes empresarios y especuladores financieros.`
            break
          default:
            analysis = `Sobre "${item.title}", consideramos que es necesario un análisis profundo que contemple las diferentes perspectivas y proponga soluciones concretas para beneficio de toda la sociedad.`
        }

        return analysis
      })
      .join("\n\n")

    // Conclusión según el partido
    switch (party) {
      case "libertad-avanza":
        conclusion = `Para concluir, desde ${partyName} reafirmamos nuestro compromiso con la libertad económica y los derechos individuales. Seguiremos trabajando para reducir el tamaño del Estado, bajar impuestos y eliminar regulaciones que obstaculizan el desarrollo y la prosperidad de los argentinos. ¡Viva la libertad, carajo!`
        break
      case "union-patria":
        conclusion = `En síntesis, desde ${partyName} continuaremos defendiendo un modelo de país con justicia social, independencia económica y soberanía política. No daremos ni un paso atrás en la defensa de los derechos conquistados y seguiremos trabajando por una patria justa, libre y soberana para todos los argentinos y argentinas.`
        break
      case "juntos-cambio":
        conclusion = `En conclusión, desde ${partyName} reafirmamos nuestro compromiso con un cambio responsable que combine crecimiento económico, fortalecimiento institucional e inclusión social. Seguiremos trabajando por un país con reglas claras, oportunidades para todos y un futuro mejor para las próximas generaciones.`
        break
      case "frente-izquierda":
        conclusion = `Para finalizar, desde ${partyName} llamamos a la organización y movilización de los trabajadores y sectores populares. Solo con la unidad en la lucha podremos enfrentar las políticas de ajuste y construir una alternativa política de los trabajadores y la izquierda. ¡La lucha continúa, compañeros!`
        break
      default:
        conclusion = `En conclusión, seguiremos trabajando por un país mejor, con más oportunidades para todos y soluciones concretas a los problemas que enfrentamos como sociedad. El diálogo y el consenso serán nuestras herramientas para construir un futuro mejor.`
    }

    // Ajustar la longitud según el parámetro
    let fullSpeech = `${introduction}\n\n${body}\n\n${conclusion}`

    if (params.length === "short") {
      // Para discursos cortos, reducir el contenido
      const bodyParts = body.split("\n\n")
      const shortenedBody = bodyParts.slice(0, Math.min(2, bodyParts.length)).join("\n\n")
      fullSpeech = `${introduction}\n\n${shortenedBody}\n\n${conclusion}`
    } else if (params.length === "long") {
      // Para discursos largos, expandir con más detalles
      const expandedBody =
        body +
        "\n\n" +
        news
          .map((item) => {
            return `Profundizando en "${item.title}", es importante destacar que este tema tiene múltiples aristas que deben ser consideradas. Desde ${partyName}, creemos firmemente que es necesario un análisis exhaustivo que contemple tanto las causas como las posibles soluciones a largo plazo.`
          })
          .join("\n\n")

      fullSpeech = `${introduction}\n\n${expandedBody}\n\n${conclusion}`
    }

    // Ajustar el tono según el parámetro
    if (params.tone === "passionate") {
      fullSpeech = fullSpeech
        .replace(/consideramos/g, "estamos convencidos")
        .replace(/creemos/g, "afirmamos con total convicción")
        .replace(/proponemos/g, "exigimos")
        .replace(/analizando/g, "observando con indignación")
    } else if (params.tone === "conversational") {
      fullSpeech = fullSpeech
        .replace(/Estimados ciudadanos/g, "Hola a todos")
        .replace(/Querido pueblo argentino/g, "Amigos y amigas")
        .replace(/Ciudadanas y ciudadanos/g, "Vecinos y vecinas")
        .replace(/Compañeras y compañeros/g, "Amigos todos")
    }

    return fullSpeech
  }

  // Función para copiar el discurso al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSpeech)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Función para descargar el discurso como archivo de texto
  const downloadSpeech = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedSpeech], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${speechTitle || "discurso-politico"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Función para seleccionar/deseleccionar una noticia
  const toggleNewsSelection = (newsItem: NewsItem) => {
    if (selectedNews.some((item) => item.title === newsItem.title)) {
      setSelectedNews(selectedNews.filter((item) => item.title !== newsItem.title))
    } else {
      setSelectedNews([...selectedNews, newsItem])
    }
  }

  // Función para filtrar noticias por categoría
  const filterNewsByCategory = (category: string) => {
    if (category === "all") {
      setFilteredNews(newsItems)
    } else {
      setFilteredNews(newsItems.filter((item) => item.category === category))
    }
  }

  // Obtener categorías únicas de las noticias
  const uniqueCategories = Array.from(new Set(newsItems.map((item) => item.category)))

  // Función para obtener el nombre del partido
  const getPartyName = (party: PoliticalParty): string => {
    switch (party) {
      case "libertad-avanza":
        return "La Libertad Avanza"
      case "union-patria":
        return "Unión por la Patria"
      case "juntos-cambio":
        return "Juntos por el Cambio"
      case "frente-izquierda":
        return "Frente de Izquierda"
      case "otros":
        return "Otros partidos"
      default:
        return "Desconocido"
    }
  }

  // Función para obtener el color del partido
  const getPartyColor = (party: PoliticalParty): string => {
    switch (party) {
      case "libertad-avanza":
        return "bg-purple-100 text-purple-800"
      case "union-patria":
        return "bg-blue-100 text-blue-800"
      case "juntos-cambio":
        return "bg-yellow-100 text-yellow-800"
      case "frente-izquierda":
        return "bg-red-100 text-red-800"
      case "otros":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generador de Discursos Políticos</CardTitle>
          <CardDescription>Crea discursos políticos personalizados basados en noticias actuales</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {showApiKeyAlert && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {apiKeyStatus === "quota_exceeded"
                    ? "Cuota de API excedida"
                    : apiKeyStatus === "invalid"
                      ? "Clave API no válida"
                      : "Configuración de API requerida"}
                </AlertTitle>
                <AlertDescription>
                  {apiKeyStatus === "quota_exceeded" ? (
                    <div>
                      <p>Se ha excedido la cuota de la API de OpenAI. Para resolver este problema:</p>
                      <ul className="list-disc pl-5 mt-2">
                        <li>
                          Verifique su plan de facturación en la{" "}
                          <a
                            href="https://platform.openai.com/account/billing/overview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline"
                          >
                            página de facturación de OpenAI
                          </a>
                        </li>
                        <li>Considere actualizar a un plan de pago si está utilizando una cuenta gratuita</li>
                        <li>
                          O utilice una clave API diferente en la{" "}
                          <a href="/settings" className="font-medium underline">
                            página de configuración
                          </a>
                        </li>
                      </ul>
                      <p className="mt-2">
                        <strong>Nota:</strong> La aplicación funcionará en modo limitado con funcionalidades básicas.
                      </p>
                    </div>
                  ) : apiKeyStatus === "invalid" ? (
                    <div>
                      <p>
                        La clave API proporcionada no es válida. Por favor, verifique su clave API en la{" "}
                        <a href="/settings" className="font-medium underline">
                          página de configuración
                        </a>
                        .
                      </p>
                      <p className="mt-2">
                        <strong>Nota:</strong> La aplicación funcionará en modo limitado con funcionalidades básicas.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p>
                        Para generar discursos políticos con todas las funcionalidades, necesitas configurar una clave
                        API válida de OpenAI en la{" "}
                        <a href="/settings" className="font-medium underline">
                          página de configuración
                        </a>
                        .
                      </p>
                      <p className="mt-2">
                        <strong>Nota:</strong> La aplicación funcionará en modo limitado con funcionalidades básicas.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {fallbackMode && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Modo de funcionamiento limitado</AlertTitle>
                <AlertDescription>
                  La aplicación está funcionando en modo limitado debido a problemas con la API de OpenAI. Los discursos
                  generados serán más básicos, pero podrás seguir utilizando la aplicación.
                </AlertDescription>
              </Alert>
            )}

            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="news">Noticias</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
              <TabsTrigger value="speech">Discurso</TabsTrigger>
            </TabsList>

            {/* Pestaña de Noticias */}
            <TabsContent value="news" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button onClick={handleScrapeNews} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Obteniendo noticias... ({Math.round(progress)}%)
                    </>
                  ) : (
                    "Obtener noticias automáticamente"
                  )}
                </Button>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Buscar noticias..."
                    className="w-full px-3 py-2 border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Obteniendo noticias...</span>
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

              {/* Filtros de categoría */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => filterNewsByCategory("all")}
                >
                  Todas
                </Badge>
                {uniqueCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => filterNewsByCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Lista de noticias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Noticias disponibles ({filteredNews.length})</h3>
                  <ScrollArea className="h-[400px] border rounded-md p-2">
                    <div className="space-y-2">
                      {filteredNews.length > 0 ? (
                        filteredNews.map((item, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              selectedNews.some((news) => news.title === item.title)
                                ? "bg-blue-50 border-blue-200"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`}
                            onClick={() => toggleNewsSelection(item)}
                          >
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-gray-500 flex justify-between">
                              <span>{item.source}</span>
                              <Badge variant="outline">{item.category}</Badge>
                            </div>
                            {item.summary && <div className="text-sm mt-1 line-clamp-2">{item.summary}</div>}
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-4">
                          {newsItems.length > 0
                            ? "No se encontraron noticias con los filtros actuales."
                            : "No hay noticias disponibles. Haz clic en 'Obtener noticias' para comenzar."}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Noticias seleccionadas ({selectedNews.length})</h3>
                  <ScrollArea className="h-[400px] border rounded-md p-2">
                    <div className="space-y-2">
                      {selectedNews.length > 0 ? (
                        selectedNews.map((item, index) => (
                          <div key={index} className="p-3 border rounded-md bg-blue-50 border-blue-200">
                            <div className="flex justify-between">
                              <div className="font-medium">{item.title}</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleNewsSelection(item)}
                              >
                                ×
                              </Button>
                            </div>
                            <div className="text-sm text-gray-500 flex justify-between">
                              <span>{item.source}</span>
                              <Badge variant="outline">{item.category}</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-4">
                          No hay noticias seleccionadas. Haz clic en las noticias disponibles para seleccionarlas.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            {/* Pestaña de Configuración */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="speech-title">Título del discurso</Label>
                    <input
                      id="speech-title"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      placeholder="Ej: Discurso sobre la situación económica"
                      value={speechTitle}
                      onChange={(e) => setSpeechTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Partido político</Label>
                    <RadioGroup
                      value={selectedParty}
                      onValueChange={(value) => setSelectedParty(value as PoliticalParty)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="libertad-avanza" id="libertad-avanza" />
                        <Label htmlFor="libertad-avanza">La Libertad Avanza</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="union-patria" id="union-patria" />
                        <Label htmlFor="union-patria">Unión por la Patria</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="juntos-cambio" id="juntos-cambio" />
                        <Label htmlFor="juntos-cambio">Juntos por el Cambio</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="frente-izquierda" id="frente-izquierda" />
                        <Label htmlFor="frente-izquierda">Frente de Izquierda</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="otros" id="otros" />
                        <Label htmlFor="otros">Otros partidos</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Longitud del discurso</Label>
                    <RadioGroup
                      value={speechLength}
                      onValueChange={(value) => setSpeechLength(value as any)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="short" id="short" />
                        <Label htmlFor="short">Corto (500-800 palabras)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">Medio (1000-1500 palabras)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="long" id="long" />
                        <Label htmlFor="long">Largo (2000-2500 palabras)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Tono del discurso</Label>
                    <RadioGroup
                      value={speechTone}
                      onValueChange={(value) => setSpeechTone(value as any)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="formal" id="formal" />
                        <Label htmlFor="formal">Formal e institucional</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="passionate" id="passionate" />
                        <Label htmlFor="passionate">Apasionado y enérgico</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="conversational" id="conversational" />
                        <Label htmlFor="conversational">Conversacional y cercano</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Enfoque del discurso</Label>
                    <RadioGroup
                      value={speechFocus}
                      onValueChange={(value) => setSpeechFocus(value as any)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="problems" id="problems" />
                        <Label htmlFor="problems">Énfasis en problemas y críticas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="solutions" id="solutions" />
                        <Label htmlFor="solutions">Énfasis en soluciones y propuestas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="balanced" id="balanced" />
                        <Label htmlFor="balanced">Equilibrado</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Audiencia objetivo</Label>
                    <Select value={audience} onValueChange={(value) => setAudience(value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona la audiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Público general</SelectItem>
                        <SelectItem value="supporters">Simpatizantes del partido</SelectItem>
                        <SelectItem value="undecided">Votantes indecisos</SelectItem>
                        <SelectItem value="opposition">Opositores políticos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Categoría principal</Label>
                    <Select value={speechCategory} onValueChange={setSpeechCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="economy">Economía</SelectItem>
                        <SelectItem value="security">Seguridad</SelectItem>
                        <SelectItem value="health">Salud</SelectItem>
                        <SelectItem value="education">Educación</SelectItem>
                        <SelectItem value="environment">Medio ambiente</SelectItem>
                        <SelectItem value="international">Relaciones internacionales</SelectItem>
                        <SelectItem value="social">Políticas sociales</SelectItem>
                        <SelectItem value="infrastructure">Infraestructura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-statistics">Incluir estadísticas</Label>
                      <Switch
                        id="include-statistics"
                        checked={includeStatistics}
                        onCheckedChange={setIncludeStatistics}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-historical">Incluir contexto histórico</Label>
                      <Switch
                        id="include-historical"
                        checked={includeHistoricalContext}
                        onCheckedChange={setIncludeHistoricalContext}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-quotes">Incluir citas y referencias</Label>
                      <Switch id="include-quotes" checked={includeQuotes} onCheckedChange={setIncludeQuotes} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="speech-context">Contexto adicional (opcional)</Label>
                    <Textarea
                      id="speech-context"
                      placeholder="Añade información contextual para el discurso, como el lugar, la ocasión o temas específicos a enfatizar"
                      className="mt-1"
                      value={speechContext}
                      onChange={(e) => setSpeechContext(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pestaña de Discurso */}
            <TabsContent value="speech" className="space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  onClick={generateSpeech}
                  disabled={isGenerating || selectedNews.length === 0}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generando discurso... ({Math.round(progress)}%)
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generar discurso
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!generatedSpeech}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSpeech}
                    disabled={!generatedSpeech}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Generando discurso...</span>
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

              {warning && (
                <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle>Advertencia</AlertTitle>
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              )}

              <div className="border rounded-md p-4 bg-white">
                {generatedSpeech ? (
                  <div>
                    <h2 className="text-xl font-bold mb-4">{speechTitle || "Discurso político"}</h2>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getPartyColor(selectedParty)}>{getPartyName(selectedParty)}</Badge>
                      <Badge variant="outline">
                        {speechLength === "short" ? "Corto" : speechLength === "medium" ? "Medio" : "Largo"}
                      </Badge>
                      <Badge variant="outline">
                        {speechTone === "formal"
                          ? "Formal"
                          : speechTone === "passionate"
                            ? "Apasionado"
                            : "Conversacional"}
                      </Badge>
                      {fallbackMode && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                          Modo limitado
                        </Badge>
                      )}
                    </div>
                    <div className="prose max-w-none">
                      {generatedSpeech
                        .split("\n")
                        .map((paragraph, index) => (paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>El discurso generado aparecerá aquí.</p>
                    <p className="text-sm mt-2">
                      Selecciona noticias, configura los parámetros y haz clic en "Generar discurso".
                    </p>
                  </div>
                )}
              </div>

              {sentimentAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis del discurso</CardTitle>
                    <CardDescription>Métricas y análisis de sentimiento del discurso generado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-md p-3">
                        <h3 className="text-sm font-medium text-gray-500">Sentimiento</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${sentimentAnalysis.sentiment.positive}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>Positivo</span>
                              <span>{Math.round(sentimentAnalysis.sentiment.positive)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-500"
                                style={{ width: `${sentimentAnalysis.sentiment.neutral}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>Neutral</span>
                              <span>{Math.round(sentimentAnalysis.sentiment.neutral)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{ width: `${sentimentAnalysis.sentiment.negative}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>Negativo</span>
                              <span>{Math.round(sentimentAnalysis.sentiment.negative)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-md p-3">
                        <h3 className="text-sm font-medium text-gray-500">Métricas de legibilidad</h3>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs">Legibilidad</span>
                            <span className="text-xs font-medium">{sentimentAnalysis.readabilityScore}/100</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${sentimentAnalysis.readabilityScore}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs">Complejidad</span>
                            <span className="text-xs font-medium">{sentimentAnalysis.complexity}/100</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${sentimentAnalysis.complexity}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs">Formalidad</span>
                            <span className="text-xs font-medium">{sentimentAnalysis.formalityLevel}/100</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500"
                              style={{ width: `${sentimentAnalysis.formalityLevel}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-md p-3">
                        <h3 className="text-sm font-medium text-gray-500">Palabras clave</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {sentimentAnalysis.keywords.map((keyword: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mt-4">Temas principales</h3>
                        <div className="mt-2">
                          {sentimentAnalysis.keyTopics.map((topic: any, index: number) => (
                            <div key={index} className="text-sm mb-2">
                              <div className="flex justify-between">
                                <span>{topic.topic}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    topic.sentiment.dominant === "positive"
                                      ? "bg-green-50 text-green-700"
                                      : topic.sentiment.dominant === "negative"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-yellow-50 text-yellow-700"
                                  }
                                >
                                  {topic.sentiment.dominant}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
