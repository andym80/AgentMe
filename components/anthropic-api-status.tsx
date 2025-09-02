"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AnthropicApiStatus() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Solo acceder a localStorage en el cliente
    const storedKey = localStorage.getItem("anthropic_api_key")
    const quotaExceededFlag = localStorage.getItem("anthropic_quota_exceeded") === "true"

    setApiKey(storedKey)
    setQuotaExceeded(quotaExceededFlag)
    setIsLoading(false)
  }, [])

  const handleConfigureClick = () => {
    router.push("/settings")
  }

  const handleResetQuota = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("anthropic_quota_exceeded")
      setQuotaExceeded(false)
    }
  }

  if (isLoading) {
    return (
      <Alert variant="default" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cargando estado de la API de Anthropic...</AlertTitle>
      </Alert>
    )
  }

  if (quotaExceeded) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cuota de Anthropic excedida</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            Se ha excedido la cuota de la API de Anthropic. Verifica tu plan y detalles de facturación en la{" "}
            <a
              href="https://console.anthropic.com/account/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              página de facturación de Anthropic
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
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>API de Anthropic no configurada</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            No se ha configurado una clave API de Anthropic. Algunas funciones avanzadas de análisis no estarán
            disponibles.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleConfigureClick}>
              Configurar API de Anthropic
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="default" className="mb-4 bg-green-50 border-green-200 text-green-800">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle>API de Anthropic configurada</AlertTitle>
      <AlertDescription>
        La API de Anthropic está correctamente configurada. Las funciones avanzadas de análisis están disponibles.
      </AlertDescription>
    </Alert>
  )
}
