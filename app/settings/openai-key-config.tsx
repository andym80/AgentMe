"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, CheckCircle, XCircle } from "lucide-react"
import { storeApiKey, getStoredApiKey, removeApiKey } from "@/lib/ai-fallback-service"

interface OpenAIKeyConfigProps {
  onKeyChange?: (hasKey: boolean) => void
}

export function OpenAIKeyConfig({ onKeyChange }: OpenAIKeyConfigProps) {
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Cargar clave existente al montar el componente
    const existingKey = getStoredApiKey("openai")
    if (existingKey) {
      setApiKey(existingKey)
      setValidationStatus("valid")
      onKeyChange?.(true)
    }
  }, [onKeyChange])

  const validateApiKey = async (key: string): Promise<boolean> => {
    // Validación básica del formato
    if (!key || key.length < 20) {
      return false
    }

    if (!key.startsWith("sk-")) {
      return false
    }

    // En producción, aquí se haría una llamada real a la API de OpenAI
    // Por ahora, simulamos la validación
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulamos que las claves que empiezan con "sk-test" son inválidas
    return !key.startsWith("sk-test")
  }

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setMessage("Por favor, ingresa una clave API válida")
      setValidationStatus("invalid")
      return
    }

    setIsValidating(true)
    setMessage("Validando clave API...")

    try {
      const isValid = await validateApiKey(apiKey.trim())

      if (isValid) {
        storeApiKey("openai", apiKey.trim())
        setValidationStatus("valid")
        setMessage("Clave API guardada y validada correctamente")
        onKeyChange?.(true)
      } else {
        setValidationStatus("invalid")
        setMessage("La clave API no es válida. Verifica que sea correcta.")
      }
    } catch (error) {
      setValidationStatus("invalid")
      setMessage("Error al validar la clave API. Intenta nuevamente.")
      console.error("Error validating API key:", error)
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveKey = () => {
    removeApiKey("openai")
    setApiKey("")
    setValidationStatus("idle")
    setMessage("Clave API eliminada")
    onKeyChange?.(false)
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setMessage("No hay clave API para probar")
      return
    }

    setIsValidating(true)
    setMessage("Probando conexión...")

    try {
      const isValid = await validateApiKey(apiKey.trim())

      if (isValid) {
        setValidationStatus("valid")
        setMessage("Conexión exitosa con OpenAI")
      } else {
        setValidationStatus("invalid")
        setMessage("Error de conexión. Verifica tu clave API.")
      }
    } catch (error) {
      setValidationStatus("invalid")
      setMessage("Error al probar la conexión")
      console.error("Error testing connection:", error)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuración de OpenAI
        </CardTitle>
        <CardDescription>Configura tu clave API de OpenAI para habilitar las funciones de IA avanzadas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openai-key">Clave API de OpenAI</Label>
          <div className="relative">
            <Input
              id="openai-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {message && (
          <Alert
            className={
              validationStatus === "valid"
                ? "border-green-200 bg-green-50"
                : validationStatus === "invalid"
                  ? "border-red-200 bg-red-50"
                  : ""
            }
          >
            <div className="flex items-center gap-2">
              {validationStatus === "valid" && <CheckCircle className="h-4 w-4 text-green-600" />}
              {validationStatus === "invalid" && <XCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription
                className={
                  validationStatus === "valid" ? "text-green-800" : validationStatus === "invalid" ? "text-red-800" : ""
                }
              >
                {message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSaveKey} disabled={isValidating || !apiKey.trim()} className="flex-1">
            {isValidating ? "Validando..." : "Guardar Clave"}
          </Button>

          <Button variant="outline" onClick={handleTestConnection} disabled={isValidating || !apiKey.trim()}>
            Probar Conexión
          </Button>

          {validationStatus === "valid" && (
            <Button variant="destructive" onClick={handleRemoveKey}>
              Eliminar
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>¿Cómo obtener tu clave API?</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>
              Ve a{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </li>
            <li>Inicia sesión en tu cuenta de OpenAI</li>
            <li>Haz clic en "Create new secret key"</li>
            <li>Copia la clave y pégala aquí</li>
          </ol>
          <p className="mt-2 text-xs text-amber-600">
            <strong>Nota:</strong> Tu clave API se almacena localmente en tu navegador y nunca se envía a nuestros
            servidores.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default OpenAIKeyConfig
