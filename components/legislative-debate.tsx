"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Scale, BookOpen, GitCompare, FileText, ThumbsUp, ThumbsDown, Clock } from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"
import { partyEthicalPositions } from "@/lib/ethical-knowledge"

interface LegislativeDebateProps {
  newsItem: NewsItem
}

export default function LegislativeDebate({ newsItem }: LegislativeDebateProps) {
  const [activeParty, setActiveParty] = useState<PoliticalParty>("libertad-avanza")

  const parties: { id: PoliticalParty; name: string; color: string }[] = [
    { id: "libertad-avanza", name: "La Libertad Avanza", color: "bg-purple-100 hover:bg-purple-200 text-purple-800" },
    { id: "union-patria", name: "Unión por la Patria", color: "bg-blue-100 hover:bg-blue-200 text-blue-800" },
    { id: "juntos-cambio", name: "Juntos por el Cambio", color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800" },
    { id: "frente-izquierda", name: "Frente de Izquierda", color: "bg-red-100 hover:bg-red-200 text-red-800" },
    { id: "otros", name: "Otros partidos", color: "bg-gray-100 hover:bg-gray-200 text-gray-800" },
  ]

  // Verificar si la noticia tiene información legislativa
  const hasLegislativeInfo = newsItem.legislativeInfo?.isLegislative

  if (!hasLegislativeInfo) {
    return null
  }

  // Generar posición legislativa según el partido
  const generateLegislativePosition = (party: PoliticalParty) => {
    const legislativeInfo = newsItem.legislativeInfo
    if (!legislativeInfo) return ""

    const ethicalPosition = partyEthicalPositions[party]
    const title = newsItem.title

    switch (party) {
      case "libertad-avanza":
        return `Nuestra posición sobre "${title}" se basa en los principios de ${ethicalPosition.principles[0]} y ${
          ethicalPosition.principles[1]
        }. Rechazamos esta iniciativa por representar una expansión injustificada del poder estatal que limita libertades individuales y derechos de propiedad. Proponemos en cambio desregular el sector y permitir que los mecanismos de mercado resuelvan eficientemente las necesidades existentes.`

      case "union-patria":
        return `Respecto a "${title}", nuestra posición se fundamenta en los principios de ${
          ethicalPosition.principles[0]
        } y ${
          ethicalPosition.principles[1]
        }. Apoyamos esta iniciativa porque fortalece el rol del Estado como garante de derechos fundamentales y promueve una distribución más equitativa de recursos. Proponemos algunas modificaciones para asegurar mayor participación de sectores populares en su implementación.`

      case "juntos-cambio":
        return `En relación a "${title}", nuestra postura se basa en los principios de ${
          ethicalPosition.principles[0]
        } y ${
          ethicalPosition.principles[1]
        }. Apoyamos parcialmente esta iniciativa pero proponemos modificaciones sustanciales para asegurar su sostenibilidad fiscal, transparencia en la implementación y evaluación de resultados. Es necesario un enfoque gradual que genere previsibilidad.`

      case "frente-izquierda":
        return `Frente a "${title}", nuestra posición se fundamenta en los principios de ${
          ethicalPosition.principles[0]
        } y ${
          ethicalPosition.principles[1]
        }. Rechazamos esta iniciativa por considerarla insuficiente y funcional a intereses corporativos. Proponemos una alternativa radical que nacionalice el sector bajo control de trabajadores y usuarios, con financiamiento proveniente de impuestos progresivos a grandes fortunas.`

      default:
        return `Sobre "${title}", nuestra postura busca equilibrar los principios de ${
          ethicalPosition.principles[0]
        } y ${
          ethicalPosition.principles[1]
        }. Proponemos un enfoque pragmático que tome elementos positivos de la iniciativa pero incorpore mecanismos de participación ciudadana y evaluación periódica de resultados. Es fundamental construir consensos amplios en temas estratégicos.`
    }
  }

  // Generar argumentos éticos según el partido
  const generateEthicalArguments = (party: PoliticalParty) => {
    const ethicalPosition = partyEthicalPositions[party]

    switch (party) {
      case "libertad-avanza":
        return [
          "Violación del principio de no agresión al imponer obligaciones coercitivas",
          "Restricción injustificada de la libertad contractual entre partes",
          "Uso de recursos confiscados mediante impuestos coercitivos",
          "Creación de incentivos perversos que distorsionan decisiones individuales",
        ]

      case "union-patria":
        return [
          "Protección de derechos sociales fundamentales garantizados constitucionalmente",
          "Reducción de desigualdades estructurales que afectan a sectores vulnerables",
          "Fortalecimiento de la soberanía nacional en sectores estratégicos",
          "Promoción de la solidaridad como valor social fundamental",
        ]

      case "juntos-cambio":
        return [
          "Necesidad de reglas claras y previsibles que generen confianza institucional",
          "Equilibrio entre derechos individuales y responsabilidades colectivas",
          "Sostenibilidad fiscal para evitar cargas a generaciones futuras",
          "Transparencia y rendición de cuentas en la gestión pública",
        ]

      case "frente-izquierda":
        return [
          "Confrontación con intereses del capital concentrado nacional y transnacional",
          "Democratización real de la toma de decisiones con participación de trabajadores",
          "Distribución de la riqueza socialmente producida y apropiada privadamente",
          "Solidaridad de clase frente a la explotación capitalista",
        ]

      default:
        return [
          "Búsqueda de consensos amplios que trasciendan divisiones partidarias",
          "Políticas basadas en evidencia científica y mejores prácticas internacionales",
          "Equilibrio entre diferentes valores e intereses legítimos en conflicto",
          "Gradualismo responsable en la implementación de cambios estructurales",
        ]
    }
  }

  const renderVotePrediction = (party: PoliticalParty) => {
    const legislativeInfo = newsItem.legislativeInfo
    if (!legislativeInfo || !legislativeInfo.votePredicciones || !legislativeInfo.votePredicciones[party]) {
      return null
    }

    const prediction = legislativeInfo.votePredicciones[party]
    const { voteYes, voteNo, abstention } = prediction

    // Determinar el resultado más probable
    const willVoteYes = voteYes > voteNo && voteYes > abstention
    const willVoteNo = voteNo > voteYes && voteNo > abstention
    const willAbstain = abstention > voteYes && abstention > voteNo

    return (
      <div className="mt-4 bg-gray-50 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Predicción de voto
        </h4>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 ${willVoteYes ? "bg-green-100" : "bg-gray-100"}`}>
              <ThumbsUp className={`h-5 w-5 ${willVoteYes ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <span className="text-xs mt-1">{voteYes}%</span>
            <span className="text-xs text-gray-500">A favor</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 ${willVoteNo ? "bg-red-100" : "bg-gray-100"}`}>
              <ThumbsDown className={`h-5 w-5 ${willVoteNo ? "text-red-600" : "text-gray-400"}`} />
            </div>
            <span className="text-xs mt-1">{voteNo}%</span>
            <span className="text-xs text-gray-500">En contra</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 ${willAbstain ? "bg-yellow-100" : "bg-gray-100"}`}>
              <Clock className={`h-5 w-5 ${willAbstain ? "text-yellow-600" : "text-gray-400"}`} />
            </div>
            <span className="text-xs mt-1">{abstention}%</span>
            <span className="text-xs text-gray-500">Abstención</span>
          </div>
        </div>

        {prediction.justification && (
          <div className="mt-2 text-xs text-gray-600 border-t pt-2">
            <span className="font-medium">Justificación:</span> {prediction.justification}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-5 w-5 text-amber-600" />
          <span className="text-amber-800">Debate Legislativo</span>
        </CardTitle>
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
                    <FileText className="h-5 w-5" />
                    <h3 className="font-medium">Posición legislativa</h3>
                  </div>
                  <p className="text-sm">{generateLegislativePosition(party.id)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5" />
                    <h3 className="font-medium">Argumentos éticos</h3>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {generateEthicalArguments(party.id).map((argument, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">•</span>
                        <span>{argument}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCompare className="h-5 w-5" />
                    <h3 className="font-medium">Marco ético</h3>
                  </div>
                  <div className="text-sm">
                    <Badge className={party.color}>{partyEthicalPositions[party.id].framework}</Badge>
                    <div className="mt-2">
                      <p>
                        Este enfoque ético fundamenta nuestra posición legislativa y orienta nuestras propuestas de
                        política pública en este ámbito.
                      </p>
                    </div>
                  </div>
                </div>

                {renderVotePrediction(party.id)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
