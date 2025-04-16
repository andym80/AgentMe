"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Radio, Tv, Clock, Lightbulb, MessageCircle, Info } from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"

interface QuickResponseProps {
  content: string
  party: PoliticalParty
  newsItem: NewsItem
  responseType: string
}

export default function QuickResponse({ content, party, newsItem, responseType }: QuickResponseProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("simple")
  const [showContext, setShowContext] = useState(false)

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

  const getResponseTypeIcon = () => {
    switch (responseType) {
      case "laws":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-800">
            Leyes
          </Badge>
        )
      case "opinions":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-800">
            Opinión
          </Badge>
        )
      case "solutions":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800">
            Solución
          </Badge>
        )
      case "historical":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-800">
            Historia
          </Badge>
        )
      case "philosophical":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-800">
            Filosofía
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-800">
            Análisis
          </Badge>
        )
    }
  }

  // Obtener el color para la subcategoría
  const getSubcategoryColor = (subcategory?: string): string => {
    if (!subcategory) return "bg-gray-100 text-gray-800"

    const colors: Record<string, string> = {
      legislative: "bg-amber-100 text-amber-800",
      executive: "bg-blue-100 text-blue-800",
      judicial: "bg-indigo-100 text-indigo-800",
      electoral: "bg-purple-100 text-purple-800",
      diplomatic: "bg-cyan-100 text-cyan-800",
      economic_policy: "bg-green-100 text-green-800",
      fiscal: "bg-emerald-100 text-emerald-800",
      monetary: "bg-teal-100 text-teal-800",
      labor: "bg-lime-100 text-lime-800",
      markets: "bg-yellow-100 text-yellow-800",
      companies: "bg-orange-100 text-orange-800",
      innovation: "bg-rose-100 text-rose-800",
      digital: "bg-fuchsia-100 text-fuchsia-800",
      scientific: "bg-violet-100 text-violet-800",
      public_health: "bg-red-100 text-red-800",
      healthcare: "bg-pink-100 text-pink-800",
      climate: "bg-sky-100 text-sky-800",
      conservation: "bg-green-100 text-green-800",
      pollution: "bg-slate-100 text-slate-800",
      infrastructure: "bg-zinc-100 text-zinc-800",
      housing: "bg-stone-100 text-stone-800",
      transportation: "bg-neutral-100 text-neutral-800",
      other: "bg-gray-100 text-gray-800",
    }

    return colors[subcategory] || "bg-gray-100 text-gray-800"
  }

  // Obtener el color para el tipo de noticia
  const getNewsTypeColor = (newsType?: string): string => {
    if (!newsType) return "bg-gray-100 text-gray-800"

    const colors: Record<string, string> = {
      breaking: "bg-red-100 text-red-800",
      developing: "bg-orange-100 text-orange-800",
      analysis: "bg-blue-100 text-blue-800",
      opinion: "bg-purple-100 text-purple-800",
      interview: "bg-indigo-100 text-indigo-800",
      report: "bg-green-100 text-green-800",
      investigation: "bg-amber-100 text-amber-800",
      announcement: "bg-cyan-100 text-cyan-800",
      statement: "bg-teal-100 text-teal-800",
      other: "bg-gray-100 text-gray-800",
    }

    return colors[newsType] || "bg-gray-100 text-gray-800"
  }

  // Obtener el nombre legible de la subcategoría
  const getSubcategoryName = (subcategory?: string): string => {
    if (!subcategory) return "Otro"

    const names: Record<string, string> = {
      legislative: "Legislativo",
      executive: "Ejecutivo",
      judicial: "Judicial",
      electoral: "Electoral",
      diplomatic: "Diplomático",
      economic_policy: "Política Económica",
      fiscal: "Fiscal",
      monetary: "Monetario",
      labor: "Laboral",
      markets: "Mercados",
      companies: "Empresas",
      innovation: "Innovación",
      digital: "Digital",
      scientific: "Científico",
      public_health: "Salud Pública",
      healthcare: "Sistema de Salud",
      climate: "Clima",
      conservation: "Conservación",
      pollution: "Contaminación",
      infrastructure: "Infraestructura",
      housing: "Vivienda",
      transportation: "Transporte",
      other: "Otro",
    }

    return names[subcategory] || "Otro"
  }

  // Obtener el nombre legible del tipo de noticia
  const getNewsTypeName = (newsType?: string): string => {
    if (!newsType) return "Estándar"

    const names: Record<string, string> = {
      breaking: "Última Hora",
      developing: "En Desarrollo",
      analysis: "Análisis",
      opinion: "Opinión",
      interview: "Entrevista",
      report: "Reportaje",
      investigation: "Investigación",
      announcement: "Anuncio",
      statement: "Declaración",
      other: "Estándar",
    }

    return names[newsType] || "Estándar"
  }

  // Simplify content for quick reading
  const simplifyContent = (content: string): string => {
    // Split into paragraphs
    const paragraphs = content.split("\n\n")

    // Take only first 2-3 paragraphs and shorten them
    const simplifiedParagraphs = paragraphs.slice(0, 2).map((p) => {
      // Split into sentences
      const sentences = p.split(/\.\s+/)
      // Take only first 1-2 sentences
      return sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "..." : ".")
    })

    return simplifiedParagraphs.join("\n\n")
  }

  // Extract key points as bullet points
  const extractKeyPoints = (content: string): string[] => {
    // Split into paragraphs
    const paragraphs = content.split("\n\n")

    // Extract key sentences that might be important points
    const keyPoints: string[] = []
    const allSentences: string[] = []

    // Primero, recolectar todas las oraciones
    paragraphs.forEach((p) => {
      const sentences = p.split(/\.\s+/)
      sentences.forEach((s) => {
        if (s.trim().length > 15) {
          // Ignorar oraciones muy cortas
          allSentences.push(s.trim())
        }
      })
    })

    // Buscar oraciones con palabras clave de alta relevancia
    const highPriorityKeywords = [
      "importante",
      "clave",
      "fundamental",
      "crucial",
      "esencial",
      "impacto",
      "consecuencia",
      "implica",
      "significa",
      "demuestra",
      "revela",
      "evidencia",
      "confirma",
      "refuta",
      "contradice",
      "propone",
      "plantea",
      "sugiere",
      "recomienda",
      "advierte",
      "destaca",
      "subraya",
      "enfatiza",
      "prioriza",
      "concluye",
    ]

    // Primero añadir oraciones con palabras clave de alta prioridad
    allSentences.forEach((sentence) => {
      if (
        highPriorityKeywords.some((keyword) => sentence.toLowerCase().includes(keyword)) &&
        !keyPoints.includes(sentence)
      ) {
        keyPoints.push(sentence)
      }
    })

    // Si no tenemos suficientes puntos clave, buscar oraciones con datos específicos
    if (keyPoints.length < 3) {
      const dataPatterns = [
        /\d+%/, // Porcentajes
        /\d+ (?:millones|mil)/, // Cantidades grandes
        /(?:aumentó|disminuyó|creció|redujo)/, // Cambios
        /según (?:el|la|los|las)/, // Fuentes
        /(?:primera|primero|último|última) vez/, // Hitos
      ]

      allSentences.forEach((sentence) => {
        if (!keyPoints.includes(sentence) && dataPatterns.some((pattern) => pattern.test(sentence.toLowerCase()))) {
          keyPoints.push(sentence)
        }
      })
    }

    // Si aún necesitamos más puntos, tomar las oraciones más largas (suelen ser más informativas)
    if (keyPoints.length < 4) {
      const remainingSentences = allSentences.filter((s) => !keyPoints.includes(s)).sort((a, b) => b.length - a.length)

      for (let i = 0; i < remainingSentences.length && keyPoints.length < 5; i++) {
        keyPoints.push(remainingSentences[i])
      }
    }

    // Asegurar que no excedemos 5 puntos clave
    return keyPoints.slice(0, 5)
  }

  const simplifiedContent = simplifyContent(content)
  const keyPoints = extractKeyPoints(content)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Respuesta Rápida</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm ${getPartyColor(party)}`}>{getPartyName(party)}</div>
            {getResponseTypeIcon()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Noticia: {newsItem.title}</span>
          {newsItem.context && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs flex items-center gap-1"
              onClick={() => setShowContext(!showContext)}
            >
              <Info className="h-3 w-3" />
              Contexto
            </Button>
          )}
        </div>

        {/* Mostrar subcategoría y tipo de noticia */}
        <div className="flex flex-wrap gap-2 mt-2">
          {newsItem.subcategory && (
            <Badge className={getSubcategoryColor(newsItem.subcategory)}>
              {getSubcategoryName(newsItem.subcategory)}
            </Badge>
          )}
          {newsItem.newsType && (
            <Badge className={getNewsTypeColor(newsItem.newsType)}>{getNewsTypeName(newsItem.newsType)}</Badge>
          )}
        </div>

        {/* Mostrar contexto si está habilitado */}
        {showContext && newsItem.context && (
          <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-700 border border-gray-200">
            {newsItem.context}
          </div>
        )}
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 px-4">
          <TabsTrigger value="simple" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            30 seg
          </TabsTrigger>
          <TabsTrigger value="points" className="text-xs">
            <Lightbulb className="h-3 w-3 mr-1" />
            Puntos clave
          </TabsTrigger>
          <TabsTrigger value="full" className="text-xs">
            <MessageCircle className="h-3 w-3 mr-1" />
            Completo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-md mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600">Versión simplificada para lectura de 30 segundos</span>
            </div>
            <div className="prose max-w-none text-sm">
              {simplifiedContent.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="points">
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-md mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600">Puntos clave para mencionar</span>
            </div>
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </TabsContent>

        <TabsContent value="full">
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-md mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600">Respuesta completa y detallada</span>
            </div>
            <div className="prose max-w-none text-sm">
              {content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="justify-between border-t p-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Radio className="h-3 w-3" />
            <span className="text-xs">Radio</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Tv className="h-3 w-3" />
            <span className="text-xs">TV</span>
          </Badge>
        </div>
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
    </Card>
  )
}
