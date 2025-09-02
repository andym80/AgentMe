import type { NLPAnalysisResult } from "./advanced-nlp-engine"
import type { TemporalTrend } from "./temporal-analysis"

export interface EmergingNarrative {
  description: string
  confidence: number
  supportingEvidence: string[]
  relatedTopics: string[]
  potentialImpact: number
  firstDetected: string
}

export interface NarrativeAnalysisResult {
  emergingNarratives: EmergingNarrative[]
  dominantNarratives: EmergingNarrative[]
  fadingNarratives: EmergingNarrative[]
  narrativeConnections: {
    source: string
    target: string
    strength: number
  }[]
}

// Función principal para detectar narrativas emergentes
export function detectEmergingNarratives(
  currentAnalysis: NLPAnalysisResult,
  temporalTrends: TemporalTrend[],
): NarrativeAnalysisResult {
  // Si no hay análisis o tendencias, devolver resultado vacío
  if (!currentAnalysis || !temporalTrends || temporalTrends.length === 0) {
    return createEmptyNarrativeAnalysis()
  }

  // Obtener narrativas existentes del análisis actual
  const existingNarratives = currentAnalysis.narratives || []

  // Identificar temas emergentes de las tendencias temporales
  const emergingTopics = temporalTrends.filter((trend) => trend.trend === "rising").map((trend) => trend.topic)

  // Identificar temas en declive
  const fadingTopics = temporalTrends.filter((trend) => trend.trend === "falling").map((trend) => trend.topic)

  // Generar narrativas emergentes basadas en temas emergentes y narrativas existentes
  const emergingNarratives: EmergingNarrative[] = []
  const dominantNarratives: EmergingNarrative[] = []
  const fadingNarratives: EmergingNarrative[] = []

  // Procesar narrativas existentes
  existingNarratives.forEach((narrative) => {
    // Verificar si la narrativa está relacionada con temas emergentes
    const relatedToEmergingTopics = narrative.relatedTopics.some((topic) => emergingTopics.includes(topic))

    // Verificar si la narrativa está relacionada con temas en declive
    const relatedToFadingTopics = narrative.relatedTopics.some((topic) => fadingTopics.includes(topic))

    // Crear objeto de narrativa
    const narrativeObj: EmergingNarrative = {
      description: narrative.description,
      confidence: narrative.strength,
      supportingEvidence: generateSupportingEvidence(narrative.description),
      relatedTopics: narrative.relatedTopics,
      potentialImpact: calculatePotentialImpact(narrative.strength, narrative.relatedTopics),
      firstDetected: new Date().toISOString(),
    }

    // Clasificar la narrativa según su relación con temas emergentes/en declive
    if (relatedToEmergingTopics) {
      emergingNarratives.push(narrativeObj)
    } else if (relatedToFadingTopics) {
      fadingNarratives.push(narrativeObj)
    } else if (narrative.strength > 0.6) {
      dominantNarratives.push(narrativeObj)
    }
  })

  // Generar narrativas adicionales basadas en combinaciones de temas emergentes
  if (emergingTopics.length >= 2) {
    for (let i = 0; i < emergingTopics.length - 1; i++) {
      for (let j = i + 1; j < emergingTopics.length; j++) {
        const topic1 = emergingTopics[i]
        const topic2 = emergingTopics[j]

        // Verificar si ya existe una narrativa que relacione estos temas
        const alreadyExists = existingNarratives.some(
          (narrative) => narrative.relatedTopics.includes(topic1) && narrative.relatedTopics.includes(topic2),
        )

        if (!alreadyExists) {
          const newNarrative: EmergingNarrative = {
            description: `Posible conexión emergente entre ${topic1} y ${topic2}`,
            confidence: 0.6,
            supportingEvidence: [
              `Ambos temas están ganando relevancia simultáneamente`,
              `No se ha identificado una narrativa establecida que los conecte`,
            ],
            relatedTopics: [topic1, topic2],
            potentialImpact: 0.7,
            firstDetected: new Date().toISOString(),
          }

          emergingNarratives.push(newNarrative)
        }
      }
    }
  }

  // Generar conexiones entre narrativas
  const narrativeConnections = generateNarrativeConnections([
    ...emergingNarratives,
    ...dominantNarratives,
    ...fadingNarratives,
  ])

  return {
    emergingNarratives,
    dominantNarratives,
    fadingNarratives,
    narrativeConnections,
  }
}

// Función para generar evidencia de apoyo simulada
function generateSupportingEvidence(narrativeDescription: string): string[] {
  // En una implementación real, esto analizaría las noticias para encontrar evidencia
  // Esta es una implementación simulada

  const genericEvidence = [
    "Mencionado en múltiples fuentes de noticias",
    "Tendencia creciente en cobertura mediática",
    "Declaraciones de actores políticos relevantes",
    "Repercusión en redes sociales",
    "Análisis de expertos confirma esta tendencia",
  ]

  // Seleccionar aleatoriamente 2-3 evidencias
  const numEvidences = 2 + Math.floor(Math.random() * 2)
  const selectedEvidence: string[] = []

  for (let i = 0; i < numEvidences; i++) {
    const randomIndex = Math.floor(Math.random() * genericEvidence.length)
    if (!selectedEvidence.includes(genericEvidence[randomIndex])) {
      selectedEvidence.push(genericEvidence[randomIndex])
    }
  }

  return selectedEvidence
}

// Función para calcular el impacto potencial de una narrativa
function calculatePotentialImpact(strength: number, relatedTopics: string[]): number {
  // En una implementación real, esto consideraría la importancia de los temas relacionados
  // Esta es una implementación simulada

  // Base del impacto es la fuerza de la narrativa
  let impact = strength

  // Ajustar por número de temas relacionados (más temas = mayor alcance potencial)
  impact += Math.min(0.3, relatedTopics.length * 0.1)

  // Normalizar a rango 0-1
  impact = Math.min(1, Math.max(0, impact))

  return Number(impact.toFixed(2))
}

// Función para generar conexiones entre narrativas
function generateNarrativeConnections(narratives: EmergingNarrative[]): {
  source: string
  target: string
  strength: number
}[] {
  const connections: {
    source: string
    target: string
    strength: number
  }[] = []

  // Buscar narrativas que comparten temas
  for (let i = 0; i < narratives.length - 1; i++) {
    for (let j = i + 1; j < narratives.length; j++) {
      const narrative1 = narratives[i]
      const narrative2 = narratives[j]

      // Encontrar temas compartidos
      const sharedTopics = narrative1.relatedTopics.filter((topic) => narrative2.relatedTopics.includes(topic))

      if (sharedTopics.length > 0) {
        // Calcular fuerza de conexión basada en temas compartidos y confianza
        const connectionStrength =
          (sharedTopics.length / Math.max(narrative1.relatedTopics.length, narrative2.relatedTopics.length)) *
          ((narrative1.confidence + narrative2.confidence) / 2)

        connections.push({
          source: narrative1.description,
          target: narrative2.description,
          strength: Number(connectionStrength.toFixed(2)),
        })
      }
    }
  }

  return connections
}

// Función para crear un análisis de narrativas vacío
function createEmptyNarrativeAnalysis(): NarrativeAnalysisResult {
  return {
    emergingNarratives: [],
    dominantNarratives: [],
    fadingNarratives: [],
    narrativeConnections: [],
  }
}
