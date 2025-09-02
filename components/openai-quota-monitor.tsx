"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { simulateOpenAIQuota } from "@/lib/openai-service"
import { getEncryptedItem } from "@/lib/crypto-utils"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function OpenAIQuotaMonitor() {
  const [quotaData, setQuotaData] = useState<{
    used: number
    limit: number
    remaining: number
    resetDate: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuotaData = async () => {
    setLoading(true)
    setError(null)

    try {
      const apiKey = getEncryptedItem("openai_api_key")

      if (!apiKey) {
        setError("No se ha configurado la clave API de OpenAI")
        setLoading(false)
        return
      }

      const data = await simulateOpenAIQuota()
      setQuotaData(data)
    } catch (err) {
      setError(`Error al obtener datos de cuota: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotaData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getUsagePercentage = () => {
    if (!quotaData) return 0
    return Math.round((quotaData.used / quotaData.limit) * 100)
  }

  const getProgressColor = () => {
    const percentage = getUsagePercentage()
    if (percentage < 50) return "bg-green-500"
    if (percentage < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cuota de OpenAI</CardTitle>
          <CardDescription>Monitoreo de uso de la API de OpenAI</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchQuotaData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : quotaData ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Uso de cuota</span>
                <span>{getUsagePercentage()}%</span>
              </div>
              <Progress value={getUsagePercentage()} className={getProgressColor()} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Usado</p>
                <p className="font-medium">{quotaData.used} unidades</p>
              </div>
              <div>
                <p className="text-muted-foreground">Restante</p>
                <p className="font-medium">{quotaData.remaining} unidades</p>
              </div>
              <div>
                <p className="text-muted-foreground">Límite</p>
                <p className="font-medium">{quotaData.limit} unidades</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reinicio</p>
                <p className="font-medium">{formatDate(quotaData.resetDate)}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">No hay datos disponibles</div>
        )}
      </CardContent>
    </Card>
  )
}
