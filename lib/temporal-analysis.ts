import type { NLPAnalysisResult } from "./advanced-nlp-engine"

export interface TemporalTrend {
  topic: string
  dataPoints: {
    date: string
    volume: number
    sentiment: number
  }[]
  trend: "rising" | "falling" | "stable"
  volatility: number
}

export interface TemporalAnalysisResult {
  trends: TemporalTrend[]
  emergingTopics: string[]
  fadingTopics: string[]
  sentimentShifts: {
    topic: string
    previousSentiment: number
    currentSentiment: number
    change: number
  }[]
  topicVolatility: {
    topic: string
    volatility: number
  }[]
}

// Función principal para analizar tendencias temporales
export function trackTemporalTrends(
  historicalAnalyses: { date: string; analysis: NLPAnalysisResult }[],
): TemporalAnalysisResult {
  if (!historicalAnalyses || historicalAnalyses.length < 2) {
    return createEmptyTemporalAnalysis()
  }

  // Ordenar análisis por fecha
  const sortedAnalyses = [...historicalAnalyses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extraer todos los temas únicos de todos los análisis
  const allTopics = new Set<string>()
  sortedAnalyses.forEach((item) => {
    item.analysis.topics.forEach((topic) => {
      allTopics.add(topic.name)
    })
  })

  // Crear tendencias para cada tema
  const trends: TemporalTrend[] = Array.from(allTopics).map((topic) => {
    const dataPoints = sortedAnalyses.map((item) => {
      const topicData = item.analysis.topics.find((t) => t.name === topic)
      return {
        date: item.date,
        volume: topicData ? topicData.relevance : 0,
        sentiment: topicData ? topicData.sentiment : 0,
      }
    })

    // Calcular tendencia
    const trend = calculateTrend(dataPoints)

    // Calcular volatilidad
    const volatility = calculateVolatility(dataPoints)

    return {
      topic,
      dataPoints,
      trend,
      volatility,
    }
  })

  // Identificar temas emergentes y en declive
  const emergingTopics = trends
    .filter((t) => t.trend === "rising" && t.dataPoints[t.dataPoints.length - 1].volume > 0.6)
    .map((t) => t.topic)

  const fadingTopics = trends.filter((t) => t.trend === "falling" && t.dataPoints[0].volume > 0.6).map((t) => t.topic)

  // Identificar cambios significativos en sentimiento
  const sentimentShifts = trends
    .filter((t) => t.dataPoints.length >= 2)
    .map((t) => {
      const previousSentiment = t.dataPoints[t.dataPoints.length - 2].sentiment
      const currentSentiment = t.dataPoints[t.dataPoints.length - 1].sentiment
      const change = currentSentiment - previousSentiment

      return {
        topic: t.topic,
        previousSentiment,
        currentSentiment,
        change,
      }
    })
    .filter((shift) => Math.abs(shift.change) > 0.3) // Solo cambios significativos

  // Ordenar temas por volatilidad
  const topicVolatility = trends
    .map((t) => ({ topic: t.topic, volatility: t.volatility }))
    .sort((a, b) => b.volatility - a.volatility)

  return {
    trends,
    emergingTopics,
    fadingTopics,
    sentimentShifts,
    topicVolatility,
  }
}

// Función para calcular la tendencia de un tema
function calculateTrend(
  dataPoints: { volume: number; sentiment: number; date: string }[],
): "rising" | "falling" | "stable" {
  if (dataPoints.length < 2) return "stable"

  // Usar los últimos 3 puntos o todos si hay menos
  const recentPoints = dataPoints.slice(-Math.min(3, dataPoints.length))

  // Calcular pendiente simple
  const firstVolume = recentPoints[0].volume
  const lastVolume = recentPoints[recentPoints.length - 1].volume
  const volumeDiff = lastVolume - firstVolume

  if (volumeDiff > 0.15) return "rising"
  if (volumeDiff < -0.15) return "falling"
  return "stable"
}

// Función para calcular la volatilidad de un tema
function calculateVolatility(dataPoints: { volume: number; sentiment: number; date: string }[]): number {
  if (dataPoints.length < 2) return 0

  // Calcular cambios entre puntos consecutivos
  let totalChange = 0
  for (let i = 1; i < dataPoints.length; i++) {
    totalChange += Math.abs(dataPoints[i].volume - dataPoints[i - 1].volume)
  }

  // Normalizar por el número de intervalos
  return Number((totalChange / (dataPoints.length - 1)).toFixed(2))
}

// Función para crear un análisis temporal vacío
function createEmptyTemporalAnalysis(): TemporalAnalysisResult {
  return {
    trends: [],
    emergingTopics: [],
    fadingTopics: [],
    sentimentShifts: [],
    topicVolatility: [],
  }
}

// Función para guardar un análisis en el historial
export function saveAnalysisToHistory(analysis: NLPAnalysisResult): void {
  try {
    const now = new Date().toISOString()
    const historyItem = { date: now, analysis }

    // Obtener historial existente
    const historyJson = localStorage.getItem("nlp_analysis_history")
    let history: { date: string; analysis: NLPAnalysisResult }[] = []

    if (historyJson) {
      history = JSON.parse(historyJson)
    }

    // Añadir nuevo análisis
    history.push(historyItem)

    // Limitar a los últimos 10 análisis para no sobrecargar localStorage
    if (history.length > 10) {
      history = history.slice(-10)
    }

    // Guardar historial actualizado
    localStorage.setItem("nlp_analysis_history", JSON.stringify(history))
  } catch (error) {
    console.error("Error al guardar análisis en historial:", error)
  }
}

// Función para obtener el historial de análisis
export function getAnalysisHistory(): { date: string; analysis: NLPAnalysisResult }[] {
  try {
    const historyJson = localStorage.getItem("nlp_analysis_history")
    if (historyJson) {
      return JSON.parse(historyJson)
    }
    return []
  } catch (error) {
    console.error("Error al obtener historial de análisis:", error)
    return []
  }
}
