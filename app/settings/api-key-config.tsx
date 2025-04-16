"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Check } from "lucide-react"
import { saveApiKey } from "@/lib/api-key-action"

export default function ApiKeyConfig() {
  const [apiKey, setApiKey] = useState("")
  const [savedKey, setSavedKey] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Nueva clave API proporcionada por el usuario
  const newProvidedApiKey =
    "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"

  useEffect(() => {
    // Intentar cargar la clave API desde localStorage (solo para compatibilidad con versiones anteriores)
    const storedKey = localStorage.getItem("openai_api_key")
    if (storedKey) {
      setSavedKey(storedKey)
      setApiKey(storedKey)
    }
  }, [])

  const validateApiKey = (key: string): boolean => {
    // Las claves API de OpenAI generalmente comienzan con "sk-" y tienen una longitud específica
    return key.startsWith("sk-") && key.length > 20
  }

  const handleSave = async () => {
    setError(null)
    setIsLoading(true)

    // Validar el formato de la clave API
    if (!validateApiKey(apiKey)) {
      setError("La clave API no parece tener el formato correcto. Las claves de OpenAI comienzan con 'sk-'.")
      setIsLoading(false)
      return
    }

    try {
      // Guardar la clave API en el servidor
      const result = await saveApiKey(apiKey)

      if (result.success) {
        // También guardar en localStorage como respaldo
        localStorage.setItem("openai_api_key", apiKey)
        setSavedKey(apiKey)
        setSaveSuccess(true)

        // Limpiar cualquier indicador de cuota excedida
        localStorage.removeItem("openai_quota_exceeded")

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
      localStorage.setItem("openai_api_key", apiKey)
      // Limpiar cualquier indicador de cuota excedida
      localStorage.removeItem("openai_quota_exceeded")
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

  // Función para usar la clave API proporcionada directamente
  const handleUseProvidedKey = (providedKey: string) => {
    if (validateApiKey(providedKey)) {
      setApiKey(providedKey)
      localStorage.setItem("openai_api_key", providedKey)
      localStorage.removeItem("openai_quota_exceeded")
      setSavedKey(providedKey)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } else {
      setError("La clave API proporcionada no tiene el formato correcto.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de API de OpenAI</CardTitle>
        <CardDescription>
          Configura tu clave API de OpenAI para habilitar la generación de contenido con IA
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
          <AlertTitle>Límites de la API de OpenAI</AlertTitle>
          <AlertDescription>
            Asegúrate de que tu cuenta de OpenAI tenga créditos disponibles y no haya excedido su cuota. Las cuentas
            gratuitas tienen límites de uso. Si recibes un error de cuota excedida, verifica tu plan en la{" "}
            <a
              href="https://platform.openai.com/account/billing/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              página de facturación de OpenAI
            </a>
            .
          </AlertDescription>
        </Alert>

        {localStorage.getItem("openai_quota_exceeded") && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cuota de API excedida</AlertTitle>
            <AlertDescription>
              <p>Se ha detectado que su clave API de OpenAI ha excedido su cuota. Para resolver este problema:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>
                  Verifique su plan de facturación en la{" "}
                  <a
                    href="https://platform.openai.com/account/billing/overview"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    página de facturación de OpenAI
                  </a>
                </li>
                <li>Considere actualizar a un plan de pago si está utilizando una cuenta gratuita</li>
                <li>O utilice una clave API diferente</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="api-key">Clave API de OpenAI</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Puedes obtener tu clave API en{" "}
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
        <Button
          variant="secondary"
          onClick={() => handleUseProvidedKey(newProvidedApiKey)}
          className="w-full sm:w-auto"
        >
          Usar nueva clave proporcionada
        </Button>
      </CardFooter>
    </Card>
  )
}
