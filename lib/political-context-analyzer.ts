import type { NewsItem, PoliticalParty } from "@/lib/types"

// Tipos para el análisis de coyuntura política
type Sentiment = "positive" | "negative" | "neutral"

interface PoliticalContext {
  mainTopics: string[]
  keyActors: string[]
  controversialTopics: string[]
  currentSentiment: {
    government: Sentiment
    economy: Sentiment
    social: Sentiment
    international: Sentiment
  }
}

interface CommunicationRecommendations {
  emphasize: string[]
  avoid: string[]
  reframe: string[]
  tone: string
  keywords: string[]
}

// Función para analizar la coyuntura política basada en las noticias
export function analyzePoliticalContext(newsItems: NewsItem[]): PoliticalContext {
  // Esta es una implementación simplificada. En un entorno real,
  // se utilizaría NLP y análisis de sentimiento más avanzados.

  // Extraer todos los títulos y descripciones para análisis
  const allText = newsItems.map((item) => `${item.title} ${item.description}`).join(" ")

  // Análisis básico de temas principales (simulado)
  const mainTopics = extractMainTopics(allText)

  // Identificar actores clave mencionados
  const keyActors = extractKeyActors(allText)

  // Identificar temas controversiales
  const controversialTopics = extractControversialTopics(allText)

  // Analizar sentimiento general
  const currentSentiment = analyzeGeneralSentiment(allText)

  return {
    mainTopics,
    keyActors,
    controversialTopics,
    currentSentiment,
  }
}

// Función para obtener recomendaciones de comunicación según el partido
export function getCommunicationRecommendations(
  party: PoliticalParty,
  context: PoliticalContext,
): CommunicationRecommendations {
  // Definir recomendaciones según el partido y el contexto actual
  switch (party) {
    case "libertad-avanza":
      return getLibertadAvanzaRecommendations(context)
    case "union-patria":
      return getUnionPatriaRecommendations(context)
    case "juntos-cambio":
      return getJuntosCambioRecommendations(context)
    case "frente-izquierda":
      return getFrenteIzquierdaRecommendations(context)
    default:
      return getDefaultRecommendations(context)
  }
}

// Funciones auxiliares para el análisis (implementaciones simplificadas)

function extractMainTopics(text: string): string[] {
  // En una implementación real, se utilizaría NLP para extraer temas
  // Esta es una implementación simulada basada en palabras clave
  const economicKeywords = ["economía", "inflación", "dólar", "impuestos", "presupuesto"]
  const socialKeywords = ["educación", "salud", "seguridad", "trabajo", "pobreza"]
  const politicalKeywords = ["congreso", "elecciones", "gobierno", "oposición", "reforma"]
  const internationalKeywords = ["internacional", "exterior", "relaciones", "acuerdo", "tratado"]

  const topics: string[] = []

  // Simular detección de temas económicos
  if (containsAny(text.toLowerCase(), economicKeywords)) {
    topics.push("Economía")

    if (text.toLowerCase().includes("inflación")) topics.push("Inflación")
    if (text.toLowerCase().includes("dólar")) topics.push("Tipo de cambio")
    if (text.toLowerCase().includes("impuesto")) topics.push("Política fiscal")
  }

  // Simular detección de temas sociales
  if (containsAny(text.toLowerCase(), socialKeywords)) {
    topics.push("Políticas sociales")

    if (text.toLowerCase().includes("educación")) topics.push("Educación")
    if (text.toLowerCase().includes("salud")) topics.push("Salud pública")
    if (text.toLowerCase().includes("seguridad")) topics.push("Seguridad")
  }

  // Simular detección de temas políticos
  if (containsAny(text.toLowerCase(), politicalKeywords)) {
    topics.push("Política interna")

    if (text.toLowerCase().includes("elecciones")) topics.push("Proceso electoral")
    if (text.toLowerCase().includes("reforma")) topics.push("Reformas políticas")
  }

  // Simular detección de temas internacionales
  if (containsAny(text.toLowerCase(), internationalKeywords)) {
    topics.push("Relaciones internacionales")
  }

  // Si no se detectaron temas, agregar temas genéricos
  if (topics.length === 0) {
    topics.push("Actualidad política", "Gestión gubernamental")
  }

  return topics.slice(0, 5) // Limitar a 5 temas principales
}

function extractKeyActors(text: string): string[] {
  // En una implementación real, se utilizaría NER (Named Entity Recognition)
  // Esta es una implementación simulada con actores políticos comunes
  const possibleActors = [
    "Presidente",
    "Ministro de Economía",
    "Congreso Nacional",
    "Oposición",
    "Gobernadores",
    "Sindicatos",
    "Empresarios",
    "Movimientos sociales",
    "Poder Judicial",
    "Medios de comunicación",
  ]

  // Simular detección de actores (en un caso real se detectarían nombres propios)
  const actors = possibleActors.filter((_, index) => Math.random() > 0.6)

  // Asegurar que siempre haya al menos 2 actores
  if (actors.length < 2) {
    actors.push("Gobierno", "Oposición")
  }

  return actors
}

function extractControversialTopics(text: string): string[] {
  // En una implementación real, se analizaría el sentimiento y la polarización
  // Esta es una implementación simulada basada en temas típicamente controversiales
  const controversialKeywords = [
    "conflicto",
    "polémica",
    "crisis",
    "escándalo",
    "corrupción",
    "protesta",
    "denuncia",
    "rechazo",
    "controversia",
    "debate",
  ]

  const topics: string[] = []

  // Simular detección de temas controversiales
  if (containsAny(text.toLowerCase(), controversialKeywords)) {
    if (text.toLowerCase().includes("corrupción")) topics.push("Denuncias de corrupción")
    if (text.toLowerCase().includes("protesta")) topics.push("Protestas sociales")
    if (text.toLowerCase().includes("crisis")) topics.push("Crisis económica")
    if (text.toLowerCase().includes("escándalo")) topics.push("Escándalo político")
    if (text.toLowerCase().includes("debate")) topics.push("Debate legislativo")
  }

  // Si no se detectaron temas controversiales específicos, agregar genéricos
  if (topics.length === 0) {
    // Simular algunos temas controversiales genéricos
    const genericControversial = [
      "Política económica",
      "Reforma judicial",
      "Política exterior",
      "Seguridad pública",
      "Gasto público",
    ]

    // Seleccionar aleatoriamente 1-2 temas genéricos
    const numTopics = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < numTopics; i++) {
      const index = Math.floor(Math.random() * genericControversial.length)
      topics.push(genericControversial[index])
    }
  }

  return topics
}

function analyzeGeneralSentiment(text: string): PoliticalContext["currentSentiment"] {
  // En una implementación real, se utilizaría análisis de sentimiento avanzado
  // Esta es una implementación simulada

  // Palabras positivas y negativas para análisis básico de sentimiento
  const positiveWords = ["crecimiento", "mejora", "avance", "éxito", "positivo", "beneficio"]
  const negativeWords = ["crisis", "problema", "caída", "fracaso", "negativo", "perjuicio"]

  // Contar palabras positivas y negativas en diferentes ámbitos
  const governmentPos = countMatches(
    text.toLowerCase(),
    positiveWords.filter((w) => Math.random() > 0.5),
  )
  const governmentNeg = countMatches(
    text.toLowerCase(),
    negativeWords.filter((w) => Math.random() > 0.5),
  )

  const economyPos = countMatches(
    text.toLowerCase(),
    positiveWords.filter((w) => Math.random() > 0.5),
  )
  const economyNeg = countMatches(
    text.toLowerCase(),
    negativeWords.filter((w) => Math.random() > 0.5),
  )

  const socialPos = countMatches(
    text.toLowerCase(),
    positiveWords.filter((w) => Math.random() > 0.5),
  )
  const socialNeg = countMatches(
    text.toLowerCase(),
    negativeWords.filter((w) => Math.random() > 0.5),
  )

  const internationalPos = countMatches(
    text.toLowerCase(),
    positiveWords.filter((w) => Math.random() > 0.5),
  )
  const internationalNeg = countMatches(
    text.toLowerCase(),
    negativeWords.filter((w) => Math.random() > 0.5),
  )

  // Determinar sentimiento basado en conteo (simulado)
  return {
    government: determineSentiment(governmentPos, governmentNeg),
    economy: determineSentiment(economyPos, economyNeg),
    social: determineSentiment(socialPos, socialNeg),
    international: determineSentiment(internationalPos, internationalNeg),
  }
}

// Funciones para generar recomendaciones según el partido

function getLibertadAvanzaRecommendations(context: PoliticalContext): CommunicationRecommendations {
  return {
    emphasize: [
      "Libertad económica",
      "Reducción del gasto público",
      "Desregulación",
      "Iniciativa privada",
      "Seguridad jurídica",
    ],
    avoid: context.currentSentiment.economy === "negative" ? ["Detalles técnicos económicos"] : [],
    reframe: ["Crisis económica como oportunidad de cambio", "Problemas sociales como consecuencia del estatismo"],
    tone: "Disruptivo y técnico",
    keywords: [
      "Libertad",
      "Mercado",
      "Competencia",
      "Desregulación",
      "Eficiencia",
      "Motosierra",
      "Ajuste",
      "Déficit cero",
    ],
  }
}

function getUnionPatriaRecommendations(context: PoliticalContext): CommunicationRecommendations {
  return {
    emphasize: [
      "Protección social",
      "Soberanía económica",
      "Derechos adquiridos",
      "Rol del Estado",
      "Distribución del ingreso",
    ],
    avoid: context.currentSentiment.economy === "negative" ? ["Inflación histórica"] : [],
    reframe: ["Ajuste económico como ataque a derechos", "Problemas económicos como herencia recibida"],
    tone: "Emotivo y confrontativo",
    keywords: [
      "Pueblo",
      "Derechos",
      "Justicia social",
      "Patria",
      "Soberanía",
      "Distribución",
      "Estado presente",
      "Memoria",
    ],
  }
}

function getJuntosCambioRecommendations(context: PoliticalContext): CommunicationRecommendations {
  return {
    emphasize: [
      "Institucionalidad",
      "Modernización del Estado",
      "Equilibrio fiscal responsable",
      "Diálogo político",
      "Inserción internacional",
    ],
    avoid: [],
    reframe: ["Problemas económicos como desafíos de gestión", "Conflictos políticos como oportunidad de consenso"],
    tone: "Moderado y técnico",
    keywords: [
      "Consenso",
      "Instituciones",
      "Transparencia",
      "Gestión",
      "Eficiencia",
      "Modernización",
      "Equilibrio",
      "Diálogo",
    ],
  }
}

function getFrenteIzquierdaRecommendations(context: PoliticalContext): CommunicationRecommendations {
  return {
    emphasize: [
      "Derechos de los trabajadores",
      "Crítica al sistema económico",
      "Desigualdad social",
      "Lucha de clases",
      "Internacionalismo",
    ],
    avoid: [],
    reframe: ["Crisis económica como crisis del capitalismo", "Problemas sociales como consecuencia del sistema"],
    tone: "Crítico y combativo",
    keywords: [
      "Trabajadores",
      "Lucha",
      "Clase obrera",
      "Capitalismo",
      "Explotación",
      "Resistencia",
      "Unidad",
      "Revolución",
    ],
  }
}

function getDefaultRecommendations(context: PoliticalContext): CommunicationRecommendations {
  return {
    emphasize: [
      "Propuestas concretas",
      "Soluciones pragmáticas",
      "Bienestar ciudadano",
      "Transparencia",
      "Participación",
    ],
    avoid: [],
    reframe: ["Problemas como desafíos a resolver", "Conflictos como oportunidades de mejora"],
    tone: "Constructivo y propositivo",
    keywords: ["Soluciones", "Propuestas", "Ciudadanía", "Bienestar", "Futuro", "Desarrollo", "Oportunidad", "Cambio"],
  }
}

// Funciones auxiliares

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword))
}

function countMatches(text: string, keywords: string[]): number {
  return keywords.reduce((count, word) => {
    const regex = new RegExp(word, "g")
    const matches = text.match(regex)
    return count + (matches ? matches.length : 0)
  }, 0)
}

function determineSentiment(positive: number, negative: number): Sentiment {
  if (positive > negative) return "positive"
  if (negative > positive) return "negative"
  return "neutral"
}
