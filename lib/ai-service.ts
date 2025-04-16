"\"use server"

import type { NewsItem, PoliticalParty } from "./types"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getApiKey } from "./api-key-action"
import { getRelevantHistoricalEvents, getRelevantStatistics } from "./historical-knowledge"
import { getRelevantMoralDilemmas, getRelevantEthicalPrinciples, partyEthicalPositions } from "./ethical-knowledge"
import { enhanceResponseCoherence, generateNewsContext } from "./nlp-service"

interface AdaptNewsResult {
  generalMessage: string
  topicOpinions: Record<string, string>
}

async function adaptNewsForParty(
  newsItems: NewsItem[],
  party: PoliticalParty,
  apiKey?: string,
): Promise<AdaptNewsResult> {
  // Si no hay noticias, devolver un mensaje predeterminado
  if (!newsItems || newsItems.length === 0) {
    return {
      generalMessage: "No hay noticias disponibles para adaptar.",
      topicOpinions: {},
    }
  }

  // Intentar obtener la clave API del servidor si no se proporciona
  if (!apiKey) {
    apiKey = await getApiKey()
  }

  // Si no hay clave API, generar contenido simulado
  if (!apiKey || !apiKey.startsWith("sk-")) {
    console.log("Clave API de OpenAI no válida, usando contenido simulado")
    const generalMessage = generateMockContent(party, newsItems)
    const topicOpinions = generateMockTopicOpinions(party, newsItems)
    return { generalMessage, topicOpinions }
  }

  try {
    // Generar un contexto general para todas las noticias
    let generalContext = ""
    try {
      generalContext = await generateNewsContext(newsItems[0], apiKey)
    } catch (error) {
      console.error("Error al generar contexto general:", error)
      generalContext = "Análisis de noticias para campaña política."
    }

    // Generar opiniones específicas para cada noticia
    const topicOpinions: Record<string, string> = {}
    for (let i = 0; i < newsItems.length; i++) {
      const newsItem = newsItems[i]
      const newsId = `news-${i}`

      try {
        const prompt = `
Eres un experto en comunicación política y debes generar una opinión sobre la siguiente noticia desde la perspectiva del partido ${party}:

Título: ${newsItem.title}
Resumen: ${newsItem.summary}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}
Contexto: ${generalContext}

Genera una opinión concisa (máximo 3 oraciones) que refleje la posición del partido ${party} sobre este tema.
`

        const { text: opinion } = await generateText({
          model: openai("gpt-4o"),
          prompt,
          temperature: 0.5,
          maxTokens: 300,
          apiKey,
        })

        topicOpinions[newsId] = opinion
      } catch (error) {
        console.error(`Error al generar opinión para noticia ${newsId}:`, error)
        topicOpinions[newsId] = "No se pudo generar una opinión para esta noticia."
      }
    }

    // Combinar todas las opiniones en un mensaje general
    let generalMessage = `Análisis general de noticias para ${party}:\n\n`
    for (const newsId in topicOpinions) {
      generalMessage += `**${newsItems[Number.parseInt(newsId.split("-")[1])].title}**\n${topicOpinions[newsId]}\n\n`
    }

    // Mejorar la coherencia del mensaje general
    generalMessage = await enhanceResponseCoherence(newsItems, generalMessage, party, apiKey)

    return { generalMessage, topicOpinions }
  } catch (error) {
    console.error("Error al adaptar noticias:", error)
    return {
      generalMessage: "Error al generar contenido. Por favor, inténtalo de nuevo.",
      topicOpinions: {},
    }
  }
}

// Función para generar contenido simulado cuando no hay clave API
function generateMockContent(party: PoliticalParty, newsItems: NewsItem[]): string {
  // Determinar el contexto general de las noticias
  const categories = newsItems.map((item) => item.category)
  const isMainlyLocal = categories.filter((cat) => ["local", "municipal"].includes(cat)).length > categories.length / 2
  const isMainlyNational =
    categories.filter((cat) => ["nacional", "provincial"].includes(cat)).length > categories.length / 2

  // Extraer temas clave de las noticias sin mencionar títulos directamente
  const topics = extractKeyTopics(newsItems)

  // Seleccionar un estilo de respuesta aleatorio para evitar repetición
  const responseStyle = getRandomResponseStyle()

  // Generar respuesta según el partido y contexto
  return generatePartyResponse(party, topics, isMainlyLocal, isMainlyNational, responseStyle)
}

// Función para generar opiniones específicas sobre cada noticia
function generateMockTopicOpinions(party: PoliticalParty, newsItems: NewsItem[]): Record<string, string> {
  const opinions: Record<string, string> = {}

  newsItems.forEach((item, index) => {
    // Generar un identificador único para cada noticia
    const newsId = `news-${index}`

    // Generar opinión según el partido y la categoría de la noticia
    opinions[newsId] = generateTopicOpinion(party, item)
  })

  return opinions
}

// Función para generar una opinión específica sobre una noticia con contexto histórico
function generateTopicOpinion(party: PoliticalParty, newsItem: NewsItem): string {
  // Determinar el tipo de tema para contextualizar la respuesta
  const isEconomic = ["business", "economy"].includes(newsItem.category)
  const isSocial = ["health", "education", "social"].includes(newsItem.category)
  const isInstitutional = ["politics", "nacional", "provincial"].includes(newsItem.category)
  const isEnvironmental = ["environment"].includes(newsItem.category)
  const isTechnological = ["technology"].includes(newsItem.category)
  const isLocal = ["municipal", "local"].includes(newsItem.category)

  // Seleccionar un formato aleatorio para la respuesta
  const formatStyle = Math.floor(Math.random() * 3) // 0, 1, o 2

  // Generar componentes de la respuesta
  const briefDescription = generateBriefDescription(newsItem)
  const historicalContext = generateHistoricalContext(newsItem)
  const ethicalConsiderations = generateEthicalConsiderations(party, newsItem)
  const partySolution = generatePartySolution(party, newsItem)

  // Combinar las partes según el formato seleccionado
  if (formatStyle === 0) {
    // Formato estándar
    return `${briefDescription}\n\n${historicalContext}\n\n${ethicalConsiderations}\n\n${partySolution}`
  } else if (formatStyle === 1) {
    // Formato que comienza con consideraciones éticas
    return `${ethicalConsiderations}\n\n${briefDescription}\n\nEn perspectiva histórica: ${historicalContext.replace("**Precedente histórico:**\n", "")}\n\n${partySolution}`
  } else {
    // Formato que comienza con la propuesta
    return `${partySolution}\n\nEsta propuesta surge del análisis de la situación actual: ${briefDescription.replace("**Contexto actual:**\n", "")}\n\n${historicalContext}\n\n${ethicalConsiderations}`
  }
}

// Función para generar una descripción breve del tema
function generateBriefDescription(newsItem: NewsItem): string {
  const category = newsItem.category
  const title = newsItem.title

  // Seleccionar un estilo aleatorio para la descripción
  const descriptionStyle = Math.floor(Math.random() * 4) // 0, 1, 2, o 3

  let description = "**Contexto actual:**\n"

  // Diferentes estilos de introducción para cada categoría
  const introStyles = [
    "La situación actual refleja",
    "El panorama presente muestra",
    "El contexto contemporáneo evidencia",
    "La coyuntura actual revela",
    "La realidad que enfrentamos manifiesta",
    "El escenario vigente demuestra",
    "La circunstancia presente expone",
  ]

  const randomIntro = introStyles[Math.floor(Math.random() * introStyles.length)]

  if (category === "politics" || category === "nacional") {
    const politicsDescriptions = [
      `${randomIntro} tensiones importantes en torno a ${title.toLowerCase()}. Este tema ha generado debate entre diferentes sectores y requiere un análisis cuidadoso de sus implicaciones para la gobernabilidad y el desarrollo institucional del país.`,
      `La arena política se encuentra en ebullición debido a ${title.toLowerCase()}. Las distintas fuerzas políticas han tomado posiciones encontradas, revelando fracturas profundas en el sistema institucional que requieren atención inmediata.`,
      `El tablero político nacional se ha reconfigurado a partir de ${title.toLowerCase()}. Este fenómeno no es aislado sino que responde a transformaciones estructurales en la relación entre ciudadanía, representantes y Estado.`,
      `La dinámica política actual está marcada por ${title.toLowerCase()}, un tema que trasciende las divisiones partidarias tradicionales y exige nuevos enfoques para fortalecer la calidad democrática.`,
    ]
    description += politicsDescriptions[descriptionStyle % politicsDescriptions.length]
  } else if (category === "business" || category === "economy") {
    const economyDescriptions = [
      `${randomIntro} desafíos significativos relacionados con ${title.toLowerCase()}. Los indicadores muestran tendencias que requieren atención inmediata para evitar impactos negativos en el desarrollo productivo y el bienestar de la población.`,
      `El pulso económico del país se ve afectado por ${title.toLowerCase()}. Las variables macroeconómicas presentan señales mixtas que generan incertidumbre en los mercados y afectan las decisiones de inversión a largo plazo.`,
      `La estructura productiva enfrenta una transformación acelerada debido a ${title.toLowerCase()}. Este proceso tiene ganadores y perdedores, lo que plantea interrogantes sobre la distribución de costos y beneficios del modelo económico.`,
      `La coyuntura económica actual, caracterizada por ${title.toLowerCase()}, refleja desequilibrios estructurales que requieren soluciones innovadoras más allá de las recetas tradicionales.`,
    ]
    description += economyDescriptions[descriptionStyle % economyDescriptions.length]
  } else if (category === "technology") {
    const techDescriptions = [
      `${randomIntro} cambios disruptivos relacionados con ${title.toLowerCase()}. Esta evolución presenta tanto oportunidades como desafíos que deben ser abordados con una visión estratégica de largo plazo.`,
      `La revolución tecnológica avanza a ritmo vertiginoso con ${title.toLowerCase()} como protagonista. Este fenómeno está reconfigurando industrias enteras y transformando la forma en que interactuamos con nuestro entorno.`,
      `La frontera tecnológica se expande aceleradamente con innovaciones como ${title.toLowerCase()}. Argentina enfrenta el desafío de posicionarse estratégicamente en este nuevo escenario para no quedar rezagada.`,
      `El ecosistema tecnológico nacional experimenta transformaciones profundas a partir de ${title.toLowerCase()}. Este proceso plantea interrogantes sobre soberanía digital, formación de talento y marcos regulatorios adecuados.`,
    ]
    description += techDescriptions[descriptionStyle % descriptionStyle.length]
  } else if (category === "health") {
    const healthDescriptions = [
      `${randomIntro} retos complejos vinculados a ${title.toLowerCase()}. Las estadísticas muestran patrones que demandan respuestas efectivas del sistema de salud y políticas públicas coordinadas.`,
      `El panorama sanitario está marcado por ${title.toLowerCase()}, situación que pone a prueba las capacidades del sistema de salud y evidencia brechas estructurales en el acceso a servicios esenciales.`,
      `La salud pública enfrenta un punto de inflexión con ${title.toLowerCase()}. Este fenómeno trasciende lo meramente médico y se entrelaza con determinantes sociales, económicos y ambientales.`,
      `La situación epidemiológica relacionada con ${title.toLowerCase()} revela desigualdades persistentes en nuestro sistema sanitario que requieren un abordaje integral y centrado en las personas.`,
    ]
    description += healthDescriptions[descriptionStyle % healthDescriptions.length]
  } else if (category === "environment") {
    const environmentDescriptions = [
      `${randomIntro} desafíos urgentes relacionados con ${title.toLowerCase()}. Los datos científicos señalan tendencias preocupantes que requieren un abordaje multisectorial y compromisos firmes.`,
      `La crisis ambiental se manifiesta localmente a través de ${title.toLowerCase()}, fenómeno que no puede entenderse aisladamente sino como parte de transformaciones ecosistémicas globales.`,
      `El equilibrio ecológico se ve amenazado por ${title.toLowerCase()}, situación que pone en evidencia la tensión entre modelos productivos vigentes y la sustentabilidad a largo plazo.`,
      `La problemática ambiental vinculada a ${title.toLowerCase()} representa un punto crítico que exige repensar la relación entre desarrollo económico y preservación de bienes naturales comunes.`,
    ]
    description += environmentDescriptions[descriptionStyle % descriptionStyle.length]
  } else if (category === "provincial" || category === "municipal" || category === "local") {
    const localDescriptions = [
      `${randomIntro} impactos directos de ${title.toLowerCase()} en la calidad de vida ciudadana. Las particularidades de cada región demandan soluciones adaptadas a sus contextos específicos y necesidades concretas.`,
      `La dinámica territorial muestra que ${title.toLowerCase()} afecta de manera diferenciada a distintas comunidades, evidenciando desigualdades estructurales que requieren políticas focalizadas.`,
      `El desarrollo local enfrenta una encrucijada con ${title.toLowerCase()} como factor determinante. Las capacidades institucionales de los gobiernos subnacionales son clave para dar respuestas efectivas.`,
      `La realidad comunitaria está siendo transformada por ${title.toLowerCase()}, fenómeno que exige nuevas formas de articulación entre Estado, organizaciones sociales y sector privado a nivel territorial.`,
    ]
    description += localDescriptions[descriptionStyle % localDescriptions.length]
  } else {
    const generalDescriptions = [
      `${randomIntro} aspectos relevantes sobre ${title.toLowerCase()} que merecen atención por sus implicaciones en diversos ámbitos. Su análisis requiere considerar múltiples factores y perspectivas para comprender su verdadero alcance e impacto.`,
      `La complejidad de ${title.toLowerCase()} trasciende categorías tradicionales y exige un enfoque interdisciplinario para comprender sus múltiples dimensiones y efectos.`,
      `El fenómeno de ${title.toLowerCase()} emerge como un tema transversal que conecta diferentes esferas de la vida social, económica y cultural de nuestra sociedad.`,
      `La relevancia de ${title.toLowerCase()} radica en su capacidad para revelar tendencias profundas que están reconfigurando nuestro entorno y plantean nuevos desafíos colectivos.`,
    ]
    description += generalDescriptions[descriptionStyle % generalDescriptions.length]
  }

  return description
}

// Función para generar contexto histórico
function generateHistoricalContext(newsItem: NewsItem): string {
  const category = newsItem.category

  // Obtener eventos históricos relevantes
  const relevantEvents = getRelevantHistoricalEvents(category, 1)
  const event = relevantEvents.length > 0 ? relevantEvents[0] : null

  // Obtener estadísticas relevantes
  const relevantStats = getRelevantStatistics(category, 1)
  const stat = relevantStats.length > 0 ? relevantStats[0] : null

  // Seleccionar un estilo aleatorio para la presentación histórica
  const historyStyle = Math.floor(Math.random() * 3) // 0, 1, o 2

  // Diferentes estilos de introducción para el contexto histórico
  const historyIntros = [
    "**Precedente histórico:**\n",
    "**Lecciones de la historia:**\n",
    "**Antecedentes históricos:**\n",
    "**Perspectiva histórica:**\n",
    "**Raíces históricas:**\n",
  ]

  const randomHistoryIntro = historyIntros[Math.floor(Math.random() * historyIntros.length)]
  let historicalContext = randomHistoryIntro

  if (event) {
    if (historyStyle === 0) {
      historicalContext += `Durante el período ${event.period}, Argentina atravesó ${event.event}. ${event.description} Este episodio histórico tuvo un impacto significativo: ${event.impact} `
    } else if (historyStyle === 1) {
      historicalContext += `Si analizamos ${event.event} (${event.period}), encontramos paralelismos reveladores con la situación actual. ${event.description} Las consecuencias fueron profundas: ${event.impact} `
    } else {
      historicalContext += `La experiencia de ${event.period} con ${event.event} nos brinda claves interpretativas valiosas. ${event.description} Este proceso transformó el escenario nacional: ${event.impact} `
    }

    if (stat) {
      const statIntros = [
        `Las estadísticas muestran que ${stat.data} `,
        `Los datos históricos revelan que ${stat.data} `,
        `Las cifras de aquel período indican que ${stat.data} `,
        `Cuantitativamente, se observó que ${stat.data} `,
      ]
      historicalContext += statIntros[Math.floor(Math.random() * statIntros.length)]
    }

    const conclusions = [
      "Las lecciones de aquel momento son fundamentales para comprender los desafíos actuales y evitar repetir errores del pasado.",
      "Este precedente histórico ofrece enseñanzas valiosas que deberíamos incorporar en nuestros análisis contemporáneos.",
      "La memoria histórica de este episodio debe informar nuestras decisiones presentes para construir un futuro más próspero.",
      "Recuperar esta experiencia histórica nos permite enriquecer el debate actual con perspectiva y profundidad.",
    ]
    historicalContext += conclusions[Math.floor(Math.random() * conclusions.length)]
  } else {
    // Usar el contenido anterior como respaldo
    historicalContext += generateDefaultHistoricalContext(category)
  }

  return historicalContext
}

// Función para generar consideraciones éticas
function generateEthicalConsiderations(party: PoliticalParty, newsItem: NewsItem): string {
  // Obtener dilemas morales relevantes
  const moralDilemmas = getRelevantMoralDilemmas(newsItem.category, 1)
  const ethicalPrinciples = getRelevantEthicalPrinciples(newsItem.category, 2)

  // Seleccionar un estilo aleatorio para las consideraciones éticas
  const ethicsStyle = Math.floor(Math.random() * 3) // 0, 1, o 2

  // Diferentes estilos de introducción para las consideraciones éticas
  const ethicsIntros = [
    "**Consideraciones éticas:**\n",
    "**Dimensión ética:**\n",
    "**Reflexión moral:**\n",
    "**Análisis ético:**\n",
    "**Implicaciones éticas:**\n",
  ]

  const randomEthicsIntro = ethicsIntros[Math.floor(Math.random() * ethicsIntros.length)]
  let ethicalConsiderations = randomEthicsIntro

  if (moralDilemmas.length > 0) {
    const dilemma = moralDilemmas[0]
    const partyPosition = partyEthicalPositions[party]

    if (ethicsStyle === 0) {
      ethicalConsiderations += `Este tema plantea el dilema ético de ${dilemma.issue}: ${dilemma.description} `
    } else if (ethicsStyle === 1) {
      ethicalConsiderations += `En el centro de esta cuestión encontramos una tensión moral fundamental: ${dilemma.issue}. ${dilemma.description} `
    } else {
      ethicalConsiderations += `Desde una perspectiva ética, debemos considerar que ${dilemma.issue} representa un dilema complejo. ${dilemma.description} `
    }

    // Añadir la perspectiva del partido con variaciones
    const partyIntros = [
      `Desde nuestra perspectiva basada en ${partyPosition.principles[0]} y ${partyPosition.principles[1]}, `,
      `Considerando nuestros principios fundamentales de ${partyPosition.principles[0]} y ${partyPosition.principles[1]}, `,
      `En consonancia con nuestra tradición de valorar ${partyPosition.principles[0]} y ${partyPosition.principles[1]}, `,
      `Fieles a nuestro compromiso con ${partyPosition.principles[0]} y ${partyPosition.principles[1]}, `,
    ]

    const randomPartyIntro = partyIntros[Math.floor(Math.random() * partyIntros.length)]

    switch (party) {
      case "libertad-avanza":
        ethicalConsiderations += `${randomPartyIntro}${dilemma.perspectives.libertarian} `
        break
      case "union-patria":
        ethicalConsiderations += `${randomPartyIntro}${dilemma.perspectives.progressive} `
        break
      case "juntos-cambio":
        ethicalConsiderations += `${randomPartyIntro}${dilemma.perspectives.conservative} `
        break
      case "frente-izquierda":
        ethicalConsiderations += `${randomPartyIntro}${dilemma.perspectives.progressive} `
        break
      default:
        ethicalConsiderations += `${randomPartyIntro}${dilemma.perspectives.communitarian} `
    }
  } else if (ethicalPrinciples.length > 0) {
    const principleIntros = [
      `Este tema involucra principios éticos fundamentales como `,
      `En el análisis ético de esta cuestión, debemos considerar principios como `,
      `La dimensión moral de este asunto se relaciona con valores como `,
      `Desde una perspectiva ética, es crucial reconocer principios como `,
    ]

    ethicalConsiderations += principleIntros[Math.floor(Math.random() * principleIntros.length)]

    ethicalConsiderations += `${ethicalPrinciples[0].name} (${ethicalPrinciples[0].description}) `
    if (ethicalPrinciples.length > 1) {
      ethicalConsiderations += `y ${ethicalPrinciples[1].name} (${ethicalPrinciples[1].description}) `
    }
    ethicalConsiderations += `que deben ser considerados al formular políticas públicas en este ámbito.`
  } else {
    const fallbackIntros = [
      `Este tema requiere un análisis ético cuidadoso que considere tanto los principios fundamentales como las consecuencias prácticas de las decisiones políticas. `,
      `La complejidad ética de este asunto exige un enfoque que equilibre principios morales con resultados concretos para la sociedad. `,
      `Desde una perspectiva moral, debemos evaluar tanto las intenciones como los efectos de las políticas propuestas en esta materia. `,
      `El análisis ético de esta cuestión debe integrar consideraciones deontológicas y consecuencialistas para ser completo. `,
    ]

    ethicalConsiderations += fallbackIntros[Math.floor(Math.random() * fallbackIntros.length)]

    const frameworkIntros = [
      `El marco ético de ${partyEthicalPositions[party].framework} que guía nuestras propuestas enfatiza la importancia de ${partyEthicalPositions[party].principles[0]} y ${partyEthicalPositions[party].principles[1]}.`,
      `Nuestra visión, fundamentada en el ${partyEthicalPositions[party].framework}, prioriza valores como ${partyEthicalPositions[party].principles[0]} y ${partyEthicalPositions[party].principles[1]}.`,
    ]

    ethicalConsiderations += frameworkIntros[Math.floor(Math.random() * frameworkIntros.length)]
  }

  return ethicalConsiderations
}

// Función de respaldo que usa el contenido anterior
function generateDefaultHistoricalContext(category: string): string {
  // Mantener el código original de generateHistoricalContext como respaldo
  // (Código existente que ya estaba en el archivo)

  if (category === "politics" || category === "nacional") {
    const historicalEvents = [
      {
        period: "1955-1958",
        event: "la Revolución Libertadora y el gobierno de facto de Aramburu",
        lesson: "la importancia de la estabilidad institucional y el respeto por la voluntad popular",
      },
      {
        period: "1976-1983",
        event: "la última dictadura militar",
        lesson: "la necesidad de defender el estado de derecho y los valores democráticos",
      },
      {
        period: "1989-1990",
        event: "la hiperinflación y la crisis de gobernabilidad",
        lesson: "cómo la inestabilidad económica puede socavar las instituciones democráticas",
      },
      {
        period: "2001-2002",
        event: "la crisis del 'que se vayan todos'",
        lesson: "las consecuencias de la desconexión entre la clase política y las demandas ciudadanas",
      },
      {
        period: "2008",
        event: "el conflicto por la resolución 125 y las retenciones móviles",
        lesson: "la complejidad de articular intereses sectoriales con políticas de Estado",
      },
    ]

    const selected = historicalEvents[Math.floor(Math.random() * historicalEvents.length)]

    // Diferentes formatos para presentar el mismo contenido
    const formats = [
      `Durante ${selected.period}, Argentina atravesó una situación similar con ${selected.event}. Este episodio nos enseñó ${selected.lesson}. Las lecciones de aquel momento son fundamentales para comprender los desafíos actuales y evitar repetir errores del pasado.`,
      `El período ${selected.period} marcó a nuestra sociedad con ${selected.event}, experiencia que dejó como enseñanza ${selected.lesson}. Recuperar esta memoria histórica resulta esencial para enfrentar los retos contemporáneos con mayor sabiduría.`,
      `Si analizamos ${selected.event} (${selected.period}), encontramos una valiosa lección sobre ${selected.lesson}. Este precedente histórico ofrece claves interpretativas para abordar la coyuntura actual con perspectiva.`,
      `La experiencia histórica de ${selected.event} durante ${selected.period} nos legó aprendizajes sobre ${selected.lesson} que mantienen plena vigencia al analizar la situación presente.`,
    ]

    return formats[Math.floor(Math.random() * formats.length)]
  } else if (category === "business" || category === "economy") {
    const historicalEvents = [
      {
        period: "1952",
        event: "el Plan Económico de Emergencia implementado por Perón",
        lesson: "la importancia de equilibrar el desarrollo industrial con la estabilidad macroeconómica",
      },
      {
        period: "1975-1976",
        event: "el 'Rodrigazo' y la crisis inflacionaria",
        lesson: "los riesgos de los ajustes económicos abruptos y sus consecuencias sociales",
      },
      {
        period: "1985",
        event: "el Plan Austral y los intentos de estabilización",
        lesson: "la necesidad de combinar medidas de corto plazo con reformas estructurales",
      },
      {
        period: "1991-2001",
        event: "la Convertibilidad y su posterior colapso",
        lesson: "los límites de los modelos económicos rígidos frente a shocks externos",
      },
      {
        period: "2005-2015",
        event: "el modelo de crecimiento con inclusión social",
        lesson: "la tensión entre políticas distributivas y sustentabilidad fiscal",
      },
    ]

    const selected = historicalEvents[Math.floor(Math.random() * historicalEvents.length)]

    // Diferentes formatos para presentar el mismo contenido
    const formats = [
      `En ${selected.period}, el país enfrentó desafíos económicos similares durante ${selected.event}. Aquella experiencia demostró ${selected.lesson}. Analizar este precedente nos permite comprender mejor las dinámicas actuales y diseñar políticas más efectivas.`,
      `La historia económica argentina nos muestra que durante ${selected.period}, ${selected.event} puso a prueba la resiliencia del sistema productivo. Esta experiencia evidenció ${selected.lesson}, lección que mantiene vigencia en el contexto actual.`,
      `Si examinamos ${selected.event} durante ${selected.period}, encontramos paralelismos reveladores con la coyuntura presente. Aquel episodio dejó en claro ${selected.lesson}, aprendizaje que debería informar nuestras decisiones económicas actuales.`,
      `La experiencia de ${selected.event} durante ${selected.period} constituye un caso de estudio fundamental que ilustra ${selected.lesson}. Este antecedente histórico ofrece perspectivas valiosas para abordar los desafíos económicos contemporáneos.`,
    ]

    return formats[Math.floor(Math.random() * formats.length)]
  } else if (category === "technology") {
    const historicalEvents = [
      {
        period: "1950-1960",
        event: "la creación de la Comisión Nacional de Energía Atómica",
        lesson: "la importancia de la inversión estatal en desarrollo científico-tecnológico estratégico",
      },
      {
        period: "1970s",
        event: "el desarrollo de la industria informática nacional y las políticas proteccionistas",
        lesson: "los desafíos de desarrollar capacidades tecnológicas locales en un mundo globalizado",
      },
      {
        period: "1990s",
        event: "la privatización de empresas tecnológicas estatales",
        lesson: "el impacto de las decisiones sobre soberanía tecnológica en el desarrollo de largo plazo",
      },
      {
        period: "2003-2015",
        event: "la creación del Ministerio de Ciencia y Tecnología y el retorno de científicos",
        lesson:
          "cómo las políticas públicas pueden revertir procesos de fuga de cerebros y fortalecer capacidades locales",
      },
      {
        period: "2016-2020",
        event: "el desarrollo de la economía del conocimiento y las empresas unicornio argentinas",
        lesson: "el potencial de la innovación tecnológica como motor de desarrollo económico",
      },
    ]

    const selected = historicalEvents[Math.floor(Math.random() * historicalEvents.length)]

    // Diferentes formatos para presentar el mismo contenido
    const formats = [
      `Un precedente relevante ocurrió en ${selected.period} con ${selected.event}. Este hito histórico evidenció ${selected.lesson}. Las transformaciones tecnológicas actuales pueden comprenderse mejor a la luz de estas experiencias previas.`,
      `La historia tecnológica de nuestro país registra un momento clave con ${selected.event} (${selected.period}). Esta experiencia demostró ${selected.lesson}, enseñanza que cobra renovada relevancia en el contexto digital actual.`,
      `Si analizamos ${selected.event} durante ${selected.period}, encontramos lecciones valiosas sobre ${selected.lesson}. Este antecedente histórico ofrece perspectivas enriquecedoras para abordar los desafíos tecnológicos contemporáneos.`,
      `La experiencia de ${selected.event} (${selected.period}) constituye un caso paradigmático que ilustra ${selected.lesson}. Recuperar esta memoria tecnológica resulta fundamental para diseñar estrategias de innovación efectivas.`,
    ]

    return formats[Math.floor(Math.random() * formats.length)]
  } else if (category === "health") {
    const historicalEvents = [
      {
        period: "1946-1955",
        event: "la creación del sistema público de salud bajo la gestión de Ramón Carrillo",
        lesson: "la importancia de un enfoque integral y preventivo en las políticas sanitarias",
      },
      {
        period: "1970s",
        event: "la implementación del Programa de Atención Primaria de la Salud",
        lesson: "el valor de la descentralización y el acceso territorial a servicios básicos",
      },
      {
        period: "1980s",
        event: "la crisis del sistema sanitario durante la hiperinflación",
        lesson: "cómo la inestabilidad económica afecta directamente la calidad de los servicios esenciales",
      },
      {
        period: "1990s",
        event: "la descentralización y transferencia de hospitales a provincias y municipios",
        lesson: "los desafíos de coordinar políticas sanitarias en un sistema federal",
      },
      {
        period: "2009",
        event: "la pandemia de gripe A (H1N1) y la respuesta sanitaria",
        lesson: "la necesidad de sistemas de alerta temprana y protocolos de emergencia efectivos",
      },
    ]

    const selected = historicalEvents[Math.floor(Math.random() * historicalEvents.length)]

    // Diferentes formatos para presentar el mismo contenido
    const formats = [
      `En el ámbito sanitario, ${selected.event} durante ${selected.period} representa un antecedente significativo. Esta experiencia demostró ${selected.lesson}. Recuperar estas lecciones históricas resulta fundamental para fortalecer nuestras capacidades de respuesta actuales.`,
      `La historia de la salud pública en Argentina registra un hito importante con ${selected.event} (${selected.period}). Esta experiencia evidenció ${selected.lesson}, aprendizaje que mantiene plena vigencia al analizar los desafíos sanitarios contemporáneos.`,
      `Si examinamos ${selected.event} durante ${selected.period}, encontramos enseñanzas valiosas sobre ${selected.lesson}. Este precedente histórico ofrece claves interpretativas para diseñar políticas de salud más efectivas y equitativas.`,
      `La experiencia de ${selected.event} (${selected.period}) constituye un caso paradigmático que ilustra ${selected.lesson}. Incorporar esta memoria sanitaria en nuestros análisis actuales enriquece el debate sobre políticas públicas de salud.`,
    ]

    return formats[Math.floor(Math.random() * formats.length)]
  } else if (category === "environment") {
    const historicalEvents = [
      {
        period: "1970s",
        event: "la creación de las primeras secretarías de medio ambiente",
        lesson: "los inicios de la institucionalización de la política ambiental en Argentina",
      },
      {
        period: "1980s",
        event: "los primeros estudios sobre deforestación en el norte argentino",
        lesson: "la importancia del monitoreo científico para la conservación de ecosistemas",
      },
      {
        period: "1994",
        event: "la incorporación de derechos ambientales en la reforma constitucional",
        lesson: "el valor de los marcos normativos para la protección del ambiente",
      },
      {
        period: "2002-2007",
        event: "el conflicto por las pasteras en el Río Uruguay",
        lesson: "la complejidad de los conflictos socioambientales y la dimensión internacional de la problemática",
      },
      {
        period: "2010-2020",
        event: "la implementación de la Ley de Bosques y sus desafíos",
        lesson: "las tensiones entre conservación y desarrollo productivo en la gestión territorial",
      },
    ]

    const selected = historicalEvents[Math.floor(Math.random() * historicalEvents.length)]

    // Diferentes formatos para presentar el mismo contenido
    const formats = [
      `Un antecedente importante en materia ambiental fue ${selected.event} durante ${selected.period}. Este proceso evidenció ${selected.lesson}. Los desafíos ambientales actuales requieren incorporar estas experiencias en el diseño de políticas efectivas.`,
      `La historia ambiental de nuestro país registra un momento clave con ${selected.event} (${selected.period}). Esta experiencia demostró ${selected.lesson}, aprendizaje que cobra renovada relevancia frente a la crisis ecológica actual.`,
      `Si analizamos ${selected.event} durante ${selected.period}, encontramos lecciones valiosas sobre ${selected.lesson}. Este precedente histórico ofrece perspectivas enriquecedoras para abordar la gobernanza ambiental contemporánea.`,
      `La experiencia de ${selected.event} (${selected.period}) constituye un caso paradigmático que ilustra ${selected.lesson}. Recuperar esta memoria ecológica resulta fundamental para diseñar estrategias de sustentabilidad efectivas.`,
    ]

    return formats[Math.floor(Math.random() * formats.length)]
  } else if (category === "provincial" || category === "municipal" || category === "local") {
    const historicalEvents = [
      {
        period: "1950s",
        event: "la creación de los primeros municipios autónomos",
        lesson: "la importancia de la descentralización para atender necesidades territoriales específicas",
      },
      {
        period: "1983-1987",
        event: "la recuperación democrática a nivel local tras la dictadura",
        lesson: "el rol fundamental de los gobiernos locales en la reconstrucción institucional",
      },
      {
        period: "1990s",
        event: "la transferencia de responsabilidades a provincias y municipios sin recursos adecuados",
        lesson: "los desafíos de la descentralización sin correspondencia fiscal",
      },
      {
        period: "2001-2003",
        event: "la respuesta local a la crisis económica y social",
        lesson: "la capacidad de los gobiernos locales para implementar soluciones innovadoras en contextos adversos",
      },
      {
        period: "2010-2020",
        event: "el desarrollo de presupuestos participativos y mecanismos de participación ciudadana",
        lesson: "el valor de involucrar a la comunidad en la toma de decisiones sobre políticas públicas locales",
      },
    ]

    const selected = historicalEvents[Math.floor(Math.random() * historicalEvents.length)]

    // Diferentes formatos para presentar el mismo contenido
    const formats = [
      `A nivel territorial, ${selected.event} durante ${selected.period} constituye un precedente relevante. Esta experiencia demostró ${selected.lesson}. Las políticas locales actuales pueden enriquecerse incorporando estas lecciones históricas.`,
      `La historia del desarrollo local en Argentina registra un hito importante con ${selected.event} (${selected.period}). Esta experiencia evidenció ${selected.lesson}, aprendizaje que mantiene plena vigencia para la gestión territorial contemporánea.`,
      `Si examinamos ${selected.event} durante ${selected.period}, encontramos enseñanzas valiosas sobre ${selected.lesson}. Este antecedente histórico ofrece claves interpretativas para fortalecer las capacidades de los gobiernos subnacionales.`,
      `La experiencia de ${selected.event} (${selected.period}) constituye un caso paradigmático que ilustra ${selected.lesson}. Incorporar esta memoria institucional en nuestros análisis actuales enriquece el debate sobre federalismo y desarrollo local.`,
    ]

    return formats[Math.floor(Math.random() * formats.length)]
  } else {
    const historicalEvents = [
      {
        period: "1950-1960",
        event: "los primeros planes de desarrollo nacional",
        lesson: "la importancia de la planificación estratégica para el desarrollo sostenible",
      },
      {
        period: "1970s",
        event: "las crisis internacionales y su impacto en Argentina",
        lesson: "la vulnerabilidad del país frente a cambios en el contexto global",
      },
      {
        period: "1980s",
        event: "la transición democrática y sus desafíos",
        lesson: "la complejidad de construir instituciones sólidas tras períodos autoritarios",
      },
      {
        period: "1990s",
        event: "las reformas estructurales y la globalización",
        lesson: "los impactos sociales de las transformaciones económicas aceleradas",
      },
      {
        period: "2000-2020",
        event: "los ciclos de crisis y recuperación",
        lesson: "la necesidad de políticas anticíclicas y mecanismos de protección social",
      },
    ]

    const selected = historicalEvents[Math.floor(Math.random() * historicalEvents.length)]

    // Diferentes formatos para presentar el mismo contenido
    const formats = [
      `Un antecedente histórico significativo fue ${selected.event} durante ${selected.period}. Este proceso evidenció ${selected.lesson}. Analizar estos precedentes nos permite comprender mejor los desafíos actuales y diseñar respuestas más efectivas.`,
      `La historia reciente de nuestro país registra un momento clave con ${selected.event} (${selected.period}). Esta experiencia demostró ${selected.lesson}, aprendizaje que cobra renovada relevancia en el contexto actual.`,
      `Si examinamos ${selected.event} durante ${selected.period}, encontramos lecciones valiosas sobre ${selected.lesson}. Este precedente histórico ofrece perspectivas enriquecedoras para abordar los desafíos contemporáneos.`,
      `La experiencia de ${selected.event} (${selected.period}) constituye un caso paradigmático que ilustra ${selected.lesson}. Recuperar esta memoria colectiva resulta fundamental para diseñar políticas públicas más efectivas y sostenibles.`,
    ]

    return formats[Math.floor(Math.random() * formats.length)]
  }
}

// Función para generar una solución específica según el partido
function generatePartySpecificSolution(party: PoliticalParty, category: string): string {
  // Mantener el código original de las soluciones específicas por partido
  // (Código existente que ya estaba en el archivo)

  if (party === "libertad-avanza") {
    if (category === "politics" || category === "nacional") {
      return "proponemos una reforma integral del Estado que reduzca drásticamente su tamaño y simplifique la estructura burocrática. Esto incluye eliminar ministerios redundantes, reducir regulaciones innecesarias y devolver autonomía a las provincias. La solución no es más Estado sino más libertad para que los ciudadanos tomen sus propias decisiones sin interferencias políticas."
    } else if (category === "business" || category === "economy") {
      return "Implementaremos un programa de desregulación económica radical que elimine controles de precios, restricciones cambiarias y barreras al comercio internacional. Reduciremos impuestos para liberar recursos productivos y promoveremos un sistema monetario competitivo que termine con el monopolio estatal de la moneda. Solo la libertad económica puede generar prosperidad genuina y sostenible."
    } else if (category === "technology") {
      return "Eliminaremos todas las trabas burocráticas que obstaculizan la innovación tecnológica y abriremos el mercado a la competencia global. Proponemos un marco regulatorio mínimo que proteja derechos básicos pero que permita la experimentación y el desarrollo sin restricciones estatales. El avance tecnológico florece cuando el Estado se aparta y deja actuar a los emprendedores."
    } else if (category === "health") {
      return "Transformaremos el sistema de salud implementando un modelo basado en la libertad de elección y la competencia entre prestadores. Reemplazaremos el actual sistema burocrático por un esquema de seguros de salud donde cada individuo pueda elegir su cobertura según sus necesidades. El Estado solo debe garantizar un marco de reglas claras, no gestionar hospitales ni intervenir en decisiones médicas."
    } else if (category === "environment") {
      return "Abordaremos los desafíos ambientales a través de soluciones de mercado y derechos de propiedad bien definidos. Implementaremos un sistema donde quienes contaminen deban compensar directamente a los afectados, sin intermediación burocrática. La innovación tecnológica y el respeto a la propiedad privada son más efectivos para proteger el ambiente que las regulaciones estatales."
    } else if (category === "provincial" || category === "municipal" || category === "local") {
      return "Devolveremos autonomía plena a las comunidades locales, eliminando la dependencia de fondos nacionales y reduciendo la interferencia de niveles superiores de gobierno. Cada municipio debe poder establecer sus propias reglas y prioridades, compitiendo entre sí para ofrecer mejores servicios a menor costo. La descentralización radical es el camino hacia la eficiencia y la innovación."
    } else {
      return "Nuestra propuesta se basa en los principios fundamentales de libertad individual, respeto irrestricto a la propiedad privada y reducción del Estado a sus funciones esenciales. Frente a cualquier problema, la solución siempre implica más libertad y menos intervención estatal. Los individuos, actuando libremente en el mercado, generan soluciones más eficientes que cualquier planificación centralizada."
    }
  } else if (party === "union-patria") {
    if (category === "politics" || category === "nacional") {
      return "Implementaremos un programa de fortalecimiento institucional que recupere el rol del Estado como garante de derechos y promotor del desarrollo nacional. Esto incluye reconstruir capacidades estatales estratégicas, implementar mecanismos de participación ciudadana y fortalecer el federalismo con justicia social. La soberanía política es la base para un proyecto de país con inclusión."
    } else if (category === "business" || category === "economy") {
      return "Desarrollaremos un modelo económico que combine crecimiento con distribución del ingreso, fortaleciendo el mercado interno y protegiendo sectores estratégicos. Implementaremos políticas activas de promoción industrial, regulación de sectores concentrados y redistribución progresiva. El Estado debe orientar el desarrollo económico para que sus beneficios alcancen a las mayorías populares."
    } else if (category === "technology") {
      return "Impulsaremos un plan nacional de desarrollo tecnológico soberano, con inversión pública en áreas estratégicas y formación de recursos humanos locales. Crearemos polos tecnológicos regionales y promoveremos la transferencia de conocimientos hacia sectores productivos nacionales. La tecnología debe estar al servicio de un proyecto de desarrollo con inclusión social."
    } else if (category === "health") {
      return "Fortaleceremos el sistema público de salud garantizando acceso universal, gratuito y de calidad en todo el territorio nacional. Implementaremos un programa de inversión en infraestructura sanitaria, formación de profesionales y producción pública de medicamentos. La salud es un derecho humano fundamental que no puede quedar librado a las reglas del mercado."
    } else if (category === "environment") {
      return "Desarrollaremos una política ambiental integral que combine protección de recursos naturales con desarrollo productivo sustentable. Implementaremos un plan de transición energética justa, fortaleceremos áreas protegidas y promoveremos la participación comunitaria en la gestión territorial. La soberanía sobre nuestros recursos naturales es clave para un modelo de desarrollo sustentable."
    } else if (category === "provincial" || category === "municipal" || category === "local") {
      return "Implementaremos un programa de desarrollo territorial equilibrado con inversión en infraestructura, fortalecimiento de economías regionales y transferencia de recursos a gobiernos locales. Promoveremos la articulación entre diferentes niveles de gobierno y la participación comunitaria en la definición de prioridades. El federalismo con justicia social es esencial para un desarrollo armónico del país."
    } else {
      return "Nuestra propuesta se basa en la reconstrucción de un Estado presente que garantice derechos, promueva el desarrollo nacional y asegure la justicia social. Frente a los desafíos actuales, necesitamos recuperar herramientas de política pública que permitan construir una sociedad más justa, soberana y solidaria. El mercado debe estar al servicio del bienestar colectivo, no a la inversa."
    }
  } else if (party === "juntos-cambio") {
    if (category === "politics" || category === "nacional") {
      return "Implementaremos una reforma institucional que fortalezca la calidad democrática, la división de poderes y la transparencia gubernamental. Esto incluye modernizar el sistema electoral, profesionalizar el servicio civil y fortalecer los mecanismos de control. Las instituciones sólidas son la base para generar confianza, atraer inversiones y promover el desarrollo sostenible."
    } else if (category === "business" || category === "economy") {
      return "Desarrollaremos un programa económico que combine estabilidad macroeconómica, apertura inteligente al mundo y reglas claras para la inversión. Implementaremos una reforma fiscal integral, simplificación administrativa y políticas de promoción de exportaciones. El crecimiento económico sostenible requiere tanto mercados dinámicos como instituciones públicas eficientes."
    } else if (category === "technology") {
      return "Impulsaremos un ecosistema de innovación que integre al país en las cadenas globales de valor tecnológico. Implementaremos incentivos fiscales para empresas innovadoras, fortaleceremos la vinculación entre universidades y sector productivo, y modernizaremos el marco regulatorio. La transformación digital es clave para aumentar la productividad y generar empleo de calidad."
    } else if (category === "health") {
      return "Reformaremos el sistema sanitario implementando un modelo mixto que combine gestión pública eficiente con participación del sector privado. Desarrollaremos un sistema de información integrado, implementaremos mecanismos de evaluación de calidad y promoveremos la incorporación de tecnología. Un sistema de salud moderno requiere tanto cobertura universal como eficiencia en la gestión."
    } else if (category === "environment") {
      return "Implementaremos una política ambiental basada en estándares internacionales y mejores prácticas globales. Promoveremos la economía circular, incentivos para tecnologías limpias y mecanismos de certificación ambiental para productos exportables. El desarrollo sustentable requiere compatibilizar crecimiento económico con protección ambiental responsable."
    } else if (category === "provincial" || category === "municipal" || category === "local") {
      return "Impulsaremos un programa de modernización de gobiernos locales con profesionalización de la gestión, incorporación de tecnología y mecanismos de transparencia. Promoveremos la descentralización con responsabilidad fiscal y la cooperación público-privada para mejorar servicios municipales. Los gobiernos locales eficientes son fundamentales para mejorar la calidad de vida de los ciudadanos."
    } else {
      return "Nuestra propuesta se basa en la modernización del Estado, el fortalecimiento institucional y la inserción inteligente en el mundo. Frente a los desafíos actuales, proponemos un enfoque pragmático que combine eficiencia en la gestión pública, dinamismo del sector privado y políticas de largo plazo que trasciendan los gobiernos de turno. El verdadero progreso requiere instituciones sólidas y reglas claras."
    }
  } else if (party === "frente-izquierda") {
    if (category === "politics" || category === "nacional") {
      return "Impulsaremos una transformación radical del sistema político que termine con los privilegios de la casta política y empodere a los trabajadores y sectores populares. Proponemos mecanismos de democracia directa, revocabilidad de mandatos y que los funcionarios cobren lo mismo que un docente. Solo la organización y movilización popular puede construir una democracia real al servicio de las mayorías."
    } else if (category === "business" || category === "economy") {
      return "Implementaremos un programa económico que rompa con la lógica capitalista de explotación y saqueo. Esto incluye nacionalizar la banca y el comercio exterior, prohibir despidos y suspensiones, establecer un salario mínimo igual a la canasta familiar y expropiar a los grandes grupos económicos. La economía debe reorganizarse bajo control de los trabajadores para satisfacer necesidades sociales."
    } else if (category === "technology") {
      return "Desarrollaremos un plan de soberanía tecnológica que ponga la ciencia y la tecnología al servicio de las necesidades populares. Crearemos centros de investigación públicos con participación de trabajadores, implementaremos la reducción de la jornada laboral sin reducción salarial frente a la automatización y garantizaremos acceso universal a tecnologías esenciales. La revolución tecnológica debe beneficiar a las mayorías, no a una élite."
    } else if (category === "health") {
      return "Implementaremos un sistema único estatal de salud, gratuito y de calidad, eliminando la fragmentación actual y el negocio de las prepagas. Nacionalizaremos la industria farmacéutica, fortaleceremos la producción pública de medicamentos y garantizaremos condiciones dignas para los trabajadores de la salud. El derecho a la salud no puede estar subordinado a la lógica de ganancia capitalista."
    } else if (category === "environment") {
      return "Desarrollaremos un plan de emergencia ambiental que enfrente a las corporaciones responsables del saqueo de recursos naturales y la contaminación. Prohibiremos el fracking, la megaminería a cielo abierto y el uso de agrotóxicos, implementando un modelo productivo ecológicamente sustentable bajo control social. La crisis ambiental es consecuencia directa del sistema capitalista y su lógica depredadora."
    } else if (category === "provincial" || category === "municipal" || category === "local") {
      return "Promoveremos la autoorganización territorial mediante asambleas populares con poder de decisión real sobre los recursos y políticas públicas. Implementaremos presupuestos participativos vinculantes, control vecinal de obras públicas y municipalización de servicios esenciales. Las comunidades organizadas deben tener el poder para decidir sobre las cuestiones que afectan su vida cotidiana."
    } else {
      return "Nuestra propuesta plantea una transformación socialista de la sociedad que termine con la explotación capitalista y construya un sistema basado en la propiedad colectiva de los medios de producción. Frente a la crisis actual, no alcanza con parches o reformas superficiales: necesitamos un cambio revolucionario que ponga la economía bajo control democrático de los trabajadores y al servicio de las necesidades sociales, no del lucro privado."
    }
  } else {
    // otros
    if (category === "politics" || category === "nacional") {
      return "Implementaremos un programa de renovación política que supere la polarización extrema y construya consensos en torno a políticas de Estado. Esto incluye reformas que mejoren la representatividad, promuevan la participación ciudadana y fortalezcan la transparencia. El verdadero progreso requiere diálogo constructivo y acuerdos básicos que trasciendan los ciclos electorales."
    } else if (category === "business" || category === "economy") {
      return "Desarrollaremos un modelo económico equilibrado que combine elementos de diferentes enfoques según su efectividad comprobada. Implementaremos políticas que promuevan tanto la inversión privada como la protección social, con un Estado que establezca reglas claras y corrija fallas de mercado. Las experiencias internacionales exitosas muestran que no se trata de más o menos Estado, sino de un mejor Estado."
    } else if (category === "technology") {
      return "Impulsaremos un ecosistema de innovación que aproveche oportunidades tecnológicas con un marco ético adecuado. Promoveremos la colaboración entre sector público, privado y académico, la formación de talento local y la adopción de tecnologías que mejoren la calidad de vida. El desarrollo tecnológico debe orientarse a resolver problemas concretos de la sociedad."
    } else if (category === "health") {
      return "Reformaremos el sistema sanitario con base en evidencia científica y mejores prácticas internacionales. Fortaleceremos la atención primaria, implementaremos un sistema de información integrado y promoveremos la evaluación permanente de resultados. Las políticas de salud deben diseñarse con criterios técnicos y no ideológicos, priorizando el bienestar de los pacientes."
    } else if (category === "environment") {
      return "Implementaremos soluciones prácticas que equilibren protección ambiental y desarrollo económico. Promoveremos energías renovables, incentivos para producción limpia y educación ambiental, con participación de todos los sectores involucrados. Los desafíos ambientales requieren un enfoque pragmático basado en ciencia y cooperación internacional."
    } else if (category === "provincial" || category === "municipal" || category === "local") {
      return "Fortaleceremos las capacidades de gestión local con asistencia técnica, formación de funcionarios y mecanismos de participación ciudadana. Promoveremos soluciones adaptadas a cada contexto territorial, aprendizaje entre municipios y alianzas estratégicas con actores locales. Las comunidades necesitan gobiernos locales efectivos que respondan a sus necesidades específicas."
    } else {
      return "Nuestra propuesta se basa en un enfoque pragmático orientado a resultados concretos, más allá de dogmas ideológicos. Frente a los desafíos actuales, proponemos construir consensos amplios en torno a objetivos compartidos como el desarrollo sostenible, la inclusión social y el fortalecimiento democrático. Los problemas complejos requieren soluciones integrales y colaborativas."
    }
  }
}

// Función para extraer temas clave de las noticias
function extractKeyTopics(newsItems: NewsItem[]): string[] {
  // Mapeo de categorías a temas más descriptivos
  const categoryToTopic: Record<string, string> = {
    politics: "política nacional",
    nacional: "asuntos nacionales",
    provincial: "gestión provincial",
    municipal: "administración municipal",
    local: "desarrollo comunitario",
    business: "economía y negocios",
    economy: "política económica",
    technology: "innovación tecnológica",
    health: "sistema de salud",
    environment: "protección ambiental",
    education: "sistema educativo",
    security: "seguridad ciudadana",
  }

  // Extraer temas principales basados en categorías y palabras clave
  const mainTopics: string[] = []

  // Primero, añadir temas basados en categorías
  newsItems.forEach((item) => {
    const topic = categoryToTopic[item.category] || item.category
    if (!mainTopics.includes(topic)) {
      mainTopics.push(topic)
    }
  })

  // Luego, extraer temas específicos de los títulos
  const specificTopics = extractSpecificTopics(newsItems)

  // Combinar y limitar a 3 temas
  return [...mainTopics, ...specificTopics].slice(0, 3)
}

// Función para extraer temas específicos de los títulos
function extractSpecificTopics(newsItems: NewsItem[]): string[] {
  const specificTopics: string[] = []

  // Palabras clave que indican temas específicos
  const keywordToTopic: Record<string, string> = {
    reforma: "reformas estructurales",
    ley: "legislación",
    impuesto: "política fiscal",
    salud: "sistema sanitario",
    educación: "sistema educativo",
    seguridad: "seguridad pública",
    trabajo: "empleo y trabajo",
    economía: "situación económica",
    inflación: "control de la inflación",
    inversión: "atracción de inversiones",
    desarrollo: "desarrollo sostenible",
    infraestructura: "obras de infraestructura",
    vivienda: "acceso a la vivienda",
    transporte: "sistema de transporte",
    ambiente: "protección ambiental",
    energía: "política energética",
    tecnología: "avance tecnológico",
    digital: "transformación digital",
    social: "políticas sociales",
    jubilación: "sistema previsional",
    presupuesto: "gestión presupuestaria",
    deuda: "manejo de la deuda",
    comercio: "comercio exterior",
    exportación: "fomento de exportaciones",
    importación: "regulación de importaciones",
    campo: "sector agropecuario",
    industria: "desarrollo industrial",
    pyme: "apoyo a PyMEs",
    emprendedor: "emprendedurismo",
    innovación: "innovación productiva",
    ciencia: "investigación científica",
    cultura: "promoción cultural",
    turismo: "desarrollo turístico",
    deporte: "fomento deportivo",
    justicia: "sistema judicial",
    corrupción: "lucha contra la corrupción",
    transparencia: "transparencia gubernamental",
    participación: "participación ciudadana",
    descentralización: "descentralización administrativa",
    federal: "federalismo fiscal",
    municipal: "autonomía municipal",
    barrio: "mejoras barriales",
    comunidad: "fortalecimiento comunitario",
    vecino: "atención a vecinos",
  }

  // Buscar palabras clave en los títulos
  newsItems.forEach((item) => {
    const titleLower = item.title.toLowerCase()

    for (const [keyword, topic] of Object.entries(keywordToTopic)) {
      if (titleLower.includes(keyword) && !specificTopics.includes(topic)) {
        specificTopics.push(topic)
        break // Solo un tema por noticia para evitar redundancia
      }
    }
  })

  return specificTopics
}

// Función para seleccionar un estilo de respuesta aleatorio
function getRandomResponseStyle(): string {
  const styles = [
    "analítico", // Enfoque en análisis y datos
    "narrativo", // Enfoque en contar una historia
    "propositivo", // Enfoque en propuestas y soluciones
    "crítico", // Enfoque en crítica y contraste
    "reflexivo", // Enfoque en reflexiones y preguntas
    "dialéctico", // Enfoque en tesis, antítesis y síntesis
    "histórico", // Enfoque en evolución histórica
    "comparativo", // Enfoque en comparaciones y contrastes
    "pragmático", // Enfoque en soluciones prácticas
    "filosófico", // Enfoque en principios y valores
  ]

  return styles[Math.floor(Math.random() * styles.length)]
}

// Función para generar respuesta según el partido
function generatePartyResponse(
  party: PoliticalParty,
  topics: string[],
  isLocal: boolean,
  isNational: boolean,
  style: string,
): string {
  // Determinar el ámbito geográfico para contextualizar
  const scope = isLocal ? "local" : isNational ? "nacional" : "general"

  // Crear un contexto temático coherente
  let topicsContext = ""
  if (topics.length === 0) {
    topicsContext = "los desafíos actuales"
  } else if (topics.length === 1) {
    topicsContext = topics[0]
  } else if (topics.length === 2) {
    topicsContext = `${topics[0]} y ${topics[1]}`
  } else {
    topicsContext = `${topics[0]}, ${topics[1]} y ${topics[2]}`
  }

  // Generar respuesta según el partido político y el estilo
  switch (party) {
    case "libertad-avanza":
      if (style === "analítico") {
        return `Los recientes acontecimientos en el ámbito ${scope} revelan un patrón preocupante de intervención estatal excesiva. Al analizar ${topicsContext}, resulta evidente que las soluciones estatistas continúan fracasando.

La evidencia económica es clara: donde el Estado retrocede, la prosperidad avanza. Los indicadores muestran que las jurisdicciones con menor carga regulatoria y fiscal experimentan mayor crecimiento y generación de empleo genuino.

Desde La Libertad Avanza proponemos un enfoque radicalmente distinto: desregulación, simplificación tributaria y respeto irrestricto a la propiedad privada. Nuestros representantes deben comunicar con firmeza que solo la libertad económica puede resolver los problemas que el intervencionismo ha creado.`
      } else if (style === "narrativo") {
        return `Observamos con preocupación cómo se desarrollan los acontecimientos en nuestra comunidad. Cada día, los ciudadanos enfrentan nuevas trabas burocráticas que dificultan el emprendimiento y la creación de riqueza genuina.

Imaginen un escenario diferente: un sistema donde cada individuo pueda desarrollar su potencial sin la asfixiante presencia del Estado. Donde ${topicsContext} se aborden mediante la cooperación voluntaria y no por imposición.

El camino hacia la prosperidad requiere coraje para desmantelar estructuras obsoletas. Nuestros representantes tienen la responsabilidad histórica de defender las ideas de la libertad frente a un sistema que perpetúa la dependencia y el estancamiento.`
      } else if (style === "dialéctico") {
        return `La situación actual representa la tesis del estatismo: un sistema donde el gobierno pretende resolver todos los problemas sociales mediante regulación, impuestos y burocracia. Los resultados en ${topicsContext} demuestran el fracaso de este enfoque.

Como antítesis, proponemos un sistema basado en la libertad individual y la responsabilidad personal. Donde cada ciudadano pueda tomar sus propias decisiones sin la interferencia constante del aparato estatal.

La síntesis que buscamos es una sociedad próspera donde el Estado se limite a proteger derechos fundamentales, permitiendo que la creatividad y energía de los individuos libres genere soluciones innovadoras a los problemas colectivos.`
      } else if (style === "histórico") {
        return `La historia económica mundial demuestra que los períodos de mayor prosperidad coinciden con momentos de expansión de las libertades individuales y reducción de la intervención estatal. Desde la Revolución Industrial hasta el milagro económico de países asiáticos, la evidencia es contundente.

En Argentina, cada vez que se intentaron políticas de liberalización, como durante la década de 1990, fueron saboteadas por la persistencia de un Estado sobredimensionado y corporativo. Los problemas actuales en ${topicsContext} son consecuencia directa de décadas de dirigismo económico.

Nuestro movimiento representa una oportunidad histórica para romper definitivamente con este ciclo de decadencia y establecer un nuevo paradigma basado en la libertad económica, el respeto a la propiedad privada y la responsabilidad individual.`
      } else {
        return `La situación ${scope} actual confirma nuestra visión: el exceso de regulaciones y la asfixiante presión fiscal están sofocando el desarrollo económico. Los temas que dominan la agenda, como ${topicsContext}, son consecuencia directa de décadas de políticas estatistas.

Es imperativo implementar reformas estructurales que liberen las fuerzas productivas. Esto incluye una drástica reducción del gasto público improductivo, eliminación de regulaciones innecesarias y un sistema tributario simple que respete el derecho de propiedad.

Nuestros voceros deben articular con claridad que estas medidas no son negociables. La libertad económica es el único camino sostenible hacia la prosperidad, y estamos dispuestos a defender estos principios sin concesiones.`
      }

    case "union-patria":
      if (style === "analítico") {
        return `El análisis de la coyuntura ${scope} actual revela la necesidad urgente de fortalecer el rol del Estado como garante de derechos. Los indicadores relacionados con ${topicsContext} demuestran que el mercado por sí solo no resuelve las desigualdades estructurales.

Las estadísticas son contundentes: en los períodos de políticas públicas activas, los índices de bienestar social mejoraron significativamente. La distribución del ingreso, el acceso a servicios esenciales y la protección de sectores vulnerables requieren una presencia estatal estratégica.

Desde Unión por la Patria defendemos un modelo de desarrollo con inclusión social. Nuestros representantes deben enfatizar la importancia de políticas que fortalezcan el mercado interno, protejan la industria nacional y garanticen derechos fundamentales para todos los argentinos.`
      } else if (style === "narrativo") {
        return `La historia reciente nos muestra que cuando el Estado abandona su rol de protección, son los sectores más vulnerables quienes sufren las consecuencias. Los acontecimientos actuales relacionados con ${topicsContext} son un recordatorio de esta realidad.

Recordemos los logros alcanzados cuando implementamos políticas de inclusión y desarrollo nacional: millones de compatriotas accedieron a derechos que parecían inalcanzables. Ese es el camino que debemos retomar, adaptándolo a los desafíos del presente.

El proyecto de país que defendemos pone a las personas en el centro. Nuestros representantes tienen la misión de transmitir que la justicia social no es una consigna vacía, sino un compromiso concreto con políticas que mejoren la vida cotidiana de las mayorías populares.`
      } else if (style === "filosófico") {
        return `La concepción filosófica que guía nuestro movimiento entiende al ser humano como un sujeto de derechos cuya dignidad debe ser garantizada por el Estado. Esta visión se contrapone al individualismo que reduce a las personas a meros agentes económicos en competencia.

Los desafíos actuales en ${topicsContext} nos interpelan sobre el tipo de sociedad que queremos construir: ¿una donde prevalezca la ley del más fuerte o una comunidad organizada donde el bienestar colectivo sea prioridad?

Nuestra tradición política siempre ha respondido a esta pregunta fundamental con un compromiso inquebrantable con la justicia social, la soberanía política y la independencia económica. Estos principios, lejos de ser obsoletos, cobran renovada vigencia frente a los desafíos del siglo XXI.`
      } else if (style === "comparativo") {
        return `Si comparamos los resultados de las políticas neoliberales con los logros de los gobiernos nacional-populares, las diferencias son evidentes. Mientras que las primeras generaron concentración de la riqueza, desindustrialización y exclusión social, las segundas ampliaron derechos, fortalecieron el mercado interno y redujeron la pobreza.

En materia de ${topicsContext}, los modelos basados en el "derrame" han fracasado sistemáticamente, mientras que las políticas de desarrollo con inclusión han demostrado su efectividad tanto en Argentina como en otros países de la región.

Frente a la actual coyuntura, debemos recuperar las mejores experiencias de gestión estatal activa, adaptándolas a los nuevos desafíos globales y tecnológicos, pero sin renunciar a los principios fundamentales de justicia social y soberanía nacional.`
      } else {
        return `La situación ${scope} actual refleja las consecuencias de un modelo económico que prioriza la especulación financiera sobre el bienestar colectivo. Los temas que preocupan a la ciudadanía, como ${topicsContext}, requieren respuestas integrales desde el Estado.

Proponemos recuperar herramientas de política económica que garanticen soberanía en las decisiones estratégicas. Esto implica fortalecer la capacidad regulatoria del Estado, implementar políticas de promoción industrial y asegurar una distribución más equitativa de la riqueza.

Es fundamental que nuestros voceros comuniquen con claridad que el desarrollo nacional con justicia social es posible. Frente a quienes proponen el sálvese quien pueda, defendemos un proyecto colectivo donde el crecimiento beneficie a todos los sectores de la sociedad.`
      }

    case "juntos-cambio":
      if (style === "analítico") {
        return `Un análisis objetivo de la situación ${scope} actual revela la necesidad de fortalecer las instituciones republicanas y modernizar el Estado. Los datos relacionados con ${topicsContext} muestran que Argentina necesita reglas claras y previsibles para atraer inversiones y generar empleo de calidad.

Las experiencias internacionales exitosas demuestran que la combinación de instituciones sólidas, apertura inteligente al mundo y políticas de largo plazo son la base del desarrollo sostenible. Los indicadores económicos y sociales mejoran cuando existe seguridad jurídica y estabilidad.

Desde Juntos por el Cambio promovemos un Estado eficiente que cumpla sus funciones esenciales sin ahogar la iniciativa privada. Nuestros representantes deben enfatizar que el verdadero progreso requiere tanto mercados dinámicos como instituciones públicas transparentes y eficaces.`
      } else if (style === "narrativo") {
        return `Observamos con preocupación cómo la falta de previsibilidad y el deterioro institucional afectan el desarrollo de nuestra comunidad. Los ciudadanos enfrentan diariamente las consecuencias de políticas cortoplacistas en temas como ${topicsContext}.

Imaginemos un país donde las reglas sean claras y se respeten, donde el esfuerzo sea valorado y la educación sea prioridad. Ese es el camino que han seguido las naciones que lograron progresar de manera sostenida en las últimas décadas.

Nuestros representantes tienen la responsabilidad de transmitir que el cambio es posible, pero requiere consensos básicos y políticas de Estado que trasciendan los gobiernos. La modernización y el fortalecimiento institucional son la base para construir un futuro de oportunidades para todos.`
      } else if (style === "pragmático") {
        return `Los problemas concretos que enfrentan los ciudadanos en ${topicsContext} requieren soluciones prácticas más allá de ideologías rígidas. Necesitamos un enfoque basado en resultados que combine lo mejor de diferentes tradiciones políticas.

Proponemos medidas específicas como: simplificación administrativa para facilitar la creación de empresas, reforma educativa orientada a habilidades del siglo XXI, y modernización del Estado mediante digitalización de trámites y evaluación permanente de resultados.

Nuestro compromiso es con la eficacia y la transparencia. Cada política debe ser evaluada por sus resultados concretos en la mejora de la calidad de vida de los ciudadanos, no por su adhesión a dogmas ideológicos o intereses sectoriales.`
      } else if (style === "crítico") {
        return `El análisis crítico de la situación actual revela que tanto el populismo como el neoliberalismo extremo han fracasado en resolver los problemas estructurales de Argentina. Las consecuencias se observan claramente en ${topicsContext}.

El populismo sacrifica el futuro por el presente, generando desequilibrios macroeconómicos insostenibles. El neoliberalismo desatiende las necesidades sociales y profundiza desigualdades. Ambos modelos han demostrado sus limitaciones.

Proponemos superar esta falsa dicotomía mediante un enfoque que combine crecimiento económico con inclusión social, apertura inteligente al mundo con desarrollo productivo nacional, y libertad individual con responsabilidad colectiva. El verdadero cambio requiere integrar lo mejor de diferentes tradiciones políticas.`
      } else {
        return `La coyuntura ${scope} actual refleja la urgencia de implementar reformas estructurales que modernicen el Estado y fortalezcan nuestras instituciones. Los desafíos relacionados con ${topicsContext} requieren soluciones basadas en el diálogo y la búsqueda de consensos.

Proponemos un programa de gobierno centrado en la eficiencia del sector público, la seguridad jurídica y la inserción inteligente en el mundo. Esto incluye simplificación administrativa, digitalización de procesos y profesionalización del servicio civil.

Es fundamental que nuestros voceros comuniquen con claridad que el progreso requiere tanto un sector privado dinámico como un Estado que cumpla eficientemente sus funciones esenciales. El verdadero cambio implica construir instituciones sólidas que garanticen previsibilidad y confianza.`
      }

    case "frente-izquierda":
      if (style === "analítico") {
        return `El análisis de clase de la situación ${scope} actual revela las contradicciones del sistema capitalista. Los datos sobre ${topicsContext} demuestran cómo la concentración de la riqueza profundiza la explotación de los trabajadores y la degradación ambiental.

Las estadísticas son contundentes: mientras las ganancias empresariales aumentan, los salarios reales se deterioran y las condiciones laborales empeoran. Este no es un fenómeno aislado sino la lógica inherente de un sistema basado en la maximización de beneficios para una minoría.

Desde el Frente de Izquierda planteamos la necesidad de una reorganización económica bajo control de los trabajadores. Nuestros representantes deben denunciar con firmeza que las crisis recurrentes solo pueden superarse mediante una transformación radical de las relaciones de producción.`
      } else if (style === "narrativo") {
        return `La realidad cotidiana de los barrios obreros y populares contrasta dramáticamente con los discursos oficiales sobre recuperación económica. Los trabajadores enfrentan diariamente las consecuencias de un sistema que prioriza las ganancias sobre las necesidades humanas en temas como ${topicsContext}.

La historia de las luchas populares nos enseña que los derechos nunca se conquistaron esperando concesiones desde arriba, sino mediante la organización y movilización de los sectores oprimidos. Ese legado de resistencia debe inspirarnos frente a la actual ofensiva capitalista.

Nuestros militantes tienen la tarea de impulsar la autoorganización en cada lugar de trabajo y estudio. Solo la acción colectiva de la clase trabajadora puede construir una alternativa real frente a un sistema que solo ofrece más ajuste, precarización y saqueo de los recursos naturales.`
      } else if (style === "dialéctico") {
        return `La realidad actual representa la tesis del capitalismo: un sistema donde una minoría propietaria de los medios de producción explota a la mayoría trabajadora. Las contradicciones en ${topicsContext} son manifestaciones de este antagonismo fundamental.

Como antítesis, surge la resistencia organizada de los trabajadores y sectores populares, que a través de sus luchas cuestionan la legitimidad del orden establecido y plantean la necesidad de un sistema alternativo.

La síntesis que proponemos es el socialismo: una sociedad donde los medios de producción estén bajo control democrático de los trabajadores y la producción se oriente a satisfacer necesidades sociales, no a generar ganancias privadas. Esta transformación solo puede realizarse mediante la movilización revolucionaria de las mayorías explotadas.`
      } else if (style === "histórico") {
        return `La historia de la lucha de clases nos muestra que cada sistema económico lleva en su seno las contradicciones que eventualmente conducen a su superación. El capitalismo no es la excepción, como evidencian las crisis cada vez más profundas en ${topicsContext}.

Desde la Comuna de París hasta las revoluciones del siglo XX, los trabajadores han demostrado su capacidad para tomar el control de la sociedad y reorganizarla sobre nuevas bases. Estas experiencias, con sus logros y limitaciones, constituyen un valioso legado para las luchas actuales.

Nuestro movimiento se inscribe en esta tradición revolucionaria, adaptándola a las condiciones del capitalismo contemporáneo. La tarea histórica sigue siendo la misma: organizar a la clase trabajadora para que tome en sus manos su propio destino y el de toda la sociedad.`
      } else {
        return `La situación ${scope} actual expone la bancarrota de un sistema económico que solo beneficia a los grandes capitalistas. Los problemas que afectan a la mayoría trabajadora, como ${topicsContext}, son consecuencia directa de la lógica de acumulación capitalista.

Frente a quienes proponen parches a un sistema en crisis, planteamos un programa de transición que incluye: nacionalización de los sectores estratégicos bajo control obrero, prohibición de despidos y suspensiones, reparto de las horas de trabajo sin reducción salarial, y un plan de obras públicas para resolver las necesidades populares.

Es fundamental que nuestros voceros denuncien con claridad que no hay salida dentro de los límites del capitalismo. La única alternativa real es la lucha por un gobierno de trabajadores que avance hacia una sociedad donde la producción se oriente a satisfacer necesidades sociales y no a generar ganancias privadas.`
      }

    default: // otros
      if (style === "analítico") {
        return `Un análisis objetivo de la situación ${scope} actual revela la necesidad de buscar soluciones pragmáticas más allá de las divisiones ideológicas tradicionales. Los datos sobre ${topicsContext} muestran que los problemas complejos requieren enfoques integrales.

La evidencia internacional sugiere que las experiencias más exitosas combinan elementos de diferentes modelos: mercados eficientes, instituciones sólidas y políticas sociales activas. No se trata de más o menos Estado, sino de un mejor Estado en alianza con un sector privado responsable.

Proponemos un enfoque basado en resultados concretos y no en dogmas ideológicos. Nuestros representantes deben comunicar que es posible construir consensos amplios en torno a objetivos compartidos como el desarrollo sostenible, la inclusión social y el fortalecimiento democrático.`
      } else if (style === "narrativo") {
        return `Los acontecimientos recientes en nuestra comunidad reflejan tanto desafíos como oportunidades. Ciudadanos de diversos sectores comparten preocupaciones similares sobre temas como ${topicsContext}, más allá de sus preferencias políticas.

Existen experiencias inspiradoras donde el diálogo constructivo permitió superar divisiones y construir soluciones conjuntas. Nuestros representantes deben promover estos espacios de encuentro y escucha activa.

El futuro de nuestra sociedad depende de nuestra capacidad para trabajar juntos en la búsqueda del bien común. Necesitamos líderes que prioricen el diálogo, la transparencia y la rendición de cuentas.`
      } else if (style === "pragmático") {
        return `Los problemas concretos que enfrentan los ciudadanos en ${topicsContext} requieren soluciones prácticas más allá de ideologías rígidas. Necesitamos un enfoque basado en resultados que combine lo mejor de diferentes tradiciones políticas.

Proponemos medidas específicas como: simplificación administrativa para facilitar la creación de empresas, reforma educativa orientada a habilidades del siglo XXI, y modernización del Estado mediante digitalización de trámites y evaluación permanente de resultados.

Nuestro compromiso es con la eficacia y la transparencia. Cada política debe ser evaluada por sus resultados concretos en la mejora de la calidad de vida de los ciudadanos, no por su adhesión a dogmas ideológicos o intereses sectoriales.`
      } else if (style === "crítico") {
        return `El análisis crítico de la situación actual revela que tanto el populismo como el neoliberalismo extremo han fracasado en resolver los problemas estructurales de Argentina. Las consecuencias se observan claramente en ${topicsContext}.

El populismo sacrifica el futuro por el presente, generando desequilibrios macroeconómicos insostenibles. El neoliberalismo desatiende las necesidades sociales y profundiza desigualdades. Ambos modelos han demostrado sus limitaciones.

Proponemos superar esta falsa dicotomía mediante un enfoque que combine crecimiento económico con inclusión social, apertura inteligente al mundo con desarrollo productivo nacional, y libertad individual con responsabilidad colectiva. El verdadero cambio requiere integrar lo mejor de diferentes tradiciones políticas.`
      } else {
        return `La coyuntura ${scope} actual refleja la urgencia de implementar reformas estructurales que modernicen el Estado y fortalezcan nuestras instituciones. Los desafíos relacionados con ${topicsContext} requieren soluciones basadas en el diálogo y la búsqueda de consensos.

Proponemos un programa de gobierno centrado en la eficiencia del sector público, la seguridad jurídica y la inserción inteligente en el mundo. Esto incluye simplificación administrativa, digitalización de procesos y profesionalización del servicio civil.

Es fundamental que nuestros voceros comuniquen con claridad que el progreso requiere tanto un sector privado dinámico como un Estado que cumpla eficientemente sus funciones esenciales. El verdadero cambio implica construir instituciones sólidas que garanticen previsibilidad y confianza.`
      }
  }
}

export { adaptNewsForParty }
