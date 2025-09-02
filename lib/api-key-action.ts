"use server"

import fs from "fs"
import path from "path"
import { encrypt, decrypt } from "./crypto-utils"

// Ruta a los archivos donde se guardarán las claves API encriptadas
const API_KEY_FILE = path.join(process.cwd(), ".api-key")
const ANTHROPIC_KEY_FILE = path.join(process.cwd(), ".anthropic-key")
const OPENAI_KEY_FILE = path.join(process.cwd(), ".openai-key")

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

export async function saveAnthropicKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Encriptar la clave API
    const encryptedKey = encrypt(apiKey, SECRET_KEY)

    // Guardar la clave encriptada en un archivo
    fs.writeFileSync(ANTHROPIC_KEY_FILE, encryptedKey)

    // También guardar en variable de entorno para la sesión actual
    process.env.ANTHROPIC_API_KEY = apiKey

    return { success: true }
  } catch (error) {
    console.error("Error al guardar la clave API de Anthropic:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al guardar la clave API de Anthropic",
    }
  }
}

export async function saveOpenAIKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Encriptar la clave API
    const encryptedKey = encrypt(apiKey, SECRET_KEY)

    // Guardar la clave encriptada en un archivo
    fs.writeFileSync(OPENAI_KEY_FILE, encryptedKey)

    // También guardar en variable de entorno para la sesión actual
    process.env.OPENAI_API_KEY = apiKey

    return { success: true }
  } catch (error) {
    console.error("Error al guardar la clave API de OpenAI:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al guardar la clave API de OpenAI",
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

export async function getAnthropicKey(): Promise<string | null> {
  try {
    // Primero intentar obtener de la variable de entorno
    if (process.env.ANTHROPIC_API_KEY) {
      return process.env.ANTHROPIC_API_KEY
    }

    // Si no existe, intentar leer del archivo
    if (fs.existsSync(ANTHROPIC_KEY_FILE)) {
      const encryptedKey = fs.readFileSync(ANTHROPIC_KEY_FILE, "utf-8")
      return decrypt(encryptedKey, SECRET_KEY)
    }

    return null
  } catch (error) {
    console.error("Error al obtener la clave API de Anthropic:", error)
    return null
  }
}

export async function getOpenAIKey(): Promise<string | null> {
  try {
    // Primero intentar obtener de la variable de entorno
    if (process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY
    }

    // Si no existe, intentar leer del archivo
    if (fs.existsSync(OPENAI_KEY_FILE)) {
      const encryptedKey = fs.readFileSync(OPENAI_KEY_FILE, "utf-8")
      return decrypt(encryptedKey, SECRET_KEY)
    }

    return null
  } catch (error) {
    console.error("Error al obtener la clave API de OpenAI:", error)
    return null
  }
}
