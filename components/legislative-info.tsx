"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, Link2, ThumbsUp, ThumbsDown } from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"

interface LegislativeInfoProps {
  newsItem: NewsItem
  selectedParty?: PoliticalParty
}

export default function LegislativeInfo({ newsItem, selectedParty }: LegislativeInfoProps) {
  // Si no hay información legislativa, no mostrar nada
  if (!newsItem.legislativeInfo || !newsItem.legislativeInfo.isLegislative) {
    return null
  }

  const { lawName, lawDescription, voteDate, votePredicciones } = newsItem.legislativeInfo

  // Obtener los partidos para los que tenemos predicciones
  const parties = votePredicciones ? (Object.keys(votePredicciones) as PoliticalParty[]) : []

  // Función para obtener el nombre completo del partido
  const getPartyName = (party: PoliticalParty): string => {
    const partyNames: Record<PoliticalParty, string> = {
      "libertad-avanza": "La Libertad Avanza",
      "union-patria": "Unión por la Patria",
      "juntos-cambio": "Juntos por el Cambio",
      "frente-izquierda": "Frente de Izquierda",
      otros: "Otros partidos",
    }
    return partyNames[party] || party
  }

  // Función para obtener el color del partido
  const getPartyColor = (party: PoliticalParty): string => {
    const partyColors: Record<PoliticalParty, string> = {
      "libertad-avanza": "bg-purple-600",
      "union-patria": "bg-blue-600",
      "juntos-cambio": "bg-yellow-600",
      "frente-izquierda": "bg-red-600",
      otros: "bg-gray-600",
    }
    return partyColors[party] || "bg-gray-600"
  }

  // Formatear la fecha de votación
  const formattedVoteDate = voteDate
    ? new Date(voteDate).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Fecha no definida"

  // Obtener el contexto legislativo basado en la categoría de la noticia
  const getLegislativeContext = (category: string): string => {
    switch (category) {
      case "politics":
      case "nacional":
        return "debate sobre política nacional"
      case "business":
      case "economy":
        return "regulación económica y fiscal"
      case "technology":
        return "normativa sobre tecnología e innovación"
      case "health":
        return "sistema de salud pública"
      case "environment":
        return "protección del medio ambiente"
      case "provincial":
        return "administración provincial"
      case "municipal":
        return "gestión municipal"
      case "local":
        return "desarrollo comunitario"
      default:
        return "actualidad legislativa"
    }
  }

  // Obtener la postura política según el partido y la categoría
  const getPoliticalStance = (party: PoliticalParty, category: string): string => {
    const stances: Record<PoliticalParty, Record<string, string>> = {
      "libertad-avanza": {
        politics: "Este proyecto busca reducir la burocracia estatal y fortalecer las libertades individuales.",
        nacional: "Esta iniciativa apunta a desregular la economía y reducir la intervención del Estado.",
        business: "La propuesta promueve la libertad de mercado y la reducción de cargas impositivas.",
        economy: "El enfoque prioriza la iniciativa privada y la eliminación de restricciones económicas.",
        technology: "Se busca fomentar la innovación sin restricciones regulatorias excesivas.",
        health: "El proyecto impulsa un sistema basado en la libre elección y competencia entre prestadores.",
        environment: "La normativa equilibra el desarrollo económico con soluciones ambientales de mercado.",
        provincial: "La ley busca mayor autonomía provincial y reducción de dependencia del gobierno central.",
        municipal: "Se promueve la autogestión municipal con menor interferencia de niveles superiores.",
        local: "La iniciativa fortalece el desarrollo comunitario basado en la cooperación voluntaria.",
        default: "El proyecto se alinea con principios de libertad económica y reducción del Estado.",
      },
      "union-patria": {
        politics: "Este proyecto fortalece el rol del Estado como garante de derechos fundamentales.",
        nacional: "Esta iniciativa promueve la soberanía nacional y el desarrollo con inclusión.",
        business: "La propuesta busca equilibrar el crecimiento económico con la distribución del ingreso.",
        economy: "El enfoque prioriza el mercado interno y la protección de sectores estratégicos.",
        technology: "Se busca desarrollar capacidades tecnológicas nacionales con apoyo estatal.",
        health: "El proyecto refuerza el sistema público de salud con acceso universal garantizado.",
        environment: "La normativa protege recursos naturales estratégicos bajo control soberano.",
        provincial: "La ley fortalece la articulación federal con políticas de desarrollo regional.",
        municipal: "Se promueve la participación ciudadana en la gestión de recursos municipales.",
        local: "La iniciativa impulsa el desarrollo territorial con inclusión de sectores populares.",
        default: "El proyecto se alinea con principios de justicia social y soberanía nacional.",
      },
      "juntos-cambio": {
        politics: "Este proyecto moderniza las instituciones y fortalece la calidad democrática.",
        nacional: "Esta iniciativa busca eficiencia en la gestión pública y seguridad jurídica.",
        business: "La propuesta genera condiciones para atraer inversiones y crear empleo de calidad.",
        economy: "El enfoque combina apertura económica con estabilidad macroeconómica.",
        technology: "Se busca integrar al país en las cadenas globales de innovación tecnológica.",
        health: "El proyecto propone un sistema mixto con colaboración público-privada eficiente.",
        environment: "La normativa adopta estándares internacionales de sustentabilidad.",
        provincial: "La ley impulsa la descentralización con responsabilidad fiscal.",
        municipal: "Se promueve la profesionalización de la gestión municipal y la transparencia.",
        local: "La iniciativa fomenta alianzas entre sector público, privado y sociedad civil.",
        default: "El proyecto se alinea con principios republicanos y de modernización institucional.",
      },
      "frente-izquierda": {
        politics: "Este proyecto confronta los intereses de las élites económicas y financieras.",
        nacional: "Esta iniciativa defiende los derechos de trabajadores frente al poder corporativo.",
        business: "La propuesta establece controles sobre grandes empresas y grupos económicos.",
        economy: "El enfoque prioriza la redistribución de la riqueza y el control obrero.",
        technology: "Se busca democratizar el acceso a tecnologías y conocimiento científico.",
        health: "El proyecto establece un sistema único estatal con participación de trabajadores.",
        environment: "La normativa enfrenta el extractivismo y protege comunidades afectadas.",
        provincial: "La ley fortalece la organización popular a nivel provincial.",
        municipal: "Se promueve la gestión directa de recursos por asambleas ciudadanas.",
        local: "La iniciativa impulsa la autoorganización comunitaria y poder popular.",
        default: "El proyecto se alinea con la lucha contra el capitalismo y por los derechos laborales.",
      },
      otros: {
        politics: "Este proyecto busca consensos amplios más allá de divisiones partidarias.",
        nacional: "Esta iniciativa aborda desafíos nacionales con enfoque pragmático.",
        business: "La propuesta equilibra desarrollo económico con responsabilidad social.",
        economy: "El enfoque combina elementos de diferentes modelos económicos.",
        technology: "Se busca aprovechar oportunidades tecnológicas con marco ético.",
        health: "El proyecto mejora el sistema de salud con base en evidencia científica.",
        environment: "La normativa adopta soluciones prácticas a problemas ambientales.",
        provincial: "La ley promueve buenas prácticas de gestión provincial.",
        municipal: "Se impulsa la innovación en servicios municipales centrados en ciudadanos.",
        local: "La iniciativa fortalece el tejido social y la identidad comunitaria.",
        default: "El proyecto se alinea con un enfoque pragmático orientado a resultados.",
      },
    }

    // Obtener la postura específica o usar la default
    return stances[party][category] || stances[party].default
  }

  // Determinar el contexto legislativo basado en la categoría
  const legislativeContext = getLegislativeContext(newsItem.category)

  // Obtener la postura política si hay un partido seleccionado
  const politicalStance = selectedParty ? getPoliticalStance(selectedParty, newsItem.category) : ""

  return (
    <Card className="mt-4 border-2 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded text-sm">
            Debate Legislativo
          </span>
        </div>
        <CardTitle className="text-lg flex items-center gap-2">{lawName}</CardTitle>
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
          <Link2 className="h-3 w-3" />
          <span>Relacionado con {legislativeContext}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lawDescription && <p className="text-sm text-gray-600 dark:text-gray-300">{lawDescription}</p>}

        {politicalStance && (
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-sm">
            <span className="font-medium">Perspectiva de {getPartyName(selectedParty!)}: </span>
            {politicalStance}
          </div>
        )}

        <div className="text-sm">
          <span className="font-medium">Fecha estimada de votación:</span> {formattedVoteDate}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-1">
            Predicción de voto por partido
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Predicción basada en posiciones históricas, declaraciones públicas y alineación ideológica de cada
                    partido.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {parties.map((party) => {
              const prediction = votePredicciones?.[party]
              if (!prediction) return null

              const { voteYes, voteNo, abstention, justification } = prediction
              const isSelected = selectedParty === party
              const willVoteYes = voteYes > voteNo
              const willVoteNo = voteNo > voteYes

              return (
                <div
                  key={party}
                  className={`p-2 rounded flex items-center gap-3 ${
                    isSelected ? "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" : ""
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${getPartyColor(party)}`}></div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>{getPartyName(party)}</span>

                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className={`rounded-full p-1 ${willVoteYes ? "bg-green-100" : "bg-gray-100"}`}>
                                <ThumbsUp className={`h-4 w-4 ${willVoteYes ? "text-green-600" : "text-gray-400"}`} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Probabilidad de voto a favor: {voteYes}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className={`rounded-full p-1 ${willVoteNo ? "bg-red-100" : "bg-gray-100"}`}>
                                <ThumbsDown className={`h-4 w-4 ${willVoteNo ? "text-red-600" : "text-gray-400"}`} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Probabilidad de voto en contra: {voteNo}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {isSelected && justification && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{justification}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
