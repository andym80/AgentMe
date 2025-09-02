"use server"

import { getAnthropicKey } from "./api-key-action"

export interface AnthropicQuotaInfo {
  status: "success" | "error"
  quotaUsed?: number
  quotaLimit?: number
  percentageUsed?: number
  resetDate?: string
  error?: string
}

export async function checkAnthropicQuota(): Promise<AnthropicQuotaInfo> {
  try {
    // Obtener la clave API de Anthropic
    const apiKey = await getAnthropicKey()

    if (!apiKey) {
      return {
        status: "error",
        error: "No se ha configurado una clave API de Anthropic",
      }
    }

    // Realizar una solicitud a la API de Anthropic para verificar el estado de la cuota
    // Nota: Anthropic no tiene un endpoint público específico para verificar cuotas
    // Esta es una implementación simulada que deberías reemplazar con la API real cuando esté disponible

    // Simulamos una solicitud a la API para verificar si la clave es válida
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [
          {
            role: "user",
            content: "Hello",
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()

      // Verificar si el error está relacionado con la cuota
      if (
        errorData.error?.type === "rate_limit_error" ||
        errorData.error?.message?.includes("quota") ||
        errorData.error?.message?.includes("rate limit")
      ) {
        return {
          status: "error",
          error: "Se ha excedido la cuota de la API de Anthropic",
          quotaUsed: 100,
          quotaLimit: 100,
          percentageUsed: 100,
        }
      }

      return {
        status: "error",
        error: errorData.error?.message || "Error al verificar la cuota de Anthropic",
      }
    }

    // Como Anthropic no proporciona información directa sobre la cuota,
    // devolvemos una estimación basada en que la solicitud fue exitosa
    return {
      status: "success",
      // Estos valores son simulados y deberían reemplazarse con datos reales
      quotaUsed: 75000,
      quotaLimit: 100000,
      percentageUsed: 75,
      resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 días desde hoy
    }
  } catch (error) {
    console.error("Error al verificar la cuota de Anthropic:", error)
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Error desconocido al verificar la cuota",
    }
  }
}
