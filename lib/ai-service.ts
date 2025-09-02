import type { PoliticalParty, NewsItem, AdaptedMessage } from "./types"

// Mock data para desarrollo
const MOCK_ADAPTED_MESSAGES = {
  "frente-de-todos": {
    general:
      "Desde el Frente de Todos, reafirmamos nuestro compromiso con la justicia social y la inclusión. Las políticas públicas deben estar al servicio del pueblo, garantizando derechos y oportunidades para todos los argentinos.",
    economic:
      "Defendemos un modelo económico que priorice el mercado interno, el trabajo nacional y la distribución equitativa de la riqueza. Es fundamental fortalecer el rol del Estado como regulador y promotor del desarrollo.",
    social:
      "Nuestra visión se centra en la construcción de una sociedad más justa e igualitaria, donde los derechos humanos sean una realidad para todos. La educación pública, la salud universal y la protección social son pilares fundamentales.",
  },
  "juntos-por-el-cambio": {
    general:
      "Desde Juntos por el Cambio, promovemos un país moderno, transparente y con instituciones sólidas. Creemos en la importancia del diálogo, el consenso y las políticas de Estado que trasciendan los gobiernos.",
    economic:
      "Apostamos por una economía competitiva, con reglas claras que fomenten la inversión y la creación de empleo genuino. La estabilidad macroeconómica y la inserción internacional son claves para el crecimiento sostenible.",
    social:
      "Defendemos una sociedad basada en la meritocracia, la igualdad de oportunidades y el respeto por las libertades individuales. La educación de calidad y la seguridad ciudadana son prioridades fundamentales.",
  },
  "la-libertad-avanza": {
    general:
      "La Libertad Avanza representa el cambio que Argentina necesita. Defendemos la libertad individual, la propiedad privada y un Estado mínimo que no interfiera en la vida de los ciudadanos.",
    economic:
      "Promovemos la libertad económica total, la eliminación de regulaciones excesivas y la competencia libre. El mercado es el mejor asignador de recursos y el motor del progreso y la prosperidad.",
    social:
      "Creemos en la responsabilidad individual y la libertad de elección. Cada persona debe ser libre de tomar sus propias decisiones sin la tutela del Estado, respetando siempre los derechos de los demás.",
  },
  "frente-de-izquierda": {
    general:
      "El Frente de Izquierda lucha por los derechos de los trabajadores y los sectores populares. Defendemos una transformación radical del sistema hacia una sociedad socialista y democrática.",
    economic:
      "Proponemos la nacionalización de los recursos estratégicos y las empresas de servicios públicos. Los trabajadores deben tener control sobre los medios de producción y una distribución justa de la riqueza.",
    social:
      "Luchamos contra toda forma de opresión y discriminación. Defendemos los derechos de las mujeres, las diversidades, los pueblos originarios y todos los sectores marginados por el sistema capitalista.",
  },
  "hacemos-por-nuestro-pais": {
    general:
      "Hacemos por Nuestro País representa el centro político constructivo. Buscamos el diálogo y el consenso para construir políticas de Estado que beneficien a todos los argentinos.",
    economic:
      "Promovemos un desarrollo económico equilibrado que combine la eficiencia del mercado con la justicia social. Es necesario un Estado presente pero eficiente, que promueva la inversión y el empleo.",
    social:
      "Defendemos una sociedad plural y tolerante, donde prime el respeto mutuo y la convivencia democrática. La educación, la salud y la seguridad son derechos fundamentales que el Estado debe garantizar.",
  },
}

export interface AIResponse {
  content: string
  error?: string
}

// Función principal para generar respuestas adaptadas
export async function adaptNewsForParty(
  newsItems: NewsItem[],
  party: PoliticalParty,
  apiKey?: string | null,
  analysisType: "general" | "economic" | "social" = "general",
): Promise<AdaptedMessage> {
  try {
    // Si no hay clave API, usar contenido mock
    if (!apiKey) {
      const mockContent =
        MOCK_ADAPTED_MESSAGES[party.id]?.[analysisType] ||
        MOCK_ADAPTED_MESSAGES[party.id]?.general ||
        "Mensaje adaptado no disponible para este partido político."

      return {
        originalNews: newsItems,
        adaptedContent: mockContent,
        party: party,
        timestamp: new Date().toISOString(),
        analysisType,
        confidence: 0.85,
        keyPoints: [
          "Análisis basado en la línea política del partido",
          "Enfoque en los valores y principios fundamentales",
          "Adaptación del discurso a la audiencia objetivo",
        ],
      }
    }

    // Aquí iría la lógica real de la API cuando esté configurada
    // Por ahora, devolvemos contenido mock mejorado
    const mockContent =
      MOCK_ADAPTED_MESSAGES[party.id]?.[analysisType] ||
      MOCK_ADAPTED_MESSAGES[party.id]?.general ||
      "Mensaje adaptado no disponible para este partido político."

    return {
      originalNews: newsItems,
      adaptedContent: mockContent,
      party: party,
      timestamp: new Date().toISOString(),
      analysisType,
      confidence: 0.92,
      keyPoints: [
        "Análisis avanzado con IA",
        "Adaptación contextual al partido político",
        "Optimización para máximo impacto comunicacional",
      ],
    }
  } catch (error) {
    console.error("Error adaptando noticias:", error)

    return {
      originalNews: newsItems,
      adaptedContent: "Error al generar el mensaje adaptado. Por favor, intenta nuevamente.",
      party: party,
      timestamp: new Date().toISOString(),
      analysisType,
      confidence: 0,
      keyPoints: ["Error en el procesamiento"],
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Función simplificada para generar mensajes adaptados
export async function generateAdaptedMessage(
  newsItems: NewsItem[],
  party: PoliticalParty,
  apiKey?: string | null,
): Promise<string> {
  try {
    const result = await adaptNewsForParty(newsItems, party, apiKey)
    return result.adaptedContent
  } catch (error) {
    console.error("Error generando mensaje adaptado:", error)
    return "Error al generar el mensaje adaptado. Por favor, intenta nuevamente."
  }
}

// Función para generar análisis de sentimiento
export async function analyzeSentiment(
  text: string,
  apiKey?: string | null,
): Promise<{
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  details: string
}> {
  try {
    // Mock implementation
    const sentiments = ["positive", "negative", "neutral"] as const
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)]

    return {
      sentiment: randomSentiment,
      confidence: 0.75 + Math.random() * 0.2,
      details: `Análisis de sentimiento ${
        randomSentiment === "positive" ? "positivo" : randomSentiment === "negative" ? "negativo" : "neutral"
      } detectado en el texto.`,
    }
  } catch (error) {
    console.error("Error analizando sentimiento:", error)
    return {
      sentiment: "neutral",
      confidence: 0,
      details: "Error al analizar el sentimiento del texto.",
    }
  }
}

// Función para generar respuestas rápidas
export async function generateQuickResponse(
  topic: string,
  party: PoliticalParty,
  apiKey?: string | null,
): Promise<string> {
  try {
    const responses = MOCK_ADAPTED_MESSAGES[party.id]
    if (!responses) {
      return "No hay respuestas disponibles para este partido político."
    }

    // Seleccionar respuesta basada en el tópico
    if (topic.toLowerCase().includes("econom")) {
      return responses.economic || responses.general
    } else if (topic.toLowerCase().includes("social")) {
      return responses.social || responses.general
    } else {
      return responses.general
    }
  } catch (error) {
    console.error("Error generando respuesta rápida:", error)
    return "Error al generar la respuesta rápida."
  }
}

// Función para validar claves API
export async function validateApiKey(apiKey: string, provider: "openai" | "anthropic"): Promise<boolean> {
  try {
    // Mock validation - en producción esto haría una llamada real a la API
    if (!apiKey || apiKey.length < 10) {
      return false
    }

    if (provider === "openai" && !apiKey.startsWith("sk-")) {
      return false
    }

    if (provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
      return false
    }

    return true
  } catch (error) {
    console.error("Error validando clave API:", error)
    return false
  }
}

// Exportar todas las funciones
export { MOCK_ADAPTED_MESSAGES }
