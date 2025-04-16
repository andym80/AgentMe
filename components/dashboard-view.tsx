"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  Clock,
  TrendingUp,
  Newspaper,
  History,
  LightbulbIcon,
  Loader2,
  Globe,
  Building,
  MapPin,
  BookOpen,
  BarChart2,
  Scale,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { adaptNewsForParty } from "@/lib/ai-service"
// Añadir a las importaciones
import { historicalEvents, historicalStatistics } from "@/lib/historical-knowledge"
import { ethicalPrinciples, moralDilemmas } from "@/lib/ethical-knowledge"

// Componente para mostrar los temas más populares
const PopularTopics = ({ topics }: { topics: { name: string; count: number; category: string }[] }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      politics: "bg-blue-100 text-blue-800",
      nacional: "bg-blue-100 text-blue-800",
      provincial: "bg-indigo-100 text-indigo-800",
      municipal: "bg-purple-100 text-purple-800",
      local: "bg-violet-100 text-violet-800",
      business: "bg-green-100 text-green-800",
      economy: "bg-green-100 text-green-800",
      technology: "bg-cyan-100 text-cyan-800",
      health: "bg-teal-100 text-teal-800",
      environment: "bg-emerald-100 text-emerald-800",
      education: "bg-amber-100 text-amber-800",
      security: "bg-orange-100 text-orange-800",
      default: "bg-gray-100 text-gray-800",
    }
    return colors[category] || colors.default
  }

  return (
    <div className="space-y-4">
      {topics.map((topic, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(topic.category)}>{topic.category}</Badge>
            <span className="font-medium">{topic.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{topic.count} usos</span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, (topic.count / topics[0].count) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente para generar mensajes rápidos por partido
const QuickMessageGenerator = ({
  newsItems,
  onMessageGenerated,
}: {
  newsItems: NewsItem[]
  onMessageGenerated: (party: PoliticalParty, message: string, opinions: Record<string, string>) => void
}) => {
  const [generatingParty, setGeneratingParty] = useState<PoliticalParty | null>(null)
  const { toast } = useToast()

  const parties: { id: PoliticalParty; name: string; color: string }[] = [
    { id: "libertad-avanza", name: "La Libertad Avanza", color: "bg-purple-100 hover:bg-purple-200 text-purple-800" },
    { id: "union-patria", name: "Unión por la Patria", color: "bg-blue-100 hover:bg-blue-200 text-blue-800" },
    { id: "juntos-cambio", name: "Juntos por el Cambio", color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800" },
    { id: "frente-izquierda", name: "Frente de Izquierda", color: "bg-red-100 hover:bg-red-200 text-red-800" },
    { id: "otros", name: "Otros partidos", color: "bg-gray-100 hover:bg-gray-200 text-gray-800" },
  ]

  const generateMessage = async (party: PoliticalParty) => {
    if (newsItems.length === 0) {
      toast({
        title: "No hay noticias disponibles",
        description: "Carga noticias primero para generar mensajes",
        variant: "destructive",
      })
      return
    }

    setGeneratingParty(party)

    try {
      // Obtener la clave API del localStorage como respaldo
      const apiKey = localStorage.getItem("openai_api_key")

      const result = await adaptNewsForParty(newsItems, party, apiKey)
      onMessageGenerated(party, result.generalMessage, result.topicOpinions)

      toast({
        title: "Mensaje generado",
        description: `Se ha generado un mensaje para ${parties.find((p) => p.id === party)?.name}`,
      })
    } catch (error) {
      console.error("Error al generar mensaje:", error)
      toast({
        title: "Error al generar mensaje",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setGeneratingParty(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {parties.map((party) => (
        <Button
          key={party.id}
          variant="outline"
          className={`h-auto py-3 ${party.color} justify-start`}
          onClick={() => generateMessage(party.id)}
          disabled={generatingParty !== null}
        >
          {generatingParty === party.id ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-2" />
          )}
          {party.name}
        </Button>
      ))}
    </div>
  )
}

// Componente para mostrar estadísticas recientes
const RecentStats = ({
  totalNews,
  totalMessages,
  topCategories,
  newsBreakdown,
}: {
  totalNews: number
  totalMessages: number
  topCategories: { name: string; count: number }[]
  newsBreakdown: { international: number; national: number; municipal: number }
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Noticias Procesadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalNews}</div>
            <div className="flex items-center mt-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Últimas 24 horas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Mensajes Generados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMessages}</div>
            <div className="flex items-center mt-1 text-sm text-green-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Sesión actual</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Categoría Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{topCategories[0]?.name || "N/A"}</div>
            <div className="flex items-center mt-1 text-sm text-green-600">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{topCategories[0]?.count || 0} artículos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Distribución de Noticias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Internacional</span>
              </div>
              <span className="text-2xl font-bold text-blue-800">{newsBreakdown.international}</span>
              <span className="text-xs text-blue-600">
                {totalNews > 0 ? Math.round((newsBreakdown.international / totalNews) * 100) : 0}%
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Building className="h-4 w-4 text-indigo-600" />
                <span className="font-medium text-indigo-800">Nacional</span>
              </div>
              <span className="text-2xl font-bold text-indigo-800">{newsBreakdown.national}</span>
              <span className="text-xs text-indigo-600">
                {totalNews > 0 ? Math.round((newsBreakdown.national / totalNews) * 100) : 0}%
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">Municipal</span>
              </div>
              <span className="text-2xl font-bold text-purple-800">{newsBreakdown.municipal}</span>
              <span className="text-xs text-purple-600">
                {totalNews > 0 ? Math.round((newsBreakdown.municipal / totalNews) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para mostrar dilemas éticos
const EthicalDilemmas = () => {
  // Mostrar algunos dilemas éticos de ejemplo
  const exampleDilemmas = moralDilemmas.slice(0, 5)

  return (
    <div className="space-y-4">
      {exampleDilemmas.map((dilemma, index) => (
        <Card key={index} className="hover:bg-gray-50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-600" />
              {dilemma.issue}
            </CardTitle>
            <CardDescription className="text-xs">{dilemma.relevantTo.join(", ")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{dilemma.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-xs p-2 bg-blue-50 rounded">
                <span className="font-medium block mb-1">Progresista:</span>
                {dilemma.perspectives.progressive}
              </div>
              <div className="text-xs p-2 bg-yellow-50 rounded">
                <span className="font-medium block mb-1">Conservador:</span>
                {dilemma.perspectives.conservative}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Componente para mostrar principios éticos
const EthicalPrinciples = () => {
  // Mostrar algunos principios éticos de ejemplo
  const examplePrinciples = ethicalPrinciples.slice(0, 5)

  return (
    <div className="space-y-4">
      {examplePrinciples.map((principle, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-medium text-sm">{principle.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{principle.description}</p>
          </div>
          <Badge variant="outline" className="ml-2">
            {principle.relevantTo[0]}
          </Badge>
        </div>
      ))}
    </div>
  )
}

// Componente principal del Dashboard
interface DashboardViewProps {
  newsItems: NewsItem[]
  onRefreshNews: () => void
  onMessageGenerated: (party: PoliticalParty, message: string, opinions: Record<string, string>) => void
  isLoading: boolean
  messagesGenerated: number
}

export function DashboardView({
  newsItems,
  onRefreshNews,
  onMessageGenerated,
  isLoading,
  messagesGenerated,
}: DashboardViewProps) {
  // Datos simulados para temas populares (en una implementación real, estos vendrían de una base de datos)
  const popularTopics = [
    { name: "Reforma económica", count: 42, category: "economy" },
    { name: "Política internacional", count: 38, category: "politics" },
    { name: "Desarrollo local", count: 35, category: "municipal" },
    { name: "Innovación tecnológica", count: 29, category: "technology" },
    { name: "Medio ambiente", count: 24, category: "environment" },
    { name: "Salud pública", count: 21, category: "health" },
  ]

  // Datos simulados para secciones históricas más consultadas
  const historicalSections = [
    { name: "Crisis 2001-2002", count: 37, category: "economy" },
    { name: "Reforma Constitucional 1994", count: 32, category: "politics" },
    { name: "Hiperinflación 1989", count: 28, category: "economy" },
    { name: "Privatizaciones 1990s", count: 25, category: "business" },
    { name: "Retorno democrático 1983", count: 22, category: "politics" },
  ]

  // Calcular categorías principales
  const categoryCount: Record<string, number> = {}
  newsItems.forEach((item) => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
  })

  const topCategories = Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // Calcular distribución de noticias por nivel
  const newsBreakdown = {
    international: newsItems.filter((item) => ["politics", "business", "technology"].includes(item.category)).length,
    national: newsItems.filter((item) =>
      ["nacional", "provincial", "economy", "health", "environment"].includes(item.category),
    ).length,
    municipal: newsItems.filter((item) => ["municipal", "local"].includes(item.category)).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Panel de Control</h2>
        <Button variant="outline" onClick={onRefreshNews} disabled={isLoading} className="flex items-center gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar Noticias
        </Button>
      </div>

      <RecentStats
        totalNews={newsItems.length}
        totalMessages={messagesGenerated}
        topCategories={topCategories}
        newsBreakdown={newsBreakdown}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generación Rápida</CardTitle>
            <CardDescription>Genera mensajes adaptados para diferentes partidos políticos</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickMessageGenerator newsItems={newsItems} onMessageGenerated={onMessageGenerated} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <Tabs defaultValue="topics">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="topics" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Temas</span>
                </TabsTrigger>
                <TabsTrigger value="historical" className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  <span>Historia</span>
                </TabsTrigger>
                <TabsTrigger value="ethical" className="flex items-center gap-1">
                  <Scale className="h-4 w-4" />
                  <span>Ética</span>
                </TabsTrigger>
                <TabsTrigger value="solutions" className="flex items-center gap-1">
                  <LightbulbIcon className="h-4 w-4" />
                  <span>Soluciones</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="topics" className="mt-0">
              <PopularTopics topics={popularTopics} />
            </TabsContent>
            <TabsContent value="historical" className="mt-0">
              <PopularTopics topics={historicalSections} />
            </TabsContent>
            <TabsContent value="ethical" className="mt-0">
              <EthicalPrinciples />
            </TabsContent>
            <TabsContent value="solutions" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-800">La Libertad Avanza</Badge>
                    <span className="font-medium">Desregulación económica</span>
                  </div>
                  <span className="text-sm text-gray-500">32 propuestas</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Unión por la Patria</Badge>
                    <span className="font-medium">Fortalecimiento del Estado</span>
                  </div>
                  <span className="text-sm text-gray-500">29 propuestas</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Juntos por el Cambio</Badge>
                    <span className="font-medium">Modernización institucional</span>
                  </div>
                  <span className="text-sm text-gray-500">27 propuestas</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Frente de Izquierda</Badge>
                    <span className="font-medium">Control obrero</span>
                  </div>
                  <span className="text-sm text-gray-500">24 propuestas</span>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-600" />
            <span>Dilemas Éticos y Morales</span>
          </CardTitle>
          <CardDescription>Base de conocimiento ético para fundamentar el discurso político</CardDescription>
        </CardHeader>
        <CardContent>
          <EthicalDilemmas />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <span>Análisis Histórico-Filosófico</span>
          </CardTitle>
          <CardDescription>Base de conocimiento para fundamentar el discurso político</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <History className="h-4 w-4" />
                Precedentes Históricos
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Accede a una base de datos de eventos históricos relevantes para contextualizar la actualidad política.
              </p>
              <div className="text-xs text-gray-500">
                Incluye {historicalEvents.length} eventos históricos documentados
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Fundamentos Filosóficos
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Explora los conceptos filosóficos y teóricos que fundamentan las diferentes ideologías políticas.
              </p>
              <div className="text-xs text-gray-500">Documentados para los 5 principales espacios políticos</div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Estadísticas Históricas
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Utiliza datos estadísticos históricos para respaldar argumentos y contextualizar propuestas.
              </p>
              <div className="text-xs text-gray-500">{historicalStatistics.length} series estadísticas disponibles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            <span>Noticias Disponibles</span>
          </CardTitle>
          <CardDescription>{newsItems.length} artículos disponibles para análisis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsItems.slice(0, 6).map((item, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="text-xs text-gray-500">{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{item.summary}</p>
                {/* Indicador de nivel de noticia */}
                <div className="mt-2 flex items-center">
                  {["politics", "business", "technology"].includes(item.category) ? (
                    <span className="text-xs flex items-center text-blue-600">
                      <Globe className="h-3 w-3 mr-1" /> Internacional
                    </span>
                  ) : ["nacional", "provincial", "economy", "health", "environment"].includes(item.category) ? (
                    <span className="text-xs flex items-center text-indigo-600">
                      <Building className="h-3 w-3 mr-1" /> Nacional
                    </span>
                  ) : (
                    <span className="text-xs flex items-center text-purple-600">
                      <MapPin className="h-3 w-3 mr-1" /> Municipal
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {newsItems.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Ver todas las noticias
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardView
