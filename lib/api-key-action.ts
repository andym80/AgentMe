"use server"

import { encryptData } from "./crypto-utils"

export async function saveApiKey(apiKey: string) {
  try {
    // Encriptar la clave API antes de guardarla
    const encryptedKey = await encryptData(apiKey)

    // En una implementación real, aquí guardaríamos la clave encriptada en una base de datos
    // Por ahora, simulamos una operación exitosa

    return { success: true }
  } catch (error) {
    console.error("Error al guardar la clave API:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al guardar la clave API",
    }
  }
}
