export interface MessageEvaluation {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  politicalAlignment: number // -1 (izquierda) a 1 (derecha)
  emotionalTone: "positive" | "neutral" | "negative"
  complexity: number // 0-1
  effectiveness: number // 0-1
}

export interface EvaluationCriteria {
  clarity: number
  persuasiveness: number
  authenticity: number
  relevance: number
  impact: number
}

export function evaluateMessage(message: string, targetAudience: string, politicalContext: string): MessageEvaluation {
  // Análisis básico de longitud y estructura
  const wordCount = message.split(" ").length
  const sentenceCount = message.split(/[.!?]+/).length
  const avgWordsPerSentence = wordCount / sentenceCount

  // Evaluación de claridad
  const clarity = calculateClarity(message, avgWordsPerSentence)

  // Evaluación de persuasión
  const persuasiveness = calculatePersuasiveness(message)

  // Evaluación de autenticidad
  const authenticity = calculateAuthenticity(message, politicalContext)

  // Evaluación de relevancia
  const relevance = calculateRelevance(message, targetAudience)

  // Evaluación de impacto
  const impact = calculateImpact(message)

  // Puntuación general
  const score = (clarity + persuasiveness + authenticity + relevance + impact) / 5

  // Análisis de alineación política
  const politicalAlignment = analyzePoliticalAlignment(message)

  // Análisis de tono emocional
  const emotionalTone = analyzeEmotionalTone(message)

  // Complejidad del mensaje
  const complexity = calculateComplexity(message, avgWordsPerSentence)

  // Efectividad estimada
  const effectiveness = (score + impact) / 2

  return {
    score: Math.round(score * 100) / 100,
    strengths: generateStrengths(clarity, persuasiveness, authenticity, relevance, impact),
    weaknesses: generateWeaknesses(clarity, persuasiveness, authenticity, relevance, impact),
    suggestions: generateSuggestions(message, clarity, persuasiveness, authenticity, relevance, impact),
    politicalAlignment,
    emotionalTone,
    complexity,
    effectiveness,
  }
}

function calculateClarity(message: string, avgWordsPerSentence: number): number {
  let score = 1.0

  // Penalizar oraciones muy largas
  if (avgWordsPerSentence > 25) score -= 0.3
  else if (avgWordsPerSentence > 20) score -= 0.1

  // Penalizar uso excesivo de jerga técnica
  const technicalWords = ["implementar", "optimizar", "paradigma", "sinergia", "holístico"]
  const technicalCount = technicalWords.reduce(
    (count, word) => count + (message.toLowerCase().includes(word) ? 1 : 0),
    0,
  )
  score -= technicalCount * 0.1

  // Bonificar uso de conectores claros
  const connectors = ["por lo tanto", "sin embargo", "además", "en consecuencia", "por ejemplo"]
  const connectorCount = connectors.reduce(
    (count, connector) => count + (message.toLowerCase().includes(connector) ? 1 : 0),
    0,
  )
  score += connectorCount * 0.05

  return Math.max(0, Math.min(1, score))
}

function calculatePersuasiveness(message: string): number {
  let score = 0.5

  // Buscar elementos persuasivos
  const persuasiveElements = [
    "necesitamos",
    "debemos",
    "es fundamental",
    "es crucial",
    "es importante",
    "juntos podemos",
    "unidos",
    "nuestro futuro",
    "para todos",
    "beneficio",
  ]

  const persuasiveCount = persuasiveElements.reduce(
    (count, element) => count + (message.toLowerCase().includes(element) ? 1 : 0),
    0,
  )
  score += persuasiveCount * 0.1

  // Buscar llamadas a la acción
  const callsToAction = ["vote", "apoya", "únete", "participa", "actúa", "decide"]
  const actionCount = callsToAction.reduce(
    (count, action) => count + (message.toLowerCase().includes(action) ? 1 : 0),
    0,
  )
  score += actionCount * 0.15

  // Penalizar lenguaje muy agresivo
  const aggressiveWords = ["destruir", "eliminar", "acabar con", "guerra", "enemigo"]
  const aggressiveCount = aggressiveWords.reduce(
    (count, word) => count + (message.toLowerCase().includes(word) ? 1 : 0),
    0,
  )
  score -= aggressiveCount * 0.2

  return Math.max(0, Math.min(1, score))
}

function calculateAuthenticity(message: string, politicalContext: string): number {
  let score = 0.7

  // Bonificar referencias específicas al contexto argentino
  const argentineReferences = [
    "argentina",
    "argentinos",
    "patria",
    "nación",
    "pueblo argentino",
    "buenos aires",
    "provincias",
    "federal",
    "constitución",
  ]

  const contextCount = argentineReferences.reduce(
    (count, ref) => count + (message.toLowerCase().includes(ref) ? 1 : 0),
    0,
  )
  score += contextCount * 0.05

  // Penalizar clichés políticos excesivos
  const cliches = [
    "cambio real",
    "nueva era",
    "revolución",
    "transformación total",
    "solución definitiva",
    "promesa de campaña",
  ]

  const clicheCount = cliches.reduce((count, cliche) => count + (message.toLowerCase().includes(cliche) ? 1 : 0), 0)
  score -= clicheCount * 0.1

  return Math.max(0, Math.min(1, score))
}

function calculateRelevance(message: string, targetAudience: string): number {
  let score = 0.6

  // Mapear audiencias a palabras clave relevantes
  const audienceKeywords: Record<string, string[]> = {
    jóvenes: ["educación", "trabajo", "futuro", "oportunidades", "tecnología"],
    trabajadores: ["empleo", "salario", "derechos laborales", "sindicatos", "jubilación"],
    empresarios: ["inversión", "crecimiento", "mercado", "competitividad", "exportaciones"],
    familias: ["salud", "educación", "seguridad", "vivienda", "alimentación"],
    jubilados: ["pensiones", "salud", "medicamentos", "asistencia social", "dignidad"],
  }

  const relevantKeywords = audienceKeywords[targetAudience.toLowerCase()] || []
  const relevanceCount = relevantKeywords.reduce(
    (count, keyword) => count + (message.toLowerCase().includes(keyword) ? 1 : 0),
    0,
  )

  score += relevanceCount * 0.1

  return Math.max(0, Math.min(1, score))
}

function calculateImpact(message: string): number {
  let score = 0.5

  // Buscar elementos de alto impacto
  const impactWords = [
    "histórico",
    "revolucionario",
    "transformador",
    "decisivo",
    "crucial",
    "millones",
    "todos los argentinos",
    "generaciones futuras",
    "cambio profundo",
  ]

  const impactCount = impactWords.reduce((count, word) => count + (message.toLowerCase().includes(word) ? 1 : 0), 0)
  score += impactCount * 0.1

  // Bonificar uso de datos específicos
  const numberPattern = /\d+(\.\d+)?%?/g
  const numbers = message.match(numberPattern) || []
  score += numbers.length * 0.05

  return Math.max(0, Math.min(1, score))
}

function analyzePoliticalAlignment(message: string): number {
  let alignment = 0

  // Palabras asociadas con la izquierda (-1)
  const leftWords = [
    "justicia social",
    "igualdad",
    "derechos humanos",
    "pueblo",
    "trabajadores",
    "redistribución",
    "estado presente",
    "servicios públicos",
    "solidaridad",
  ]

  // Palabras asociadas con la derecha (+1)
  const rightWords = [
    "libertad económica",
    "mercado libre",
    "emprendimiento",
    "eficiencia",
    "competitividad",
    "inversión privada",
    "reducir el estado",
    "meritocracia",
  ]

  const leftCount = leftWords.reduce((count, word) => count + (message.toLowerCase().includes(word) ? 1 : 0), 0)

  const rightCount = rightWords.reduce((count, word) => count + (message.toLowerCase().includes(word) ? 1 : 0), 0)

  alignment = (rightCount - leftCount) * 0.2
  return Math.max(-1, Math.min(1, alignment))
}

function analyzeEmotionalTone(message: string): "positive" | "neutral" | "negative" {
  const positiveWords = [
    "esperanza",
    "futuro",
    "progreso",
    "crecimiento",
    "oportunidad",
    "éxito",
    "prosperidad",
    "bienestar",
    "alegría",
    "optimismo",
  ]

  const negativeWords = [
    "crisis",
    "problema",
    "dificultad",
    "preocupación",
    "amenaza",
    "peligro",
    "fracaso",
    "deterioro",
    "conflicto",
    "temor",
  ]

  const positiveCount = positiveWords.reduce((count, word) => count + (message.toLowerCase().includes(word) ? 1 : 0), 0)

  const negativeCount = negativeWords.reduce((count, word) => count + (message.toLowerCase().includes(word) ? 1 : 0), 0)

  if (positiveCount > negativeCount) return "positive"
  if (negativeCount > positiveCount) return "negative"
  return "neutral"
}

function calculateComplexity(message: string, avgWordsPerSentence: number): number {
  let complexity = 0.5

  // Complejidad basada en longitud de oraciones
  complexity += (avgWordsPerSentence - 15) * 0.02

  // Complejidad basada en vocabulario técnico
  const complexWords = message.split(" ").filter((word) => word.length > 8).length
  complexity += complexWords * 0.01

  return Math.max(0, Math.min(1, complexity))
}

function generateStrengths(
  clarity: number,
  persuasiveness: number,
  authenticity: number,
  relevance: number,
  impact: number,
): string[] {
  const strengths: string[] = []

  if (clarity > 0.7) strengths.push("Mensaje claro y fácil de entender")
  if (persuasiveness > 0.7) strengths.push("Alto poder de persuasión")
  if (authenticity > 0.7) strengths.push("Tono auténtico y creíble")
  if (relevance > 0.7) strengths.push("Muy relevante para la audiencia objetivo")
  if (impact > 0.7) strengths.push("Potencial de alto impacto")

  if (strengths.length === 0) {
    strengths.push("Mensaje estructurado correctamente")
  }

  return strengths
}

function generateWeaknesses(
  clarity: number,
  persuasiveness: number,
  authenticity: number,
  relevance: number,
  impact: number,
): string[] {
  const weaknesses: string[] = []

  if (clarity < 0.5) weaknesses.push("El mensaje podría ser más claro")
  if (persuasiveness < 0.5) weaknesses.push("Falta poder de persuasión")
  if (authenticity < 0.5) weaknesses.push("Podría sonar más auténtico")
  if (relevance < 0.5) weaknesses.push("Poca conexión con la audiencia objetivo")
  if (impact < 0.5) weaknesses.push("Impacto limitado")

  return weaknesses
}

function generateSuggestions(
  message: string,
  clarity: number,
  persuasiveness: number,
  authenticity: number,
  relevance: number,
  impact: number,
): string[] {
  const suggestions: string[] = []

  if (clarity < 0.6) {
    suggestions.push("Usar oraciones más cortas y directas")
    suggestions.push("Evitar jerga técnica innecesaria")
  }

  if (persuasiveness < 0.6) {
    suggestions.push("Incluir más llamadas a la acción")
    suggestions.push("Usar ejemplos concretos y casos específicos")
  }

  if (authenticity < 0.6) {
    suggestions.push("Incluir referencias específicas al contexto argentino")
    suggestions.push("Evitar clichés políticos excesivos")
  }

  if (relevance < 0.6) {
    suggestions.push("Conectar más directamente con los intereses de la audiencia")
    suggestions.push("Usar ejemplos que resuenen con el público objetivo")
  }

  if (impact < 0.6) {
    suggestions.push("Incluir datos específicos y cifras concretas")
    suggestions.push("Enfatizar las consecuencias y beneficios del mensaje")
  }

  if (suggestions.length === 0) {
    suggestions.push("El mensaje está bien estructurado, considera añadir más ejemplos específicos")
  }

  return suggestions
}

export function compareMessages(messages: string[], criteria: EvaluationCriteria): MessageEvaluation[] {
  return messages.map((message) => evaluateMessage(message, "general", "argentina"))
}

export function getBestMessage(evaluations: MessageEvaluation[]): MessageEvaluation | null {
  if (evaluations.length === 0) return null

  return evaluations.reduce((best, current) => (current.score > best.score ? current : best))
}
