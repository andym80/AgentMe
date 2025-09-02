"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { AIProvider } from "@/lib/ai-fallback-service"
import { safeStorage, isClient } from "@/lib/storage-utils"

export default function AIProviderSelector() {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("auto")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Solo acceder a localStorage en el cliente y después de montar el componente
    if (isClient) {
      const storedProvider = safeStorage.getItem("preferred_ai_provider")
      setSelectedProvider((storedProvider as AIProvider) || "auto")
    }
  }, [])

  const handleProviderChange = (value: string) => {
    const provider = value as AIProvider
    setSelectedProvider(provider)

    // Solo guardar en localStorage si estamos en el cliente
    if (isClient && isMounted) {
      safeStorage.setItem("preferred_ai_provider", provider)
    }
  }

  // Renderizado condicional
  if (!isMounted) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Cargando preferencias...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Proveedor de IA Preferido</CardTitle>
        <CardDescription>
          Selecciona qué proveedor de IA quieres usar por defecto para generar contenido
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedProvider} onValueChange={handleProviderChange} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto" className="font-medium">
              Automático (recomendado)
            </Label>
            <p className="text-sm text-gray-500 ml-6">Usa el proveedor disponible más adecuado automáticamente</p>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="anthropic" id="anthropic" />
            <Label htmlFor="anthropic" className="font-medium">
              Anthropic Claude
            </Label>
            <p className="text-sm text-gray-500 ml-6">Prioriza el uso de Anthropic Claude para todas las respuestas</p>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="openai" id="openai" />
            <Label htmlFor="openai" className="font-medium">
              OpenAI GPT-4o
            </Label>
            <p className="text-sm text-gray-500 ml-6">Prioriza el uso de OpenAI GPT-4o para todas las respuestas</p>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
