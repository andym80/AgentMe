"use server"

import fs from "fs"
import path from "path"
import { encrypt, decrypt } from "./crypto-utils"

// Ruta al archivo donde se guardará la clave API encriptada
const API_KEY_FILE = path.join(process.cwd(), ".api-key")

// Clave secreta para encriptar/desencriptar (en producción, usar una variable de entorno)
const SECRET_KEY = process.env.ENCRYPTION_KEY || "default-secret-key-change-in-production"

export async function saveApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Encriptar la clave API
    const encryptedKey = encrypt(apiKey, SECRET_KEY)

    // Guardar la clave encriptada en un archivo
    fs.writeFileSync(API_KEY_FILE, encryptedKey)

    // También guardar en variable de entorno para la sesión actual
    process.env.OPENAI_API_KEY = apiKey

    return { success: true }
  } catch (error) {
    console.error("Error al guardar la clave API:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al guardar la clave API",
    }
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    // Primero intentar obtener de la variable de entorno
    if (process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY
    }

    // Si no existe, intentar leer del archivo
    if (fs.existsSync(API_KEY_FILE)) {
      const encryptedKey = fs.readFileSync(API_KEY_FILE, "utf-8")
      return decrypt(encryptedKey, SECRET_KEY)
    }

    return null
  } catch (error) {
    console.error("Error al obtener la clave API:", error)
    return null
  }
}
