"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Newspaper,
  MessageCircle,
  Scale,
  History,
  BookOpen,
  Lightbulb,
  RefreshCw,
  FileText,
  Users,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Filter,
  AlertCircle,
  Radio,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { adaptNewsForParty } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"

// Define the political parties
const POLITICAL_PARTIES: { id: PoliticalParty; name: string; color: string; bgColor: string; icon: JSX.Element }[] = [
  {
    id: "libertad-avanza",
    name: "La Libertad Avanza",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    icon: <Lightbulb className="h-5 w-5 text-purple-600" />,
  },
  {
    id: "union-patria",
    name: "Unión por la Patria",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: <Users className="h-5 w-5 text-blue-600" />,
  },
  {
    id: "juntos-cambio",
    name: "Juntos por el Cambio",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: <RefreshCw className="h-5 w-5 text-yellow-600" />,
  },
  {
    id: "frente-izquierda",
    name: "Frente de Izquierda",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: <Scale className="h-5 w-5 text-red-600" />,
  },
  {
    id: "otros",
    name: "Otros Partidos",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: <Users className="h-5 w-5 text-gray-600" />,
  },
]

// Define the function types with more specific descriptions and outputs
const FUNCTION_TYPES = [
  {
    id: "laws",
    name: "Leyes",
    icon: <FileText className="h-5 w-5" />,
    description: "Análisis de leyes y predicciones de voto",
    outputFormat: "Análisis detallado de proyectos de ley con predicciones de voto para cada partido político",
  },
  {
    id: "news",
    name: "Noticias",
    icon: <Newspaper className="h-5 w-5" />,
    description: "Noticias actualizadas",
    outputFormat: "Resumen de noticias recientes con enfoque en el impacto político",
  },
  {
    id: "opinions",
    name: "Opiniones",
    icon: <MessageCircle className="h-5 w-5" />,
    description: "Opiniones políticas",
    outputFormat: "Posicionamiento político sobre temas de actualidad con argumentos persuasivos",
  },
  {
    id: "solutions",
    name: "Soluciones",
    icon: <Lightbulb className="h-5 w-5" />,
    description: "Propuestas concretas",
    outputFormat: "Propuestas de políticas públicas y soluciones a problemas actuales",
  },
  {
    id: "historical",
    name: "Historia",
    icon: <History className="h-5 w-5" />,
    description: "Contexto histórico",
    outputFormat: "Análisis de precedentes históricos relacionados con la situación actual",
  },
  {
    id: "philosophical",
    name: "Filosofía",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Fundamentos ideológicos",
    outputFormat: "Explicación de los principios filosóficos e ideológicos que sustentan las posiciones políticas",
  },
]

// Función de utilidad para asegurar que los datos de aceptación y compartidos estén disponibles
const ensureDataStructure = (newsItems: NewsItem[]): NewsItem[] => {
  return newsItems.map((item) => ({
    ...item,
    acceptance: item.acceptance || { positive: 50, neutral: 30, negative: 20 },
    shareMetrics: item.shareMetrics || { total: 0, facebook: 0, twitter: 0, whatsapp: 0, other: 0 },
  }))
}

interface CircularInterfaceProps {
  newsItems: NewsItem[]
  onGenerateContent: (party: PoliticalParty, contentType: string, content: any) => void
}

export default function CircularInterface({ newsItems, onGenerateContent }: CircularInterfaceProps) {
  const [selectedParty, setSelectedParty] = useState<PoliticalParty | null>(null)
  const [selectedFunction, setSelectedFunction] = useState<string | null>("laws") // Default to laws
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("laws") // Default to laws
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [lawsNews, setLawsNews] = useState<NewsItem[]>([])
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const circleRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Filter news related to laws on component mount and when newsItems change
  useEffect(() => {
    if (newsItems.length > 0) {
      // Asegurar que todos los elementos tengan la estructura de datos correcta
      const processedNewsItems = ensureDataStructure(newsItems)

      const lawsRelatedNews = processedNewsItems.filter(
        (item) =>
          item.title.toLowerCase().includes("ley") ||
          item.title.toLowerCase().includes("legisla") ||
          item.title.toLowerCase().includes("congreso") ||
          item.title.toLowerCase().includes("parlamento") ||
          item.title.toLowerCase().includes("diputados") ||
          item.title.toLowerCase().includes("senadores") ||
          item.title.toLowerCase().includes("proyecto") ||
          item.title.toLowerCase().includes("reforma") ||
          item.title.toLowerCase().includes("normativa") ||
          item.title.toLowerCase().includes("regulación") ||
          item.title.toLowerCase().includes("debate") ||
          item.title.toLowerCase().includes("votación") ||
          (item.legislativeInfo && item.legislativeInfo.isLegislative) ||
          item.category === "politics" ||
          item.category === "nacional",
      )

      setLawsNews(lawsRelatedNews)
      setFilteredNews(lawsRelatedNews) // Default to showing laws-related news

      // Si hay noticias legislativas, seleccionar la primera por defecto
      if (lawsRelatedNews.length > 0) {
        setSelectedNewsItem(lawsRelatedNews[0])
      }
    }
  }, [newsItems])

  // Animation for background color based on selected party
  const getBackgroundColor = () => {
    if (!selectedParty) return "bg-gradient-to-r from-gray-100 to-gray-200"

    const party = POLITICAL_PARTIES.find((p) => p.id === selectedParty)
    if (!party) return "bg-gradient-to-r from-gray-100 to-gray-200"

    switch (party.id) {
      case "libertad-avanza":
        return "bg-gradient-to-r from-purple-50 to-purple-100"
      case "union-patria":
        return "bg-gradient-to-r from-blue-50 to-blue-100"
      case "juntos-cambio":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100"
      case "frente-izquierda":
        return "bg-gradient-to-r from-red-50 to-red-100"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200"
    }
  }

  // Handle click on a party button
  const handlePartyClick = (party: PoliticalParty) => {
    setSelectedParty(party)
    if (selectedFunction && selectedNewsItem) {
      generateContent(party, selectedFunction, selectedNewsItem)
    }
  }

  // Handle click on a function button
  const handleFunctionClick = (functionId: string) => {
    setSelectedFunction(functionId)
    setActiveTab(functionId)

    // Filter news based on function type
    if (functionId === "laws") {
      setFilteredNews(lawsNews)
    } else {
      setFilteredNews(newsItems)
    }

    if (selectedParty && selectedNewsItem) {
      generateContent(selectedParty, functionId, selectedNewsItem)
    }
  }

  // Handle news item selection
  const handleNewsItemClick = (newsItem: NewsItem) => {
    setSelectedNewsItem(newsItem)
    if (selectedParty && selectedFunction) {
      generateContent(selectedParty, selectedFunction, newsItem)
    }
  }

  // Toggle live mode
  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode)
    toast({
      title: isLiveMode ? "Modo normal activado" : "Modo en vivo activado",
      description: isLiveMode
        ? "Interfaz estándar para análisis detallado"
        : "Interfaz optimizada para respuestas rápidas en transmisiones",
    })
  }

  // Generate content based on selected party, function and news item
  const generateContent = async (party: PoliticalParty, functionType: string, newsItem: NewsItem | null) => {
    if (!newsItem) {
      toast({
        title: "No hay noticia seleccionada",
        description: "Selecciona una noticia para generar contenido",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Get API key from localStorage as fallback
      const apiKey = localStorage.getItem("openai_api_key")

      // Use a single news item for focused analysis
      const newsItemsToAnalyze = [newsItem]

      // Generate content based on function type
      switch (functionType) {
        case "laws":
          if (!newsItem.legislativeInfo?.isLegislative) {
            // Si la noticia no tiene información legislativa, intentar inferirla
            const lawsPrompt = `
Analiza esta noticia relacionada con leyes y proyectos legislativos desde la perspectiva del partido ${
              POLITICAL_PARTIES.find((p) => p.id === party)?.name
            }.

Noticia: ${newsItem.title}
Resumen: ${newsItem.summary}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}

1. Explica en lenguaje simple y accesible de qué trata esta ley o proyecto
2. Analiza los posibles impactos sociales y económicos
3. Predice cómo votaría cada partido político (a favor, en contra o abstención) con porcentajes
4. Justifica brevemente la posición de cada partido
5. Proporciona argumentos persuasivos que el partido ${
              POLITICAL_PARTIES.find((p) => p.id === party)?.name
            } podría usar para defender su posición

El tono debe ser accesible para el público general, evitando tecnicismos excesivos o lenguaje elitista.
Usa lenguaje claro y directo, como si estuvieras explicándolo en una transmisión de radio o TV.
Incluye un contexto histórico breve relacionado con esta ley o tema similar en el pasado.
`

            const lawsResult = await adaptNewsForParty(newsItemsToAnalyze, party, apiKey)
            onGenerateContent(party, functionType, {
              generalMessage: lawsResult.generalMessage,
              topicOpinions: lawsResult.topicOpinions,
              newsItem,
              customPrompt: lawsPrompt,
            })
          } else {
            // Si ya tiene información legislativa, usar esa
            const lawsPrompt = `
Analiza esta ley o proyecto legislativo desde la perspectiva del partido ${
              POLITICAL_PARTIES.find((p) => p.id === party)?.name
            }.

Ley: ${newsItem.legislativeInfo.lawName}
Descripción: ${newsItem.legislativeInfo.lawDescription}
Fecha estimada de votación: ${new Date(newsItem.legislativeInfo.voteDate || "").toLocaleDateString()}

1. Explica en lenguaje simple y accesible de qué trata esta ley
2. Analiza los posibles impactos sociales y económicos
3. Predice cómo votaría cada partido político (a favor, en contra o abstención) con porcentajes
4. Justifica brevemente la posición de cada partido
5. Proporciona argumentos persuasivos que el partido ${
              POLITICAL_PARTIES.find((p) => p.id === party)?.name
            } podría usar para defender su posición

El tono debe ser accesible para el público general, evitando tecnicismos excesivos o lenguaje elitista.
Usa lenguaje claro y directo, como si estuvieras explicándolo en una transmisión de radio o TV.
Incluye un contexto histórico breve relacionado con esta ley o tema similar en el pasado.
`

            const lawsResult = await adaptNewsForParty(newsItemsToAnalyze, party, apiKey)
            onGenerateContent(party, functionType, {
              generalMessage: lawsResult.generalMessage,
              topicOpinions: lawsResult.topicOpinions,
              newsItem,
              customPrompt: lawsPrompt,
            })
          }
          break

        case "news":
          // Custom prompt for news analysis
          const newsPrompt = `
Analiza esta noticia desde la perspectiva del partido ${POLITICAL_PARTIES.find((p) => p.id === party)?.name}.

Noticia: ${newsItem.title}
Resumen: ${newsItem.summary}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}

1. Resume el hecho principal en lenguaje simple y accesible (máximo 2 oraciones)
2. Explica por qué es relevante para la ciudadanía (máximo 2 oraciones)
3. Analiza cómo afecta a diferentes sectores sociales (máximo 3 oraciones)
4. Proporciona el enfoque único que tendría el partido ${
            POLITICAL_PARTIES.find((p) => p.id === party)?.name
          } sobre este tema (máximo 3 oraciones)

El tono debe ser informativo pero accesible, evitando tanto el sensacionalismo como el lenguaje técnico excesivo.
Usa lenguaje claro y directo, como si estuvieras explicándolo en una transmisión de radio o TV.
`

          const newsResult = await adaptNewsForParty(newsItemsToAnalyze, party, apiKey)
          onGenerateContent(party, functionType, {
            generalMessage: newsResult.generalMessage,
            topicOpinions: newsResult.topicOpinions,
            newsItem,
            customPrompt: newsPrompt,
          })
          break

        case "opinions":
          // Custom prompt for political opinions
          const opinionsPrompt = `
Genera una opinión política persuasiva sobre este tema de actualidad desde la perspectiva del partido ${
            POLITICAL_PARTIES.find((p) => p.id === party)?.name
          }.

Noticia: ${newsItem.title}
Resumen: ${newsItem.summary}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}

1. Establece una posición clara y contundente (máximo 2 oraciones)
2. Proporciona 2-3 argumentos persuasivos basados en los valores del partido
3. Anticipa y refuta 1-2 contraargumentos de la oposición
4. Incluye 1-2 frases memorables que podrían ser utilizadas en discursos o comunicados

El tono debe ser apasionado pero accesible, utilizando lenguaje que resuene con el votante promedio.
Usa lenguaje claro y directo, como si estuvieras explicándolo en una transmisión de radio o TV.
`

          const opinionsResult = await adaptNewsForParty(newsItemsToAnalyze, party, apiKey)
          onGenerateContent(party, functionType, {
            generalMessage: opinionsResult.generalMessage,
            topicOpinions: opinionsResult.topicOpinions,
            newsItem,
            customPrompt: opinionsPrompt,
          })
          break

        case "solutions":
          // Custom prompt for solutions
          const solutionsPrompt = `
Proporciona soluciones concretas al problema mencionado en esta noticia desde la perspectiva del partido ${
            POLITICAL_PARTIES.find((p) => p.id === party)?.name
          }.

Noticia: ${newsItem.title}
Resumen: ${newsItem.summary}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}

1. Identifica claramente el desafío principal (máximo 2 oraciones)
2. Proporciona 2-3 propuestas concretas y viables
3. Explica brevemente cómo se implementarían estas soluciones
4. Describe los beneficios esperados para la ciudadanía
5. Menciona un ejemplo de éxito similar (nacional o internacional)

Las soluciones deben ser prácticas, explicadas en lenguaje accesible y alineadas con la ideología del partido.
Usa lenguaje claro y directo, como si estuvieras explicándolo en una transmisión de radio o TV.
`

          const solutionsResult = await adaptNewsForParty(newsItemsToAnalyze, party, apiKey)
          onGenerateContent(party, functionType, {
            generalMessage: solutionsResult.generalMessage,
            topicOpinions: solutionsResult.topicOpinions,
            newsItem,
            customPrompt: solutionsPrompt,
          })
          break

        case "historical":
          // Custom prompt for historical context
          const historicalPrompt = `
Proporciona contexto histórico relevante para entender este tema de actualidad desde la perspectiva del partido ${
            POLITICAL_PARTIES.find((p) => p.id === party)?.name
          }.

Noticia: ${newsItem.title}
Resumen: ${newsItem.summary}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}

1. Identifica 1-2 precedentes históricos relevantes en Argentina (1950-presente)
2. Explica cómo estos eventos pasados iluminan la situación actual (máximo 3 oraciones)
3. Destaca 1-2 lecciones aprendidas que deberían aplicarse hoy
4. Relaciona la tradición histórica del partido con su posición actual (máximo 2 oraciones)

El contexto histórico debe ser accesible para personas sin conocimientos especializados, evitando fechas y nombres excesivos.
Usa lenguaje claro y directo, como si estuvieras explicándolo en una transmisión de radio o TV.
`

          const historicalResult = await adaptNewsForParty(newsItemsToAnalyze, party, apiKey)
          onGenerateContent(party, functionType, {
            generalMessage: historicalResult.generalMessage,
            topicOpinions: historicalResult.topicOpinions,
            newsItem,
            customPrompt: historicalPrompt,
          })
          break

        case "philosophical":
          // Custom prompt for philosophical foundations
          const philosophicalPrompt = `
Explica los fundamentos filosóficos e ideológicos que sustentan la posición del partido ${
            POLITICAL_PARTIES.find((p) => p.id === party)?.name
          } sobre este tema.

Noticia: ${newsItem.title}
Resumen: ${newsItem.summary}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}

1. Identifica 1-2 principios filosóficos fundamentales aplicables
2. Explica cómo estos principios informan la posición del partido (máximo 3 oraciones)
3. Menciona 1-2 pensadores o tradiciones intelectuales relevantes
4. Contrasta brevemente con los fundamentos filosóficos de otro partido principal

La explicación debe ser accesible para el público general, traduciendo conceptos filosóficos complejos a lenguaje cotidiano.
Usa lenguaje claro y directo, como si estuvieras explicándolo en una transmisión de radio o TV.
`

          const philosophicalResult = await adaptNewsForParty(newsItemsToAnalyze, party, apiKey)
          onGenerateContent(party, functionType, {
            generalMessage: philosophicalResult.generalMessage,
            topicOpinions: philosophicalResult.topicOpinions,
            newsItem,
            customPrompt: philosophicalPrompt,
          })
          break

        default:
          break
      }

      toast({
        title: "Contenido generado",
        description: `Se ha generado contenido para ${POLITICAL_PARTIES.find((p) => p.id === party)?.name}`,
      })
    } catch (error) {
      console.error("Error al generar contenido:", error)
      toast({
        title: "Error al generar contenido",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Render vote prediction for a party
  const renderVotePrediction = (party: PoliticalParty, newsItem: NewsItem) => {
    const legislativeInfo = newsItem.legislativeInfo
    if (!legislativeInfo || !legislativeInfo.votePredicciones || !legislativeInfo.votePredicciones[party]) {
      return (
        <div className="text-xs text-gray-500 italic">
          No hay predicción de voto disponible para este partido en esta ley
        </div>
      )
    }

    const prediction = legislativeInfo.votePredicciones[party]
    if (!prediction) {
      return (
        <div className="text-xs text-gray-500 italic">
          No hay predicción de voto disponible para este partido en esta ley
        </div>
      )
    }

    const voteYes = prediction.voteYes || 0
    const voteNo = prediction.voteNo || 0
    const abstention = prediction.abstention || 0

    // Determine the most likely result
    const willVoteYes = voteYes > voteNo && voteYes > abstention
    const willVoteNo = voteNo > voteYes && voteNo > abstention
    const willAbstain = abstention > voteYes && abstention > voteNo

    return (
      <div className="mt-2 bg-gray-50 p-2 rounded-md">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-1 ${willVoteYes ? "bg-green-100" : "bg-gray-100"}`}>
              <ThumbsUp className={`h-4 w-4 ${willVoteYes ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <span className="text-xs mt-1">{voteYes}%</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`rounded-full p-1 ${willVoteNo ? "bg-red-100" : "bg-gray-100"}`}>
              <ThumbsDown className={`h-4 w-4 ${willVoteNo ? "text-red-600" : "text-gray-400"}`} />
            </div>
            <span className="text-xs mt-1">{voteNo}%</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`rounded-full p-1 ${willAbstain ? "bg-yellow-100" : "bg-gray-100"}`}>
              <Clock className={`h-4 w-4 ${willAbstain ? "text-yellow-600" : "text-gray-400"}`} />
            </div>
            <span className="text-xs mt-1">{abstention}%</span>
          </div>

          <div className="flex-1">
            <div className="text-xs">
              {willVoteYes && <span className="font-medium text-green-600">Probablemente vote a favor</span>}
              {willVoteNo && <span className="font-medium text-red-600">Probablemente vote en contra</span>}
              {willAbstain && <span className="font-medium text-yellow-600">Probablemente se abstenga</span>}
            </div>
            {prediction.justification && <div className="text-xs text-gray-600 mt-1">{prediction.justification}</div>}
          </div>
        </div>
      </div>
    )
  }

  // Render the live mode interface
  const renderLiveMode = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left column: News selection */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>Noticias en Debate</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {filteredNews.map((newsItem, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-2 rounded-md cursor-pointer text-xs border",
                        selectedNewsItem?.title === newsItem.title
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50 border-transparent",
                      )}
                      onClick={() => handleNewsItemClick(newsItem)}
                    >
                      <div className="font-medium">{newsItem.title}</div>
                      <div className="text-gray-500 mt-1 flex justify-between">
                        <span>{newsItem.source}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {newsItem.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Middle column: Party selection */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Partidos Políticos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-2 gap-2">
                {POLITICAL_PARTIES.map((party) => (
                  <Button
                    key={party.id}
                    variant={selectedParty === party.id ? "default" : "outline"}
                    className={cn(
                      "h-auto py-3 justify-start",
                      selectedParty === party.id ? party.color : "text-gray-700",
                    )}
                    onClick={() => handlePartyClick(party.id)}
                  >
                    <div className="flex flex-col items-center w-full">
                      <div className={cn("rounded-full p-2 mb-1", party.bgColor)}>{party.icon}</div>
                      <span className="text-xs text-center">{party.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Function selection */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Tipo de Respuesta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-2 gap-2">
                {FUNCTION_TYPES.map((func) => (
                  <Button
                    key={func.id}
                    variant={selectedFunction === func.id ? "default" : "outline"}
                    className="h-auto py-3 justify-start"
                    onClick={() => handleFunctionClick(func.id)}
                  >
                    <div className="flex flex-col items-center w-full">
                      <div className="rounded-full p-2 mb-1 bg-gray-100">{func.icon}</div>
                      <span className="text-xs text-center">{func.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render the standard interface with circular design
  const renderStandardMode = () => {
    return (
      <div className="flex justify-center items-center my-4">
        <div ref={circleRef} className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
          {/* Center circle */}
          <motion.div
            className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-lg",
              selectedParty ? POLITICAL_PARTIES.find((p) => p.id === selectedParty)?.bgColor : "bg-white",
            )}
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: selectedParty ? "0 0 15px rgba(0, 0, 0, 0.2)" : "0 0 5px rgba(0, 0, 0, 0.1)",
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="text-center">
              {selectedParty ? (
                <>
                  <div className="transform scale-125 mb-1">
                    {POLITICAL_PARTIES.find((p) => p.id === selectedParty)?.icon}
                  </div>
                  <p
                    className={cn("font-medium text-xs", POLITICAL_PARTIES.find((p) => p.id === selectedParty)?.color)}
                  >
                    {POLITICAL_PARTIES.find((p) => p.id === selectedParty)?.name}
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="h-8 w-8 text-gray-400" />
                  <p className="text-xs text-gray-500 mt-1">Selecciona un partido</p>
                </>
              )}
            </div>
          </motion.div>

          {/* Party buttons - larger and more prominent */}
          {POLITICAL_PARTIES.map((party, index) => {
            const angle = (index / POLITICAL_PARTIES.length) * 2 * Math.PI
            const radius = 100 // Reduced radius for better fit
            const x = radius * Math.cos(angle - Math.PI / 2)
            const y = radius * Math.sin(angle - Math.PI / 2)

            return (
              <motion.button
                key={party.id}
                className={cn(
                  "absolute w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md transition-all",
                  selectedParty === party.id ? party.bgColor : "bg-white hover:bg-gray-50",
                )}
                style={{
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => handlePartyClick(party.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: selectedParty === party.id ? [1, 1.05, 1] : 1,
                  boxShadow: selectedParty === party.id ? "0 0 10px rgba(0, 0, 0, 0.2)" : "0 0 5px rgba(0, 0, 0, 0.1)",
                }}
                transition={{
                  duration: selectedParty === party.id ? 2 : 0.2,
                  repeat: selectedParty === party.id ? Number.POSITIVE_INFINITY : 0,
                }}
              >
                <div className="text-center">
                  <div className="transform scale-125 mb-1">{party.icon}</div>
                  <p className={cn("text-xs font-medium", party.color)}>{party.name.split(" ")[0]}</p>
                </div>
              </motion.button>
            )
          })}

          {/* Function buttons - smaller and on outer circle */}
          {FUNCTION_TYPES.map((func, index) => {
            const angle = (index / FUNCTION_TYPES.length) * 2 * Math.PI
            const radius = 170 // Outer radius
            const x = radius * Math.cos(angle - Math.PI / 2)
            const y = radius * Math.sin(angle - Math.PI / 2)

            return (
              <motion.button
                key={func.id}
                className={cn(
                  "absolute w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-md transition-all",
                  selectedFunction === func.id ? "bg-gray-200" : "bg-white hover:bg-gray-50",
                )}
                style={{
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => handleFunctionClick(func.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  {func.icon}
                  <p className="text-[10px] font-medium mt-1">{func.name}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative p-4 rounded-xl transition-colors duration-500", getBackgroundColor())}>
      <div className="mb-4 text-center">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Gestor de Prensa Interactivo</h2>
          <Button variant="outline" size="sm" onClick={toggleLiveMode} className="flex items-center gap-1">
            {isLiveMode ? (
              <>
                <Newspaper className="h-4 w-4" />
                <span className="text-xs">Modo Normal</span>
              </>
            ) : (
              <>
                <Radio className="h-4 w-4" />
                <span className="text-xs">Modo En Vivo</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-gray-600 text-sm">
          {isLiveMode
            ? "Interfaz optimizada para respuestas rápidas durante transmisiones de radio y TV"
            : "Análisis político personalizado con predicciones de voto para proyectos legislativos"}
        </p>
      </div>

      {/* Status indicator */}
      <div className="text-center mb-4">
        {isGenerating ? (
          <Badge variant="outline" className="bg-blue-50">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Generando contenido...
          </Badge>
        ) : selectedParty && selectedFunction && selectedNewsItem ? (
          <Badge variant="outline" className="bg-green-50">
            <Sparkles className="h-3 w-3 mr-1" />
            Listo para generar
          </Badge>
        ) : (
          <Badge variant="outline">Selecciona partido, función y noticia</Badge>
        )}
      </div>

      {/* Render different interfaces based on mode */}
      {isLiveMode ? renderLiveMode() : renderStandardMode()}

      {/* News selection area - always visible */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {activeTab === "laws" ? (
              <>
                <FileText className="h-5 w-5 text-amber-600" />
                <span>Leyes y Proyectos Legislativos</span>
              </>
            ) : (
              <>
                <Newspaper className="h-5 w-5 text-blue-600" />
                <span>Noticias Actualizadas</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* News categories filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant="outline"
              className={cn("cursor-pointer hover:bg-gray-100", activeTab === "laws" ? "bg-amber-50" : "")}
              onClick={() => {
                setActiveTab("laws")
                setFilteredNews(lawsNews)
              }}
            >
              <FileText className="h-3 w-3 mr-1" />
              Leyes
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setActiveTab("news")
                setFilteredNews(newsItems)
              }}
            >
              <Filter className="h-3 w-3 mr-1" />
              Todas
            </Badge>
            {Array.from(new Set(newsItems.map((item) => item.category))).map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setActiveTab("news")
                  setFilteredNews(newsItems.filter((item) => item.category === category))
                }}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Selected news item detail */}
          {selectedNewsItem && (
            <Card className="mb-4 border-2 border-blue-200">
              <CardContent className="p-3">
                <h3 className="font-medium text-sm">{selectedNewsItem.title}</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Fuente: {selectedNewsItem.source} | {new Date(selectedNewsItem.publishedAt).toLocaleDateString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {selectedNewsItem.category}
                  </Badge>
                </div>
                <p className="text-xs mt-2">{selectedNewsItem.summary}</p>

                {/* Legislative info if available */}
                {selectedNewsItem.legislativeInfo?.isLegislative && (
                  <div className="mt-3 bg-amber-50 p-2 rounded-md">
                    <p className="text-xs font-medium text-amber-800">{selectedNewsItem.legislativeInfo.lawName}</p>
                    <p className="text-xs text-gray-600 mt-1">{selectedNewsItem.legislativeInfo.lawDescription}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Fecha estimada de votación:{" "}
                      {new Date(selectedNewsItem.legislativeInfo.voteDate || "").toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Vote predictions for selected party */}
                {selectedParty && selectedNewsItem.legislativeInfo?.isLegislative && (
                  <div className="mt-3">
                    <h4 className="text-xs font-medium mb-1">
                      Predicción de voto para {POLITICAL_PARTIES.find((p) => p.id === selectedParty)?.name}:
                    </h4>
                    {renderVotePrediction(selectedParty, selectedNewsItem)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* News List */}
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNews.map((newsItem, index) => (
                <Card
                  key={index}
                  className={cn(
                    "cursor-pointer hover:border-blue-200 transition-colors",
                    selectedNewsItem?.title === newsItem.title ? "border-2 border-blue-300" : "",
                  )}
                  onClick={() => handleNewsItemClick(newsItem)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-2">{newsItem.title}</h4>
                      {newsItem.legislativeInfo?.isLegislative && (
                        <Badge className="bg-amber-100 text-amber-800 ml-1 shrink-0">Ley</Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{newsItem.source}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {newsItem.category}
                      </Badge>
                    </div>
                    <p className="text-xs mt-2 line-clamp-2">{newsItem.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-0 pb-3 px-4">
          <Button
            className="w-full"
            disabled={!selectedParty || !selectedFunction || !selectedNewsItem || isGenerating}
            onClick={() => {
              if (selectedParty && selectedFunction && selectedNewsItem) {
                generateContent(selectedParty, selectedFunction, selectedNewsItem)
              }
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generar Respuesta Rápida
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
