"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Check } from "lucide-react"
import { saveAnthropicKey } from "@/lib/api-key-action"
import { safeStorage, isClient } from "@/lib/storage-utils"

export default function AnthropicKeyConfig() {
  const [apiKey, setApiKey] = useState("")
  const [savedKey, setSavedKey] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Marcar que el componente está montado
    setIsMounted(true)

    // Solo acceder a localStorage después de montar el componente y en el cliente
    if (isClient) {
      const storedKey = safeStorage.getItem("anthropic_api_key")
      if (storedKey) {
        setSavedKey(storedKey)
        setApiKey(storedKey)
      }
    }
  }, [])

  const validateApiKey = (key: string): boolean => {
    // Las claves API de Anthropic generalmente comienzan con "sk-ant-" y tienen una longitud específica
    return key.startsWith("sk-ant-") && key.length > 20
  }

  const handleSave = async () => {
    setError(null)
    setIsLoading(true)

    // Validar el formato de la clave API
    if (!validateApiKey(apiKey)) {
      setError("La clave API no parece tener el formato correcto. Las claves de Anthropic comienzan con 'sk-ant-'.")
      setIsLoading(false)
      return
    }

    try {
      // Guardar la clave API en el servidor
      const result = await saveAnthropicKey(apiKey)

      if (result.success) {
        // También guardar en localStorage como respaldo
        if (isClient && isMounted) {
          safeStorage.setItem("anthropic_api_key", apiKey)
          // Limpiar cualquier indicador de cuota excedida
          safeStorage.removeItem("anthropic_quota_exceeded")
        }

        setSavedKey(apiKey)
        setSaveSuccess(true)

        // Mostrar mensaje de éxito por 3 segundos
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      } else {
        setError(result.error || "Error al guardar la clave API")
      }
    } catch (err) {
      console.error("Error al guardar la clave API:", err)
      setError("Error al guardar la clave API. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función alternativa para guardar solo en localStorage cuando el servidor falla
  const handleLocalSave = () => {
    try {
      if (isClient && isMounted) {
        safeStorage.setItem("anthropic_api_key", apiKey)
        // Limpiar cualquier indicador de cuota excedida
        safeStorage.removeItem("anthropic_quota_exceeded")
      }

      setSavedKey(apiKey)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
      return true
    } catch (err) {
      console.error("Error al guardar en localStorage:", err)
      return false
    }
  }

  // Renderizado condicional
  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de API de Anthropic</CardTitle>
          <CardDescription>
            Configura tu clave API de Anthropic para habilitar análisis avanzado de contenido con Claude
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="api-key">Clave API de Anthropic</Label>
            <Input id="api-key" type="password" placeholder="Cargando..." disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled>Cargando...</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de API de Anthropic</CardTitle>
        <CardDescription>
          Configura tu clave API de Anthropic para habilitar análisis avanzado de contenido con Claude
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Tu clave API se guardará de forma segura. En este entorno de demostración, también se almacenará en el
            navegador para permitir la funcionalidad completa.
          </AlertDescription>
        </Alert>

        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Límites de la API de Anthropic</AlertTitle>
          <AlertDescription>
            Asegúrate de que tu cuenta de Anthropic tenga créditos disponibles y no haya excedido su cuota. Si recibes
            un error de cuota excedida, verifica tu plan en la{" "}
            <a
              href="https://console.anthropic.com/account/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              página de facturación de Anthropic
            </a>
            .
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="api-key">Clave API de Anthropic</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Puedes obtener tu clave API en{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              console.anthropic.com/settings/keys
            </a>
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes("crypto") && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (handleLocalSave()) {
                        setError(null)
                      }
                    }}
                  >
                    Guardar solo en el navegador
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {savedKey && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Estado:</span> Clave API configurada
          </div>
        )}

        {saveSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Guardado exitoso</AlertTitle>
            <AlertDescription>La clave API se ha guardado correctamente.</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Button onClick={handleSave} disabled={!apiKey || isLoading} className="w-full sm:w-auto">
          {isLoading ? "Guardando..." : "Guardar clave API"}
        </Button>
        <Button
          variant="outline"
          onClick={handleLocalSave}
          disabled={!apiKey || isLoading}
          className="w-full sm:w-auto"
        >
          Guardar solo en navegador
        </Button>
      </CardFooter>
    </Card>
  )
}
