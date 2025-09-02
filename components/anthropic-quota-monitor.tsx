"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle } from "lucide-react"

export default function AnthropicQuotaMonitor() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [quotaLimit, setQuotaLimit] = useState(100)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Solo acceder a localStorage en el cliente
    const storedKey = localStorage.getItem("anthropic_api_key")
    setApiKey(storedKey)

    // Simular datos de cuota para demostración
    // En una implementación real, esto debería obtener datos reales de la API de Anthropic
    const simulateQuotaData = () => {
      setQuotaUsed(35)
      setQuotaLimit(100)
      setIsLoading(false)
    }

    if (storedKey) {
      simulateQuotaData()
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Cargando datos de cuota...</p>
        </CardContent>
      </Card>
    )
  }

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Cuota de Anthropic
          </CardTitle>
          <CardDescription>No disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No se ha configurado una clave API de Anthropic. Configura una clave para monitorear tu cuota.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Error al obtener datos de cuota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const percentUsed = (quotaUsed / quotaLimit) * 100
  const isLow = percentUsed < 50
  const isMedium = percentUsed >= 50 && percentUsed < 80
  const isHigh = percentUsed >= 80

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Cuota de Anthropic
        </CardTitle>
        <CardDescription>Uso actual de tu cuota de API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uso: {quotaUsed.toLocaleString()} tokens</span>
            <span>Límite: {quotaLimit.toLocaleString()} tokens</span>
          </div>
          <Progress
            value={percentUsed}
            className={`h-2 ${isLow ? "bg-green-100" : isMedium ? "bg-yellow-100" : "bg-red-100"}`}
            indicatorClassName={`${isLow ? "bg-green-500" : isMedium ? "bg-yellow-500" : "bg-red-500"}`}
          />
        </div>
        <p className="text-sm text-gray-500">
          {isLow
            ? "Tu uso de cuota es bajo. Tienes suficientes tokens disponibles."
            : isMedium
              ? "Tu uso de cuota es moderado. Considera monitorear tu uso."
              : "Tu uso de cuota es alto. Considera aumentar tu límite o reducir el uso."}
        </p>
      </CardContent>
    </Card>
  )
}
