"use server"

import type { NewsItem, PoliticalParty } from "./types"
import { analyzePoliticalContext, getCommunicationRecommendations } from "./political-context-analyzer"
import { getAnthropicKey } from "./api-key-action"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// Función para generar respuesta con Anthropic
export async function generateAnthropicResponse(prompt: string): Promise<{ content: string; error?: string }> {
  try {
    // Intentar obtener la clave API de Anthropic del servidor
    let apiKey: string | null = null

    try {
      apiKey = await getAnthropicKey()
    } catch (error) {
      console.warn("Error al obtener la clave API de Anthropic del servidor:", error)
    }

    // Si no hay clave API en el servidor, intentar obtenerla del localStorage en el cliente
    if (!apiKey && typeof window !== "undefined") {
      apiKey = localStorage.getItem("anthropic_api_key")
    }

    if (!apiKey) {
      return {
        content: "",
        error: "No se ha configurado la clave API de Anthropic",
      }
    }

    const response = await generateText({
      model: anthropic("claude-3-haiku-20240307"),
      apiKey,
      prompt,
    })

    return {
      content: response.text,
    }
  } catch (error) {
    console.error("Error al generar respuesta con Anthropic:", error)

    // Check if it's a quota exceeded error
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("quota") || errorMessage.includes("exceeded") || errorMessage.includes("billing")) {
      if (typeof window !== "undefined") {
        localStorage.setItem("anthropic_quota_exceeded", "true")
      }
      return {
        content: "",
        error: "QUOTA_EXCEEDED: Se ha excedido la cuota de Anthropic. Verifique su plan y detalles de facturación.",
      }
    }

    return {
      content: "",
      error: `Error al generar respuesta con Anthropic: ${errorMessage}`,
    }
  }
}

// Función para generar mensaje adaptado - EXPORT REQUERIDO
export async function generateAdaptedMessage(
  newsItems: NewsItem[],
  party: PoliticalParty,
  apiKey?: string | null,
): Promise<string> {
  try {
    const result = await adaptNewsForParty(newsItems, party, apiKey)
    return result.generalMessage
  } catch (error) {
    console.error("Error al generar mensaje adaptado:", error)
    return generateMockContent(party, newsItems)
  }
}

// Función para generar contenido simulado cuando no hay clave API
function generateMockContent(party: PoliticalParty, newsItems: NewsItem[]): string {
  // Analizar la coyuntura política actual
  const politicalContext = analyzePoliticalContext(newsItems)

  // Obtener recomendaciones de comunicación específicas para el partido
  const recommendations = getCommunicationRecommendations(party, politicalContext)

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
  return generatePartyResponse(party, topics, isMainlyLocal, isMainlyNational, responseStyle, recommendations)
}

// Función para generar opiniones específicas sobre cada noticia
function generateMockTopicOpinions(party: PoliticalParty, newsItems: NewsItem[]): Record<string, string> {
  // Analizar la coyuntura política actual
  const politicalContext = analyzePoliticalContext(newsItems)

  // Obtener recomendaciones de comunicación específicas para el partido
  const recommendations = getCommunicationRecommendations(party, politicalContext)

  const opinions: Record<string, string> = {}

  newsItems.forEach((item, index) => {
    // Generar un identificador único para cada noticia
    const newsId = `news-${index}`

    // Generar opinión según el partido y la categoría de la noticia
    opinions[newsId] = generateTopicOpinion(party, item, recommendations)
  })

  return opinions
}

// Función para generar una opinión específica sobre una noticia con contexto histórico
function generateTopicOpinion(
  party: PoliticalParty,
  newsItem: NewsItem,
  recommendations: ReturnType<typeof getCommunicationRecommendations>,
): string {
  // Verificar si el tema debe ser evitado o reencuadrado
  const shouldReframe = recommendations.reframe.some((topic) =>
    newsItem.title.toLowerCase().includes(topic.toLowerCase()),
  )

  const shouldAvoid = recommendations.avoid.some((topic) => newsItem.title.toLowerCase().includes(topic.toLowerCase()))

  // Seleccionar un formato aleatorio para la respuesta
  const formatStyle = Math.floor(Math.random() * 3) // 0, 1, o 2

  // Generar componentes de la respuesta
  const briefDescription = generateBriefDescription(newsItem, party, shouldReframe)
  const historicalContext = generateHistoricalContext(newsItem, party)
  const ethicalConsiderations = generateEthicalConsiderations(party, newsItem)
  const partySolution = generatePartySolution(party, newsItem, recommendations)

  // Si es un tema a evitar, minimizar su importancia y reencuadrarlo positivamente
  if (shouldAvoid) {
    return `Si bien algunos medios mencionan ${newsItem.title}, es importante destacar que ${getPositiveReframing(party, newsItem)}. ${partySolution}`
  }

  // Si es un tema a reencuadrar, presentarlo desde la perspectiva favorable al partido
  if (shouldReframe) {
    return `Respecto a ${newsItem.title}, desde nuestra perspectiva ${getPartyPerspective(party, newsItem)}. ${historicalContext}\n\n${partySolution}`
  }

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

// Función para generar una descripción breve favorable al partido
function generateBriefDescription(newsItem: NewsItem, party: PoliticalParty, shouldReframe: boolean): string {
  // Si es un tema a reencuadrar, presentarlo desde una perspectiva favorable
  if (shouldReframe) {
    return "**Contexto actual:**\n" + getPartyPerspective(party, newsItem)
  }

  // Generar descripción estándar con enfoque favorable al partido
  const partyPerspective = getPartyPerspective(party, newsItem)
  return (
    "**Contexto actual:**\nAnálisis de la situación actual relacionada con " + newsItem.title + ". " + partyPerspective
  )
}

// Función para obtener la perspectiva del partido sobre una noticia
function getPartyPerspective(party: PoliticalParty, newsItem: NewsItem): string {
  switch (party) {
    case "libertad-avanza":
      return `Este tema refleja la necesidad de más libertad económica y menos intervención estatal. La solución pasa por desregular y permitir que el mercado funcione eficientemente.`

    case "union-patria":
      return `Este tema demuestra la importancia de un Estado presente que garantice derechos y proteja a los sectores más vulnerables frente a los intereses económicos concentrados.`

    case "juntos-cambio":
      return `Este tema requiere un enfoque institucional serio, con políticas de Estado consensuadas y una gestión eficiente que equilibre desarrollo económico y bienestar social.`

    case "frente-izquierda":
      return `Este tema evidencia las contradicciones del sistema capitalista y la necesidad de una transformación profunda que ponga los intereses de los trabajadores por encima de las ganancias empresariales.`

    default:
      return `Este tema necesita un abordaje equilibrado, basado en evidencia y diálogo entre los diferentes sectores, superando la polarización improductiva.`
  }
}

// Función para reencuadrar positivamente un tema desfavorable
function getPositiveReframing(party: PoliticalParty, newsItem: NewsItem): string {
  switch (party) {
    case "libertad-avanza":
      return `lo verdaderamente importante es avanzar en las reformas estructurales que garanticen la libertad económica y reduzcan el peso del Estado`

    case "union-patria":
      return `lo fundamental es defender los derechos conquistados y promover un modelo de desarrollo con inclusión social`

    case "juntos-cambio":
      return `lo esencial es fortalecer las instituciones democráticas y generar políticas de Estado basadas en el consenso`

    case "frente-izquierda":
      return `lo crucial es organizar a los trabajadores para defender sus derechos frente al avance de las políticas de ajuste`

    default:
      return `lo importante es buscar soluciones pragmáticas basadas en evidencia y en el diálogo entre los diferentes sectores`
  }
}

function generateHistoricalContext(newsItem: NewsItem, party: PoliticalParty): string {
  // Generar contexto histórico relevante según el partido
  const partyHistoricalPerspective = {
    "libertad-avanza":
      "La historia argentina demuestra que las épocas de mayor prosperidad coincidieron con políticas de libre mercado y menor intervención estatal.",
    "union-patria":
      "La experiencia histórica argentina muestra que los períodos de mayor inclusión social se lograron con un Estado presente y políticas redistributivas.",
    "juntos-cambio":
      "Los antecedentes históricos indican que las transformaciones duraderas requieren consensos amplios y fortalecimiento institucional.",
    "frente-izquierda":
      "La historia de las luchas populares en Argentina demuestra que los derechos se conquistan con organización y movilización de los trabajadores.",
  }

  return (
    "**Precedente histórico:**\n" +
    (partyHistoricalPerspective[party] ||
      "Los antecedentes históricos muestran la importancia del diálogo y las políticas consensuadas.") +
    ` En el contexto de ${newsItem.category}, es fundamental aprender de experiencias pasadas para construir soluciones efectivas.`
  )
}

function generateEthicalConsiderations(party: PoliticalParty, newsItem: NewsItem): string {
  const ethicalFrameworks = {
    "libertad-avanza":
      "Desde una perspectiva ética basada en la libertad individual y la responsabilidad personal, es fundamental respetar los derechos de propiedad y la autonomía de las personas.",
    "union-patria":
      "Desde una ética de la justicia social y la solidaridad, es imperativo garantizar que las políticas protejan a los más vulnerables y promuevan la igualdad de oportunidades.",
    "juntos-cambio":
      "Desde una ética institucional y republicana, es esencial que las decisiones se tomen con transparencia, respetando el estado de derecho y los procedimientos democráticos.",
    "frente-izquierda":
      "Desde una ética de clase y transformación social, es necesario priorizar los intereses de los trabajadores y cuestionar las estructuras de poder existentes.",
  }

  return (
    "**Consideraciones éticas:**\n" +
    (ethicalFrameworks[party] ||
      "Desde una perspectiva ética equilibrada, es importante considerar el impacto de las decisiones en todos los sectores de la sociedad.") +
    ` En relación a ${newsItem.category}, esto implica evaluar cuidadosamente las consecuencias de cada propuesta.`
  )
}

function generatePartySolution(
  party: PoliticalParty,
  newsItem: NewsItem,
  recommendations: ReturnType<typeof getCommunicationRecommendations>,
): string {
  // Incorporar palabras clave recomendadas
  const keywords = recommendations.keywords
  const randomKeywords = keywords.sort(() => 0.5 - Math.random()).slice(0, 3)

  // Usar el tono recomendado
  const tone = recommendations.tone

  switch (party) {
    case "libertad-avanza":
      return `**Nuestra propuesta:**\nDesde La Libertad Avanza proponemos ${randomKeywords[0]} y ${randomKeywords[1]} para resolver esta situación. Es fundamental avanzar en la ${randomKeywords[2]} para garantizar el desarrollo económico y la prosperidad de todos los argentinos. Con un enfoque ${tone}, trabajaremos para eliminar las trabas que impiden el crecimiento y la generación de empleo genuino.`

    case "union-patria":
      return `**Nuestra propuesta:**\nDesde Unión por la Patria defendemos la ${randomKeywords[0]} y la ${randomKeywords[1]} como pilares fundamentales para abordar esta problemática. Es necesario fortalecer el ${randomKeywords[2]} para proteger a los sectores más vulnerables. Con un tono ${tone}, seguiremos trabajando por un modelo de país con justicia social e inclusión.`

    case "juntos-cambio":
      return `**Nuestra propuesta:**\nDesde Juntos por el Cambio impulsamos la ${randomKeywords[0]} y el ${randomKeywords[1]} como ejes de nuestra propuesta. Promovemos la ${randomKeywords[2]} para construir un país con instituciones sólidas y desarrollo sustentable. Con un enfoque ${tone}, buscamos generar consensos amplios que permitan políticas de Estado a largo plazo.`

    case "frente-izquierda":
      return `**Nuestra propuesta:**\nDesde el Frente de Izquierda planteamos la ${randomKeywords[0]} y la ${randomKeywords[1]} como respuestas a esta situación. Defendemos la ${randomKeywords[2]} frente al avance de las políticas de ajuste. Con un tono ${tone}, llamamos a la organización y movilización para defender los derechos de los trabajadores y transformar la realidad.`

    default:
      return `**Nuestra propuesta:**\nProponemos un enfoque basado en la ${randomKeywords[0]} y el ${randomKeywords[1]}, buscando soluciones concretas a los problemas de la gente. Es importante promover la ${randomKeywords[2]} para construir un futuro mejor para todos. Con un tono ${tone}, trabajamos por acuerdos amplios que superen la polarización y generen resultados tangibles.`
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

  // Extraer temas principales basados en categorías
  const mainTopics: string[] = []
  newsItems.forEach((item) => {
    const topic = categoryToTopic[item.category] || item.category
    if (!mainTopics.includes(topic)) {
      mainTopics.push(topic)
    }
  })

  // Extraer temas específicos de los títulos
  const specificTopics = extractSpecificTopics(newsItems)

  // Combinar y limitar a 3 temas
  return [...mainTopics, ...specificTopics].slice(0, 3)
}

// Función para extraer temas específicos de los títulos
function extractSpecificTopics(newsItems: NewsItem[]): string[] {
  // Palabras clave relevantes para identificar temas
  const keywordPatterns = [
    /\b(inflación|precios|dólar|devaluación|economía|ajuste|déficit)\b/i,
    /\b(ley|reforma|proyecto|legislación|congreso|diputados|senadores)\b/i,
    /\b(salud|educación|vivienda|transporte|servicios)\b/i,
    /\b(seguridad|delito|crimen|policía|justicia)\b/i,
    /\b(trabajo|empleo|salarios|despidos|sindicatos)\b/i,
    /\b(impuestos|tarifas|subsidios|gasto público)\b/i,
    /\b(protestas|manifestaciones|movilizaciones|paro|huelga)\b/i,
    /\b(corrupción|transparencia|ética|funcionarios)\b/i,
    /\b(internacional|exterior|relaciones|acuerdo|tratado)\b/i,
    /\b(ambiente|clima|energía|recursos|contaminación)\b/i,
  ]

  // Extraer temas específicos
  const specificTopics: string[] = []

  newsItems.forEach((item) => {
    keywordPatterns.forEach((pattern) => {
      const match = item.title.match(pattern)
      if (match && match[0]) {
        const topic = match[0].toLowerCase()
        if (!specificTopics.includes(topic)) {
          specificTopics.push(topic)
        }
      }
    })
  })

  return specificTopics
}

// Función para seleccionar un estilo de respuesta aleatorio
function getRandomResponseStyle(): string {
  const styles = [
    "analítico",
    "narrativo",
    "propositivo",
    "crítico",
    "reflexivo",
    "dialéctico",
    "histórico",
    "comparativo",
    "pragmático",
    "filosófico",
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
  recommendations: ReturnType<typeof getCommunicationRecommendations>,
): string {
  // Incorporar recomendaciones específicas para el partido
  const emphasize = recommendations.emphasize.join(", ")
  const tone = recommendations.tone
  const keywords = recommendations.keywords
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .join(", ")

  // Generar respuesta adaptada al partido y contexto
  switch (party) {
    case "libertad-avanza":
      return `En un tono ${tone} y con un estilo ${style}, analizamos la situación actual relacionada con ${topics.join(", ")}. 

Desde La Libertad Avanza, enfatizamos ${emphasize}. Nuestra visión se basa en los principios de libertad económica, reducción del Estado y respeto irrestricto a la propiedad privada.

Los problemas que enfrenta Argentina son consecuencia de décadas de intervencionismo estatal, gasto público descontrolado y políticas que atentan contra la libertad individual. La solución pasa por ${keywords}.

Es momento de romper con el status quo y avanzar hacia un país donde los individuos puedan desarrollarse plenamente sin la opresión de un Estado omnipresente. Las ideas de la libertad son el único camino hacia la prosperidad.`

    case "union-patria":
      return `Con un tono ${tone} y un estilo ${style}, analizamos la coyuntura actual en relación a ${topics.join(", ")}.

Desde Unión por la Patria, destacamos ${emphasize}. Nuestra visión se fundamenta en la justicia social, la soberanía política y la independencia económica.

Los desafíos que enfrenta nuestro pueblo son resultado de políticas de ajuste que benefician a los sectores concentrados de la economía en detrimento de las mayorías populares. Proponemos ${keywords}.

Es hora de recuperar un proyecto nacional que ponga en el centro a los trabajadores, jubilados y sectores vulnerables. Solo con un Estado presente y políticas de inclusión podremos construir una patria justa, libre y soberana.`

    case "juntos-cambio":
      return `Con un enfoque ${tone} y un estilo ${style}, analizamos la situación actual en torno a ${topics.join(", ")}.

Desde Juntos por el Cambio, priorizamos ${emphasize}. Nuestra visión se basa en el fortalecimiento institucional, la modernización del Estado y el desarrollo sustentable.

Los problemas que enfrenta Argentina requieren soluciones serias, responsables y consensuadas que superen la improvisación y el cortoplacismo. Impulsamos ${keywords}.

Es momento de construir políticas de Estado que trasciendan las gestiones de gobierno y generen previsibilidad. Con diálogo, gestión eficiente y respeto institucional podemos encaminar al país hacia un desarrollo integral y sostenido.`

    case "frente-izquierda":
      return `Con un tono ${tone} y un estilo ${style}, analizamos la realidad actual en relación a ${topics.join(", ")}.

Desde el Frente de Izquierda, denunciamos ${emphasize}. Nuestra perspectiva se fundamenta en la defensa incondicional de los intereses de la clase trabajadora y los sectores populares.

La crisis que atraviesa el país es producto del sistema capitalista y sus políticas de ajuste que descargan el peso de la crisis sobre los trabajadores mientras se garantizan las ganancias empresariales. Luchamos por ${keywords}.

Es necesario construir una alternativa política de los trabajadores y la izquierda que enfrente el ajuste y proponga una reorganización completa de la sociedad sobre nuevas bases sociales, donde la economía esté al servicio de las necesidades populares y no de la ganancia capitalista.`

    default:
      return `Con un enfoque ${tone} y un estilo ${style}, analizamos la situación actual respecto a ${topics.join(", ")}.

Destacamos la importancia de ${emphasize}. Nuestra visión se basa en el pragmatismo, el diálogo y la búsqueda de soluciones concretas a los problemas de la gente.

Los desafíos que enfrenta Argentina requieren superar la polarización y construir acuerdos amplios que permitan políticas sustentables en el tiempo. Proponemos ${keywords}.

Es tiempo de dejar atrás las falsas antinomias y trabajar en propuestas serias, basadas en evidencia y orientadas a resultados. Solo con diálogo, responsabilidad y visión de futuro podremos construir un país con oportunidades para todos.`
  }
}

export async function adaptNewsForParty(
  newsItems: NewsItem[],
  party: PoliticalParty,
  apiKey?: string | null,
): Promise<{ generalMessage: string; topicOpinions: Record<string, string> }> {
  // Analizar la coyuntura política actual
  const politicalContext = analyzePoliticalContext(newsItems)

  // Obtener recomendaciones de comunicación específicas para el partido
  const recommendations = getCommunicationRecommendations(party, politicalContext)

  // Intentar obtener la clave API de Anthropic del servidor
  let anthropicApiKey = apiKey

  if (!anthropicApiKey) {
    try {
      anthropicApiKey = await getAnthropicKey()
    } catch (error) {
      console.warn("Error al obtener la clave API de Anthropic del servidor:", error)
    }
  }

  // Si no hay clave API en el servidor, intentar obtenerla del localStorage en el cliente
  if (!anthropicApiKey && typeof window !== "undefined") {
    anthropicApiKey = localStorage.getItem("anthropic_api_key")
  }

  if (!anthropicApiKey) {
    console.warn("No Anthropic API key provided, using mock content.")
    const generalMessage = generateMockContent(party, newsItems)
    const topicOpinions = generateMockTopicOpinions(party, newsItems)
    return { generalMessage, topicOpinions }
  }

  try {
    const partyName =
      party === "libertad-avanza"
        ? "La Libertad Avanza"
        : party === "union-patria"
          ? "Unión por la Patria"
          : party === "juntos-cambio"
            ? "Juntos por el Cambio"
            : party === "frente-izquierda"
              ? "Frente de Izquierda"
              : "Otros Partidos"

    // Incorporar el análisis de coyuntura y recomendaciones en el prompt
    const generalPrompt = `
Como un estratega de comunicación política experto, analiza las siguientes noticias y genera un mensaje general conciso y persuasivo, adaptado a la ideología y los valores del partido político ${partyName}.

Noticias:
${newsItems.map((item) => `- ${item.title} (${item.source}): ${item.summary}`).join("\n")}

ANÁLISIS DE COYUNTURA POLÍTICA:
- Temas principales: ${politicalContext.mainTopics.join(", ")}
- Actores clave: ${politicalContext.keyActors.join(", ")}
- Temas controversiales: ${politicalContext.controversialTopics.join(", ")}

RECOMENDACIONES ESPECÍFICAS PARA ${partyName.toUpperCase()}:
- Temas a enfatizar: ${recommendations.emphasize.join(", ")}
- Temas a evitar o reencuadrar: ${recommendations.avoid.join(", ")}
- Tono recomendado: ${recommendations.tone}
- Palabras clave a utilizar: ${recommendations.keywords.join(", ")}

Considera los siguientes aspectos al generar el mensaje:
* Identifica los temas clave que son relevantes para el partido.
* Utiliza un lenguaje que resuene con la base electoral del partido.
* Destaca las soluciones y propuestas del partido para abordar los problemas mencionados en las noticias.
* Mantén un tono positivo y optimista, transmitiendo confianza en el futuro.
* Incluye un llamado a la acción, invitando a los ciudadanos a unirse al partido y apoyar sus propuestas.
* IMPORTANTE: Presenta CADA mención y objeto de comunicación de manera FAVORABLE según la ideología del partido.
* Si hay temas desfavorables para el partido, reencuádralos de manera positiva o minimiza su importancia.

El mensaje debe ser breve (máximo 200 palabras) y estar listo para ser utilizado en redes sociales, discursos públicos o comunicados de prensa.
`

    try {
      const generalResponse = await generateAnthropicResponse(generalPrompt)

      if (generalResponse.error) {
        throw new Error(generalResponse.error)
      }

      const topicOpinions: Record<string, string> = {}

      for (let i = 0; i < Math.min(newsItems.length, 5); i++) {
        const newsItem = newsItems[i]

        // Verificar si el tema debe ser evitado o reencuadrado
        const shouldReframe = recommendations.reframe.some((topic) =>
          newsItem.title.toLowerCase().includes(topic.toLowerCase()),
        )

        const shouldAvoid = recommendations.avoid.some((topic) =>
          newsItem.title.toLowerCase().includes(topic.toLowerCase()),
        )

        // Adaptar el prompt según si el tema debe ser evitado, reencuadrado o enfatizado
        let topicPromptStrategy = ""
        if (shouldAvoid) {
          topicPromptStrategy = `IMPORTANTE: Este es un tema DESFAVORABLE para el partido. Minimiza su importancia y reencuádralo de manera positiva. Enfoca la respuesta en otros aspectos que sean favorables para el partido.`
        } else if (shouldReframe) {
          topicPromptStrategy = `IMPORTANTE: Este es un tema CONTROVERSIAL que debe ser REENCUADRADO. Presenta la noticia desde una perspectiva favorable al partido, destacando aspectos que se alineen con su ideología.`
        } else {
          topicPromptStrategy = `IMPORTANTE: Este es un tema que puede ser FAVORABLE para el partido. Enfatiza los aspectos que se alinean con la ideología del partido y presenta una posición clara y contundente.`
        }

        const topicPrompt = `
Como un estratega de comunicación política experto, genera una opinión concisa y persuasiva sobre el siguiente tema de actualidad, adaptada a la ideología y los valores del partido político ${partyName}.

Noticia: ${newsItem.title}
Resumen: ${newsItem.summary}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}

${topicPromptStrategy}

RECOMENDACIONES ESPECÍFICAS PARA ${partyName.toUpperCase()}:
- Tono recomendado: ${recommendations.tone}
- Palabras clave a utilizar: ${recommendations.keywords.join(", ")}

Considera los siguientes aspectos al generar la opinión:
* Establece una posición clara y contundente sobre el tema.
* Proporciona argumentos persuasivos basados en los valores del partido.
* Anticipa y refuta posibles contraargumentos de la oposición.
* Utiliza un lenguaje que resuene con la base electoral del partido.
* Incluye un llamado a la acción, invitando a los ciudadanos a unirse al partido y apoyar sus propuestas.
* IMPORTANTE: Presenta CADA mención y objeto de comunicación de manera FAVORABLE según la ideología del partido.

La opinión debe ser breve (máximo 100 palabras) y estar lista para ser utilizado en redes sociales, discursos públicos o comunicados de prensa.
`

        try {
          const topicResponse = await generateAnthropicResponse(topicPrompt)
          if (topicResponse.error) {
            throw new Error(topicResponse.error)
          }
          topicOpinions[`news-${i}`] = topicResponse.content
        } catch (error) {
          console.warn(`Failed to generate topic opinion for news item ${i}, using mock content.`, error)
          topicOpinions[`news-${i}`] = generateTopicOpinion(party, newsItem, recommendations)
        }
      }

      return { generalMessage: generalResponse.content, topicOpinions }
    } catch (error) {
      // Check if it's a quota exceeded error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (
        errorMessage.includes("QUOTA_EXCEEDED") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("exceeded") ||
        errorMessage.includes("billing")
      ) {
        console.warn("Anthropic API quota exceeded, using mock content.")
        if (typeof window !== "undefined") {
          localStorage.setItem("anthropic_quota_exceeded", "true")
        }
        throw new Error(
          "QUOTA_EXCEEDED: Se ha excedido la cuota de Anthropic. Verifique su plan y detalles de facturación.",
        )
      }

      throw error
    }
  } catch (error) {
    console.error("Error al generar contenido con la API de Anthropic:", error)
    console.warn("Error al generar contenido con la API de Anthropic, utilizando contenido simulado.")

    // Check if it's a quota exceeded error
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("QUOTA_EXCEEDED")) {
      throw error // Re-throw to be handled by the caller
    }

    const generalMessage = generateMockContent(party, newsItems)
    const topicOpinions = generateMockTopicOpinions(party, newsItems)
    return { generalMessage, topicOpinions }
  }
}
