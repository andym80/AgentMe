"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Brain, TrendingUp, Target, Users, Activity, CheckCircle, Download } from "lucide-react"
import type { NewsItem } from "@/lib/types"

interface TechnicalAnalysisViewProps {
  news: NewsItem[]
}

interface AnalysisMetrics {
  sentiment: {
    positive: number
    neutral: number
    negative: number
    trend: "up" | "down" | "stable"
  }
  complexity: {
    average: number
    distribution: Array<{ range: string; count: number }>
  }
  topics: Array<{
    name: string
    frequency: number
    sentiment: number
    relevance: number
  }>
  sources: Array<{
    name: string
    count: number
    reliability: number
    bias: number
  }>
  temporal: Array<{
    date: string
    volume: number
    sentiment: number
    engagement: number
  }>
  political: Array<{
    party: string
    mentions: number
    sentiment: number
    influence: number
  }>
}

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  indigo: "#6366f1",
  pink: "#ec4899",
  teal: "#14b8a6",
}

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.indigo,
  COLORS.pink,
  COLORS.teal,
]

export default function TechnicalAnalysisView({ news }: TechnicalAnalysisViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<"sentiment" | "topics" | "sources" | "temporal">("sentiment")
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d")
  const [analysisDepth, setAnalysisDepth] = useState<"basic" | "advanced" | "expert">("advanced")

  // Calcular métricas de análisis
  const analysisMetrics = useMemo((): AnalysisMetrics => {
    if (!news.length) {
      return {
        sentiment: { positive: 0, neutral: 0, negative: 0, trend: "stable" },
        complexity: { average: 0, distribution: [] },
        topics: [],
        sources: [],
        temporal: [],
        political: [],
      }
    }

    // Análisis de sentimientos
    const sentimentTotals = news.reduce(
      (acc, item) => {
        const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
        acc.positive += acceptance.positive
        acc.neutral += acceptance.neutral
        acc.negative += acceptance.negative
        return acc
      },
      { positive: 0, neutral: 0, negative: 0 },
    )

    const totalNews = news.length
    const sentiment = {
      positive: Math.round(sentimentTotals.positive / totalNews),
      neutral: Math.round(sentimentTotals.neutral / totalNews),
      negative: Math.round(sentimentTotals.negative / totalNews),
      trend: "stable" as const, // Simplificado para este ejemplo
    }

    // Análisis de complejidad (simulado)
    const complexityScores = news.map((item) => {
      const wordCount = item.title.split(" ").length + (item.summary?.split(" ").length || 0)
      return Math.min(wordCount / 50, 1) // Normalizado a 0-1
    })

    const averageComplexity = complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length

    const complexityDistribution = [
      { range: "Básico", count: complexityScores.filter((s) => s < 0.3).length },
      { range: "Intermedio", count: complexityScores.filter((s) => s >= 0.3 && s < 0.7).length },
      { range: "Avanzado", count: complexityScores.filter((s) => s >= 0.7).length },
    ]

    // Análisis de temas
    const topicKeywords = [
      "economía",
      "política",
      "salud",
      "educación",
      "seguridad",
      "trabajo",
      "inflación",
      "elecciones",
      "congreso",
      "justicia",
    ]

    const topics = topicKeywords
      .map((keyword) => {
        const mentions = news.filter(
          (item) =>
            item.title.toLowerCase().includes(keyword) || item.summary?.toLowerCase().includes(keyword) || false,
        )

        const frequency = mentions.length
        const avgSentiment =
          mentions.length > 0
            ? mentions.reduce((acc, item) => {
                const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
                return acc + (acceptance.positive - acceptance.negative)
              }, 0) /
              mentions.length /
              100
            : 0

        return {
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          frequency,
          sentiment: Math.round(avgSentiment * 100) / 100,
          relevance: Math.min(frequency / totalNews, 1),
        }
      })
      .filter((topic) => topic.frequency > 0)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8)

    // Análisis de fuentes
    const sourceCounts = news.reduce(
      (acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sources = Object.entries(sourceCounts)
      .map(([name, count]) => ({
        name,
        count,
        reliability: 0.7 + Math.random() * 0.3, // Simulado
        bias: (Math.random() - 0.5) * 2, // -1 a 1
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Análisis temporal (últimos 7 días)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const temporal = last7Days.map((date) => {
      const dayNews = news.filter((item) => item.publishedAt.startsWith(date))
      const volume = dayNews.length

      const avgSentiment =
        volume > 0
          ? dayNews.reduce((acc, item) => {
              const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
              return acc + acceptance.positive
            }, 0) / volume
          : 0

      const engagement =
        volume > 0 ? dayNews.reduce((acc, item) => acc + (item.shareMetrics?.total || 0), 0) / volume : 0

      return {
        date: new Date(date).toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
        volume,
        sentiment: Math.round(avgSentiment),
        engagement: Math.round(engagement),
      }
    })

    // Análisis político (simulado)
    const politicalParties = [
      "La Libertad Avanza",
      "Unión por la Patria",
      "Juntos por el Cambio",
      "Frente de Izquierda",
    ]

    const political = politicalParties
      .map((party) => {
        const mentions = Math.floor(Math.random() * totalNews * 0.3)
        const sentiment = (Math.random() - 0.5) * 2
        const influence = Math.random()

        return {
          party,
          mentions,
          sentiment: Math.round(sentiment * 100) / 100,
          influence: Math.round(influence * 100) / 100,
        }
      })
      .sort((a, b) => b.mentions - a.mentions)

    return {
      sentiment,
      complexity: {
        average: Math.round(averageComplexity * 100) / 100,
        distribution: complexityDistribution,
      },
      topics,
      sources,
      temporal,
      political,
    }
  }, [news])

  // Exportar análisis
  const handleExportAnalysis = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      newsCount: news.length,
      metrics: analysisMetrics,
      settings: {
        selectedMetric,
        timeRange,
        analysisDepth,
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analisis_tecnico_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [news.length, analysisMetrics, selectedMetric, timeRange, analysisDepth])

  // Componente de métricas principales
  const MainMetrics = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sentimiento Promedio</p>
                <p className="text-2xl font-bold text-green-600">{analysisMetrics.sentiment.positive}%</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={analysisMetrics.sentiment.positive} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complejidad Media</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(analysisMetrics.complexity.average * 100)}%
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={analysisMetrics.complexity.average * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temas Identificados</p>
                <p className="text-2xl font-bold text-purple-600">{analysisMetrics.topics.length}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1" />
              {analysisMetrics.topics
                .slice(0, 2)
                .map((t) => t.name)
                .join(", ")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fuentes Analizadas</p>
                <p className="text-2xl font-bold text-orange-600">{analysisMetrics.sources.length}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1" />
              Confiabilidad promedio:{" "}
              {Math.round(
                (analysisMetrics.sources.reduce((acc, s) => acc + s.reliability, 0) / analysisMetrics.sources.length) *
                  100,
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    [analysisMetrics],
  )

  if (!news.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No hay datos para analizar</h3>
          <p className="text-gray-500">Carga algunas noticias para ver el análisis técnico completo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-500" />
                Análisis Técnico Avanzado
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Análisis profundo de {news.length} noticias con métricas avanzadas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={analysisDepth} onValueChange={(value: any) => setAnalysisDepth(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                  <SelectItem value="expert">Experto</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExportAnalysis} className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas principales */}
      {MainMetrics}

      {/* Análisis detallado */}
      <Tabs value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Sentimiento</span>
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Temas</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Fuentes</span>
          </TabsTrigger>
          <TabsTrigger value="temporal" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Temporal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de sentimientos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución de Sentimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Positivo", value: analysisMetrics.sentiment.positive, color: COLORS.success },
                        { name: "Neutral", value: analysisMetrics.sentiment.neutral, color: COLORS.warning },
                        { name: "Negativo", value: analysisMetrics.sentiment.negative, color: COLORS.danger },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Positivo", value: analysisMetrics.sentiment.positive, color: COLORS.success },
                        { name: "Neutral", value: analysisMetrics.sentiment.neutral, color: COLORS.warning },
                        { name: "Negativo", value: analysisMetrics.sentiment.negative, color: COLORS.danger },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Complejidad del contenido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución de Complejidad</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analysisMetrics.complexity.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.indigo} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Frecuencia de temas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temas Más Frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisMetrics.topics} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="frequency" fill={COLORS.purple} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análisis radar de temas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análisis Multidimensional</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={analysisMetrics.topics.slice(0, 6)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 1]} />
                    <Radar
                      name="Relevancia"
                      dataKey="relevance"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Lista detallada de temas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles por Tema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisMetrics.topics.map((topic, index) => (
                  <div key={topic.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{topic.name}</div>
                        <div className="text-sm text-gray-600">
                          {topic.frequency} menciones • Relevancia: {Math.round(topic.relevance * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={topic.sentiment > 0 ? "default" : topic.sentiment < 0 ? "destructive" : "secondary"}
                        className={topic.sentiment > 0 ? "bg-green-100 text-green-800" : ""}
                      >
                        {topic.sentiment > 0 ? "+" : ""}
                        {topic.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volumen por fuente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Volumen por Fuente</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisMetrics.sources.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.teal} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confiabilidad vs Sesgo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Confiabilidad de Fuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisMetrics.sources.slice(0, 6).map((source) => (
                    <div key={source.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{source.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{source.count} noticias</Badge>
                          <Badge
                            variant={
                              source.reliability > 0.8
                                ? "default"
                                : source.reliability > 0.6
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={source.reliability > 0.8 ? "bg-green-100 text-green-800" : ""}
                          >
                            {Math.round(source.reliability * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={source.reliability * 100} className="h-2" />
                      <div className="text-xs text-gray-500">
                        Sesgo político: {source.bias > 0 ? "Derecha" : source.bias < 0 ? "Izquierda" : "Neutral"}(
                        {Math.abs(source.bias).toFixed(2)})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volumen temporal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Volumen de Noticias (7 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analysisMetrics.temporal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tendencia de sentimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evolución del Sentimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analysisMetrics.temporal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sentiment"
                      stroke={COLORS.success}
                      strokeWidth={2}
                      dot={{ fill: COLORS.success }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Análisis político */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Menciones Políticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisMetrics.political.map((party) => (
                  <div key={party.party} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{party.party}</span>
                      <Badge variant="outline">{party.mentions} menciones</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sentimiento:</span>
                        <span
                          className={
                            party.sentiment > 0
                              ? "text-green-600"
                              : party.sentiment < 0
                                ? "text-red-600"
                                : "text-gray-600"
                          }
                        >
                          {party.sentiment > 0 ? "+" : ""}
                          {party.sentiment}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Influencia:</span>
                        <span>{party.influence}</span>
                      </div>
                      <Progress value={party.influence * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
