"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { History, BookOpen, BarChart2, Users } from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import {
  getRelevantHistoricalEvents,
  getRelevantStatistics,
  getPhilosophicalReferences,
  getPoliticalReferences,
  getIdeologicalPrinciples,
} from "@/lib/historical-knowledge"

interface HistoricalContrastProps {
  newsItem: NewsItem
  selectedParty: PoliticalParty
}

export default function HistoricalContrast({ newsItem, selectedParty }: HistoricalContrastProps) {
  const [activeTab, setActiveTab] = useState("historical")

  // Obtener datos relevantes
  const historicalEvents = getRelevantHistoricalEvents(newsItem.category, 2)
  const statistics = getRelevantStatistics(newsItem.category, 2)
  const philosophicalConcepts = getPhilosophicalReferences(selectedParty, newsItem.category, 2)
  const politicalReferences = getPoliticalReferences(selectedParty, newsItem.category, 2)
  const ideologicalPrinciples = getIdeologicalPrinciples(selectedParty, newsItem.category, 3)

  // Función para obtener el color del partido
  const getPartyColor = (party: PoliticalParty): string => {
    const colors: Record<PoliticalParty, string> = {
      "libertad-avanza": "bg-purple-100 text-purple-800 border-purple-200",
      "union-patria": "bg-blue-100 text-blue-800 border-blue-200",
      "juntos-cambio": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "frente-izquierda": "bg-red-100 text-red-800 border-red-200",
      otros: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[party]
  }

  return (
    <Card className={`border-2 ${getPartyColor(selectedParty)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Análisis Histórico-Filosófico
        </CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger
              value="historical"
              className="flex items-center gap-1 data-[state=active]:bg-gray-100 data-[state=active]:font-medium"
            >
              <History className="h-4 w-4" />
              <span>Precedentes</span>
            </TabsTrigger>
            <TabsTrigger
              value="philosophical"
              className="flex items-center gap-1 data-[state=active]:bg-gray-100 data-[state=active]:font-medium"
            >
              <BookOpen className="h-4 w-4" />
              <span>Fundamentos</span>
            </TabsTrigger>
            <TabsTrigger
              value="statistical"
              className="flex items-center gap-1 data-[state=active]:bg-gray-100 data-[state=active]:font-medium"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Estadísticas</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <TabsContent value="historical" className="mt-2 space-y-4 p-2">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Precedentes Históricos Relevantes</h3>
            {historicalEvents.length > 0 ? (
              historicalEvents.map((event, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{event.event}</span>
                    <Badge variant="outline">{event.period}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <p className="text-sm text-gray-700 italic">Impacto: {event.impact}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No se encontraron precedentes históricos relevantes.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="philosophical" className="mt-2 space-y-4 p-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Principios Ideológicos</h3>
            <div className="flex flex-wrap gap-2">
              {ideologicalPrinciples.map((principle, index) => (
                <Badge key={index} variant="secondary" className={getPartyColor(selectedParty)}>
                  {principle}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Fundamentos Filosóficos</h3>
            {philosophicalConcepts.length > 0 ? (
              philosophicalConcepts.map((concept, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{concept.name}</span>
                    <Badge variant="outline">{concept.originPeriod}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{concept.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>Pensadores clave: {concept.keyThinkers.join(", ")}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No se encontraron fundamentos filosóficos relevantes.</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Referencias Políticas</h3>
            {politicalReferences.length > 0 ? (
              politicalReferences.map((reference, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{reference.figure}</span>
                    <Badge variant="outline">{reference.period}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{reference.contribution}</p>
                  <p className="text-xs text-gray-500">Corriente: {reference.ideology}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No se encontraron referencias políticas relevantes.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="statistical" className="mt-2 space-y-4 p-2">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Datos Estadísticos Históricos</h3>
            {statistics.length > 0 ? (
              statistics.map((stat, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{stat.topic}</span>
                    <Badge variant="outline">{stat.period}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.data}</p>
                  <p className="text-xs text-gray-500">Fuente: {stat.source}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No se encontraron datos estadísticos relevantes.</p>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  )
}
