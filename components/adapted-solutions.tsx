"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, ArrowRight } from "lucide-react"
import type { PoliticalParty } from "@/lib/types"

interface AdaptedSolutionsProps {
  title: string
  category: string
  solutions: Record<PoliticalParty, string[]>
}

export default function AdaptedSolutions({ title, category, solutions }: AdaptedSolutionsProps) {
  // Define the political parties
  const parties: { id: PoliticalParty; name: string; color: string; bgColor: string }[] = [
    { id: "libertad-avanza", name: "La Libertad Avanza", color: "text-purple-800", bgColor: "bg-purple-50" },
    { id: "union-patria", name: "Unión por la Patria", color: "text-blue-800", bgColor: "bg-blue-50" },
    { id: "juntos-cambio", name: "Juntos por el Cambio", color: "text-yellow-800", bgColor: "bg-yellow-50" },
    { id: "frente-izquierda", name: "Frente de Izquierda", color: "text-red-800", bgColor: "bg-red-50" },
    { id: "otros", name: "Otros partidos", color: "text-gray-800", bgColor: "bg-gray-50" },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <span>Soluciones para: {title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Comparativa de soluciones propuestas por cada partido político para abordar este tema.
        </p>

        <Tabs defaultValue="libertad-avanza">
          <TabsList className="grid grid-cols-5 mb-4">
            {parties.map((party) => (
              <TabsTrigger key={party.id} value={party.id}>
                {party.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {parties.map((party) => (
            <TabsContent key={party.id} value={party.id}>
              <div className={`p-4 rounded-md ${party.bgColor}`}>
                <h3 className={`font-medium ${party.color} mb-3`}>Soluciones de {party.name}:</h3>

                <div className="space-y-3">
                  {solutions[party.id] ? (
                    solutions[party.id].map((solution, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-md shadow-sm">
                        <ArrowRight className={`h-5 w-5 mt-0.5 ${party.color}`} />
                        <p className="text-sm">{solution}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 bg-white rounded-md">
                      <p className="text-sm text-gray-500">
                        Selecciona "Generar contenido" para ver soluciones específicas para este partido.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 bg-white p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Principios aplicados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {party.id === "libertad-avanza" && (
                      <>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Libertad individual
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Libre mercado
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Estado mínimo
                        </span>
                      </>
                    )}
                    {party.id === "union-patria" && (
                      <>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Justicia social
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Soberanía nacional
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Estado presente
                        </span>
                      </>
                    )}
                    {party.id === "juntos-cambio" && (
                      <>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Institucionalidad
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Modernización
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Eficiencia</span>
                      </>
                    )}
                    {party.id === "frente-izquierda" && (
                      <>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Derechos laborales
                        </span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Anticapitalismo</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Redistribución</span>
                      </>
                    )}
                    {party.id === "otros" && (
                      <>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Pragmatismo</span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Consenso</span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Gradualismo</span>
                      </>
                    )}
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
