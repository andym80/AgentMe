"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LightbulbIcon, Users, BookOpen, GitCompare } from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { partyIdeologies } from "@/lib/historical-knowledge"

interface IdeologicalSolutionsProps {
  newsItem: NewsItem
  category: string
}

export default function IdeologicalSolutions({ newsItem, category }: IdeologicalSolutionsProps) {
  const [activeParty, setActiveParty] = useState<PoliticalParty>("libertad-avanza")

  const parties: { id: PoliticalParty; name: string; color: string }[] = [
    { id: "libertad-avanza", name: "La Libertad Avanza", color: "bg-purple-100 hover:bg-purple-200 text-purple-800" },
    { id: "union-patria", name: "Unión por la Patria", color: "bg-blue-100 hover:bg-blue-200 text-blue-800" },
    { id: "juntos-cambio", name: "Juntos por el Cambio", color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800" },
    { id: "frente-izquierda", name: "Frente de Izquierda", color: "bg-red-100 hover:bg-red-200 text-red-800" },
    { id: "otros", name: "Otros partidos", color: "bg-gray-100 hover:bg-gray-200 text-gray-800" },
  ]

  // Obtener principios ideológicos relevantes para la categoría
  const getRelevantPrinciples = (party: PoliticalParty) => {
    if (category === "economy" || category === "business") {
      return partyIdeologies[party].economic
    } else if (category === "social" || category === "health" || category === "education") {
      return partyIdeologies[party].social
    } else if (category === "internacional" || category === "politics") {
      return partyIdeologies[party].international
    } else {
      return partyIdeologies[party].core
    }
  }

  // Generar soluciones según la ideología del partido
  const generateSolution = (party: PoliticalParty) => {
    const principles = getRelevantPrinciples(party)
    const title = newsItem.title

    switch (party) {
      case "libertad-avanza":
        return `Frente a la situación planteada en "${title}", nuestra propuesta se basa en los principios de ${principles[0]} y ${principles[1]}. La solución no pasa por más intervención estatal sino por liberar las fuerzas del mercado y respetar las decisiones individuales. Proponemos eliminar regulaciones innecesarias, reducir impuestos y permitir que los ciudadanos resuelvan sus problemas sin interferencia burocrática.`

      case "union-patria":
        return `Ante la problemática de "${title}", nuestra propuesta se fundamenta en los principios de ${principles[0]} y ${principles[1]}. El Estado debe tener un rol activo para garantizar derechos y promover el desarrollo con inclusión. Implementaremos políticas que fortalezcan la soberanía nacional, protejan a los sectores vulnerables y distribuyan equitativamente los beneficios del crecimiento.`

      case "juntos-cambio":
        return `Para abordar la situación de "${title}", proponemos un enfoque basado en ${principles[0]} y ${principles[1]}. Necesitamos instituciones sólidas y reglas claras que generen confianza y previsibilidad. Nuestra solución combina modernización del Estado, apertura inteligente al mundo y políticas de largo plazo que trasciendan los gobiernos de turno.`

      case "frente-izquierda":
        return `Frente a "${title}", nuestra propuesta se basa en los principios de ${principles[0]} y ${principles[1]}. Los problemas actuales son consecuencia directa del sistema capitalista y su lógica de explotación. Planteamos una reorganización económica bajo control de los trabajadores, nacionalización de sectores estratégicos y medidas que enfrenten directamente a los grupos de poder económico.`

      default:
        return `Para abordar la situación de "${title}", proponemos un enfoque pragmático basado en ${principles[0]} y ${principles[1]}. Las soluciones efectivas requieren superar dogmatismos ideológicos y construir consensos amplios. Implementaremos políticas basadas en evidencia que combinen lo mejor de diferentes modelos según su efectividad comprobada.`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Soluciones Comparadas
        </CardTitle>
        <p className="text-sm text-gray-500">
          Análisis de soluciones discursivas según la ideología de cada partido político
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeParty} onValueChange={(value) => setActiveParty(value as PoliticalParty)}>
          <TabsList className="grid w-full grid-cols-5">
            {parties.map((party) => (
              <TabsTrigger key={party.id} value={party.id} className={activeParty === party.id ? party.color : ""}>
                {party.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {parties.map((party) => (
            <TabsContent key={party.id} value={party.id} className="mt-4">
              <div className="space-y-4">
                <div className={`p-4 rounded-md ${party.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <LightbulbIcon className="h-5 w-5" />
                    <h3 className="font-medium">Solución propuesta</h3>
                  </div>
                  <p className="text-sm">{generateSolution(party.id)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5" />
                    <h3 className="font-medium">Principios ideológicos</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getRelevantPrinciples(party.id).map((principle, index) => (
                      <Badge key={index} variant="secondary" className={party.color}>
                        {principle}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5" />
                    <h3 className="font-medium">Referentes históricos</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {partyIdeologies[party.id].historical.slice(0, 2).map((figure, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{figure.figure}</span>
                        <p className="text-xs text-gray-600">{figure.contribution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
