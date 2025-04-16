"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThumbsUp, ThumbsDown, Clock, AlertCircle } from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"

interface VotePredictionsProps {
  newsItem: NewsItem
}

export default function VotePredictions({ newsItem }: VotePredictionsProps) {
  const [activeTab, setActiveTab] = useState<PoliticalParty>("libertad-avanza")

  // Define the political parties
  const parties: { id: PoliticalParty; name: string; color: string }[] = [
    { id: "libertad-avanza", name: "La Libertad Avanza", color: "bg-purple-100 hover:bg-purple-200 text-purple-800" },
    { id: "union-patria", name: "Unión por la Patria", color: "bg-blue-100 hover:bg-blue-200 text-blue-800" },
    { id: "juntos-cambio", name: "Juntos por el Cambio", color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800" },
    { id: "frente-izquierda", name: "Frente de Izquierda", color: "bg-red-100 hover:bg-red-200 text-red-800" },
    { id: "otros", name: "Otros partidos", color: "bg-gray-100 hover:bg-gray-200 text-gray-800" },
  ]

  // Render vote prediction for a party
  const renderVotePrediction = (party: PoliticalParty) => {
    const legislativeInfo = newsItem.legislativeInfo
    if (!legislativeInfo || !legislativeInfo.votePredicciones || !legislativeInfo.votePredicciones[party]) {
      return (
        <div className="text-center p-4">
          <AlertCircle className="h-5 w-5 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay predicción disponible para este partido</p>
        </div>
      )
    }

    const prediction = legislativeInfo.votePredicciones[party]
    if (!prediction) {
      return (
        <div className="text-center p-4">
          <AlertCircle className="h-5 w-5 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay predicción disponible para este partido</p>
        </div>
      )
    }

    const voteYes = prediction.voteYes || 0
    const voteNo = prediction.voteNo || 0
    const abstention = prediction.abstention || 0

    // Determine the most likely result
    const willVoteYes = voteYes > voteNo && voteYes > abstention
    const willVoteNo = voteNo > voteYes && voteNo > abstention
    const willAbstain = abstention > voteYes && abstention > voteNo

    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-3 ${willVoteYes ? "bg-green-100" : "bg-gray-100"}`}>
              <ThumbsUp className={`h-6 w-6 ${willVoteYes ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <span className="text-sm font-medium mt-2">{voteYes}%</span>
            <span className="text-xs text-gray-500">A favor</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`rounded-full p-3 ${willVoteNo ? "bg-red-100" : "bg-gray-100"}`}>
              <ThumbsDown className={`h-6 w-6 ${willVoteNo ? "text-red-600" : "text-gray-400"}`} />
            </div>
            <span className="text-sm font-medium mt-2">{voteNo}%</span>
            <span className="text-xs text-gray-500">En contra</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`rounded-full p-3 ${willAbstain ? "bg-yellow-100" : "bg-gray-100"}`}>
              <Clock className={`h-6 w-6 ${willAbstain ? "text-yellow-600" : "text-gray-400"}`} />
            </div>
            <span className="text-sm font-medium mt-2">{abstention}%</span>
            <span className="text-xs text-gray-500">Abstención</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Justificación:</h3>
          <p className="text-sm text-gray-600">{prediction.justification || "No hay justificación disponible."}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Resultado más probable:</h3>
          <p className="text-sm">
            {willVoteYes && (
              <span className="text-green-600 font-medium">Este partido probablemente votará a favor de esta ley.</span>
            )}
            {willVoteNo && (
              <span className="text-red-600 font-medium">Este partido probablemente votará en contra de esta ley.</span>
            )}
            {willAbstain && (
              <span className="text-yellow-600 font-medium">
                Este partido probablemente se abstendrá en la votación de esta ley.
              </span>
            )}
          </p>
        </div>
      </div>
    )
  }

  if (!newsItem.legislativeInfo?.isLegislative) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Esta noticia no contiene información legislativa</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Predicciones de Voto: {newsItem.legislativeInfo.lawName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-600">{newsItem.legislativeInfo.lawDescription}</p>
          <p className="text-xs text-gray-500 mt-2">
            Fecha estimada de votación: {new Date(newsItem.legislativeInfo.voteDate || "").toLocaleDateString()}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PoliticalParty)}>
          <TabsList className="grid grid-cols-5 mb-4">
            {parties.map((party) => (
              <TabsTrigger key={party.id} value={party.id} className={activeTab === party.id ? party.color : ""}>
                {party.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {parties.map((party) => (
            <TabsContent key={party.id} value={party.id}>
              {renderVotePrediction(party.id)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
