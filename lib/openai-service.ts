"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// Función para generar respuesta con OpenAI
export async function generateOpenAIResponse(prompt: string): Promise<{ content: string; error?: string }> {
  try {
    // Intentar obtener la clave API de OpenAI
    let apiKey: string | null = null

    // Si estamos en el servidor, intentar obtener la clave de las variables de entorno
    if (process.env.OPENAI_API_KEY) {
      apiKey = process.env.OPENAI_API_KEY
    }

    // Si no hay clave API en el servidor, intentar obtenerla del localStorage en el cliente
    if (!apiKey && typeof window !== "undefined") {
      apiKey = localStorage.getItem("openai_api_key")
    }

    if (!apiKey) {
      return {
        content: "",
        error: "No se ha configurado la clave API de OpenAI",
      }
    }

    const response = await generateText({
      model: openai("gpt-4o"),
      apiKey,
      prompt,
    })

    return {
      content: response.text,
    }
  } catch (error) {
    console.error("Error al generar respuesta con OpenAI:", error)

    // Check if it's a quota exceeded error
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("quota") || errorMessage.includes("exceeded") || errorMessage.includes("billing")) {
      if (typeof window !== "undefined") {
        localStorage.setItem("openai_quota_exceeded", "true")
      }
      return {
        content: "",
        error: "QUOTA_EXCEEDED: Se ha excedido la cuota de OpenAI. Verifique su plan y detalles de facturación.",
      }
    }

    return {
      content: "",
      error: `Error al generar respuesta con OpenAI: ${errorMessage}`,
    }
  }
}
