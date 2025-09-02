"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { PoliticalParty } from "@/lib/types"

interface AdaptedMessageProps {
  content: string
  party: PoliticalParty
  isLoading: boolean
  topicOpinions?: Record<string, string>
}

export default function AdaptedMessage({ content, party, isLoading, topicOpinions = {} }: AdaptedMessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getPartyColor = (party: PoliticalParty) => {
    switch (party) {
      case "libertad-avanza":
        return "bg-purple-100 text-purple-800"
      case "union-patria":
        return "bg-blue-100 text-blue-800"
      case "juntos-cambio":
        return "bg-yellow-100 text-yellow-800"
      case "frente-izquierda":
        return "bg-red-100 text-red-800"
      case "otros":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPartyName = (party: PoliticalParty) => {
    switch (party) {
      case "libertad-avanza":
        return "La Libertad Avanza"
      case "union-patria":
        return "Unión por la Patria"
      case "juntos-cambio":
        return "Juntos por el Cambio"
      case "frente-izquierda":
        return "Frente de Izquierda"
      case "otros":
        return "Otros partidos"
      default:
        return "Desconocido"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mensaje Político Adaptado</CardTitle>
          <div className={`px-3 py-1 rounded-full text-sm ${getPartyColor(party)}`}>{getPartyName(party)}</div>
        </div>
        <CardDescription>Noticias adaptadas para tu campaña política</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : content ? (
          <div className="prose max-w-none">
            {content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 p-6">
            Haz clic en &quot;Generar Mensaje&quot; para crear contenido adaptado basado en las noticias.
          </div>
        )}
      </CardContent>
      {content && (
        <CardFooter className="justify-end">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar al portapapeles
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
