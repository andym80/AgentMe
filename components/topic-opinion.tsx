"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Clock, History, LightbulbIcon, BookOpen } from "lucide-react"
import type { PoliticalParty } from "@/lib/types"
import HistoricalContrast from "./historical-contrast"

interface TopicOpinionProps {
  title: string
  content?: string // Hacemos content opcional
  party: PoliticalParty
  category: string
  newsItem: any // Añadir el objeto de noticia completo
}

export default function TopicOpinion({ title, content, party, category, newsItem }: TopicOpinionProps) {
  const [copied, setCopied] = useState(false)
  const [showHistorical, setShowHistorical] = useState(false)

  // Actualizar la función copyToClipboard para verificar si content existe antes de copiarlo

  const copyToClipboard = () => {
    if (content) {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getPartyColor = (party: PoliticalParty) => {
    switch (party) {
      case "libertad-avanza":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "union-patria":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "juntos-cambio":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "frente-izquierda":
        return "bg-red-100 text-red-800 border-red-200"
      case "otros":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { bg: string; text: string }> = {
      politics: { bg: "bg-blue-50", text: "text-blue-700" },
      nacional: { bg: "bg-blue-50", text: "text-blue-700" },
      provincial: { bg: "bg-indigo-50", text: "text-indigo-700" },
      municipal: { bg: "bg-purple-50", text: "text-purple-700" },
      local: { bg: "bg-violet-50", text: "text-violet-700" },
      business: { bg: "bg-green-50", text: "text-green-700" },
      economy: { bg: "bg-green-50", text: "text-green-700" },
      technology: { bg: "bg-cyan-50", text: "text-cyan-700" },
      health: { bg: "bg-teal-50", text: "text-teal-700" },
      environment: { bg: "bg-emerald-50", text: "text-emerald-700" },
      education: { bg: "bg-amber-50", text: "text-amber-700" },
      security: { bg: "bg-orange-50", text: "text-orange-700" },
    }

    const style = categories[category] || { bg: "bg-gray-50", text: "text-gray-700" }
    return `${style.bg} ${style.text}`
  }

  // Función para formatear el contenido con secciones
  const formatContent = () => {
    // Verificar si content está definido
    if (!content) {
      return <p className="text-sm text-gray-500">No hay contenido disponible</p>
    }

    // Dividir el contenido en secciones
    const sections = content.split(/\*\*([^*]+)\*\*/g).filter(Boolean)

    if (sections.length >= 5) {
      // Si el contenido ya está formateado con títulos en negrita
      const formattedSections = []

      for (let i = 0; i < sections.length; i += 2) {
        if (i + 1 < sections.length) {
          const title = sections[i]
          const sectionContent = sections[i + 1]

          let icon = null
          if (title.includes("Contexto")) {
            icon = <Clock className="h-4 w-4 mr-1" />
          } else if (title.includes("Precedente") || title.includes("Histórico")) {
            icon = <History className="h-4 w-4 mr-1" />
          } else if (title.includes("Propuesta") || title.includes("Solución")) {
            icon = <LightbulbIcon className="h-4 w-4 mr-1" />
          }

          formattedSections.push(
            <div key={i} className="mb-3">
              <h4 className="font-bold text-sm flex items-center mb-1">
                {icon}
                {title}:
              </h4>
              <div className="text-sm">
                {sectionContent.split("\n").map((paragraph, idx) => (
                  <p key={idx} className={idx === 0 ? "mt-0" : "mt-2"}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>,
          )
        }
      }

      return formattedSections
    } else {
      // Si el contenido no tiene el formato esperado, mostrarlo como está
      return content.split("\n").map((paragraph, index) => (
        <p key={index} className={index === 0 ? "mt-0" : "mt-2"}>
          {paragraph}
        </p>
      ))
    }
  }

  return (
    <div className="space-y-4">
      <Card className={`border-2 ${getPartyColor(party)}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{title}</CardTitle>
            <span className={`px-2 py-0.5 rounded text-xs ${getCategoryBadge(category)}`}>{category}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-sm">
            {content ? formatContent() : <p className="text-sm text-gray-500">No hay contenido disponible</p>}
          </div>
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistorical(!showHistorical)}
              className="flex items-center gap-1 hover:bg-gray-100"
            >
              <BookOpen className="h-3 w-3" />
              <span>{showHistorical ? "Ocultar análisis" : "Ver análisis histórico-filosófico"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-1"
              disabled={!content} // Deshabilitar el botón si no hay contenido
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copiar</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showHistorical && newsItem && (
        <div className="mt-4">
          <HistoricalContrast newsItem={newsItem} selectedParty={party} />
        </div>
      )}
    </div>
  )
}
