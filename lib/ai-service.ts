"use server"

import type { NewsItem, PoliticalParty } from "./types"
import { getHistoricalContext } from "./historical-knowledge"
import { getEthicalConsiderations } from "./ethical-knowledge"

interface AdaptNewsResult {
  generalMessage: string
  topicOpinions: Record<string, string>
}

interface SpeechParams {
  party: PoliticalParty
  length: "short" | "medium" | "long"
  tone: "formal" | "passionate" | "conversational"
  focus: "problems" | "solutions" | "balanced"
  includeStatistics: boolean
  includeHistoricalContext: boolean
  includeQuotes: boolean
  audience: "general" | "supporters" | "undecided" | "opposition"
  context: string
  category: string
  title: string
}

export async function adaptNewsForParty(
  newsItems: NewsItem[],
  party: PoliticalParty,
  apiKey?: string | null,
  speechParams?: SpeechParams,
): Promise<AdaptNewsResult> {
  // Si no hay clave API o está en modo fallback, usar el generador local
  if (!apiKey || !apiKey.startsWith("sk-")) {
    return generateLocalContent(newsItems, party, speechParams)
  }

  try {
    // Si estamos generando un discurso político
    if (speechParams) {
      return await generatePoliticalSpeech(newsItems, party, apiKey, speechParams)
    }

    // Si estamos adaptando noticias para un partido (caso original)
    const prompt = createPromptForParty(newsItems, party)
    const response = await fetchFromOpenAI(prompt, apiKey)

    // Procesar la respuesta
    const generalMessage = response.message || `Análisis de noticias desde la perspectiva de ${getPartyName(party)}`
    const topicOpinions = generateTopicOpinions(newsItems, party, response.details)

    return {
      generalMessage,
      topicOpinions,
    }
  } catch (error) {
    console.error("Error en adaptNewsForParty:", error)

    // Si hay un error, usar el generador local como fallback
    return generateLocalContent(newsItems, party, speechParams)
  }
}

// Función para generar un discurso político
async function generatePoliticalSpeech(
  newsItems: NewsItem[],
  party: PoliticalParty,
  apiKey: string,
  params: SpeechParams,
): Promise<AdaptNewsResult> {
  try {
    // Crear un prompt específico para generar un discurso político
    const prompt = createSpeechPrompt(newsItems, party, params)

    // Llamar a la API de OpenAI
    const response = await fetchFromOpenAI(prompt, apiKey, 0.7, 2500)

    // Procesar la respuesta
    const speech = response.message || generateBasicSpeech(newsItems, party, params)

    // Generar opiniones sobre temas específicos
    const topicOpinions = generateSpeechTopicOpinions(newsItems, party, params)

    return {
      generalMessage: speech,
      topicOpinions,
    }
  } catch (error) {
    console.error("Error en generatePoliticalSpeech:", error)

    // Si hay un error, generar un discurso básico localmente
    return {
      generalMessage: generateBasicSpeech(newsItems, party, params),
      topicOpinions: generateSpeechTopicOpinions(newsItems, party, params),
    }
  }
}

// Función para crear un prompt para generar un discurso político
function createSpeechPrompt(newsItems: NewsItem[], party: PoliticalParty, params: SpeechParams): string {
  const partyName = getPartyName(party)
  const newsTopics = newsItems
    .map((item) => `- ${item.title} (${item.source}): ${item.summary || "Sin resumen disponible"}`)
    .join("\n")

  // Obtener contexto histórico si se solicita
  const historicalContext = params.includeHistoricalContext ? getHistoricalContext(party, params.category) : ""

  // Obtener consideraciones éticas
  const ethicalConsiderations = getEthicalConsiderations(party, params.category)

  // Determinar la longitud del discurso
  const speechLength =
    params.length === "short"
      ? "500-800 palabras"
      : params.length === "medium"
        ? "1000-1500 palabras"
        : "2000-2500 palabras"

  // Construir el prompt
  return `
Genera un discurso político titulado "${params.title}" desde la perspectiva del partido político "${partyName}" en Argentina.

INFORMACIÓN SOBRE EL PARTIDO:
${getPartyDescription(party)}

NOTICIAS ACTUALES A ABORDAR:
${newsTopics}

PARÁMETROS DEL DISCURSO:
- Longitud: ${speechLength}
- Tono: ${params.tone === "formal" ? "Formal e institucional" : params.tone === "passionate" ? "Apasionado y enérgico" : "Conversacional y cercano"}
- Enfoque: ${params.focus === "problems" ? "Énfasis en problemas y críticas" : params.focus === "solutions" ? "Énfasis en soluciones y propuestas" : "Equilibrado entre problemas y soluciones"}
- Audiencia: ${params.audience === "general" ? "Público general" : params.audience === "supporters" ? "Simpatizantes del partido" : params.audience === "undecided" ? "Votantes indecisos" : "Opositores políticos"}
- Categoría principal: ${params.category}
${params.includeStatistics ? "- Incluir estadísticas y datos relevantes" : ""}
${params.includeQuotes ? "- Incluir citas y referencias de figuras importantes del partido" : ""}

${params.context ? `CONTEXTO ADICIONAL:\n${params.context}` : ""}

${historicalContext ? `CONTEXTO HISTÓRICO:\n${historicalContext}` : ""}

${ethicalConsiderations ? `CONSIDERACIONES ÉTICAS:\n${ethicalConsiderations}` : ""}

INSTRUCCIONES:
1. El discurso debe reflejar fielmente la ideología, valores y posiciones políticas de ${partyName}.
2. Estructura el discurso con una introducción clara, desarrollo de ideas y conclusión contundente.
3. Aborda las noticias mencionadas desde la perspectiva del partido.
4. Utiliza un lenguaje y tono coherente con la comunicación habitual del partido.
5. Incluye propuestas concretas y críticas alineadas con la ideología del partido.

Por favor, genera un discurso político completo y coherente que cumpla con todos estos requisitos.
`
}

// Función para generar opiniones sobre temas específicos para un discurso
function generateSpeechTopicOpinions(
  newsItems: NewsItem[],
  party: PoliticalParty,
  params: SpeechParams,
): Record<string, string> {
  const topicOpinions: Record<string, string> = {}
  const partyName = getPartyName(party)

  newsItems.forEach((item, index) => {
    // Generar una opinión específica sobre cada noticia
    let opinion = ""

    switch (party) {
      case "libertad-avanza":
        opinion = `Desde ${partyName}, consideramos que "${item.title}" refleja la necesidad de reducir la intervención estatal y promover la libertad individual. Este tipo de situaciones demuestra cómo el exceso de regulaciones y la burocracia estatal obstaculizan el desarrollo económico y las libertades de los ciudadanos. Proponemos una solución basada en la desregulación, la reducción impositiva y el respeto irrestricto a la propiedad privada, permitiendo que el libre mercado resuelva eficientemente este tipo de problemas sin la distorsión que genera el intervencionismo estatal.`
        break
      case "union-patria":
        opinion = `En ${partyName} analizamos "${item.title}" como una clara muestra de las consecuencias del modelo neoliberal que prioriza los intereses del mercado por encima del bienestar popular. Esta situación requiere una respuesta del Estado presente, que implemente políticas públicas activas para proteger a los sectores más vulnerables y garantizar derechos fundamentales. Nuestra propuesta incluye fortalecer el rol regulador del Estado, implementar políticas de redistribución de la riqueza y asegurar que el crecimiento económico se traduzca en mejoras concretas para las mayorías populares.`
        break
      case "juntos-cambio":
        opinion = `Desde ${partyName} vemos que "${item.title}" requiere un enfoque equilibrado que combine eficiencia económica con sensibilidad social. Esta situación demanda instituciones sólidas y transparentes, capaces de generar reglas claras y previsibilidad. Proponemos una solución basada en la modernización del Estado, la promoción de la inversión privada con marcos regulatorios adecuados, y políticas públicas eficientes que atiendan las necesidades sociales sin comprometer la sustentabilidad fiscal y el desarrollo económico a largo plazo.`
        break
      case "frente-izquierda":
        opinion = `Desde ${partyName} denunciamos que "${item.title}" es una clara manifestación de las contradicciones inherentes al sistema capitalista, que prioriza la ganancia de unos pocos a costa de la explotación de las mayorías trabajadoras. Esta situación requiere una respuesta contundente basada en la organización y movilización popular. Proponemos una transformación radical del sistema económico y social, con control obrero de la producción, nacionalización de los sectores estratégicos de la economía y una redistribución profunda de la riqueza que ponga fin a los privilegios de la clase dominante.`
        break
      default:
        opinion = `Respecto a "${item.title}", consideramos que es necesario un análisis detallado que contemple las diferentes perspectivas y proponga soluciones concretas para beneficio de toda la sociedad. Esta situación requiere un enfoque pragmático que combine lo mejor de diferentes visiones políticas para encontrar un camino que favorezca el desarrollo y bienestar general.`
    }

    // Ajustar según el enfoque solicitado
    if (params.focus === "problems") {
      opinion += ` Es preocupante observar cómo este tipo de situaciones se repiten sin que se aborden las causas estructurales del problema. Las consecuencias negativas para la sociedad son evidentes y requieren una atención urgente.`
    } else if (params.focus === "solutions") {
      opinion += ` Nuestra propuesta concreta para abordar esta situación incluye un plan de acción inmediato con medidas específicas que permitirán resolver el problema de raíz y generar beneficios tangibles para la población.`
    }

    topicOpinions[`news-${index}`] = opinion
  })

  return topicOpinions
}

// Función para generar un discurso básico sin usar la API
function generateBasicSpeech(news: NewsItem[], party: PoliticalParty, params: SpeechParams): string {
  const partyName = getPartyName(party)
  const title = params.title || "Discurso político"
  const newsTopics = news.map((item) => item.title).join(", ")

  let introduction = ""
  let body = ""
  let conclusion = ""

  // Introducción según el partido
  switch (party) {
    case "libertad-avanza":
      introduction = `Estimados compatriotas, hoy me dirijo a ustedes como representante de ${partyName} para hablar sobre temas cruciales que afectan a nuestra nación. Las recientes noticias sobre ${newsTopics} requieren nuestra atención y análisis desde una perspectiva de libertad y respeto por los derechos individuales.`
      break
    case "union-patria":
      introduction = `Querido pueblo argentino, como parte de ${partyName}, es mi deber dirigirme a ustedes para analizar la situación actual de nuestro país. Los recientes acontecimientos relacionados con ${newsTopics} nos obligan a reflexionar sobre el rumbo de nuestra patria y las políticas necesarias para proteger a los más vulnerables.`
      break
    case "juntos-cambio":
      introduction = `Ciudadanas y ciudadanos, desde ${partyName} queremos compartir nuestra visión sobre los recientes acontecimientos que marcan la agenda nacional. Las noticias sobre ${newsTopics} requieren un análisis serio y propuestas concretas para avanzar hacia un país con más oportunidades para todos.`
      break
    case "frente-izquierda":
      introduction = `Compañeras y compañeros, desde ${partyName} nos dirigimos al pueblo trabajador para analizar la coyuntura actual. Los recientes hechos relacionados con ${newsTopics} demuestran una vez más las contradicciones del sistema capitalista y la necesidad de una alternativa que defienda los intereses de la clase trabajadora.`
      break
    default:
      introduction = `Estimados ciudadanos, hoy analizaremos desde nuestra perspectiva política los recientes acontecimientos que afectan a nuestro país. Las noticias sobre ${newsTopics} merecen un análisis detallado y propuestas concretas.`
  }

  // Cuerpo del discurso basado en las noticias
  body = news
    .map((item) => {
      let analysis = ""

      switch (party) {
        case "libertad-avanza":
          analysis = `Respecto a "${item.title}", desde ${partyName} consideramos que este tema debe abordarse desde la perspectiva de la libertad individual y la reducción del intervencionismo estatal. Es fundamental que los ciudadanos puedan tomar sus propias decisiones sin la constante interferencia del Estado.`
          break
        case "union-patria":
          analysis = `En relación a "${item.title}", desde ${partyName} creemos que es necesario implementar políticas públicas que protejan a los sectores más vulnerables. El Estado debe tener un rol activo para garantizar la justicia social y la distribución equitativa de la riqueza.`
          break
        case "juntos-cambio":
          analysis = `Sobre "${item.title}", en ${partyName} proponemos un enfoque equilibrado que combine el desarrollo económico con la inclusión social. Necesitamos instituciones fuertes y transparentes que generen confianza y atraigan inversiones para crear empleo de calidad.`
          break
        case "frente-izquierda":
          analysis = `Analizando "${item.title}", desde ${partyName} denunciamos cómo este hecho evidencia las contradicciones del sistema capitalista. Los trabajadores y sectores populares son quienes sufren las consecuencias de políticas que solo benefician a los grandes empresarios y especuladores financieros.`
          break
        default:
          analysis = `Sobre "${item.title}", consideramos que es necesario un análisis profundo que contemple las diferentes perspectivas y proponga soluciones concretas para beneficio de toda la sociedad.`
      }

      return analysis
    })
    .join("\n\n")

  // Conclusión según el partido
  switch (party) {
    case "libertad-avanza":
      conclusion = `Para concluir, desde ${partyName} reafirmamos nuestro compromiso con la libertad económica y los derechos individuales. Seguiremos trabajando para reducir el tamaño del Estado, bajar impuestos y eliminar regulaciones que obstaculizan el desarrollo y la prosperidad de los argentinos. ¡Viva la libertad, carajo!`
      break
    case "union-patria":
      conclusion = `En síntesis, desde ${partyName} continuaremos defendiendo un modelo de país con justicia social, independencia económica y soberanía política. No daremos ni un paso atrás en la defensa de los derechos conquistados y seguiremos trabajando por una patria justa, libre y soberana para todos los argentinos y argentinas.`
      break
    case "juntos-cambio":
      conclusion = `En conclusión, desde ${partyName} reafirmamos nuestro compromiso con un cambio responsable que combine crecimiento económico, fortalecimiento institucional e inclusión social. Seguiremos trabajando por un país con reglas claras, oportunidades para todos y un futuro mejor para las próximas generaciones.`
      break
    case "frente-izquierda":
      conclusion = `Para finalizar, desde ${partyName} llamamos a la organización y movilización de los trabajadores y sectores populares. Solo con la unidad en la lucha podremos enfrentar las políticas de ajuste y construir una alternativa política de los trabajadores y la izquierda. ¡La lucha continúa, compañeros!`
      break
    default:
      conclusion = `En conclusión, seguiremos trabajando por un país mejor, con más oportunidades para todos y soluciones concretas a los problemas que enfrentamos como sociedad. El diálogo y el consenso serán nuestras herramientas para construir un futuro mejor.`
  }

  // Ajustar la longitud según el parámetro
  let fullSpeech = `${introduction}\n\n${body}\n\n${conclusion}`

  if (params.length === "short") {
    // Para discursos cortos, reducir el contenido
    const bodyParts = body.split("\n\n")
    const shortenedBody = bodyParts.slice(0, Math.min(2, bodyParts.length)).join("\n\n")
    fullSpeech = `${introduction}\n\n${shortenedBody}\n\n${conclusion}`
  } else if (params.length === "long") {
    // Para discursos largos, expandir con más detalles
    const expandedBody =
      body +
      "\n\n" +
      news
        .map((item) => {
          return `Profundizando en "${item.title}", es importante destacar que este tema tiene múltiples aristas que deben ser consideradas. Desde ${partyName}, creemos firmemente que es necesario un análisis exhaustivo que contemple tanto las causas como las posibles soluciones a largo plazo.`
        })
        .join("\n\n")

    fullSpeech = `${introduction}\n\n${expandedBody}\n\n${conclusion}`
  }

  // Ajustar el tono según el parámetro
  if (params.tone === "passionate") {
    fullSpeech = fullSpeech
      .replace(/consideramos/g, "estamos convencidos")
      .replace(/creemos/g, "afirmamos con total convicción")
      .replace(/proponemos/g, "exigimos")
      .replace(/analizando/g, "observando con indignación")
  } else if (params.tone === "conversational") {
    fullSpeech = fullSpeech
      .replace(/Estimados ciudadanos/g, "Hola a todos")
      .replace(/Querido pueblo argentino/g, "Amigos y amigas")
      .replace(/Ciudadanas y ciudadanos/g, "Vecinos y vecinas")
      .replace(/Compañeras y compañeros/g, "Amigos todos")
  }

  return fullSpeech
}

// Función para crear un prompt para la adaptación de noticias
function createPromptForParty(newsItems: NewsItem[], party: PoliticalParty): string {
  const partyName = getPartyName(party)
  const newsTopics = newsItems
    .map((item) => `- ${item.title} (${item.source}): ${item.summary || "Sin resumen disponible"}`)
    .join("\n")

  return `
Adapta las siguientes noticias desde la perspectiva del partido político "${partyName}" en Argentina.

INFORMACIÓN SOBRE EL PARTIDO:
${getPartyDescription(party)}

NOTICIAS A ADAPTAR:
${newsTopics}

INSTRUCCIONES:
1. Genera un mensaje general que analice estas noticias desde la perspectiva ideológica del partido.
2. El mensaje debe reflejar fielmente la ideología, valores y posiciones políticas de ${partyName}.
3. Incluye críticas y propuestas coherentes con la línea política del partido.
4. Utiliza un lenguaje y tono coherente con la comunicación habitual del partido.

Por favor, genera un análisis político coherente con la ideología del partido mencionado.
`
}

// Función para obtener una descripción detallada del partido
function getPartyDescription(party: PoliticalParty): string {
  switch (party) {
    case "libertad-avanza":
      return `La Libertad Avanza es un partido político argentino de derecha libertaria, liderado por Javier Milei. Sus principales valores son:
- Defensa de la libertad individual y económica
- Reducción drástica del tamaño del Estado
- Eliminación de regulaciones e impuestos
- Defensa irrestricta de la propiedad privada
- Promoción del libre mercado
- Oposición al intervencionismo estatal
- Crítica a la "casta política" tradicional
Su discurso se caracteriza por ser directo, confrontativo y con frecuentes referencias a la teoría económica liberal.`

    case "union-patria":
      return `Unión por la Patria (anteriormente Frente de Todos) es una coalición política argentina de centro-izquierda y peronista. Sus principales valores son:
- Justicia social, independencia económica y soberanía política
- Estado presente y activo en la economía
- Protección de los derechos de los trabajadores y sectores vulnerables
- Distribución equitativa de la riqueza
- Industrialización nacional y sustitución de importaciones
- Integración latinoamericana
- Defensa de los derechos humanos
Su discurso se caracteriza por apelar al sentimiento nacional, la justicia social y la defensa de los derechos adquiridos.`

    case "juntos-cambio":
      return `Juntos por el Cambio es una coalición política argentina de centro-derecha. Sus principales valores son:
- Institucionalidad y respeto a la división de poderes
- Economía de mercado con regulaciones razonables
- Inserción de Argentina en el mundo
- Modernización del Estado
- Seguridad jurídica y combate a la corrupción
- Equilibrio fiscal y estabilidad macroeconómica
- Federalismo
Su discurso se caracteriza por ser moderado, institucionalista y enfocado en la gestión eficiente.`

    case "frente-izquierda":
      return `El Frente de Izquierda y de los Trabajadores es una coalición política argentina de izquierda revolucionaria. Sus principales valores son:
- Anticapitalismo y socialismo
- Internacionalismo proletario
- Lucha de clases y organización de los trabajadores
- Nacionalización de los sectores estratégicos de la economía
- Oposición al imperialismo y a los organismos financieros internacionales
- Defensa de los derechos de las mujeres y diversidades
- Separación de la Iglesia y el Estado
Su discurso se caracteriza por ser combativo, denuncialista y con frecuentes referencias a la teoría marxista.`

    default:
      return `Partido político argentino con una visión pragmática que busca combinar elementos de diferentes corrientes ideológicas para dar respuesta a los problemas concretos de la sociedad. Sus posiciones varían según los temas específicos, priorizando soluciones prácticas por sobre dogmas ideológicos.`
  }
}

// Función para obtener el nombre completo del partido
// Función para obtener el nombre completo del partido
function getPartyName(party: PoliticalParty): string {
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
      return "Partido político"
  }
}

// Función para generar opiniones sobre temas específicos
function generateTopicOpinions(newsItems: NewsItem[], party: PoliticalParty, details?: any): Record<string, string> {
  const topicOpinions: Record<string, string> = {}

  newsItems.forEach((item, index) => {
    // Si tenemos detalles específicos de la API, usarlos
    if (details && details[`news-${index}`]) {
      topicOpinions[`news-${index}`] = details[`news-${index}`]
      return
    }

    // Si no, generar opiniones localmente
    let opinion = ""

    switch (party) {
      case "libertad-avanza":
        opinion = `Desde La Libertad Avanza, vemos que "${item.title}" es un claro ejemplo de cómo la intervención estatal distorsiona el mercado y limita las libertades individuales. Este tipo de situaciones solo se resuelven con más libertad económica, menos impuestos y un Estado que deje de interferir en las decisiones de los ciudadanos.`
        break
      case "union-patria":
        opinion = `En Unión por la Patria analizamos "${item.title}" como una consecuencia del modelo neoliberal que prioriza los intereses del mercado por encima del bienestar popular. Esta situación requiere un Estado presente que implemente políticas públicas activas para proteger a los sectores más vulnerables.`
        break
      case "juntos-cambio":
        opinion = `Desde Juntos por el Cambio consideramos que "${item.title}" requiere un enfoque equilibrado que combine eficiencia económica con sensibilidad social. Esta situación demanda instituciones sólidas y transparentes, capaces de generar reglas claras y previsibilidad.`
        break
      case "frente-izquierda":
        opinion = `Desde el Frente de Izquierda denunciamos que "${item.title}" es una clara manifestación de las contradicciones del sistema capitalista, que prioriza la ganancia de unos pocos a costa de la explotación de las mayorías trabajadoras. Esta situación requiere una respuesta organizada de la clase obrera.`
        break
      default:
        opinion = `Respecto a "${item.title}", consideramos que es necesario un análisis detallado que contemple las diferentes perspectivas y proponga soluciones concretas para beneficio de toda la sociedad.`
    }

    topicOpinions[`news-${index}`] = opinion
  })

  return topicOpinions
}

// Función para generar contenido local sin usar la API
function generateLocalContent(
  newsItems: NewsItem[],
  party: PoliticalParty,
  speechParams?: SpeechParams,
): AdaptNewsResult {
  // Si estamos generando un discurso político
  if (speechParams) {
    return {
      generalMessage: generateBasicSpeech(newsItems, party, speechParams),
      topicOpinions: generateSpeechTopicOpinions(newsItems, party, speechParams),
    }
  }

  // Si estamos adaptando noticias para un partido (caso original)
  const partyName = getPartyName(party)

  // Generar un mensaje general según el partido
  let generalMessage = ""

  switch (party) {
    case "libertad-avanza":
      generalMessage = `Desde La Libertad Avanza analizamos la actualidad con una perspectiva clara: la libertad individual y económica como valores fundamentales. Las recientes noticias confirman nuestra visión de que Argentina necesita menos Estado, menos impuestos y más libertad para que los ciudadanos puedan desarrollar todo su potencial sin las trabas que impone el intervencionismo estatal. La casta política sigue defendiendo sus privilegios a costa del esfuerzo de los argentinos que trabajan y producen. Es hora de un cambio radical que devuelva el poder a los ciudadanos y permita que la libertad y el mérito sean los motores del progreso.`
      break
    case "union-patria":
      generalMessage = `Desde Unión por la Patria observamos con preocupación cómo las políticas neoliberales siguen afectando a los sectores más vulnerables de nuestra sociedad. Las noticias recientes demuestran la necesidad de un Estado presente, que regule los excesos del mercado y garantice derechos fundamentales para todos los argentinos y argentinas. Seguimos defendiendo un modelo de país con justicia social, independencia económica y soberanía política, frente a quienes pretenden entregar nuestros recursos y derechos a intereses extranjeros y financieros. El pueblo argentino puede contar con nuestro compromiso inquebrantable con la patria y con los que más necesitan.`
      break
    case "juntos-cambio":
      generalMessage = `En Juntos por el Cambio analizamos la realidad argentina con responsabilidad y vocación de futuro. Las noticias actuales reflejan la necesidad de un cambio ordenado, que combine el desarrollo económico con la inclusión social. Argentina necesita instituciones sólidas, reglas claras y previsibilidad para atraer inversiones, generar empleo de calidad y reducir la pobreza. Proponemos un camino de modernización del Estado, inserción inteligente en el mundo y políticas públicas eficientes, alejado tanto del populismo irresponsable como del ajuste sin sensibilidad social. Es posible construir un país normal, con oportunidades para todos.`
      break
    case "frente-izquierda":
      generalMessage = `Desde el Frente de Izquierda denunciamos que las noticias recientes son una clara muestra de la crisis estructural del capitalismo argentino. Mientras los grandes empresarios, banqueros y terratenientes aumentan sus ganancias, los trabajadores y sectores populares sufren  banqueros y terratenientes aumentan sus ganancias, los trabajadores y sectores populares sufren las consecuencias de un sistema económico injusto y excluyente. Las políticas de ajuste, la inflación y la precarización laboral son el resultado de un modelo al servicio del FMI y los grandes capitales. Frente a esta realidad, llamamos a la organización y movilización de la clase trabajadora para construir una alternativa política que defienda los intereses populares y avance hacia una sociedad sin explotadores ni explotados.`
      break
    default:
      generalMessage = `Analizando las noticias recientes desde una perspectiva pragmática, consideramos que los problemas que enfrenta Argentina requieren soluciones concretas más allá de dogmatismos ideológicos. Es necesario un enfoque equilibrado que combine lo mejor de diferentes visiones políticas para construir un país con más oportunidades, desarrollo económico y bienestar social. Las decisiones deben basarse en evidencia y resultados, no en prejuicios ideológicos o intereses sectoriales.`
  }

  return {
    generalMessage,
    topicOpinions: generateTopicOpinions(newsItems, party),
  }
}

// Función para llamar a la API de OpenAI
async function fetchFromOpenAI(prompt: string, apiKey: string, temperature = 0.7, maxTokens = 1500): Promise<any> {
  try {
    // Verificar si tenemos una clave API válida
    if (!apiKey || !apiKey.startsWith("sk-")) {
      throw new Error("API_KEY_INVALID")
    }

    // Preparar la solicitud a la API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un analista político especializado en la política argentina, con profundo conocimiento de los diferentes partidos políticos, sus ideologías, propuestas y discursos.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorData = await response.json()

      // Verificar si es un error de cuota excedida
      if (
        response.status === 429 ||
        (errorData.error &&
          errorData.error.message &&
          (errorData.error.message.includes("quota") ||
            errorData.error.message.includes("rate limit") ||
            errorData.error.message.includes("exceeded")))
      ) {
        throw new Error("QUOTA_EXCEEDED")
      }

      // Otros errores
      throw new Error(`Error en la API de OpenAI: ${errorData.error?.message || response.statusText}`)
    }

    // Procesar la respuesta
    const data = await response.json()
    return {
      message: data.choices[0].message.content,
      details: {}, // En una implementación más completa, aquí podríamos extraer detalles adicionales
    }
  } catch (error) {
    console.error("Error al llamar a la API de OpenAI:", error)

    // Reenviar el error para manejarlo en la función llamadora
    throw error
  }
}
