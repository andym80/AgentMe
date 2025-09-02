"use client"

import { memo, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, BarChart2, PieChartIcon, Activity, Target, Brain } from "lucide-react"
import type { NewsItem } from "@/lib/types"

interface TechnicalAnalysisProps {
  news: NewsItem[]
}

// Componente memoizado para análisis de sentimientos
const SentimentAnalysis = memo(({ news }: { news: NewsItem[] }) => {
  const sentimentData = useMemo(() => {
    if (!news.length) return []

    const sentiments = news.map((item) => {
      const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
      return {
        title: item.title.substring(0, 30) + "...",
        positive: acceptance.positive,
        neutral: acceptance.neutral,
        negative: acceptance.negative,
        source: item.source,
        category: item.category,
      }
    })

    return sentiments.slice(0, 10) // Limitar a 10 elementos para rendimiento
  }, [news])

  const averageSentiment = useMemo(() => {
    if (!sentimentData.length) return { positive: 0, neutral: 0, negative: 0 }

    const totals = sentimentData.reduce(
      (acc, item) => ({
        positive: acc.positive + item.positive,
        neutral: acc.neutral + item.neutral,
        negative: acc.negative + item.negative,
      }),
      { positive: 0, neutral: 0, negative: 0 },
    )

    const count = sentimentData.length
    return {
      positive: Math.round(totals.positive / count),
      neutral: Math.round(totals.neutral / count),
      negative: Math.round(totals.negative / count),
    }
  }, [sentimentData])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{averageSentiment.positive}%</div>
            <div className="text-sm text-gray-600">Positivo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{averageSentiment.neutral}%</div>
            <div className="text-sm text-gray-600">Neutral</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{averageSentiment.negative}%</div>
            <div className="text-sm text-gray-600">Negativo</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análisis por Noticia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="positive" stackId="a" fill="#10b981" />
              <Bar dataKey="neutral" stackId="a" fill="#f59e0b" />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
})

SentimentAnalysis.displayName = "SentimentAnalysis"

// Componente memoizado para análisis de categorías
const CategoryAnalysis = memo(({ news }: { news: NewsItem[] }) => {
  const categoryData = useMemo(() => {
    if (!news.length) return []

    const categories = news.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: Math.round((value / news.length) * 100),
    }))
  }, [news])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{category.value} noticias</span>
                    <Badge variant="outline">{category.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

CategoryAnalysis.displayName = "CategoryAnalysis"

// Componente memoizado para análisis temporal
const TemporalAnalysis = memo(({ news }: { news: NewsItem[] }) => {
  const temporalData = useMemo(() => {
    if (!news.length) return []

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const dayNews = news.filter((item) => item.publishedAt.startsWith(date))

      const avgSentiment =
        dayNews.length > 0
          ? dayNews.reduce((acc, item) => {
              const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
              return acc + acceptance.positive
            }, 0) / dayNews.length
          : 0

      return {
        date: new Date(date).toLocaleDateString("es-AR", {
          month: "short",
          day: "numeric",
        }),
        count: dayNews.length,
        sentiment: Math.round(avgSentiment),
        categories: [...new Set(dayNews.map((item) => item.category))].length,
      }
    })
  }, [news])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volumen de Noticias (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencia de Sentimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="sentiment" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

TemporalAnalysis.displayName = "TemporalAnalysis"

// Componente memoizado para métricas de engagement
const EngagementMetrics = memo(({ news }: { news: NewsItem[] }) => {
  const engagementData = useMemo(() => {
    if (!news.length) return []

    return news
      .filter((item) => item.shareMetrics)
      .map((item) => ({
        title: item.title.substring(0, 25) + "...",
        total: item.shareMetrics!.total,
        facebook: item.shareMetrics!.facebook,
        twitter: item.shareMetrics!.twitter,
        whatsapp: item.shareMetrics!.whatsapp,
        source: item.source,
        category: item.category,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [news])

  const totalEngagement = useMemo(() => {
    return engagementData.reduce((acc, item) => acc + item.total, 0)
  }, [engagementData])

  const topPerformer = useMemo(() => {
    return engagementData[0] || null
  }, [engagementData])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalEngagement.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total de Interacciones</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {topPerformer ? topPerformer.total.toLocaleString() : "0"}
            </div>
            <div className="text-sm text-gray-600">Mejor Rendimiento</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement por Noticia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="title" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="facebook" stackId="a" fill="#1877f2" />
              <Bar dataKey="twitter" stackId="a" fill="#1da1f2" />
              <Bar dataKey="whatsapp" stackId="a" fill="#25d366" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
})

EngagementMetrics.displayName = "EngagementMetrics"

// Componente principal memoizado
const MemoizedTechnicalAnalysis = memo(({ news }: TechnicalAnalysisProps) => {
  const [activeTab, setActiveTab] = useState("sentiment")

  // Estadísticas generales memoizadas
  const generalStats = useMemo(() => {
    if (!news.length)
      return {
        totalNews: 0,
        avgSentiment: 0,
        topCategory: "N/A",
        legislativeCount: 0,
      }

    const totalNews = news.length
    const avgSentiment = Math.round(
      news.reduce((acc, item) => {
        const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
        return acc + acceptance.positive
      }, 0) / totalNews,
    )

    const categories = news.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topCategory =
      Object.entries(categories).reduce((a, b) => (categories[a[0]] > categories[b[0]] ? a : b))[0] || "N/A"

    const legislativeCount = news.filter((item) => item.legislativeInfo?.isLegislative).length

    return {
      totalNews,
      avgSentiment,
      topCategory: topCategory.charAt(0).toUpperCase() + topCategory.slice(1),
      legislativeCount,
    }
  }, [news])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

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
      {/* Resumen ejecutivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Resumen Ejecutivo del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{generalStats.totalNews}</div>
              <div className="text-sm text-gray-600">Noticias Analizadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{generalStats.avgSentiment}%</div>
              <div className="text-sm text-gray-600">Sentimiento Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{generalStats.topCategory}</div>
              <div className="text-sm text-gray-600">Categoría Principal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{generalStats.legislativeCount}</div>
              <div className="text-sm text-gray-600">Proyectos de Ley</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis detallado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-green-500" />
            Análisis Técnico Detallado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="sentiment" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Sentimiento</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Categorías</span>
              </TabsTrigger>
              <TabsTrigger value="temporal" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Temporal</span>
              </TabsTrigger>
              <TabsTrigger value="engagement" className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Engagement</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sentiment" className="mt-4">
              <SentimentAnalysis news={news} />
            </TabsContent>

            <TabsContent value="categories" className="mt-4">
              <CategoryAnalysis news={news} />
            </TabsContent>

            <TabsContent value="temporal" className="mt-4">
              <TemporalAnalysis news={news} />
            </TabsContent>

            <TabsContent value="engagement" className="mt-4">
              <EngagementMetrics news={news} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
})

MemoizedTechnicalAnalysis.displayName = "MemoizedTechnicalAnalysis"

export default MemoizedTechnicalAnalysis
