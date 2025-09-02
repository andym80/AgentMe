"use client"

import { generateAnthropicResponse } from "./ai-service"
import { generateOpenAIResponse } from "./openai-service"
import { encrypt, decrypt } from "./crypto-utils"
import { safeStorage, isClient } from "./storage-utils"

export type AIProvider = "anthropic" | "openai" | "auto"

export interface AIResponse {
  content: string
  provider: AIProvider
  error?: string
}

// Obtener el proveedor preferido del almacenamiento local
export function getPreferredProvider(): AIProvider {
  if (!isClient) return "auto"

  const storedProvider = safeStorage.getItem("preferred_ai_provider")
  return (storedProvider as AIProvider) || "auto"
}

// Establecer el proveedor preferido en el almacenamiento local
export function setPreferredProvider(provider: AIProvider): void {
  if (!isClient) return

  safeStorage.setItem("preferred_ai_provider", provider)
}

// Función para encriptar y guardar un elemento en localStorage
export function setEncryptedItem(key: string, value: string): void {
  if (!isClient) return

  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-encryption-key"
  const encryptedValue = encrypt(value, encryptionKey)
  safeStorage.setItem(key, encryptedValue)
}

// Función para obtener y desencriptar un elemento de localStorage
export function getEncryptedItem(key: string): string | null {
  if (!isClient) return null

  const encryptedValue = safeStorage.getItem(key)
  if (!encryptedValue) return null

  // Si el valor no está encriptado (no contiene ":"), devolverlo directamente
  if (!encryptedValue.includes(":")) {
    return encryptedValue
  }

  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-encryption-key"
  try {
    return decrypt(encryptedValue, encryptionKey)
  } catch (error) {
    console.error(`Error al desencriptar ${key}:`, error)
    // Si hay un error de desencriptación, intentar devolver el valor sin desencriptar
    return encryptedValue
  }
}

// Generar respuesta con fallback automático
export async function generateAIResponse(prompt: string): Promise<AIResponse> {
  if (!isClient) {
    return {
      content: "",
      provider: "auto",
      error: "Esta función solo está disponible en el cliente",
    }
  }

  const preferredProvider = getPreferredProvider()

  // Verificar si hay claves API disponibles
  const anthropicKey = safeStorage.getItem("anthropic_api_key")
  const openaiKey = safeStorage.getItem("openai_api_key")

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
    const anthropicKey = safeStorage.getItem("anthropic_api_key")
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
    const openaiKey = safeStorage.getItem("openai_api_key")
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
