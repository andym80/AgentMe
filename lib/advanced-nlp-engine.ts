import type { NewsItem } from "./types"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export interface NLPAnalysisResult {
  entities: {
    politicians: string[]
    organizations: string[]
    locations: string[]
  }
  topics: {
    name: string
    relevance: number
    sentiment: number
  }[]
  narratives: {
    description: string
    strength: number
    relatedTopics: string[]
  }[]
  sentimentAnalysis: {
    overall: number
    byTopic: Record<string, number>
    byEntity: Record<string, number>
  }
  technicalTerms?: {
    economic: string[]
    sociological: string[]
    political: string[]
  }
  complexityScore?: number // 0-1, donde 1 es muy complejo
  audienceAccessibility?: {
    general: number // 0-1, qué tan accesible es para público general
    specialized: number // 0-1, qué tan adecuado es para público especializado
  }
}

export async function performAdvancedNLPAnalysis(newsItems: NewsItem[], apiKey?: string): Promise<NLPAnalysisResult> {
  try {
    // Si no hay noticias, devolver un análisis vacío
    if (!newsItems || newsItems.length === 0) {
      return createEmptyAnalysis()
    }

    // Preparar el texto para análisis
    const combinedText = newsItems
      .map(
        (item) =>
          `TÍTULO: ${item.title}\nRESUMEN: ${item.summary || ""}\nFUENTE: ${item.source}\nCATEGORÍA: ${item.category || "general"}\n\n`,
      )
      .join("")

    // Si hay una clave API, usar Anthropic para análisis avanzado
    if (apiKey) {
      try {
        const prompt = `
        Analiza el siguiente conjunto de noticias políticas y proporciona un análisis estructurado.
        
        NOTICIAS:
        ${combinedText}
        
        INSTRUCCIONES:
        Proporciona un análisis estructurado en formato JSON con los siguientes elementos:
        1. Entidades mencionadas (políticos, organizaciones, lugares)
        2. Temas principales con su relevancia (0-1) y sentimiento (-1 a 1)
        3. Narrativas identificadas con su fuerza y temas relacionados
        4. Análisis de sentimiento general y por tema/entidad
        5. Términos técnicos de economía, sociología y política identificados
        6. Puntuación de complejidad del contenido (0-1)
        7. Evaluación de accesibilidad para audiencias generales y especializadas (0-1)
        
        El formato debe ser exactamente como este ejemplo:
        {
          "entities": {
            "politicians": ["Nombre1", "Nombre2"],
            "organizations": ["Org1", "Org2"],
            "locations": ["Lugar1", "Lugar2"]
          },
          "topics": [
            {"name": "Tema1", "relevance": 0.8, "sentiment": 0.2},
            {"name": "Tema2", "relevance": 0.6, "sentiment": -0.3}
          ],
          "narratives": [
            {"description": "Descripción narrativa 1", "strength": 0.7, "relatedTopics": ["Tema1", "Tema3"]},
            {"description": "Descripción narrativa 2", "strength": 0.5, "relatedTopics": ["Tema2"]}
          ],
          "sentimentAnalysis": {
            "overall": 0.1,
            "byTopic": {"Tema1": 0.2, "Tema2": -0.3},
            "byEntity": {"Nombre1": 0.5, "Org1": -0.2}
          },
          "technicalTerms": {
            "economic": ["Inflación", "Déficit fiscal"],
            "sociological": ["Movilidad social", "Desigualdad"],
            "political": ["Ley Bases", "DNU"]
          },
          "complexityScore": 0.7,
          "audienceAccessibility": {
            "general": 0.4,
            "specialized": 0.8
          }
        }
        
        IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`

        const { text } = await generateText({
          model: anthropic("claude-3-haiku-20240307"),
          prompt,
          system: "Eres un analista político experto que proporciona análisis estructurados de noticias políticas.",
          maxTokens: 2000,
          temperature: 0.2,
        })

        try {
          // Intentar parsear la respuesta como JSON
          const jsonResponse = JSON.parse(text)
          return jsonResponse as NLPAnalysisResult
        } catch (parseError) {
          console.error("Error al parsear la respuesta JSON:", parseError)
          // Si hay error de parseo, intentar extraer solo la parte JSON
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              const extractedJson = JSON.parse(jsonMatch[0])
              return extractedJson as NLPAnalysisResult
            } catch (e) {
              console.error("Error al extraer JSON de la respuesta:", e)
              return simulateNLPAnalysis(newsItems)
            }
          } else {
            return simulateNLPAnalysis(newsItems)
          }
        }
      } catch (apiError) {
        console.error("Error en la API de Anthropic:", apiError)
        return simulateNLPAnalysis(newsItems)
      }
    } else {
      // Si no hay clave API, usar análisis simulado
      return simulateNLPAnalysis(newsItems)
    }
  } catch (error) {
    console.error("Error en el análisis NLP:", error)
    return createEmptyAnalysis()
  }
}

// Función auxiliar para simular la extracción de entidades
function extractSimulatedEntities(text: string, keywords: string[], minMatches: number, maxMatches: number): string[] {
  const matches: string[] = []
  keywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      matches.push(keyword)
    }
  })

  const numMatches = Math.min(
    Math.max(Math.floor(Math.random() * (maxMatches - minMatches + 1)) + minMatches, 0),
    matches.length,
  )
  const shuffledMatches = [...matches].sort(() => 0.5 - Math.random())
  return shuffledMatches.slice(0, numMatches)
}

// Función para simular análisis NLP cuando no hay API disponible
function simulateNLPAnalysis(newsItems: NewsItem[]): NLPAnalysisResult {
  // Extraer palabras clave de los títulos y resúmenes
  const allText = newsItems
    .map((item) => `${item.title} ${item.summary || ""}`)
    .join(" ")
    .toLowerCase()

  // Simular detección de entidades
  const politicians = extractSimulatedEntities(
    allText,
    ["presidente", "ministro", "diputado", "senador", "gobernador", "alcalde", "candidato"],
    3,
    6,
  )

  const organizations = extractSimulatedEntities(
    allText,
    ["gobierno", "congreso", "partido", "ministerio", "empresa", "organización", "institución"],
    2,
    5,
  )

  const locations = extractSimulatedEntities(
    allText,
    ["argentina", "buenos aires", "córdoba", "rosario", "mendoza", "país", "provincia", "ciudad"],
    2,
    4,
  )

  // Simular temas principales
  const possibleTopics = [
    "Economía",
    "Inflación",
    "Seguridad",
    "Educación",
    "Salud",
    "Política exterior",
    "Reforma judicial",
    "Impuestos",
    "Empleo",
    "Derechos sociales",
    "Medio ambiente",
  ]

  const topics = possibleTopics
    .filter(() => Math.random() > 0.5)
    .slice(0, 4 + Math.floor(Math.random() * 3))
    .map((name) => ({
      name,
      relevance: Number((0.5 + Math.random() * 0.5).toFixed(2)),
      sentiment: Number((Math.random() * 2 - 1).toFixed(2)),
    }))

  // Simular narrativas
  const narratives = [
    {
      description: "Debate sobre la situación económica y medidas de ajuste",
      strength: Number((0.6 + Math.random() * 0.4).toFixed(2)),
      relatedTopics: ["Economía", "Inflación", "Impuestos"].filter((t) => topics.some((topic) => topic.name === t)),
    },
    {
      description: "Tensiones políticas entre gobierno y oposición",
      strength: Number((0.5 + Math.random() * 0.5).toFixed(2)),
      relatedTopics: ["Política exterior", "Reforma judicial"].filter((t) => topics.some((topic) => topic.name === t)),
    },
    {
      description: "Preocupaciones sobre problemas sociales",
      strength: Number((0.4 + Math.random() * 0.4).toFixed(2)),
      relatedTopics: ["Seguridad", "Educación", "Salud"].filter((t) => topics.some((topic) => topic.name === t)),
    },
  ]

  // Simular análisis de sentimiento
  const overall = Number((Math.random() * 2 - 1).toFixed(2))

  const byTopic: Record<string, number> = {}
  topics.forEach((topic) => {
    byTopic[topic.name] = topic.sentiment
  })

  const byEntity: Record<string, number> = {}
  ;[...politicians, ...organizations].forEach((entity) => {
    byEntity[entity] = Number((Math.random() * 2 - 1).toFixed(2))
  })

  // Simular términos técnicos detectados
  const economicTerms = ["Inflación", "Recesión", "Tipo de cambio", "Déficit fiscal"]
    .filter(() => Math.random() > 0.5)
    .slice(0, 2 + Math.floor(Math.random() * 3))

  const sociologicalTerms = ["Movilidad social", "Pobreza estructural", "Desigualdad social"]
    .filter(() => Math.random() > 0.5)
    .slice(0, 1 + Math.floor(Math.random() * 2))

  const politicalTerms = ["Ley Bases", "DNU", "Libertario", "Casta política"]
    .filter(() => Math.random() > 0.5)
    .slice(0, 2 + Math.floor(Math.random() * 2))

  // Simular puntuación de complejidad y accesibilidad
  const complexityScore = Number((0.3 + Math.random() * 0.7).toFixed(2))
  const generalAccessibility = Number((1 - complexityScore * 0.8).toFixed(2))
  const specializedAccessibility = Number((0.5 + complexityScore * 0.5).toFixed(2))

  return {
    entities: {
      politicians,
      organizations,
      locations,
    },
    topics,
    narratives,
    sentimentAnalysis: {
      overall,
      byTopic,
      byEntity,
    },
    technicalTerms: {
      economic: economicTerms,
      sociological: sociologicalTerms,
      political: politicalTerms,
    },
    complexityScore,
    audienceAccessibility: {
      general: generalAccessibility,
      specialized: specializedAccessibility,
    },
  }
}

// Función para crear un análisis vacío
function createEmptyAnalysis(): NLPAnalysisResult {
  return {
    entities: {
      politicians: [],
      organizations: [],
      locations: [],
    },
    topics: [],
    narratives: [],
    sentimentAnalysis: {
      overall: 0,
      byTopic: {},
      byEntity: {},
    },
    technicalTerms: {
      economic: [],
      sociological: [],
      political: [],
    },
    complexityScore: 0,
    audienceAccessibility: {
      general: 0,
      specialized: 0,
    },
  }
}
