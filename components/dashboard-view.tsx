"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  AreaChart,
  Area,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Target,
  Activity,
  RefreshCw,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"

interface DashboardViewProps {
  newsItems: NewsItem[]
  onRefreshNews: () => void
  onMessageGenerated: (party: PoliticalParty, message: string, opinions: Record<string, string>) => void
  isLoading: boolean
  messagesGenerated: number
}

interface DashboardStats {
  totalNews: number
  categoriesCount: number
  avgSentiment: number
  legislativeNews: number
  topSources: Array<{ name: string; count: number }>
  sentimentDistribution: Array<{ name: string; value: number; color: string }>
  categoryDistribution: Array<{ name: string; value: number; percentage: number }>
  temporalData: Array<{ date: string; count: number; sentiment: number }>
  engagementData: Array<{ source: string; total: number; positive: number; negative: number }>
}

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  indigo: "#6366f1",
}

export default function DashboardView({
  newsItems,
  onRefreshNews,
  onMessageGenerated,
  isLoading,
  messagesGenerated,
}: DashboardViewProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<"24h" | "7d" | "30d">("7d")
  const [activeMetric, setActiveMetric] = useState<"sentiment" | "engagement" | "categories">("sentiment")
  const [refreshCount, setRefreshCount] = useState(0)

  // Calcular estadísticas del dashboard
  const dashboardStats = useMemo((): DashboardStats => {
    if (!newsItems.length) {
      return {
        totalNews: 0,
        categoriesCount: 0,
        avgSentiment: 0,
        legislativeNews: 0,
        topSources: [],
        sentimentDistribution: [],
        categoryDistribution: [],
        temporalData: [],
        engagementData: [],
      }
    }

    // Estadísticas básicas
    const totalNews = newsItems.length
    const categories = new Set(newsItems.map((item) => item.category))
    const categoriesCount = categories.size
    const legislativeNews = newsItems.filter((item) => item.legislativeInfo?.isLegislative).length

    // Sentimiento promedio
    const avgSentiment =
      newsItems.reduce((acc, item) => {
        const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
        return acc + acceptance.positive
      }, 0) / totalNews

    // Top fuentes
    const sourceCounts = newsItems.reduce(
      (acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topSources = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Distribución de sentimientos
    const sentimentTotals = newsItems.reduce(
      (acc, item) => {
        const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
        acc.positive += acceptance.positive
        acc.neutral += acceptance.neutral
        acc.negative += acceptance.negative
        return acc
      },
      { positive: 0, neutral: 0, negative: 0 },
    )

    const sentimentDistribution = [
      { name: "Positivo", value: Math.round(sentimentTotals.positive / totalNews), color: COLORS.success },
      { name: "Neutral", value: Math.round(sentimentTotals.neutral / totalNews), color: COLORS.warning },
      { name: "Negativo", value: Math.round(sentimentTotals.negative / totalNews), color: COLORS.danger },
    ]

    // Distribución por categorías
    const categoryDistribution = Array.from(categories)
      .map((category) => {
        const count = newsItems.filter((item) => item.category === category).length
        return {
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: count,
          percentage: Math.round((count / totalNews) * 100),
        }
      })
      .sort((a, b) => b.value - a.value)

    // Datos temporales (últimos 7 días)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const temporalData = last7Days.map((date) => {
      const dayNews = newsItems.filter((item) => item.publishedAt.startsWith(date))
      const avgDaySentiment =
        dayNews.length > 0
          ? dayNews.reduce((acc, item) => {
              const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
              return acc + acceptance.positive
            }, 0) / dayNews.length
          : 0

      return {
        date: new Date(date).toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
        count: dayNews.length,
        sentiment: Math.round(avgDaySentiment),
      }
    })

    // Datos de engagement por fuente
    const engagementData = topSources.map((source) => {
      const sourceNews = newsItems.filter((item) => item.source === source.name)
      const totalEngagement = sourceNews.reduce((acc, item) => {
        return acc + (item.shareMetrics?.total || 0)
      }, 0)

      const positiveEngagement = sourceNews.reduce((acc, item) => {
        const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
        return acc + (acceptance.positive / 100) * (item.shareMetrics?.total || 0)
      }, 0)

      const negativeEngagement = sourceNews.reduce((acc, item) => {
        const acceptance = item.acceptance || { positive: 33, neutral: 34, negative: 33 }
        return acc + (acceptance.negative / 100) * (item.shareMetrics?.total || 0)
      }, 0)

      return {
        source: source.name,
        total: totalEngagement,
        positive: Math.round(positiveEngagement),
        negative: Math.round(negativeEngagement),
      }
    })

    return {
      totalNews,
      categoriesCount,
      avgSentiment: Math.round(avgSentiment),
      legislativeNews,
      topSources,
      sentimentDistribution,
      categoryDistribution,
      temporalData,
      engagementData,
    }
  }, [newsItems])

  // Manejar actualización de noticias
  const handleRefresh = useCallback(() => {
    setRefreshCount((prev) => prev + 1)
    onRefreshNews()
  }, [onRefreshNews])

  // Efecto para actualización automática cada 5 minutos
  useEffect(() => {
    const interval = setInterval(
      () => {
        handleRefresh()
      },
      5 * 60 * 1000,
    ) // 5 minutos

    return () => clearInterval(interval)
  }, [handleRefresh])

  // Componente de métricas principales
  const MainMetrics = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Noticias</p>
                <p className="text-2xl font-bold">{dashboardStats.totalNews}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              {dashboardStats.categoriesCount} categorías
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sentimiento Promedio</p>
                <p className="text-2xl font-bold text-green-600">{dashboardStats.avgSentiment}%</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={dashboardStats.avgSentiment} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proyectos de Ley</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardStats.legislativeNews}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1" />
              {Math.round((dashboardStats.legislativeNews / dashboardStats.totalNews) * 100)}% del total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mensajes Generados</p>
                <p className="text-2xl font-bold text-orange-600">{messagesGenerated}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Zap className="h-3 w-3 mr-1" />
              Esta sesión
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    [dashboardStats, messagesGenerated],
  )

  // Componente de gráficos
  const ChartsSection = useMemo(
    () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de sentimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribución de Sentimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardStats.sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardStats.sentimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico temporal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tendencia Temporal (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dashboardStats.temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de categorías */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardStats.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS.indigo} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Engagement por Fuente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardStats.engagementData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="source" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="positive" stackId="a" fill={COLORS.success} />
                <Bar dataKey="negative" stackId="a" fill={COLORS.danger} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    ),
    [dashboardStats],
  )

  // Componente de fuentes principales
  const TopSourcesSection = useMemo(
    () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Fuentes Principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardStats.topSources.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium">{source.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{source.count} noticias</span>
                  <Badge variant="outline">{Math.round((source.count / dashboardStats.totalNews) * 100)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    [dashboardStats],
  )

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                Dashboard de Análisis Político
              </CardTitle>
              <p className="text-muted-foreground mt-1">Monitoreo en tiempo real de noticias y tendencias políticas</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estado de carga */}
      {isLoading && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>Actualizando datos del dashboard...</AlertDescription>
        </Alert>
      )}

      {/* Métricas principales */}
      {MainMetrics}

      {/* Gráficos */}
      {ChartsSection}

      {/* Fuentes principales */}
      {TopSourcesSection}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Última actualización: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>Actualizaciones automáticas: Activas</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span>Refreshes realizados: {refreshCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
