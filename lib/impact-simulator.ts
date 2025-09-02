import type { PoliticalParty } from "./types"

export interface AudienceSegment {
  id: string
  name: string
  demographics: {
    ageRange: [number, number]
    gender?: "male" | "female" | "all"
    education?: "basic" | "intermediate" | "higher" | "all"
    region?: string
  }
  politicalLeaning: "left" | "center-left" | "center" | "center-right" | "right"
  keyIssues: string[]
}

export interface ImpactSimulation {
  messageId: string
  party: PoliticalParty
  overallImpact: number
  segmentImpacts: {
    segmentId: string
    segmentName: string
    receptivity: number
    persuasiveness: number
    shareability: number
    overallImpact: number
  }[]
  recommendations: string[]
}

// Segmentos de audiencia predefinidos
const DEFAULT_AUDIENCE_SEGMENTS: AudienceSegment[] = [
  {
    id: "young-urban",
    name: "Jóvenes urbanos",
    demographics: {
      ageRange: [18, 29],
      gender: "all",
      education: "higher",
      region: "urbano",
    },
    politicalLeaning: "center",
    keyIssues: ["empleo", "educación", "vivienda", "tecnología", "medio ambiente"],
  },
  {
    id: "middle-class",
    name: "Clase media trabajadora",
    demographics: {
      ageRange: [30, 50],
      gender: "all",
      education: "intermediate",
      region: "urbano",
    },
    politicalLeaning: "center",
    keyIssues: ["economía", "impuestos", "seguridad", "educación", "salud"],
  },
  {
    id: "senior-conservative",
    name: "Adultos mayores conservadores",
    demographics: {
      ageRange: [60, 85],
      gender: "all",
      education: "intermediate",
      region: "urbano",
    },
    politicalLeaning: "center-right",
    keyIssues: ["seguridad", "jubilaciones", "salud", "tradición", "familia"],
  },
  {
    id: "rural-workers",
    name: "Trabajadores rurales",
    demographics: {
      ageRange: [25, 65],
      gender: "all",
      education: "basic",
      region: "rural",
    },
    politicalLeaning: "center",
    keyIssues: ["campo", "impuestos", "infraestructura", "clima", "exportaciones"],
  },
  {
    id: "progressive-educated",
    name: "Profesionales progresistas",
    demographics: {
      ageRange: [25, 45],
      gender: "all",
      education: "higher",
      region: "urbano",
    },
    politicalLeaning: "center-left",
    keyIssues: ["derechos", "medio ambiente", "innovación", "diversidad", "educación"],
  },
]

// Función principal para simular el impacto de un mensaje
export async function simulateMessageImpact(
  message: string,
  party: PoliticalParty,
  segments: AudienceSegment[] = DEFAULT_AUDIENCE_SEGMENTS,
): Promise<ImpactSimulation> {
  // Generar ID único para el mensaje si no se proporciona
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Analizar el mensaje para detectar temas y tono
  const messageAnalysis = analyzeMessage(message)

  // Calcular impacto para cada segmento
  const segmentImpacts = segments.map((segment) => {
    // Calcular receptividad basada en alineación política y temas
    const receptivity = calculateReceptivity(segment, party, messageAnalysis.topics)

    // Calcular persuasividad basada en el tono y la claridad del mensaje
    const persuasiveness = calculatePersuasiveness(segment, messageAnalysis)

    // Calcular probabilidad de compartir
    const shareability = calculateShareability(segment, messageAnalysis)

    // Calcular impacto general para este segmento
    const overallImpact = receptivity * 0.4 + persuasiveness * 0.4 + shareability * 0.2

    return {
      segmentId: segment.id,
      segmentName: segment.name,
      receptivity: Number(receptivity.toFixed(2)),
      persuasiveness: Number(persuasiveness.toFixed(2)),
      shareability: Number(shareability.toFixed(2)),
      overallImpact: Number(overallImpact.toFixed(2)),
    }
  })

  // Calcular impacto general ponderado
  const overallImpact = Number(
    (segmentImpacts.reduce((sum, impact) => sum + impact.overallImpact, 0) / segmentImpacts.length).toFixed(2),
  )

  // Generar recomendaciones basadas en el análisis
  const recommendations = generateRecommendations(segmentImpacts, messageAnalysis, party)

  return {
    messageId,
    party,
    overallImpact,
    segmentImpacts,
    recommendations,
  }
}

// Función para analizar el mensaje
function analyzeMessage(message: string) {
  // En una implementación real, esto utilizaría NLP
  // Esta es una implementación simulada

  // Detectar temas en el mensaje
  const allPossibleTopics = [
    "economía",
    "impuestos",
    "inflación",
    "seguridad",
    "educación",
    "salud",
    "jubilaciones",
    "empleo",
    "vivienda",
    "infraestructura",
    "campo",
    "exportaciones",
    "derechos",
    "medio ambiente",
    "tecnología",
    "corrupción",
    "justicia",
    "familia",
    "tradición",
    "diversidad",
  ]

  const detectedTopics = allPossibleTopics.filter((topic) => message.toLowerCase().includes(topic))

  // Si no se detectaron temas específicos, inferir algunos basados en palabras clave
  if (detectedTopics.length === 0) {
    if (containsAny(message.toLowerCase(), ["dólar", "precio", "costo", "gasto", "déficit", "deuda"])) {
      detectedTopics.push("economía")
    }
    if (containsAny(message.toLowerCase(), ["delito", "policía", "crimen", "violencia", "protección"])) {
      detectedTopics.push("seguridad")
    }
    if (containsAny(message.toLowerCase(), ["escuela", "universidad", "estudiantes", "aprendizaje"])) {
      detectedTopics.push("educación")
    }
    if (containsAny(message.toLowerCase(), ["hospital", "médicos", "enfermedad", "atención", "pacientes"])) {
      detectedTopics.push("salud")
    }
  }

  // Asegurar que haya al menos un tema
  if (detectedTopics.length === 0) {
    detectedTopics.push("política general")
  }

  // Analizar tono del mensaje
  const toneAnalysis = {
    formal: containsAny(message, ["por lo tanto", "en consecuencia", "cabe destacar", "es menester"]) ? 0.8 : 0.4,
    emotional: containsAny(message, ["!", "urgente", "crucial", "fundamental", "necesitamos", "juntos"]) ? 0.8 : 0.3,
    aggressive: containsAny(message, ["contra", "lucha", "combatir", "derrotar", "enemigos"]) ? 0.8 : 0.2,
    optimistic: containsAny(message, ["futuro", "esperanza", "mejorar", "progreso", "oportunidad"]) ? 0.8 : 0.4,
    technical: containsAny(message, ["porcentaje", "implementación", "metodología", "sistema", "proceso"]) ? 0.7 : 0.3,
  }

  // Estimar claridad del mensaje
  const wordCount = message.split(/\s+/).length
  const sentenceCount = message.split(/[.!?]+/).length - 1
  const avgWordsPerSentence = wordCount / Math.max(1, sentenceCount)

  let clarity = 0.7 // Valor base
  if (avgWordsPerSentence > 25) clarity -= 0.2 // Penalizar oraciones muy largas
  if (wordCount < 20) clarity -= 0.1 // Penalizar mensajes muy cortos
  if (wordCount > 200) clarity -= 0.1 // Penalizar mensajes muy largos

  // Normalizar claridad
  clarity = Math.min(1, Math.max(0, clarity))

  return {
    topics: detectedTopics,
    tone: toneAnalysis,
    clarity,
    wordCount,
    avgWordsPerSentence,
  }
}

// Función para calcular receptividad de un segmento
function calculateReceptivity(segment: AudienceSegment, party: PoliticalParty, messageTopics: string[]): number {
  // Base de receptividad según alineación política
  let receptivity = 0.5 // Valor neutral

  // Ajustar según alineación política del segmento y partido
  if (party === "libertad-avanza") {
    if (segment.politicalLeaning === "right") receptivity += 0.3
    else if (segment.politicalLeaning === "center-right") receptivity += 0.2
    else if (segment.politicalLeaning === "left") receptivity -= 0.2
  } else if (party === "union-patria") {
    if (segment.politicalLeaning === "left") receptivity += 0.3
    else if (segment.politicalLeaning === "center-left") receptivity += 0.2
    else if (segment.politicalLeaning === "right") receptivity -= 0.2
  } else if (party === "juntos-cambio") {
    if (segment.politicalLeaning === "center-right") receptivity += 0.25
    else if (segment.politicalLeaning === "center") receptivity += 0.15
  } else if (party === "frente-izquierda") {
    if (segment.politicalLeaning === "left") receptivity += 0.35
    else if (segment.politicalLeaning === "center-left") receptivity += 0.15
    else if (segment.politicalLeaning === "right") receptivity -= 0.25
  }

  // Ajustar según coincidencia de temas
  const matchingIssues = segment.keyIssues.filter((issue) =>
    messageTopics.some((topic) => topic.includes(issue) || issue.includes(topic)),
  )

  const issueMatchBonus = (matchingIssues.length / segment.keyIssues.length) * 0.3
  receptivity += issueMatchBonus

  // Ajustes demográficos específicos (simplificados)
  if (segment.id === "young-urban" && party === "libertad-avanza") {
    receptivity += 0.1 // Bonus para jóvenes urbanos con LLA
  }
  if (segment.id === "senior-conservative" && party === "union-patria") {
    receptivity -= 0.1 // Penalización para adultos mayores conservadores con UP
  }
  if (segment.id === "rural-workers" && party === "juntos-cambio") {
    receptivity += 0.1 // Bonus para trabajadores rurales con JxC
  }

  // Normalizar a rango 0-1
  return Math.min(1, Math.max(0, receptivity))
}

// Función para calcular persuasividad
function calculatePersuasiveness(segment: AudienceSegment, messageAnalysis: ReturnType<typeof analyzeMessage>): number {
  let persuasiveness = 0.5 // Valor base

  // Ajustar según claridad del mensaje
  persuasiveness += messageAnalysis.clarity * 0.2

  // Ajustar según tono y preferencias del segmento
  if (segment.id === "young-urban") {
    // Jóvenes prefieren mensajes menos formales, más emocionales
    persuasiveness -= messageAnalysis.tone.formal * 0.1
    persuasiveness += messageAnalysis.tone.emotional * 0.1
    persuasiveness += messageAnalysis.tone.optimistic * 0.1
  } else if (segment.id === "middle-class") {
    // Clase media responde a optimismo y menos tecnicismos
    persuasiveness += messageAnalysis.tone.optimistic * 0.15
    persuasiveness -= messageAnalysis.tone.technical * 0.1
  } else if (segment.id === "senior-conservative") {
    // Adultos mayores conservadores prefieren formalidad y menos agresividad
    persuasiveness += messageAnalysis.tone.formal * 0.15
    persuasiveness -= messageAnalysis.tone.aggressive * 0.2
  } else if (segment.id === "rural-workers") {
    // Trabajadores rurales prefieren mensajes directos, menos técnicos
    persuasiveness -= messageAnalysis.tone.technical * 0.2
    persuasiveness -= messageAnalysis.tone.formal * 0.1
  } else if (segment.id === "progressive-educated") {
    // Profesionales progresistas valoran tecnicismos y optimismo
    persuasiveness += messageAnalysis.tone.technical * 0.1
    persuasiveness += messageAnalysis.tone.optimistic * 0.1
    persuasiveness -= messageAnalysis.tone.aggressive * 0.15
  }

  // Penalizar mensajes muy largos o muy cortos
  if (messageAnalysis.wordCount < 30 || messageAnalysis.wordCount > 300) {
    persuasiveness -= 0.1
  }

  // Normalizar a rango 0-1
  return Math.min(1, Math.max(0, persuasiveness))
}

// Función para calcular probabilidad de compartir
function calculateShareability(segment: AudienceSegment, messageAnalysis: ReturnType<typeof analyzeMessage>): number {
  let shareability = 0.4 // Valor base

  // Los mensajes emocionales tienen más probabilidad de ser compartidos
  shareability += messageAnalysis.tone.emotional * 0.3

  // Los mensajes optimistas suelen compartirse más
  shareability += messageAnalysis.tone.optimistic * 0.2

  // Los mensajes agresivos pueden ser compartidos por indignación
  shareability += messageAnalysis.tone.aggressive * 0.1

  // Ajustes por segmento
  if (segment.id === "young-urban") {
    // Jóvenes comparten más contenido en general
    shareability += 0.1
  } else if (segment.id === "senior-conservative") {
    // Adultos mayores comparten menos
    shareability -= 0.1
  }

  // Penalizar mensajes muy técnicos o formales para compartir
  shareability -= messageAnalysis.tone.technical * 0.15
  shareability -= messageAnalysis.tone.formal * 0.1

  // Normalizar a rango 0-1
  return Math.min(1, Math.max(0, shareability))
}

// Función para generar recomendaciones
function generateRecommendations(
  segmentImpacts: ImpactSimulation["segmentImpacts"],
  messageAnalysis: ReturnType<typeof analyzeMessage>,
  party: PoliticalParty,
): string[] {
  const recommendations: string[] = []

  // Identificar segmentos con menor impacto
  const lowImpactSegments = segmentImpacts
    .filter((impact) => impact.overallImpact < 0.5)
    .sort((a, b) => a.overallImpact - b.overallImpact)

  // Identificar segmentos con mayor impacto
  const highImpactSegments = segmentImpacts
    .filter((impact) => impact.overallImpact >= 0.7)
    .sort((b, a) => a.overallImpact - b.overallImpact)

  // Recomendaciones basadas en segmentos de bajo impacto
  if (lowImpactSegments.length > 0) {
    const worstSegment = lowImpactSegments[0]

    if (worstSegment.receptivity < 0.4) {
      recommendations.push(
        `Adaptar el mensaje para mejorar la receptividad en el segmento "${worstSegment.segmentName}" enfatizando temas que les importan.`,
      )
    }

    if (worstSegment.persuasiveness < 0.4) {
      if (worstSegment.segmentId === "young-urban") {
        recommendations.push(
          `Usar un lenguaje menos formal y más directo para aumentar la persuasión en "${worstSegment.segmentName}".`,
        )
      } else if (worstSegment.segmentId === "senior-conservative") {
        recommendations.push(
          `Emplear un tono más respetuoso y tradicional para mejorar la persuasión en "${worstSegment.segmentName}".`,
        )
      } else {
        recommendations.push(
          `Ajustar el tono y la claridad del mensaje para mejorar la persuasión en "${worstSegment.segmentName}".`,
        )
      }
    }
  }

  // Recomendaciones basadas en análisis del mensaje
  if (messageAnalysis.clarity < 0.5) {
    recommendations.push(
      "Simplificar el lenguaje y usar oraciones más cortas para mejorar la claridad general del mensaje.",
    )
  }

  if (messageAnalysis.avgWordsPerSentence > 25) {
    recommendations.push("Reducir la longitud de las oraciones para facilitar la comprensión del mensaje.")
  }

  if (messageAnalysis.topics.length < 2) {
    recommendations.push("Incorporar más temas relevantes para ampliar el alcance del mensaje a diferentes segmentos.")
  }

  // Recomendaciones específicas por partido
  if (party === "libertad-avanza") {
    if (!messageAnalysis.topics.includes("economía") && !messageAnalysis.topics.includes("impuestos")) {
      recommendations.push(
        "Incluir referencias a temas económicos o fiscales que son centrales para el discurso de La Libertad Avanza.",
      )
    }
  } else if (party === "union-patria") {
    if (!messageAnalysis.topics.includes("derechos") && !messageAnalysis.topics.includes("justicia")) {
      recommendations.push(
        "Incorporar menciones a derechos sociales o justicia social que son pilares del discurso de Unión por la Patria.",
      )
    }
  }

  // Recomendaciones basadas en segmentos de alto impacto
  if (highImpactSegments.length > 0) {
    const bestSegment = highImpactSegments[0]
    recommendations.push(
      `Potenciar la difusión del mensaje en canales que lleguen al segmento "${bestSegment.segmentName}" donde tiene mayor impacto.`,
    )
  }

  // Recomendaciones sobre compartibilidad
  const avgShareability = segmentImpacts.reduce((sum, impact) => sum + impact.shareability, 0) / segmentImpacts.length
  if (avgShareability < 0.5) {
    recommendations.push(
      "Incluir elementos más emocionales o impactantes para aumentar la probabilidad de que el mensaje sea compartido.",
    )
  }

  // Limitar a 5 recomendaciones como máximo
  return recommendations.slice(0, 5)
}

// Función auxiliar para verificar si un texto contiene alguna de las palabras clave
function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword))
}

// Función para obtener segmentos de audiencia predeterminados
export function getDefaultAudienceSegments(): AudienceSegment[] {
  return DEFAULT_AUDIENCE_SEGMENTS
}

// Función para crear un segmento de audiencia personalizado
export function createCustomAudienceSegment(segment: Omit<AudienceSegment, "id">): AudienceSegment {
  return {
    ...segment,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  }
}
