"use server"

// Interfaz para el resultado del análisis
interface SentimentAnalysisResult {
  sentiment: {
    positive: number
    negative: number
    neutral: number
    dominant: string
  }
  readabilityScore: number
  complexity: number
  formalityLevel: number
  keywords: string[]
  keyTopics: {
    topic: string
    sentiment: {
      positive: number
      negative: number
      neutral: number
      dominant: string
    }
  }[]
  dominantTone: string
  targetAudience: string
}

// Función para analizar texto usando OpenAI
export async function analyzeText(text: string, apiKey?: string | null): Promise<SentimentAnalysisResult> {
  try {
    // Si no hay API key, usar análisis local
    if (!apiKey || !apiKey.startsWith("sk-")) {
      return generateLocalAnalysis(text)
    }

    // Intentar hasta 3 veces
    let attempts = 0
    const maxAttempts = 3
    let lastError: any = null

    while (attempts < maxAttempts) {
      try {
        attempts++

        // Llamar a la API de OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "Eres un experto en análisis lingüístico y de sentimiento. Analiza el siguiente texto político y proporciona un análisis detallado en formato JSON.",
              },
              {
                role: "user",
                content: `Analiza el siguiente discurso político y proporciona un análisis detallado que incluya: 
                1. Sentimiento general (porcentajes de positivo, negativo y neutral, y cuál es dominante)
                2. Puntuación de legibilidad (0-100)
                3. Nivel de complejidad (0-100)
                4. Nivel de formalidad (0-100)
                5. Palabras clave principales (5-10)
                6. Temas clave (2-3) con su sentimiento asociado
                7. Tono dominante
                8. Audiencia objetivo probable
                
                Proporciona el resultado en formato JSON válido, sin explicaciones adicionales.
                
                Texto a analizar:
                ${text.substring(0, 2000)}...`,
              },
            ],
            temperature: 0.5,
            max_tokens: 1000,
          }),
        })

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          const errorData = await response.json()

          // Verificar si es un error de cuota excedida
          if (
            response.status === 429 ||
            (errorData.error &&
              errorData.error.message &&
              (errorData.error.message.toLowerCase().includes("quota") ||
                errorData.error.message.toLowerCase().includes("rate limit") ||
                errorData.error.message.toLowerCase().includes("exceeded") ||
                errorData.error.message.toLowerCase().includes("billing")))
          ) {
            // Marcar en localStorage que se ha excedido la cuota
            if (typeof window !== "undefined") {
              localStorage.setItem("openai_quota_exceeded", "true")
            }

            throw new Error("QUOTA_EXCEEDED: " + errorData.error?.message)
          }

          // Otros errores de API
          if (errorData.error && errorData.error.message && errorData.error.message.toLowerCase().includes("api key")) {
            if (typeof window !== "undefined") {
              localStorage.setItem("openai_api_error", "invalid_key")
            }
            throw new Error("API_KEY_INVALID: " + errorData.error?.message)
          }

          throw new Error(`Error en la API de OpenAI: ${errorData.error?.message || response.statusText}`)
        }

        // Procesar la respuesta
        const data = await response.json()
        const resultText = data.choices[0].message.content

        try {
          // Intentar extraer el JSON de la respuesta
          const jsonMatch = resultText.match(/\{[\s\S]*\}/)
          const jsonStr = jsonMatch ? jsonMatch[0] : resultText
          const result = JSON.parse(jsonStr)

          // Asegurarse de que el resultado tenga la estructura esperada
          return {
            sentiment: result.sentiment || { positive: 33, negative: 33, neutral: 34, dominant: "neutral" },
            readabilityScore: result.readabilityScore || 70,
            complexity: result.complexity || 65,
            formalityLevel: result.formalityLevel || 70,
            keywords: result.keywords || ["política", "economía", "sociedad", "desarrollo", "propuestas"],
            keyTopics: result.keyTopics || [
              {
                topic: "Análisis político",
                sentiment: { positive: 50, negative: 25, neutral: 25, dominant: "positive" },
              },
              {
                topic: "Propuestas económicas",
                sentiment: { positive: 40, negative: 30, neutral: 30, dominant: "positive" },
              },
            ],
            dominantTone: result.dominantTone || "informativo",
            targetAudience: result.targetAudience || "público general interesado en política",
          }
        } catch (parseError) {
          console.error("Error al analizar la respuesta JSON:", parseError)
          // Si hay un error al analizar el JSON, intentar extraer la información manualmente
          return generateLocalAnalysis(text)
        }
      } catch (error) {
        lastError = error
        // Si es un error de cuota o API key, no reintentar
        if (
          error instanceof Error &&
          (error.message.includes("QUOTA_EXCEEDED") || error.message.includes("API_KEY_INVALID"))
        ) {
          break
        }
        // Esperar antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error(`Error en la API al analizar texto: Failed after ${attempts} attempts. Last error:`, lastError)

    // Usar análisis local como fallback
    return generateLocalAnalysis(text)
  } catch (error) {
    console.error("Error general al analizar texto:", error)
    // En caso de cualquier error, devolver un análisis predeterminado
    return generateLocalAnalysis(text)
  }
}

// Función para generar un análisis local sin usar la API
function generateLocalAnalysis(text: string): SentimentAnalysisResult {
  // Análisis básico del texto
  const lowerText = text.toLowerCase()

  // Detectar palabras positivas y negativas para un análisis simple
  const positiveWords = [
    "bueno",
    "excelente",
    "oportunidad",
    "progreso",
    "desarrollo",
    "crecimiento",
    "libertad",
    "justicia",
    "derechos",
    "bienestar",
    "solución",
    "propuesta",
    "mejora",
    "avance",
    "éxito",
  ]
  const negativeWords = [
    "problema",
    "crisis",
    "inflación",
    "pobreza",
    "corrupción",
    "desigualdad",
    "ajuste",
    "desempleo",
    "preocupación",
    "dificultad",
    "fracaso",
    "error",
    "amenaza",
    "peligro",
  ]

  // Contar ocurrencias
  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    const matches = lowerText.match(regex)
    if (matches) positiveCount += matches.length
  })

  negativeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    const matches = lowerText.match(regex)
    if (matches) negativeCount += matches.length
  })

  // Calcular porcentajes
  const total = positiveCount + negativeCount
  let positive = total > 0 ? Math.round((positiveCount / total) * 100) : 33
  let negative = total > 0 ? Math.round((negativeCount / total) * 100) : 33

  // Asegurarse de que no sumen más de 100
  if (positive + negative > 100) {
    const factor = 100 / (positive + negative)
    positive = Math.round(positive * factor)
    negative = Math.round(negative * factor)
  }

  const neutral = 100 - positive - negative

  // Determinar sentimiento dominante
  let dominant = "neutral"
  if (positive > negative && positive > neutral) dominant = "positive"
  else if (negative > positive && negative > neutral) dominant = "negative"

  // Extraer palabras clave (simplemente las palabras más frecuentes que no sean stopwords)
  const stopwords = [
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "unos",
    "unas",
    "y",
    "o",
    "pero",
    "porque",
    "como",
    "que",
    "en",
    "por",
    "para",
    "con",
    "sin",
    "a",
    "ante",
    "bajo",
    "cabe",
    "de",
    "desde",
    "durante",
    "entre",
    "hacia",
    "hasta",
    "mediante",
    "para",
    "por",
    "según",
    "sin",
    "so",
    "sobre",
    "tras",
    "versus",
    "vía",
  ]

  const words = lowerText.split(/\W+/).filter((word) => word.length > 3 && !stopwords.includes(word))

  const wordCount: Record<string, number> = {}
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  const keywords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((entry) => entry[0])

  // Determinar temas clave (simplificado)
  const politicalTerms = ["gobierno", "estado", "política", "democracia", "elecciones", "partido"]
  const economicTerms = ["economía", "inflación", "impuestos", "presupuesto", "fiscal", "monetario", "dólar", "pesos"]
  const socialTerms = ["sociedad", "derechos", "educación", "salud", "trabajo", "vivienda", "seguridad"]

  let politicalScore = 0
  let economicScore = 0
  let socialScore = 0

  politicalTerms.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi")
    const matches = lowerText.match(regex)
    if (matches) politicalScore += matches.length
  })

  economicTerms.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi")
    const matches = lowerText.match(regex)
    if (matches) economicScore += matches.length
  })

  socialTerms.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi")
    const matches = lowerText.match(regex)
    if (matches) socialScore += matches.length
  })

  const keyTopics = []

  if (politicalScore > 0) {
    keyTopics.push({
      topic: "Análisis político",
      sentiment: {
        positive: Math.min(positive + 10, 100),
        negative: Math.max(negative - 5, 0),
        neutral: Math.max(100 - Math.min(positive + 10, 100) - Math.max(negative - 5, 0), 0),
        dominant: dominant,
      },
    })
  }

  if (economicScore > 0) {
    keyTopics.push({
      topic: "Propuestas económicas",
      sentiment: {
        positive: Math.min(positive - 5, 100),
        negative: Math.max(negative + 5, 0),
        neutral: Math.max(100 - Math.min(positive - 5, 100) - Math.max(negative + 5, 0), 0),
        dominant: dominant,
      },
    })
  }

  if (socialScore > 0) {
    keyTopics.push({
      topic: "Políticas sociales",
      sentiment: {
        positive: positive,
        negative: negative,
        neutral: neutral,
        dominant: dominant,
      },
    })
  }

  // Si no tenemos suficientes temas, añadir uno genérico
  if (keyTopics.length < 2) {
    keyTopics.push({
      topic: "Visión general",
      sentiment: {
        positive: positive,
        negative: negative,
        neutral: neutral,
        dominant: dominant,
      },
    })
  }

  // Determinar complejidad basada en longitud de palabras y oraciones
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
  const avgSentenceLength = words.length / sentences.length

  const complexity = Math.min(Math.round((avgWordLength * 10 + avgSentenceLength) * 2), 100)

  // Determinar formalidad basada en presencia de ciertos términos
  const formalTerms = [
    "por lo tanto",
    "en consecuencia",
    "sin embargo",
    "no obstante",
    "en virtud de",
    "en relación a",
    "cabe destacar",
  ]
  const informalTerms = ["bueno", "che", "digamos", "o sea", "tipo", "como que", "ponele"]

  let formalCount = 0
  let informalCount = 0

  formalTerms.forEach((term) => {
    const regex = new RegExp(term, "gi")
    const matches = text.match(regex)
    if (matches) formalCount += matches.length
  })

  informalTerms.forEach((term) => {
    const regex = new RegExp(term, "gi")
    const matches = text.match(regex)
    if (matches) informalCount += matches.length
  })

  // Calcular nivel de formalidad
  const formalityLevel = Math.min(Math.round(70 + formalCount * 5 - informalCount * 10), 100)

  // Determinar tono dominante
  let dominantTone = "informativo"
  if (negative > 40) dominantTone = "crítico"
  if (positive > 60) dominantTone = "optimista"
  if (lowerText.includes("propongo") || lowerText.includes("proponemos")) dominantTone = "propositivo"

  // Determinar audiencia objetivo
  let targetAudience = "público general interesado en política"
  if (complexity > 70) targetAudience = "público con conocimientos avanzados de política"
  if (lowerText.includes("compañeros") || lowerText.includes("militantes")) targetAudience = "simpatizantes del partido"
  if (lowerText.includes("compatriotas") || lowerText.includes("argentinos")) targetAudience = "ciudadanía en general"

  // Calcular legibilidad (simplificado)
  const readabilityScore = Math.max(100 - complexity, 30)

  return {
    sentiment: {
      positive,
      negative,
      neutral,
      dominant,
    },
    readabilityScore,
    complexity,
    formalityLevel,
    keywords,
    keyTopics,
    dominantTone,
    targetAudience,
  }
}
