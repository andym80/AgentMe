"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle } from "lucide-react"

export default function OpenAIApiStatus() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Solo acceder a localStorage en el cliente
    const storedKey = localStorage.getItem("openai_api_key")
    const quotaExceededFlag = localStorage.getItem("openai_quota_exceeded") === "true"

    setApiKey(storedKey)
    setQuotaExceeded(quotaExceededFlag)
    setIsLoading(false)
  }, [])

  const handleResetQuota = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("openai_quota_exceeded")
      setQuotaExceeded(false)
    }
  }

  const handleConfigureClick = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/settings"
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Cargando estado de la API de OpenAI...</p>
        </CardContent>
      </Card>
    )
  }

  if (quotaExceeded) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cuota de API de OpenAI excedida</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            Se ha excedido la cuota de la API de OpenAI. Verifica tu plan y detalles de facturación en la{" "}
            <a
              href="https://platform.openai.com/account/billing/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              página de facturación de OpenAI
            </a>
            .
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleResetQuota}>
              Reintentar
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!apiKey) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            API de OpenAI
          </CardTitle>
          <CardDescription>No configurada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No se ha configurado una clave API de OpenAI. Se utilizará contenido simulado o se intentará con otro
            proveedor.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={handleConfigureClick}>
            Configurar API de OpenAI
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          API de OpenAI
        </CardTitle>
        <CardDescription>Configurada</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">La API de OpenAI está configurada correctamente y lista para usar.</p>
      </CardContent>
    </Card>
  )
}
