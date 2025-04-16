"use server"

import type { NewsItem, PoliticalParty } from "./types"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getApiKey } from "./api-key-action"

// Interfaz para el análisis de sentimiento
interface SentimentAnalysis {
  positive: number
  neutral: number
  negative: number
  dominant: "positive" | "neutral" | "negative"
}

// Interfaz para entidades nombradas
interface NamedEntity {
  text: string
  type: "PERSON" | "ORGANIZATION" | "LOCATION" | "DATE" | "EVENT" | "LAW" | "OTHER"
  relevance: number
}

// Interfaz para temas clave
interface KeyTopic {
  topic: string
  relevance: number
  sentiment: SentimentAnalysis
}

// Interfaz para el análisis completo de NLP
export interface NLPAnalysis {
  sentiment: SentimentAnalysis
  entities: NamedEntity[]
  keyTopics: KeyTopic[]
  summary: string
  keywords: string[]
  readabilityScore: number // 0-100, donde 100 es muy legible
  complexity: number // 0-100, donde 100 es muy complejo
  formalityLevel: number // 0-100, donde 100 es muy formal
  politicalBias?: number // -100 a 100, donde -100 es extrema izquierda y 100 extrema derecha
}

// Modificar la función analyzeText para manejar mejor las respuestas y errores
// Reemplazar la función completa con esta versión mejorada:

// Función para analizar texto con NLP
export async function analyzeText(text: string, apiKey?: string): Promise<NLPAnalysis | null> {
  try {
    // Intentar obtener la clave API del servidor si no se proporciona
    if (!apiKey) {
      apiKey = await getApiKey()
    }

    // Si no hay clave API válida, devolver null
    if (!apiKey || !apiKey.startsWith("sk-")) {
      console.log("Clave API no válida para análisis NLP")
      return simulateNLPAnalysis(text)
    }

    const prompt = `
Analiza el siguiente texto utilizando técnicas de NLP y devuelve un análisis estructurado en formato JSON:

"""
${text}
"""

El análisis debe incluir:
1. Análisis de sentimiento (positivo, neutral, negativo)
2. Entidades nombradas (personas, organizaciones, lugares, fechas, eventos)
3. Temas clave
4. Resumen breve (máximo 2 oraciones)
5. Palabras clave (máximo 5)
6. Puntuación de legibilidad (0-100)
7. Nivel de complejidad (0-100)
8. Nivel de formalidad (0-100)
9. Sesgo político si es detectable (-100 a 100, donde -100 es extrema izquierda y 100 extrema derecha)

Responde SOLO con el objeto JSON, sin texto adicional.
`

    try {
      const { text: analysisText } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2,
        maxTokens: 1000,
        apiKey,
      })

      // Verificar que la respuesta no esté vacía
      if (!analysisText || analysisText.trim() === "") {
        console.log("Respuesta vacía en análisis NLP, usando simulación")
        return simulateNLPAnalysis(text)
      }

      try {
        // Intentar limpiar la respuesta si contiene texto adicional antes o después del JSON
        let jsonText = analysisText.trim()

        // Buscar el primer '{' y el último '}'
        const startIndex = jsonText.indexOf("{")
        const endIndex = jsonText.lastIndexOf("}")

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          jsonText = jsonText.substring(startIndex, endIndex + 1)
        }

        const analysis = JSON.parse(jsonText)
        return analysis as NLPAnalysis
      } catch (parseError) {
        console.error("Error al parsear la respuesta JSON:", parseError)
        return simulateNLPAnalysis(text)
      }
    } catch (apiError) {
      console.error("Error en la API durante análisis NLP:", apiError)
      return simulateNLPAnalysis(text)
    }
  } catch (error) {
    console.error("Error en el análisis NLP:", error)
    return simulateNLPAnalysis(text)
  }
}

// Función para simular análisis NLP cuando no hay API disponible
function simulateNLPAnalysis(text: string): NLPAnalysis {
  // Análisis de sentimiento básico basado en palabras clave
  const positiveWords = ["bueno", "excelente", "positivo", "favorable", "beneficio", "éxito", "mejora", "crecimiento"]
  const negativeWords = ["malo", "negativo", "problema", "crisis", "fracaso", "deterioro", "caída", "preocupante"]

  const textLower = text.toLowerCase()

  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    const matches = textLower.match(regex)
    if (matches) positiveCount += matches.length
  })

  negativeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    const matches = textLower.match(regex)
    if (matches) negativeCount += matches.length
  })

  const total = positiveCount + negativeCount
  const positive = total > 0 ? (positiveCount / total) * 100 : 33.33
  const negative = total > 0 ? (negativeCount / total) * 100 : 33.33
  const neutral = 100 - positive - negative

  let dominant: "positive" | "neutral" | "negative" = "neutral"
  if (positive > negative && positive > neutral) dominant = "positive"
  if (negative > positive && negative > neutral) dominant = "negative"

  // Extracción básica de entidades
  const entities: NamedEntity[] = []

  // Buscar personas (nombres propios)
  const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
  const names = text.match(nameRegex) || []
  names.forEach((name) => {
    entities.push({
      text: name,
      type: "PERSON",
      relevance: 0.8,
    })
  })

  // Buscar organizaciones (palabras en mayúsculas)
  const orgRegex = /\b[A-Z]{2,}\b/g
  const orgs = text.match(orgRegex) || []
  orgs.forEach((org) => {
    entities.push({
      text: org,
      type: "ORGANIZATION",
      relevance: 0.7,
    })
  })

  // Extracción básica de temas clave
  const sentences = text.split(/[.!?]+/)
  const keyTopics: KeyTopic[] = []

  if (sentences.length > 0) {
    // Usar la primera oración como tema principal
    keyTopics.push({
      topic: sentences[0].trim().substring(0, 50) + (sentences[0].length > 50 ? "..." : ""),
      relevance: 0.9,
      sentiment: {
        positive: positive,
        neutral: neutral,
        negative: negative,
        dominant: dominant,
      },
    })

    // Usar otra oración si hay suficientes
    if (sentences.length > 2) {
      keyTopics.push({
        topic: sentences[2].trim().substring(0, 50) + (sentences[2].length > 50 ? "..." : ""),
        relevance: 0.7,
        sentiment: {
          positive: positive,
          neutral: neutral,
          negative: negative,
          dominant: dominant,
        },
      })
    }
  }

  // Generar resumen básico
  const summary =
    sentences.length > 0
      ? sentences[0].trim() + (sentences.length > 1 ? " " + sentences[1].trim() : "")
      : text.substring(0, 100) + (text.length > 100 ? "..." : "")

  // Extraer palabras clave (palabras más largas)
  const words = text.split(/\s+/)
  const sortedWords = words
    .filter((word) => word.length > 5)
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)
    .map((word) => word.replace(/[.,;:!?()]/g, ""))

  return {
    sentiment: {
      positive: positive,
      neutral: neutral,
      negative: negative,
      dominant: dominant,
    },
    entities: entities,
    keyTopics: keyTopics,
    summary: summary,
    keywords: sortedWords,
    readabilityScore: 70, // Valor predeterminado
    complexity: text.length > 500 ? 70 : 40, // Basado en longitud
    formalityLevel: 60, // Valor predeterminado
    politicalBias: 0, // Neutral por defecto
  }
}

// Modificar la función generateNewsContext para manejar mejor las respuestas y errores
// Reemplazar la función completa con esta versión mejorada:

// Función para generar un contexto enriquecido para una noticia
export async function generateNewsContext(newsItem: NewsItem, apiKey?: string): Promise<string> {
  try {
    // Intentar obtener la clave API del servidor si no se proporciona
    if (!apiKey) {
      apiKey = await getApiKey()
    }

    // Si no hay clave API válida, devolver un contexto básico
    if (!apiKey || !apiKey.startsWith("sk-")) {
      console.log("Clave API de OpenAI no válida para generar contexto")
      return generateBasicContext(newsItem)
    }

    const prompt = `
Genera un breve contexto (máximo 2-3 oraciones) para la siguiente noticia, explicando su relevancia y posible impacto:

Título: ${newsItem.title}
Categoría: ${newsItem.category}
Subcategoría: ${newsItem.subcategory || "No especificada"}
Tipo de noticia: ${newsItem.newsType || "Estándar"}
Resumen: ${newsItem.summary}

El contexto debe:
1. Ser conciso y objetivo
2. Explicar por qué esta noticia es relevante
3. Mencionar posibles implicaciones
4. NO incluir opiniones políticas
5. Ser informativo para alguien que no está familiarizado con el tema

Responde SOLO con el contexto, sin introducción ni explicaciones adicionales.
`

    try {
      const { text: context } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.3,
        maxTokens: 200,
        apiKey,
      })

      // Verificar que la respuesta no esté vacía
      if (!context || context.trim() === "") {
        console.log("Respuesta vacía al generar contexto, usando contexto básico")
        return generateBasicContext(newsItem)
      }

      return context
    } catch (apiError) {
      console.error("Error en la API al generar contexto:", apiError)
      return generateBasicContext(newsItem)
    }
  } catch (error) {
    console.error("Error al generar contexto:", error)
    return generateBasicContext(newsItem)
  }
}

// Función para generar un contexto básico sin API
function generateBasicContext(newsItem: NewsItem): string {
  const categoryContext: Record<string, string> = {
    politics:
      "Esta noticia política podría tener implicaciones para el equilibrio de poder y las futuras políticas públicas.",
    nacional:
      "Este evento de alcance nacional podría afectar a ciudadanos en todo el país y tener repercusiones en múltiples sectores.",
    provincial:
      "Esta noticia provincial podría impactar en la administración local y en los servicios públicos de la región.",
    municipal:
      "Este desarrollo municipal podría afectar directamente a los residentes locales y los servicios comunitarios.",
    local: "Este evento local podría tener un impacto significativo en la comunidad inmediata y sus instituciones.",
    business: "Esta noticia empresarial podría afectar al mercado laboral y a la economía del sector.",
    economy:
      "Este desarrollo económico podría tener implicaciones para la inflación, el empleo y el poder adquisitivo.",
    technology: "Esta innovación tecnológica podría cambiar prácticas establecidas y abrir nuevas oportunidades.",
    health: "Esta noticia sanitaria podría afectar a las políticas de salud pública y al bienestar de la población.",
    environment:
      "Este evento ambiental podría tener consecuencias a largo plazo para los ecosistemas y las comunidades.",
    education: "Esta noticia educativa podría impactar en el futuro de estudiantes y en la calidad de la enseñanza.",
    security: "Este desarrollo en seguridad podría afectar a las políticas públicas y a la percepción ciudadana.",
    international:
      "Esta noticia internacional podría tener repercusiones en las relaciones diplomáticas y comerciales de Argentina.",
  }

  return (
    categoryContext[newsItem.category] ||
    "Esta noticia podría tener implicaciones significativas dependiendo de cómo se desarrollen los acontecimientos."
  )
}

// Función auxiliar para obtener el nombre del partido
function getPartyName(party: PoliticalParty): string {
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

// Modificar la función enhanceResponseCoherence para manejar mejor las respuestas y errores
// Reemplazar la función completa con esta versión mejorada:

// Función para mejorar la coherencia entre noticias y respuestas
export async function enhanceResponseCoherence(
  newsItems: NewsItem[],
  response: string,
  party: PoliticalParty,
  apiKey?: string,
): Promise<string> {
  try {
    // Intentar obtener la clave API del servidor si no se proporciona
    if (!apiKey) {
      apiKey = await getApiKey()
    }

    // Si no hay clave API válida, devolver la respuesta original
    if (!apiKey || !apiKey.startsWith("sk-")) {
      console.log("Clave API no válida para mejorar coherencia")
      return response
    }

    // Si la respuesta es muy corta, devolverla sin cambios
    if (response.length < 50) {
      return response
    }

    // Extraer información clave de las noticias
    const newsContext = newsItems.map((item) => ({
      title: item.title,
      category: item.category,
      subcategory: item.subcategory,
      newsType: item.newsType,
      summary: item.summary?.substring(0, 200) + (item.summary && item.summary.length > 200 ? "..." : ""),
      sentiment: item.acceptance
        ? item.acceptance.positive > item.acceptance.negative
          ? "positivo"
          : item.acceptance.negative > item.acceptance.positive
            ? "negativo"
            : "neutral"
        : "desconocido",
    }))

    const prompt = `
Eres un experto en comunicación política para el partido "${getPartyName(party)}" en Argentina.

CONTEXTO DE NOTICIAS:
${JSON.stringify(newsContext, null, 2)}

RESPUESTA ACTUAL:
"""
${response}
"""

INSTRUCCIONES:
Mejora la respuesta actual para aumentar la coherencia y concordancia con las noticias proporcionadas. 
La respuesta debe:

1. Mantener el mismo tono y estilo político del partido
2. Hacer referencias más naturales y fluidas a los temas de las noticias
3. Asegurar que la terminología sea consistente
4. Mejorar las transiciones entre ideas
5. Mantener la misma longitud aproximada
6. Conservar los puntos clave y argumentos principales
7. NO cambiar la posición política o ideológica
8. NO agregar información completamente nueva que no esté relacionada con las noticias
9. Mantener el mismo nivel de formalidad

Devuelve SOLO la respuesta mejorada, sin explicaciones ni comentarios adicionales.
`

    try {
      const { text: enhancedResponse } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.3,
        maxTokens: 1500,
        apiKey,
      })

      // Verificar que la respuesta no esté vacía
      if (!enhancedResponse || enhancedResponse.trim() === "") {
        console.log("Respuesta vacía al mejorar coherencia, devolviendo original")
        return response
      }

      return enhancedResponse
    } catch (apiError) {
      console.error("Error en la API al mejorar coherencia:", apiError)
      return response
    }
  } catch (error) {
    console.error("Error al mejorar la coherencia:", error)
    return response // Devolver la respuesta original en caso de error
  }
}
