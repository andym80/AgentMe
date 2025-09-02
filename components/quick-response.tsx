"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"
import { adaptNewsForParty } from "@/lib/ai-service"
import type { NewsItem, PoliticalParty, ResponseType } from "@/lib/types"

interface QuickResponseProps {
  content?: string
  party: PoliticalParty
  newsItem: NewsItem
  responseType: ResponseType
  newsItems?: NewsItem[]
  selectedParty?: PoliticalParty
  apiKey?: string | null
  setError?: (error: string | null) => void
  setQuotaExceeded?: (exceeded: boolean) => void
  liveMode?: boolean
}

export default function QuickResponse({
  content,
  party,
  newsItem,
  responseType,
  newsItems = [],
  selectedParty = "libertad-avanza",
  apiKey = null,
  setError,
  setQuotaExceeded,
  liveMode = false,
}: QuickResponseProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [responseContent, setResponseContent] = useState<string>(content || "")
  const [simplifiedContent, setSimplifiedContent] = useState<string[]>([])
  const [keyPoints, setKeyPoints] = useState<string[]>([])

  // Función para simplificar el contenido
  const simplifyContent = (content: string | undefined): string[] => {
    if (!content || content.trim() === "") {
      return ["No hay contenido disponible para mostrar."]
    }

    // Dividir por párrafos
    const paragraphs = content.split("\n\n")

    // Filtrar párrafos vacíos y limpiar
    return paragraphs.filter((p) => p.trim() !== "").map((p) => p.trim())
  }

  // Función para extraer puntos clave
  const extractKeyPoints = (content: string | undefined): string[] => {
    if (!content || content.trim() === "") {
      return ["No hay puntos clave disponibles."]
    }

    // Buscar puntos clave en el contenido
    const lines = content.split("\n")
    const points = lines.filter(
      (line) =>
        line.trim().startsWith("•") ||
        line.trim().startsWith("-") ||
        line.trim().startsWith("*") ||
        /^\d+\./.test(line.trim()),
    )

    // Si no se encuentran puntos explícitos, crear algunos basados en oraciones
    if (points.length === 0) {
      const sentences = content
        .replace(/([.!?])\s+/g, "$1|")
        .split("|")
        .filter((s) => s.length > 20 && s.length < 100)
        .slice(0, 3)
        .map((s) => s.trim())

      return sentences.length > 0 ? sentences : ["No se encontraron puntos clave."]
    }

    return points.map((p) =>
      p
        .trim()
        .replace(/^[•\-*]\s*/, "")
        .replace(/^\d+\.\s*/, ""),
    )
  }

  // Efecto para procesar el contenido cuando cambia
  useEffect(() => {
    if (content) {
      setResponseContent(content)
      setSimplifiedContent(simplifyContent(content))
      setKeyPoints(extractKeyPoints(content))
    }
  }, [content])

  // Efecto para generar contenido en modo live
  useEffect(() => {
    if (liveMode && newsItems && newsItems.length > 0) {
      handleGenerateResponse()
    }
  }, [liveMode, newsItems, selectedParty])

  // Función para generar respuesta
  const handleGenerateResponse = async () => {
    if (newsItems.length === 0) {
      if (setError) setError("No hay noticias para generar una respuesta. Por favor, obtén noticias primero.")
      return
    }

    setIsLoading(true)
    if (setError) setError(null)

    try {
      const result = await adaptNewsForParty(newsItems, selectedParty, apiKey)
      setResponseContent(result.generalMessage)
      setSimplifiedContent(simplifyContent(result.generalMessage))
      setKeyPoints(extractKeyPoints(result.generalMessage))
    } catch (err) {
      console.error("Error al generar respuesta:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)

      if (errorMessage.includes("QUOTA_EXCEEDED")) {
        if (setQuotaExceeded) setQuotaExceeded(true)
        if (setError) setError("Se ha excedido la cuota de la API de Anthropic. Se utilizará contenido simulado.")
      } else {
        if (setError) setError("Error al generar respuesta. Por favor, inténtalo de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Respuesta Rápida</CardTitle>
        <CardDescription>
          Respuesta adaptada para{" "}
          {party === "libertad-avanza"
            ? "La Libertad Avanza"
            : party === "union-patria"
              ? "Unión por la Patria"
              : party === "juntos-cambio"
                ? "Juntos por el Cambio"
                : party === "frente-izquierda"
                  ? "Frente de Izquierda"
                  : "Otros Partidos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose max-w-none">
              {simplifiedContent.map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
            {keyPoints.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Puntos clave:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateResponse} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generando respuesta...
            </>
          ) : (
            "Generar respuesta"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
