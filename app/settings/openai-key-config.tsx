"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { encrypt } from "@/lib/crypto-utils"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { safeStorage, isClient } from "@/lib/storage-utils"

export default function OpenAIKeyConfig() {
  const [apiKey, setApiKey] = useState("")
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Marcar que el componente está montado
    setIsMounted(true)

    // Solo acceder a localStorage después de montar el componente y en el cliente
    if (isClient) {
      const storedKey = safeStorage.getItem("openai_api_key")
      setSavedKey(storedKey || null)
    }
  }, [])

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      setError("Por favor, ingresa una clave API válida")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Solo guardar en localStorage si estamos en el cliente
      if (isClient && isMounted) {
        // Encriptar la clave API antes de guardarla
        const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-encryption-key"
        const encryptedKey = encrypt(apiKey, encryptionKey)

        // Guardar la clave API encriptada en localStorage de forma segura
        safeStorage.setItem("openai_api_key", encryptedKey)

        // Limpiar cualquier bandera de cuota excedida
        safeStorage.removeItem("openai_quota_exceeded")

        setSavedKey(encryptedKey)
        setSaveSuccess(true)

        // Ocultar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error al guardar la clave API:", error)
      setError("Error al guardar la clave API. Por favor, intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveKey = () => {
    if (isClient && isMounted) {
      safeStorage.removeItem("openai_api_key")
      setSavedKey(null)
      setApiKey("")
    }
  }

  // Renderizado condicional
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">API de OpenAI</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="openai-api-key">Clave API de OpenAI</Label>
          <Input id="openai-api-key" type="password" placeholder="Cargando..." disabled />
        </div>
        <Button disabled>Cargando...</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">API de OpenAI</h3>
        {savedKey && (
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Configurada
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="openai-api-key">Clave API de OpenAI</Label>
        <Input
          id="openai-api-key"
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-sm text-gray-500">
          Puedes obtener tu clave API de OpenAI en{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            platform.openai.com/api-keys
          </a>
        </p>
      </div>

      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          Clave API guardada correctamente
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSaveKey} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Clave API"}
        </Button>
        {savedKey && (
          <Button variant="outline" onClick={handleRemoveKey}>
            Eliminar Clave
          </Button>
        )}
      </div>
    </div>
  )
}
