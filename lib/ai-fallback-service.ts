"use client"

import { generateAnthropicResponse } from "./ai-service"
import { generateOpenAIResponse } from "./openai-service"
import type { NewsItem, PoliticalParty } from "./types"

export type AIProvider = "anthropic" | "openai" | "auto"

export interface AIResponse {
  content: string
  provider: AIProvider
  error?: string
}

// Función para almacenar datos de forma segura en localStorage
export function secureStore(key: string, value: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value)
    }
  } catch (error) {
    console.error("Error storing data:", error)
  }
}

// Función para recuperar datos de localStorage
export function secureRetrieve(key: string): string | null {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key)
    }
    return null
  } catch (error) {
    console.error("Error retrieving data:", error)
    return null
  }
}

// Función para eliminar datos de localStorage
export function secureRemove(key: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.error("Error removing data:", error)
  }
}

// Obtener el proveedor preferido del almacenamiento local
export function getPreferredProvider(): AIProvider {
  const storedProvider = secureRetrieve("preferred_ai_provider")
  return (storedProvider as AIProvider) || "auto"
}

// Establecer el proveedor preferido en el almacenamiento local
export function setPreferredProvider(provider: AIProvider): void {
  secureStore("preferred_ai_provider", provider)
}

// Generar respuesta con fallback automático
export async function generateAIResponse(prompt: string): Promise<AIResponse> {
  const preferredProvider = getPreferredProvider()

  // Verificar si hay claves API disponibles
  const anthropicKey = secureRetrieve("anthropic_api_key")
  const openaiKey = secureRetrieve("openai_api_key")

  // Si no hay claves API configuradas, devolver error
  if (!anthropicKey && !openaiKey) {
    return {
      content: "",
      provider: "auto",
      error:
        "No se han configurado claves API. Por favor, configura al menos una clave API en la sección de configuración.",
    }
  }

  // Si el proveedor es "auto", intentar con ambos proveedores
  if (preferredProvider === "auto") {
    // Intentar primero con Anthropic si hay clave disponible
    if (anthropicKey) {
      try {
        const response = await generateAnthropicResponse(prompt)
        if (!response.error) {
          return {
            content: response.content,
            provider: "anthropic",
          }
        }
      } catch (error) {
        console.warn("Error con Anthropic, intentando con OpenAI:", error)
      }
    }

    // Si falla Anthropic o no está configurado, intentar con OpenAI
    if (openaiKey) {
      try {
        const response = await generateOpenAIResponse(prompt)
        if (!response.error) {
          return {
            content: response.content,
            provider: "openai",
          }
        }
      } catch (error) {
        console.warn("Error con OpenAI:", error)
      }
    }

    // Si ambos fallan, devolver error
    return {
      content: "",
      provider: "auto",
      error: "No se pudo generar respuesta con ningún proveedor de IA",
    }
  }

  // Intentar con el proveedor preferido
  try {
    if (preferredProvider === "anthropic") {
      if (!anthropicKey) {
        // Si no hay clave de Anthropic, intentar con OpenAI
        return await tryOpenAI(prompt)
      }

      const response = await generateAnthropicResponse(prompt)
      if (response.error) {
        // Si hay error con Anthropic, intentar con OpenAI
        return await tryOpenAI(prompt)
      }

      return {
        content: response.content,
        provider: "anthropic",
      }
    } else {
      if (!openaiKey) {
        // Si no hay clave de OpenAI, intentar con Anthropic
        return await tryAnthropic(prompt)
      }

      const response = await generateOpenAIResponse(prompt)
      if (response.error) {
        // Si hay error con OpenAI, intentar con Anthropic
        return await tryAnthropic(prompt)
      }

      return {
        content: response.content,
        provider: "openai",
      }
    }
  } catch (error) {
    // Si hay una excepción, intentar con el proveedor alternativo
    if (preferredProvider === "anthropic") {
      return await tryOpenAI(prompt)
    } else {
      return await tryAnthropic(prompt)
    }
  }
}

// Intentar con Anthropic
async function tryAnthropic(prompt: string): Promise<AIResponse> {
  try {
    const anthropicKey = secureRetrieve("anthropic_api_key")
    if (!anthropicKey) {
      return {
        content: "",
        provider: "anthropic",
        error: "No se ha configurado la clave API de Anthropic",
      }
    }

    const response = await generateAnthropicResponse(prompt)
    return {
      content: response.content,
      provider: "anthropic",
      error: response.error,
    }
  } catch (error) {
    return {
      content: "",
      provider: "anthropic",
      error: `Error con Anthropic: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Intentar con OpenAI
async function tryOpenAI(prompt: string): Promise<AIResponse> {
  try {
    const openaiKey = secureRetrieve("openai_api_key")
    if (!openaiKey) {
      return {
        content: "",
        provider: "openai",
        error: "No se ha configurado la clave API de OpenAI",
      }
    }

    const response = await generateOpenAIResponse(prompt)
    return {
      content: response.content,
      provider: "openai",
      error: response.error,
    }
  } catch (error) {
    return {
      content: "",
      provider: "openai",
      error: `Error con OpenAI: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Servicio de fallback para cuando no hay API keys configuradas
export class AIFallbackService {
  private static instance: AIFallbackService
  private mockResponses: Record<string, Record<string, string>>

  private constructor() {
    this.mockResponses = {
      "libertad-avanza": {
        general:
          "Desde La Libertad Avanza, defendemos la libertad individual y la reducción del Estado. Las fuerzas del mercado libre son la mejor herramienta para generar prosperidad y desarrollo económico sostenible.",
        economic:
          "Promovemos la desregulación económica, la eliminación de controles de precios y la apertura comercial. El Estado debe limitarse a garantizar la seguridad jurídica y la defensa de la propiedad privada.",
        social:
          "Creemos en la responsabilidad individual y la libertad de elección. Cada persona debe ser libre de tomar sus propias decisiones sin la tutela paternalista del Estado.",
      },
      "union-patria": {
        general:
          "Desde Unión por la Patria, reafirmamos nuestro compromiso con la justicia social y la soberanía nacional. El Estado debe ser el garante de los derechos del pueblo y la herramienta para construir una patria más justa.",
        economic:
          "Defendemos un modelo económico con inclusión social, que priorice el mercado interno y la industria nacional. Es fundamental el rol del Estado como regulador y promotor del desarrollo productivo.",
        social:
          "Nuestra visión se centra en la construcción de una sociedad más igualitaria, donde los derechos humanos sean una realidad para todos. La educación pública y la salud universal son pilares fundamentales.",
      },
      "juntos-cambio": {
        general:
          "Desde Juntos por el Cambio, promovemos un país moderno, transparente y con instituciones sólidas. Creemos en la importancia del diálogo, el consenso y las políticas de Estado.",
        economic:
          "Apostamos por una economía competitiva, con reglas claras que fomenten la inversión y la creación de empleo genuino. La estabilidad macroeconómica es clave para el crecimiento sostenible.",
        social:
          "Defendemos una sociedad basada en la meritocracia y la igualdad de oportunidades. La educación de calidad y la seguridad ciudadana son prioridades fundamentales.",
      },
      "frente-izquierda": {
        general:
          "El Frente de Izquierda lucha por los derechos de los trabajadores y los sectores populares. Defendemos una transformación radical del sistema hacia una sociedad socialista y democrática.",
        economic:
          "Proponemos la nacionalización de los recursos estratégicos y las empresas de servicios públicos. Los trabajadores deben tener control sobre los medios de producción.",
        social:
          "Luchamos contra toda forma de opresión y discriminación. Defendemos los derechos de las mujeres, las diversidades y todos los sectores marginados por el sistema capitalista.",
      },
    }
  }

  public static getInstance(): AIFallbackService {
    if (!AIFallbackService.instance) {
      AIFallbackService.instance = new AIFallbackService()
    }
    return AIFallbackService.instance
  }

  public async generateFallbackResponse(
    newsItems: NewsItem[],
    party: PoliticalParty,
    analysisType: "general" | "economic" | "social" = "general",
  ): Promise<string> {
    try {
      const partyResponses = this.mockResponses[party] || this.mockResponses["juntos-cambio"]
      const baseResponse = partyResponses[analysisType] || partyResponses.general

      // Agregar contexto basado en las noticias
      const newsContext = this.generateNewsContext(newsItems)

      return `${baseResponse}\n\nEn el contexto actual: ${newsContext}`
    } catch (error) {
      console.error("Error generating fallback response:", error)
      return "Error al generar respuesta de fallback. Por favor, intenta nuevamente."
    }
  }

  private generateNewsContext(newsItems: NewsItem[]): string {
    if (!newsItems || newsItems.length === 0) {
      return "Analizamos la situación política actual con una perspectiva integral."
    }

    const categories = newsItems.map((item) => item.category)
    const mainCategory = this.getMostFrequentCategory(categories)

    const contextMap: Record<string, string> = {
      politics: "los desarrollos políticos recientes requieren una respuesta clara y contundente",
      economy: "la situación económica actual demanda medidas urgentes y efectivas",
      social: "los desafíos sociales actuales necesitan soluciones integrales",
      security: "la seguridad ciudadana es una prioridad que no puede postergarse",
      health: "la salud pública debe ser una política de Estado prioritaria",
      education: "la educación es la base del desarrollo y el progreso social",
    }

    return contextMap[mainCategory] || "la coyuntura actual requiere respuestas responsables y efectivas"
  }

  private getMostFrequentCategory(categories: string[]): string {
    const frequency: Record<string, number> = {}

    categories.forEach((category) => {
      frequency[category] = (frequency[category] || 0) + 1
    })

    return Object.keys(frequency).reduce((a, b) => (frequency[a] > frequency[b] ? a : b)) || "politics"
  }

  public isApiKeyConfigured(provider: "openai" | "anthropic"): boolean {
    const key = secureRetrieve(`${provider}_api_key`)
    return key !== null && key.length > 0
  }

  public async validateConnection(provider: "openai" | "anthropic"): Promise<boolean> {
    // Mock validation - en producción esto haría una llamada real
    const key = secureRetrieve(`${provider}_api_key`)
    return key !== null && key.length > 10
  }
}

// Exportar instancia singleton
export const fallbackService = AIFallbackService.getInstance()

// Funciones de utilidad
export function getStoredApiKey(provider: "openai" | "anthropic"): string | null {
  return secureRetrieve(`${provider}_api_key`)
}

export function storeApiKey(provider: "openai" | "anthropic", key: string): void {
  secureStore(`${provider}_api_key`, key)
}

export function removeApiKey(provider: "openai" | "anthropic"): void {
  secureRemove(`${provider}_api_key`)
}

export function clearAllStoredData(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.clear()
    }
  } catch (error) {
    console.error("Error clearing stored data:", error)
  }
}
