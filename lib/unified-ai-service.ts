"use server"

import type { NewsItem, PoliticalParty } from "./types"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import { analyzePoliticalContext, getCommunicationRecommendations } from "./political-context-analyzer"
import { getAnthropicKey, getOpenAIKey } from "./api-key-action"

// Tipo para los proveedores de IA disponibles
export type AIProvider = "anthropic" | "openai" | "auto"

// Función para generar contenido con el proveedor especificado o automáticamente
export async function generateAIContent(
  prompt: string,
  provider: AIProvider = "auto",
  clientApiKeys?: { anthropic?: string | null; openai?: string | null },
): Promise<{ text: string; usedProvider: AIProvider }> {
  // Intentar obtener las claves API del servidor y del cliente
  let anthropicApiKey = clientApiKeys?.anthropic
  let openaiApiKey = clientApiKeys?.openai

  if (!anthropicApiKey) {
    try {
      anthropicApiKey = await getAnthropicKey()
    } catch (error) {
      console.warn("Error al obtener la clave API de Anthropic del servidor:", error)
    }
  }

  if (!openaiApiKey) {
    try {
      openaiApiKey = await getOpenAIKey()
    } catch (error) {
      console.warn("Error al obtener la clave API de OpenAI del servidor:", error)
    }
  }

  // Si no hay claves API en el servidor, intentar obtenerlas del localStorage en el cliente
  if (typeof window !== "undefined") {
    if (!anthropicApiKey) {
      anthropicApiKey = localStorage.getItem("anthropic_api_key")
    }
    if (!openaiApiKey) {
      openaiApiKey = localStorage.getItem("openai_api_key")
    }
  }

  // Determinar qué proveedor usar
  let selectedProvider: "anthropic" | "openai"

  if (provider === "auto") {
    // Modo automático: usar el primer proveedor disponible
    if (anthropicApiKey) {
      selectedProvider = "anthropic"
    } else if (openaiApiKey) {
      selectedProvider = "openai"
    } else {
      throw new Error("No hay claves API configuradas para ningún proveedor de IA")
    }
  } else {
    // Modo específico: usar el proveedor solicitado
    selectedProvider = provider

    // Verificar que la clave API esté disponible
    if (selectedProvider === "anthropic" && !anthropicApiKey) {
      throw new Error("No hay clave API configurada para Anthropic")
    } else if (selectedProvider === "openai" && !openaiApiKey) {
      throw new Error("No hay clave API configurada para OpenAI")
    }
  }

  try {
    // Generar contenido con el proveedor seleccionado
    if (selectedProvider === "anthropic") {
      const result = await generateText({
        model: anthropic("claude-3-haiku-20240307"),
        apiKey: anthropicApiKey!,
        prompt,
      })
      return { text: result.text, usedProvider: "anthropic" }
    } else {
      const result = await generateText({
        model: openai("gpt-4o"),
        apiKey: openaiApiKey!,
        prompt,
      })
      return { text: result.text, usedProvider: "openai" }
    }
  } catch (error) {
    // Si estamos en modo automático y hay un error, intentar con el otro proveedor
    if (provider === "auto") {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn(`Error con el proveedor ${selectedProvider}, intentando con alternativa:`, errorMessage)

      // Si falló Anthropic, intentar con OpenAI
      if (selectedProvider === "anthropic" && openaiApiKey) {
        try {
          const result = await generateText({
            model: openai("gpt-4o"),
            apiKey: openaiApiKey,
            prompt,
          })
          return { text: result.text, usedProvider: "openai" }
        } catch (fallbackError) {
          console.error("Error con el proveedor de respaldo OpenAI:", fallbackError)
          throw new Error(`Ambos proveedores de IA fallaron. Último error: ${fallbackError}`)
        }
      }
      // Si falló OpenAI, intentar con Anthropic
      else if (selectedProvider === "openai" && anthropicApiKey) {
        try {
          const result = await generateText({
            model: anthropic("claude-3-haiku-20240307"),
            apiKey: anthropicApiKey,
            prompt,
          })
          return { text: result.text, usedProvider: "anthropic" }
        } catch (fallbackError) {
          console.error("Error con el proveedor de respaldo Anthropic:", fallbackError)
          throw new Error(`Ambos proveedores de IA fallaron. Último error: ${fallbackError}`)
        }
      }
    }

    // Si no estamos en modo automático o no hay proveedor alternativo, propagar el error
    throw error
  }
}

// Función para adaptar noticias para un partido político usando el servicio unificado
export async function adaptNewsForParty(
  newsItems: NewsItem[],
  party: PoliticalParty,
  provider: AIProvider = "auto",
  clientApiKeys?: { anthropic?: string | null; openai?: string | null },
): Promise<{ generalMessage: string; topicOpinions: Record<string, string>; usedProvider: AIProvider }> {
  // Analizar la coyuntura política actual
  const politicalContext = analyzePoliticalContext(newsItems)

  // Obtener recomendaciones de comunicación específicas para el partido
  const recommendations = getCommunicationRecommendations(party, politicalContext)

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

    // Generar el mensaje general
    const generalContent = await generateAIContent(generalPrompt, provider, clientApiKeys)
    let usedProvider = generalContent.usedProvider

    // Generar opiniones sobre temas específicos
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
        // Intentar usar el mismo proveedor que se usó para el mensaje general
        const topicContent = await generateAIContent(topicPrompt, usedProvider, clientApiKeys)
        topicOpinions[`news-${i}`] = topicContent.text
      } catch (error) {
        console.warn(`Error al generar opinión para la noticia ${i}, intentando con modo automático:`, error)

        // Si falla, intentar con modo automático
        try {
          const topicContent = await generateAIContent(topicPrompt, "auto", clientApiKeys)
          topicOpinions[`news-${i}`] = topicContent.text
          // Actualizar el proveedor usado si cambió
          if (topicContent.usedProvider !== usedProvider) {
            console.log(`Cambiado a proveedor ${topicContent.usedProvider} para la noticia ${i}`)
            usedProvider = topicContent.usedProvider
          }
        } catch (fallbackError) {
          console.error(`Error al generar opinión para la noticia ${i} incluso en modo automático:`, fallbackError)
          // Usar contenido simulado como último recurso
          topicOpinions[`news-${i}`] =
            `[Error al generar contenido para esta noticia. Se muestra una respuesta predeterminada]`
        }
      }
    }

    return { generalMessage: generalContent.text, topicOpinions, usedProvider }
  } catch (error) {
    console.error("Error al generar contenido con los proveedores de IA:", error)

    // Generar contenido simulado como respaldo
    const generalMessage = generateMockContent(party, newsItems)
    const topicOpinions = generateMockTopicOpinions(party, newsItems)

    return {
      generalMessage,
      topicOpinions,
      usedProvider: "mock" as AIProvider,
    }
  }
}

// Funciones de generación de contenido simulado (mantener las existentes)
function generateMockContent(party: PoliticalParty, newsItems: NewsItem[]): string {
  // Código existente para generar contenido simulado
  const politicalContext = analyzePoliticalContext(newsItems)
  const recommendations = getCommunicationRecommendations(party, politicalContext)
  const topics = extractKeyTopics(newsItems)
  const responseStyle = getRandomResponseStyle()
  const categories = newsItems.map((item) => item.category)
  const isMainlyLocal = categories.filter((cat) => ["local", "municipal"].includes(cat)).length > categories.length / 2
  const isMainlyNational =
    categories.filter((cat) => ["nacional", "provincial"].includes(cat)).length > categories.length / 2

  return generatePartyResponse(party, topics, isMainlyLocal, isMainlyNational, responseStyle, recommendations)
}

function generateMockTopicOpinions(party: PoliticalParty, newsItems: NewsItem[]): Record<string, string> {
  // Código existente para generar opiniones simuladas
  const politicalContext = analyzePoliticalContext(newsItems)
  const recommendations = getCommunicationRecommendations(party, politicalContext)
  const opinions: Record<string, string> = {}

  newsItems.forEach((item, index) => {
    const newsId = `news-${index}`
    opinions[newsId] = generateTopicOpinion(party, item, recommendations)
  })

  return opinions
}

// Incluir todas las funciones auxiliares existentes
function generateTopicOpinion(
  party: PoliticalParty,
  newsItem: NewsItem,
  recommendations: ReturnType<typeof getCommunicationRecommendations>,
): string {
  // Código existente para generar opiniones sobre temas específicos
  // ...
  const shouldReframe = recommendations.reframe.some((topic) =>
    newsItem.title.toLowerCase().includes(topic.toLowerCase()),
  )

  const shouldAvoid = recommendations.avoid.some((topic) => newsItem.title.toLowerCase().includes(topic.toLowerCase()))
  const formatStyle = Math.floor(Math.random() * 3)
  const briefDescription = generateBriefDescription(newsItem, party, shouldReframe)
  const historicalContext = generateHistoricalContext(newsItem, party)
  const ethicalConsiderations = generateEthicalConsiderations(party, newsItem)
  const partySolution = generatePartySolution(party, newsItem, recommendations)

  if (shouldAvoid) {
    return `Si bien algunos medios mencionan ${newsItem.title}, es importante destacar que ${getPositiveReframing(party, newsItem)}. ${partySolution}`
  }

  if (shouldReframe) {
    return `Respecto a ${newsItem.title}, desde nuestra perspectiva ${getPartyPerspective(party, newsItem)}. ${historicalContext}\n\n${partySolution}`
  }

  if (formatStyle === 0) {
    return `${briefDescription}\n\n${historicalContext}\n\n${ethicalConsiderations}\n\n${partySolution}`
  } else if (formatStyle === 1) {
    return `${ethicalConsiderations}\n\n${briefDescription}\n\nEn perspectiva histórica: ${historicalContext.replace("**Precedente histórico:**\n", "")}\n\n${partySolution}`
  } else {
    return `${partySolution}\n\nEsta propuesta surge del análisis de la situación actual: ${briefDescription.replace("**Contexto actual:**\n", "")}\n\n${historicalContext}\n\n${ethicalConsiderations}`
  }
}

// Incluir todas las demás funciones auxiliares existentes
function generateBriefDescription(newsItem: NewsItem, party: PoliticalParty, shouldReframe: boolean): string {
  if (shouldReframe) {
    return "**Contexto actual:**\n" + getPartyPerspective(party, newsItem)
  }
  const partyPerspective = getPartyPerspective(party, newsItem)
  return (
    "**Contexto actual:**\nAnálisis de la situación actual relacionada con " + newsItem.title + ". " + partyPerspective
  )
}

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
  return (
    "**Precedente histórico:**\nContexto histórico relacionado con " +
    newsItem.category +
    " desde la perspectiva de " +
    party
  )
}

function generateEthicalConsiderations(party: PoliticalParty, newsItem: NewsItem): string {
  return "**Consideraciones éticas:**\nAnálisis ético desde la perspectiva de " + party
}

function generatePartySolution(
  party: PoliticalParty,
  newsItem: NewsItem,
  recommendations: ReturnType<typeof getCommunicationRecommendations>,
): string {
  const keywords = recommendations.keywords
  const randomKeywords = keywords.sort(() => 0.5 - Math.random()).slice(0, 3)
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

function extractKeyTopics(newsItems: NewsItem[]): string[] {
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

  const mainTopics: string[] = []
  newsItems.forEach((item) => {
    const topic = categoryToTopic[item.category] || item.category
    if (!mainTopics.includes(topic)) {
      mainTopics.push(topic)
    }
  })

  const specificTopics = extractSpecificTopics(newsItems)
  return [...mainTopics, ...specificTopics].slice(0, 3)
}

function extractSpecificTopics(newsItems: NewsItem[]): string[] {
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

function generatePartyResponse(
  party: PoliticalParty,
  topics: string[],
  isLocal: boolean,
  isNational: boolean,
  style: string,
  recommendations: ReturnType<typeof getCommunicationRecommendations>,
): string {
  const emphasize = recommendations.emphasize.join(", ")
  const tone = recommendations.tone
  const keywords = recommendations.keywords
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .join(", ")

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
