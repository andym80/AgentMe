import type { NewsItem, PoliticalParty, NewsSubcategory, NewsType } from "./types"

// Función para generar métricas de aceptación aleatorias pero realistas
function generateAcceptanceMetrics(category: string, source: string): NewsItem["acceptance"] {
  // Diferentes fuentes y categorías tienen diferentes patrones de aceptación
  let positiveBase = 50 // Base de aceptación positiva
  let negativeBase = 20 // Base de aceptación negativa

  // Ajustar según la categoría
  if (category === "politics") {
    positiveBase -= 10 // Noticias políticas suelen ser más polarizadas
    negativeBase += 10
  } else if (category === "health" || category === "environment") {
    positiveBase += 10 // Estas categorías suelen tener mejor aceptación
    negativeBase -= 5
  }

  // Añadir variación aleatoria
  const positive = Math.min(Math.max(positiveBase + Math.floor(Math.random() * 20) - 10, 10), 90)
  const negative = Math.min(Math.max(negativeBase + Math.floor(Math.random() * 15) - 7, 5), 80)

  // Asegurar que los porcentajes sumen 100%
  const neutral = 100 - positive - negative

  return {
    positive,
    neutral,
    negative,
  }
}

// Función para generar métricas de share aleatorias pero realistas
function generateShareMetrics(category: string, source: string, publishedTime: string): NewsItem["shareMetrics"] {
  // Base de shares según la antigüedad de la noticia
  const hoursAgo = (new Date().getTime() - new Date(publishedTime).getTime()) / (1000 * 60 * 60)

  // Las noticias más recientes tienen menos shares
  let baseShares = 1000
  if (hoursAgo < 3) {
    baseShares = 200
  } else if (hoursAgo < 6) {
    baseShares = 500
  } else if (hoursAgo < 12) {
    baseShares = 800
  }

  // Ajustar según la categoría
  if (category === "politics" || category === "technology") {
    baseShares *= 1.5 // Estas categorías generan más shares
  }

  // Ajustar según la fuente (medios más grandes tienen más shares)
  const majorSources = ["Clarín", "La Nación", "Infobae", "Página/12", "BBC", "CNN"]
  if (majorSources.includes(source)) {
    baseShares *= 2
  }

  // Añadir variación aleatoria
  const totalShares = Math.floor(baseShares * (0.7 + Math.random() * 0.6))

  // Distribuir shares entre plataformas
  const facebook = Math.floor(totalShares * (0.3 + Math.random() * 0.2)) // 30-50%
  const twitter = Math.floor(totalShares * (0.15 + Math.random() * 0.15)) // 15-30%
  const whatsapp = Math.floor(totalShares * (0.2 + Math.random() * 0.2)) // 20-40%
  const other = totalShares - facebook - twitter - whatsapp // El resto

  return {
    total: totalShares,
    facebook,
    twitter,
    whatsapp,
    other,
  }
}

// Función para determinar la subcategoría basada en el título y la categoría
function determineSubcategory(title: string, category: string): NewsSubcategory {
  const titleLower = title.toLowerCase()

  // Subcategorías para política
  if (category === "politics" || category === "nacional") {
    if (
      titleLower.includes("ley") ||
      titleLower.includes("congreso") ||
      titleLower.includes("parlamento") ||
      titleLower.includes("diputados") ||
      titleLower.includes("senadores") ||
      titleLower.includes("legisla")
    ) {
      return "legislative"
    }
    if (
      titleLower.includes("presidente") ||
      titleLower.includes("ministro") ||
      titleLower.includes("gobierno") ||
      titleLower.includes("decreto") ||
      titleLower.includes("ejecutivo")
    ) {
      return "executive"
    }
    if (
      titleLower.includes("juez") ||
      titleLower.includes("corte") ||
      titleLower.includes("judicial") ||
      titleLower.includes("tribunal") ||
      titleLower.includes("sentencia") ||
      titleLower.includes("fallo")
    ) {
      return "judicial"
    }
    if (
      titleLower.includes("elección") ||
      titleLower.includes("voto") ||
      titleLower.includes("campaña") ||
      titleLower.includes("candidato") ||
      titleLower.includes("encuesta")
    ) {
      return "electoral"
    }
    if (
      titleLower.includes("diplomá") ||
      titleLower.includes("canciller") ||
      titleLower.includes("embajador") ||
      titleLower.includes("internacional") ||
      titleLower.includes("bilateral")
    ) {
      return "diplomatic"
    }
  }

  // Subcategorías para economía
  if (category === "economy" || category === "business") {
    if (
      titleLower.includes("política económica") ||
      titleLower.includes("plan económico") ||
      titleLower.includes("medidas económicas")
    ) {
      return "economic_policy"
    }
    if (
      titleLower.includes("impuesto") ||
      titleLower.includes("fiscal") ||
      titleLower.includes("presupuesto") ||
      titleLower.includes("gasto público") ||
      titleLower.includes("déficit")
    ) {
      return "fiscal"
    }
    if (
      titleLower.includes("inflación") ||
      titleLower.includes("tasa") ||
      titleLower.includes("banco central") ||
      titleLower.includes("monetaria") ||
      titleLower.includes("dólar") ||
      titleLower.includes("peso")
    ) {
      return "monetary"
    }
    if (
      titleLower.includes("trabajo") ||
      titleLower.includes("empleo") ||
      titleLower.includes("desempleo") ||
      titleLower.includes("sindicato") ||
      titleLower.includes("laboral") ||
      titleLower.includes("salarial")
    ) {
      return "labor"
    }
    if (
      titleLower.includes("mercado") ||
      titleLower.includes("bolsa") ||
      titleLower.includes("acciones") ||
      titleLower.includes("bonos") ||
      titleLower.includes("financiero")
    ) {
      return "markets"
    }
    if (
      titleLower.includes("empresa") ||
      titleLower.includes("compañía") ||
      titleLower.includes("corporación") ||
      titleLower.includes("industria") ||
      titleLower.includes("sector privado")
    ) {
      return "companies"
    }
  }

  // Subcategorías para tecnología
  if (category === "technology") {
    if (titleLower.includes("innovación") || titleLower.includes("startup") || titleLower.includes("emprendimiento")) {
      return "innovation"
    }
    if (
      titleLower.includes("digital") ||
      titleLower.includes("internet") ||
      titleLower.includes("online") ||
      titleLower.includes("plataforma") ||
      titleLower.includes("app")
    ) {
      return "digital"
    }
    if (
      titleLower.includes("investigación") ||
      titleLower.includes("científico") ||
      titleLower.includes("estudio") ||
      titleLower.includes("descubrimiento")
    ) {
      return "scientific"
    }
  }

  // Subcategorías para salud
  if (category === "health") {
    if (
      titleLower.includes("salud pública") ||
      titleLower.includes("epidemia") ||
      titleLower.includes("pandemia") ||
      titleLower.includes("prevención")
    ) {
      return "public_health"
    }
    if (
      titleLower.includes("hospital") ||
      titleLower.includes("médico") ||
      titleLower.includes("clínica") ||
      titleLower.includes("atención médica") ||
      titleLower.includes("sistema de salud")
    ) {
      return "healthcare"
    }
  }

  // Subcategorías para medio ambiente
  if (category === "environment") {
    if (
      titleLower.includes("clima") ||
      titleLower.includes("calentamiento global") ||
      titleLower.includes("cambio climático")
    ) {
      return "climate"
    }
    if (
      titleLower.includes("conservación") ||
      titleLower.includes("biodiversidad") ||
      titleLower.includes("especies") ||
      titleLower.includes("ecosistema")
    ) {
      return "conservation"
    }
    if (
      titleLower.includes("contaminación") ||
      titleLower.includes("residuos") ||
      titleLower.includes("reciclaje") ||
      titleLower.includes("plástico")
    ) {
      return "pollution"
    }
  }

  // Subcategorías para educación
  if (category === "education") {
    if (titleLower.includes("primaria") || titleLower.includes("escuela")) {
      return "primary"
    }
    if (titleLower.includes("secundaria") || titleLower.includes("colegio")) {
      return "secondary"
    }
    if (
      titleLower.includes("universidad") ||
      titleLower.includes("superior") ||
      titleLower.includes("facultad") ||
      titleLower.includes("campus")
    ) {
      return "university"
    }
  }

  // Subcategorías para seguridad
  if (category === "security") {
    if (
      titleLower.includes("crimen") ||
      titleLower.includes("delito") ||
      titleLower.includes("robo") ||
      titleLower.includes("seguridad ciudadana")
    ) {
      return "crime"
    }
    if (titleLower.includes("policía") || titleLower.includes("policial") || titleLower.includes("comisaría")) {
      return "police"
    }
    if (
      titleLower.includes("defensa") ||
      titleLower.includes("militar") ||
      titleLower.includes("ejército") ||
      titleLower.includes("armada") ||
      titleLower.includes("fuerza aérea")
    ) {
      return "defense"
    }
  }

  // Subcategorías para infraestructura
  if (category === "municipal" || category === "provincial" || category === "local") {
    if (
      titleLower.includes("infraestructura") ||
      titleLower.includes("obra pública") ||
      titleLower.includes("construcción")
    ) {
      return "infrastructure"
    }
    if (titleLower.includes("vivienda") || titleLower.includes("hogar") || titleLower.includes("casa")) {
      return "housing"
    }
    if (
      titleLower.includes("transporte") ||
      titleLower.includes("tránsito") ||
      titleLower.includes("movilidad") ||
      titleLower.includes("tren") ||
      titleLower.includes("subte") ||
      titleLower.includes("colectivo")
    ) {
      return "transportation"
    }
  }

  // Si no se encuentra una subcategoría específica
  return "other"
}

// Función para determinar el tipo de noticia basado en el título y el contenido
function determineNewsType(title: string, summary: string): NewsType {
  const titleLower = title.toLowerCase()
  const summaryLower = summary.toLowerCase()

  // Detectar noticias de último momento
  if (
    titleLower.includes("último momento") ||
    titleLower.includes("última hora") ||
    titleLower.includes("urgente") ||
    titleLower.includes("breaking")
  ) {
    return "breaking"
  }

  // Detectar noticias en desarrollo
  if (
    titleLower.includes("en desarrollo") ||
    summaryLower.includes("en desarrollo") ||
    summaryLower.includes("seguiremos informando") ||
    summaryLower.includes("actualización")
  ) {
    return "developing"
  }

  // Detectar análisis
  if (
    titleLower.includes("análisis") ||
    titleLower.includes("en profundidad") ||
    summaryLower.includes("analizamos") ||
    summaryLower.includes("en detalle")
  ) {
    return "analysis"
  }

  // Detectar opinión
  if (
    titleLower.includes("opinión") ||
    titleLower.includes("columna") ||
    titleLower.includes("editorial") ||
    summaryLower.includes("opina") ||
    summaryLower.includes("punto de vista")
  ) {
    return "opinion"
  }

  // Detectar entrevista
  if (
    titleLower.includes("entrevista") ||
    titleLower.includes("habla con") ||
    summaryLower.includes("entrevistado") ||
    summaryLower.includes("en diálogo con")
  ) {
    return "interview"
  }

  // Detectar reportaje
  if (
    titleLower.includes("reportaje") ||
    titleLower.includes("informe especial") ||
    summaryLower.includes("reportaje") ||
    summaryLower.includes("informe especial")
  ) {
    return "report"
  }

  // Detectar investigación
  if (
    titleLower.includes("investigación") ||
    titleLower.includes("investiga") ||
    summaryLower.includes("investigación") ||
    summaryLower.includes("revela")
  ) {
    return "investigation"
  }

  // Detectar anuncio oficial
  if (
    titleLower.includes("anunció") ||
    titleLower.includes("anuncia") ||
    summaryLower.includes("anunció") ||
    summaryLower.includes("oficialmente")
  ) {
    return "announcement"
  }

  // Detectar declaración
  if (
    titleLower.includes("declaró") ||
    titleLower.includes("afirmó") ||
    titleLower.includes("dijo") ||
    summaryLower.includes("declaró") ||
    summaryLower.includes("afirmó")
  ) {
    return "statement"
  }

  // Por defecto, considerar como noticia estándar
  return "other"
}

// Función para generar un contexto adicional basado en la categoría, subcategoría y tipo
function generateNewsContext(category: string, subcategory: NewsSubcategory, newsType: NewsType): string {
  // Contextos para política
  if (category === "politics" || category === "nacional") {
    if (subcategory === "legislative") {
      return "Esta noticia se enmarca en el debate legislativo actual sobre reformas clave para el país."
    }
    if (subcategory === "executive") {
      return "Este anuncio refleja las prioridades del gobierno en su agenda política actual."
    }
    if (subcategory === "judicial") {
      return "Este fallo judicial tiene importantes implicaciones para el equilibrio de poderes."
    }
    if (subcategory === "electoral") {
      return "Este desarrollo electoral podría cambiar el panorama político en las próximas elecciones."
    }
    if (subcategory === "diplomatic") {
      return "Esta noticia afecta la posición internacional de Argentina en el escenario global."
    }
  }

  // Contextos para economía
  if (category === "economy" || category === "business") {
    if (subcategory === "economic_policy") {
      return "Esta política económica busca abordar los desafíos macroeconómicos actuales del país."
    }
    if (subcategory === "fiscal") {
      return "Esta medida fiscal impactará en la recaudación y el equilibrio presupuestario."
    }
    if (subcategory === "monetary") {
      return "Esta decisión monetaria afectará la inflación y la estabilidad de la moneda."
    }
    if (subcategory === "labor") {
      return "Esta noticia impacta directamente en el mercado laboral y las condiciones de trabajo."
    }
    if (subcategory === "markets") {
      return "Este movimiento de mercado refleja la confianza de los inversores en la economía."
    }
    if (subcategory === "companies") {
      return "Esta decisión empresarial tendrá efectos en el sector productivo y el empleo."
    }
  }

  // Contextos para tecnología
  if (category === "technology") {
    if (subcategory === "innovation") {
      return "Esta innovación podría transformar la forma en que interactuamos con la tecnología."
    }
    if (subcategory === "digital") {
      return "Esta tendencia digital está cambiando los hábitos de consumo y comunicación."
    }
    if (subcategory === "scientific") {
      return "Este avance científico abre nuevas posibilidades para la investigación y el desarrollo."
    }
  }

  // Contextos para salud
  if (category === "health") {
    if (subcategory === "public_health") {
      return "Esta situación sanitaria requiere atención de las autoridades y la población."
    }
    if (subcategory === "healthcare") {
      return "Este desarrollo afecta la calidad y accesibilidad del sistema de salud."
    }
  }

  // Contextos para medio ambiente
  if (category === "environment") {
    if (subcategory === "climate") {
      return "Este fenómeno climático está relacionado con los efectos del cambio climático global."
    }
    if (subcategory === "conservation") {
      return "Esta iniciativa busca proteger la biodiversidad y los ecosistemas naturales."
    }
    if (subcategory === "pollution") {
      return "Este problema de contaminación afecta la calidad ambiental y la salud pública."
    }
  }

  // Contextos para nivel local/municipal
  if (category === "municipal" || category === "local") {
    if (subcategory === "infrastructure") {
      return "Esta obra de infraestructura busca mejorar los servicios públicos a nivel local."
    }
    if (subcategory === "housing") {
      return "Esta política habitacional afecta el acceso a la vivienda en la comunidad."
    }
    if (subcategory === "transportation") {
      return "Este cambio en el transporte impacta la movilidad urbana y la calidad de vida."
    }
  }

  // Contextos basados en el tipo de noticia
  if (newsType === "breaking") {
    return "Esta noticia de último momento está desarrollándose y podría tener actualizaciones."
  }
  if (newsType === "analysis") {
    return "Este análisis profundiza en las causas y consecuencias del tema tratado."
  }
  if (newsType === "opinion") {
    return "Esta opinión refleja una perspectiva particular sobre el tema en cuestión."
  }
  if (newsType === "investigation") {
    return "Esta investigación revela información que no estaba disponible públicamente."
  }

  // Contexto genérico
  return "Esta noticia forma parte de la actualidad informativa relevante para el debate público."
}

// Modificar la función generateLegislativeInfo para crear una mejor conexión con el título de la noticia

function generateLegislativeInfo(
  title: string,
  category: string,
  source: string,
): NewsItem["legislativeInfo"] | undefined {
  // Solo algunas noticias tendrán información legislativa (aproximadamente 20%)
  if (Math.random() > 0.2) {
    return undefined
  }

  // Determinar si el título parece relacionado con una ley o debate legislativo
  const legislativeKeywords = [
    "ley",
    "proyecto",
    "legislación",
    "congreso",
    "diputados",
    "senadores",
    "reforma",
    "normativa",
    "regulación",
    "debate",
    "votación",
  ]

  // Si el título no contiene palabras clave legislativas, aumentar la probabilidad de que no sea legislativo
  const titleLower = title.toLowerCase()
  const containsKeyword = legislativeKeywords.some((keyword) => titleLower.includes(keyword))
  if (!containsKeyword && Math.random() > 0.3) {
    return undefined
  }

  // Extraer tema principal del título para generar un nombre de ley relacionado
  let lawName = ""
  let lawDescription = ""

  // Analizar el título para extraer el tema principal
  const titleWords = title.split(" ")
  const keyNouns = titleWords.filter(
    (word) =>
      word.length > 4 &&
      !["sobre", "entre", "para", "desde", "como", "esta", "este", "nuevo", "nueva"].includes(word.toLowerCase()),
  )

  // Usar el tema del título para generar un nombre de ley relacionado
  if (category === "politics" || category === "nacional") {
    // Si el título menciona reforma, usar ese contexto
    if (titleLower.includes("reforma")) {
      const reformType = titleLower.includes("sanitaria")
        ? "Sanitaria"
        : titleLower.includes("electoral")
          ? "Electoral"
          : titleLower.includes("judicial")
            ? "Judicial"
            : titleLower.includes("fiscal")
              ? "Fiscal"
              : "Integral"

      lawName = `Ley de Reforma ${reformType}`
      lawDescription = `Proyecto que busca modificar el sistema ${reformType.toLowerCase()} para adaptarlo a las necesidades actuales y futuras del país.`
    }
    // Si menciona acuerdo o tratado
    else if (titleLower.includes("acuerdo") || titleLower.includes("tratado") || titleLower.includes("cumbre")) {
      lawName = "Ley de Ratificación de Acuerdos Internacionales"
      lawDescription = `Proyecto para la aprobación legislativa del acuerdo internacional mencionado en la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    } else {
      const topics = ["Transparencia", "Modernización", "Participación Ciudadana", "Financiamiento", "Gobernanza"]
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]

      lawName = `Ley de ${randomTopic} en ${category === "politics" ? "Política Internacional" : "Política Nacional"}`
      lawDescription = `Proyecto relacionado con la noticia sobre ${keyNouns.slice(0, 3).join(" ")}, que busca establecer nuevos estándares de ${randomTopic.toLowerCase()} en el ámbito político.`
    }
  } else if (category === "business" || category === "economy") {
    if (titleLower.includes("inversión") || titleLower.includes("financiación")) {
      lawName = "Ley de Promoción de Inversiones"
      lawDescription = `Proyecto de ley vinculado a la noticia sobre ${keyNouns.slice(0, 3).join(" ")}, que establece incentivos para atraer inversiones en sectores estratégicos.`
    } else if (titleLower.includes("impuesto") || titleLower.includes("fiscal") || titleLower.includes("tributaria")) {
      lawName = "Reforma Tributaria"
      lawDescription = `Reforma integral del sistema impositivo relacionada con la noticia sobre ${keyNouns.slice(0, 3).join(" ")}, que busca mejorar la recaudación y reducir la evasión.`
    } else {
      lawName = "Ley de Fomento a la Actividad Económica"
      lawDescription = `Proyecto vinculado a la noticia sobre ${keyNouns.slice(0, 3).join(" ")}, que busca impulsar el desarrollo económico y la creación de empleo.`
    }
  } else if (category === "technology") {
    if (titleLower.includes("inteligencia artificial") || titleLower.includes("ia")) {
      lawName = "Ley de Regulación de Inteligencia Artificial"
      lawDescription = `Marco regulatorio para el desarrollo y uso responsable de sistemas de IA, en relación con la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    } else if (titleLower.includes("datos") || titleLower.includes("privacidad")) {
      lawName = "Ley de Protección de Datos Personales"
      lawDescription = `Iniciativa para actualizar la normativa de protección de datos personales según estándares internacionales, vinculada a la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    } else {
      lawName = "Ley de Transformación Digital"
      lawDescription = `Proyecto para impulsar la digitalización de la economía y la sociedad, en relación con la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    }
  } else if (category === "health") {
    if (titleLower.includes("tratamiento") || titleLower.includes("medicamento")) {
      lawName = "Ley de Acceso a Tratamientos Médicos"
      lawDescription = `Proyecto que busca garantizar el acceso a tratamientos médicos innovadores, en relación con la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    } else if (titleLower.includes("sanitaria") || titleLower.includes("salud")) {
      lawName = "Ley de Reforma del Sistema de Salud"
      lawDescription = `Proyecto que busca reorganizar el sistema de salud para mejorar la accesibilidad y calidad, vinculado a la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    } else {
      lawName = "Ley de Cobertura Sanitaria Universal"
      lawDescription = `Proyecto para garantizar cobertura sanitaria básica a toda la población, en relación con la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    }
  } else if (category === "environment") {
    if (titleLower.includes("clima") || titleLower.includes("emisiones")) {
      lawName = "Ley de Cambio Climático"
      lawDescription = `Propuesta que establece metas de reducción de emisiones y adaptación al cambio climático, vinculada a la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    } else if (titleLower.includes("energía") || titleLower.includes("renovable")) {
      lawName = "Ley de Energías Renovables"
      lawDescription = `Iniciativa para promover la transición hacia fuentes de energía renovable, en relación con la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    } else {
      lawName = "Ley de Protección Ambiental"
      lawDescription = `Proyecto que actualiza los estándares de protección ambiental y sanciones por incumplimiento, vinculado a la noticia sobre ${keyNouns.slice(0, 3).join(" ")}.`
    }
  } else {
    // Para otras categorías, usar un enfoque más genérico pero contextualizado
    const genericLaws = [
      "Ley de Desarrollo Regional",
      "Ley de Infraestructura",
      "Ley de Seguridad Ciudadana",
      "Ley de Presupuesto",
      "Ley de Reforma Administrativa",
    ]

    lawName = genericLaws[Math.floor(Math.random() * genericLaws.length)]
    lawDescription = `Este proyecto de ley está relacionado con la noticia sobre ${keyNouns.slice(0, 3).join(" ")}. Busca establecer un marco normativo actualizado para abordar los desafíos mencionados en el artículo.`
  }

  // Generar fecha de votación (entre 1 y 60 días en el futuro)
  const today = new Date()
  const voteDateObj = new Date(today)
  voteDateObj.setDate(today.getDate() + Math.floor(Math.random() * 60) + 1)
  const voteDate = voteDateObj.toISOString()

  // Generar predicciones de voto para cada partido
  const votePredicciones: Record<
    PoliticalParty,
    {
      voteYes: number
      voteNo: number
      abstention: number
      justification: string
    }
  > = {
    "libertad-avanza": generateVotePrediction("libertad-avanza", lawName, category),
    "union-patria": generateVotePrediction("union-patria", lawName, category),
    "juntos-cambio": generateVotePrediction("juntos-cambio", lawName, category),
    "frente-izquierda": generateVotePrediction("frente-izquierda", lawName, category),
    otros: generateVotePrediction("otros", lawName, category),
  }

  return {
    isLegislative: true,
    lawName,
    lawDescription,
    voteDate,
    votePredicciones,
  }
}

// Función para generar predicciones de voto según el partido y la ley
function generateVotePrediction(
  party: PoliticalParty,
  lawName: string,
  category: string,
): {
  voteYes: number
  voteNo: number
  abstention: number
  justification: string
} {
  // Valores base según el partido y la categoría
  let voteYesBase = 50
  let abstentionBase = 10

  // Ajustar según el partido y la categoría
  if (party === "libertad-avanza") {
    // La Libertad Avanza tiende a favorecer desregulación, libre mercado
    if (
      category === "business" ||
      category === "economy" ||
      lawName.includes("Simplificación") ||
      lawName.includes("Inversiones")
    ) {
      voteYesBase += 30
    } else if (
      category === "environment" ||
      lawName.includes("Regulación") ||
      lawName.includes("Impuestos") ||
      lawName.includes("Tributaria")
    ) {
      voteYesBase -= 30
    }
  } else if (party === "union-patria") {
    // Unión por la Patria tiende a favorecer intervención estatal, políticas sociales
    if (
      category === "health" ||
      category === "social" ||
      lawName.includes("Cobertura") ||
      lawName.includes("Protección")
    ) {
      voteYesBase += 30
    } else if (
      lawName.includes("Privatización") ||
      lawName.includes("Desregulación") ||
      lawName.includes("Flexibilización")
    ) {
      voteYesBase -= 30
    }
  } else if (party === "juntos-cambio") {
    // Juntos por el Cambio posición más moderada, pro-mercado pero con regulaciones
    if (lawName.includes("Modernización") || lawName.includes("Transparencia") || lawName.includes("Digital")) {
      voteYesBase += 25
    } else if (lawName.includes("Emergencia") || lawName.includes("Intervención")) {
      voteYesBase -= 20
    }
  } else if (party === "frente-izquierda") {
    // Frente de Izquierda tiende a oponerse a políticas de mercado, favorecer derechos laborales
    if (
      lawName.includes("Trabajadores") ||
      lawName.includes("Laboral") ||
      lawName.includes("Derechos") ||
      category === "social"
    ) {
      voteYesBase += 30
    } else if (
      lawName.includes("Privatización") ||
      lawName.includes("Inversiones") ||
      lawName.includes("Flexibilización")
    ) {
      voteYesBase -= 40
    }
  }

  // Añadir variación aleatoria
  voteYesBase = Math.min(Math.max(voteYesBase + Math.floor(Math.random() * 20) - 10, 5), 95)
  abstentionBase = Math.min(Math.max(abstentionBase + Math.floor(Math.random() * 10) - 5, 0), 30)

  // Calcular voto negativo
  const voteNoBase = 100 - voteYesBase - abstentionBase

  // Generar justificación según la tendencia del voto
  let justification = ""
  if (voteYesBase >= 70) {
    justification = getPositiveJustification(party, lawName, category)
  } else if (voteYesBase <= 30) {
    justification = getNegativeJustification(party, lawName, category)
  } else {
    justification = getMixedJustification(party, lawName, category)
  }

  return {
    voteYes: voteYesBase,
    voteNo: voteNoBase,
    abstention: abstentionBase,
    justification,
  }
}

// Funciones para generar justificaciones de voto
function getPositiveJustification(party: PoliticalParty, lawName: string, category: string): string {
  const justifications: Record<PoliticalParty, string[]> = {
    "libertad-avanza": [
      "Apoya la iniciativa por su enfoque en reducir la intervención estatal y promover la libertad económica.",
      "Considera que el proyecto favorece el desarrollo del sector privado y la eliminación de trabas burocráticas.",
      "Valora positivamente la reducción de regulaciones que propone la ley.",
      "Destaca que la propuesta está alineada con los principios de libre mercado y respeto a la propiedad privada.",
    ],
    "union-patria": [
      "Respalda el proyecto por su enfoque en la protección de derechos y la inclusión social.",
      "Considera que la iniciativa fortalece el rol del Estado como garante del bienestar colectivo.",
      "Valora el impacto positivo que tendrá en los sectores más vulnerables de la sociedad.",
      "Destaca que la propuesta continúa el legado de políticas públicas orientadas a la justicia social.",
    ],
    "juntos-cambio": [
      "Apoya la iniciativa por su enfoque en la modernización institucional y la eficiencia.",
      "Considera que el proyecto equilibra adecuadamente el desarrollo económico con la necesaria regulación.",
      "Valora positivamente las medidas de transparencia y rendición de cuentas incluidas en la propuesta.",
      "Destaca que la ley fortalece el marco institucional y la seguridad jurídica.",
    ],
    "frente-izquierda": [
      "Respalda el proyecto por su enfoque en la protección de derechos laborales y sociales.",
      "Considera que la iniciativa representa un avance en la lucha contra la desigualdad estructural.",
      "Valora las medidas que limitan el poder de los sectores concentrados de la economía.",
      "Destaca que la propuesta prioriza las necesidades populares por sobre los intereses corporativos.",
    ],
    otros: [
      "Apoya la iniciativa por considerarla beneficiosa para el desarrollo nacional.",
      "Considera que el proyecto responde a necesidades concretas de la ciudadanía.",
      "Valora el enfoque pragmático y los potenciales resultados positivos de la ley.",
      "Destaca el consenso técnico que existe sobre la necesidad de estas medidas.",
    ],
  }

  return justifications[party][Math.floor(Math.random() * justifications[party].length)]
}

function getNegativeJustification(party: PoliticalParty, lawName: string, category: string): string {
  const justifications: Record<PoliticalParty, string[]> = {
    "libertad-avanza": [
      "Rechaza la iniciativa por considerarla una nueva forma de intervención estatal que limita libertades individuales.",
      "Se opone al proyecto por su enfoque estatista y el aumento de regulaciones que implica.",
      "Critica la propuesta por crear nuevas cargas fiscales y obstáculos para el sector privado.",
      "Considera que la ley representa un retroceso en términos de libertad económica y derechos de propiedad.",
    ],
    "union-patria": [
      "Rechaza la iniciativa por favorecer intereses corporativos en detrimento del bienestar colectivo.",
      "Se opone al proyecto por su enfoque neoliberal que debilita el rol del Estado como garante de derechos.",
      "Critica la propuesta por profundizar desigualdades y afectar a los sectores más vulnerables.",
      "Considera que la ley representa un retroceso en materia de soberanía nacional y justicia social.",
    ],
    "juntos-cambio": [
      "Rechaza la iniciativa por su improvisación y falta de consenso técnico.",
      "Se opone al proyecto por considerarlo fiscalmente irresponsable y de difícil implementación.",
      "Critica la propuesta por no abordar los problemas estructurales que pretende resolver.",
      "Considera que la ley carece de los mecanismos de control y transparencia necesarios.",
    ],
    "frente-izquierda": [
      "Rechaza la iniciativa por profundizar el modelo de explotación capitalista.",
      "Se opone al proyecto por favorecer a los grandes grupos económicos en detrimento de los trabajadores.",
      "Critica la propuesta por no cuestionar las bases del sistema que genera desigualdad y exclusión.",
      "Considera que la ley representa un nuevo ataque a los derechos conquistados por las luchas populares.",
    ],
    otros: [
      "Rechaza la iniciativa por considerarla inoportuna en el contexto actual.",
      "Se opone al proyecto por su enfoque parcial que no aborda la complejidad del problema.",
      "Critica la propuesta por carecer de los estudios de impacto necesarios.",
      "Considera que existen alternativas más eficientes para abordar la problemática en cuestión.",
    ],
  }

  return justifications[party][Math.floor(Math.random() * justifications[party].length)]
}

function getMixedJustification(party: PoliticalParty, lawName: string, category: string): string {
  const justifications: Record<PoliticalParty, string[]> = {
    "libertad-avanza": [
      "Mantiene una posición ambivalente, valorando algunos aspectos desregulatorios pero cuestionando nuevas intervenciones estatales.",
      "Reconoce elementos positivos en la iniciativa, aunque considera que no avanza lo suficiente en reducir el tamaño del Estado.",
      "Propone modificaciones sustanciales para alinear el proyecto con principios de libertad económica y respeto a la propiedad privada.",
      "Condiciona su apoyo a la eliminación de artículos que considera contrarios al libre mercado.",
    ],
    "union-patria": [
      "Mantiene una posición crítica pero dialoguista, reconociendo la necesidad de la ley pero cuestionando su enfoque.",
      "Propone modificaciones para fortalecer los mecanismos de protección social y el rol del Estado.",
      "Condiciona su apoyo a la inclusión de garantías para los sectores más vulnerables afectados por la medida.",
      "Busca un equilibrio entre la necesidad de la reforma y la preservación de derechos adquiridos.",
    ],
    "juntos-cambio": [
      "Mantiene una posición moderada, valorando el espíritu de la ley pero proponiendo ajustes técnicos.",
      "Reconoce la necesidad de la iniciativa aunque cuestiona aspectos de su implementación y financiamiento.",
      "Propone un enfoque gradual y consensuado que permita evaluar resultados antes de avanzar con todas las medidas.",
      "Condiciona su apoyo a la inclusión de mayores mecanismos de control y transparencia.",
    ],
    "frente-izquierda": [
      "Mantiene una posición crítica, reconociendo algunos avances puntuales pero cuestionando el marco general de la propuesta.",
      "Propone modificaciones radicales que transformen el proyecto en una verdadera herramienta de cambio estructural.",
      "Condiciona su apoyo a la inclusión de medidas que afecten directamente a los sectores concentrados de la economía.",
      "Plantea la necesidad de una consulta popular para decidir sobre temas que afectan derechos fundamentales.",
    ],
    otros: [
      "Mantiene una posición pragmática, evaluando la iniciativa en función de sus resultados concretos más que de posiciones ideológicas.",
      "Propone un enfoque basado en evidencia que permita ajustar la ley según los resultados que se vayan obteniendo.",
      "Condiciona su apoyo a la inclusión de mecanismos de evaluación periódica y rendición de cuentas.",
      "Busca construir consensos amplios que garanticen la estabilidad y continuidad de las políticas más allá de los cambios de gobierno.",
    ],
  }

  return justifications[party][Math.floor(Math.random() * justifications[party].length)]
}

// Esto sería reemplazado con llamadas API reales a fuentes de noticias o un servicio de web scraping
export async function fetchNews(category: string): Promise<NewsItem[]> {
  // En una implementación real, esto llamaría a una API o usaría una acción del servidor para extraer noticias
  // Para fines de demostración, devolveremos datos simulados

  // Simular retraso de llamada API
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return getMockNewsItems(category)
}

function getMockNewsItems(category: string): NewsItem[] {
  const now = new Date()

  const mockNews: Record<string, NewsItem[]> = {
    politics: [
      {
        title: "Cumbre Global sobre Política Climática concluye con nuevos acuerdos",
        source: "Internacional Herald",
        url: "https://www.bbc.com/news/science-environment-56837908",
        summary: "Líderes de 195 países llegaron a un consenso sobre la reducción de emisiones de carbono para 2030.",
        category: "politics",
        subcategory: "diplomatic",
        newsType: "report",
        context: "Este acuerdo internacional tendrá implicaciones directas en las políticas ambientales de Argentina.",
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 65, neutral: 20, negative: 15 },
        shareMetrics: { total: 12500, facebook: 5200, twitter: 3800, whatsapp: 2500, other: 1000 },
        legislativeInfo: generateLegislativeInfo(
          "Cumbre Global sobre Política Climática concluye con nuevos acuerdos",
          "politics",
          "Internacional Herald",
        ),
      },
      {
        title: "El Parlamento debate nuevo proyecto de reforma sanitaria",
        source: "Tiempos Nacionales",
        url: "https://www.nytimes.com/2023/04/15/world/europe/healthcare-reform-debate.html",
        summary:
          "La legislación propuesta tiene como objetivo ampliar la cobertura y reducir los costos para los ciudadanos.",
        category: "politics",
        subcategory: "legislative",
        newsType: "developing",
        context: "Este debate legislativo podría transformar el sistema de salud con impacto directo en la población.",
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 48, neutral: 32, negative: 20 },
        shareMetrics: { total: 8700, facebook: 3600, twitter: 2100, whatsapp: 2200, other: 800 },
        legislativeInfo: generateLegislativeInfo(
          "El Parlamento debate nuevo proyecto de reforma sanitaria",
          "health",
          "Tiempos Nacionales",
        ),
      },
      {
        title: "Resultados electorales muestran cambio en la demografía de votantes",
        source: "Democracia Hoy",
        url: "https://www.theguardian.com/politics/2023/apr/12/election-results-voter-demographics",
        summary: "El análisis revela patrones cambiantes en el comportamiento de voto en diferentes grupos de edad.",
        category: "politics",
        subcategory: "electoral",
        newsType: "analysis",
        context: "Este análisis electoral revela tendencias que podrían redefinir las estrategias de campaña futuras.",
        publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 52, neutral: 28, negative: 20 },
        shareMetrics: { total: 15300, facebook: 6200, twitter: 4500, whatsapp: 3100, other: 1500 },
      },
      {
        title: "Negociaciones comerciales entre las principales economías se estancan",
        source: "Revisión de Negocios Globales",
        url: "https://www.ft.com/content/3a7d6700-9f9a-11e9-b8ce-8b459ed04726",
        summary: "Desacuerdos sobre aranceles y acceso al mercado han retrasado la finalización del acuerdo.",
        category: "politics",
        subcategory: "diplomatic",
        newsType: "developing",
        context:
          "Este estancamiento comercial podría afectar las exportaciones argentinas y el acceso a mercados clave.",
        publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 35, neutral: 40, negative: 25 },
        shareMetrics: { total: 7200, facebook: 2800, twitter: 2200, whatsapp: 1500, other: 700 },
      },
    ],
    business: [
      {
        title: "Gigante tecnológico anuncia importante inversión en energía renovable",
        source: "Business Insider",
        url: "https://www.businessinsider.com/tech-giant-renewable-energy-investment-2023-4",
        summary: "La empresa planea alimentar todas sus operaciones con energía limpia para 2025.",
        category: "business",
        subcategory: "companies",
        newsType: "announcement",
        context: "Esta inversión corporativa marca una tendencia hacia la sostenibilidad en el sector tecnológico.",
        publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 78, neutral: 15, negative: 7 },
        shareMetrics: { total: 18500, facebook: 7800, twitter: 5200, whatsapp: 3800, other: 1700 },
      },
      {
        title: "Mercados bursátiles reaccionan a la decisión de tasas de interés del Banco Central",
        source: "Financial Times",
        url: "https://www.ft.com/content/markets/equities",
        summary: "Los inversores respondieron positivamente al anuncio, con los principales índices al alza.",
        category: "business",
        subcategory: "markets",
        newsType: "breaking",
        context: "Esta decisión monetaria impacta directamente en las inversiones y el costo del crédito.",
        publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 62, neutral: 25, negative: 13 },
        shareMetrics: { total: 9800, facebook: 3900, twitter: 2900, whatsapp: 2100, other: 900 },
      },
      {
        title: "Startup asegura financiación récord para solución de IA en salud",
        source: "Venture Beat",
        url: "https://venturebeat.com/ai/healthcare-ai-startup-funding/",
        summary: "La inversión de $200 millones acelerará el desarrollo de herramientas de diagnóstico.",
        category: "business",
        subcategory: "innovation",
        newsType: "report",
        context: "Esta financiación representa un hito en la aplicación de IA al sector salud en la región.",
        publishedAt: new Date(now.getTime() - 9 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 81, neutral: 12, negative: 7 },
        shareMetrics: { total: 22000, facebook: 8500, twitter: 7200, whatsapp: 4300, other: 2000 },
      },
      {
        title: "Congreso debate ley de incentivos fiscales para pequeñas empresas",
        source: "Industry Week",
        url: "https://www.industryweek.com/supply-chain/article/21254523/tax-incentives-small-business",
        summary: "La propuesta busca reducir la carga impositiva para emprendedores y PyMEs en crecimiento.",
        category: "business",
        subcategory: "fiscal",
        newsType: "developing",
        context: "Esta legislación fiscal podría transformar el panorama para pequeñas empresas y emprendedores.",
        publishedAt: new Date(now.getTime() - 15 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 72, neutral: 18, negative: 10 },
        shareMetrics: { total: 8500, facebook: 3400, twitter: 2800, whatsapp: 1600, other: 700 },
        legislativeInfo: generateLegislativeInfo(
          "Congreso debate ley de incentivos fiscales para pequeñas empresas",
          "business",
          "Industry Week",
        ),
      },
    ],
    technology: [
      {
        title: "Anunciado nuevo avance en computación cuántica",
        source: "Tech Review",
        url: "https://www.technologyreview.com/2023/04/14/quantum-computing-breakthrough/",
        summary: "Los investigadores han logrado qubits estables a temperatura ambiente por primera vez.",
        category: "technology",
        subcategory: "scientific",
        newsType: "breaking",
        context: "Este avance científico podría revolucionar la capacidad de procesamiento de datos a nivel global.",
        publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 75, neutral: 20, negative: 5 },
        shareMetrics: { total: 14200, facebook: 5800, twitter: 4500, whatsapp: 2900, other: 1000 },
      },
      {
        title: "Modelo de IA supera a humanos en desafío de diagnóstico médico",
        source: "Digital Health",
        url: "https://www.digitalhealth.net/ai-medical-diagnosis-challenge/",
        summary: "El sistema demostró una precisión del 95% en una variedad de condiciones.",
        category: "technology",
        subcategory: "innovation",
        newsType: "report",
        context: "Esta innovación en IA médica podría transformar los procesos de diagnóstico en el sistema de salud.",
        publishedAt: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 82, neutral: 12, negative: 6 },
        shareMetrics: { total: 19500, facebook: 7800, twitter: 6200, whatsapp: 3800, other: 1700 },
      },
      {
        title: "Legisladores presentan proyecto de ley para regular la inteligencia artificial",
        source: "Tech Ethics Journal",
        url: "https://techethics.com/ai-regulation-bill-introduced/",
        summary: "La propuesta busca establecer estándares éticos y de seguridad para sistemas de IA.",
        category: "technology",
        subcategory: "legislative",
        newsType: "developing",
        context: "Este marco regulatorio definirá el futuro desarrollo y aplicación de la IA en el país.",
        publishedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 58, neutral: 22, negative: 20 },
        shareMetrics: { total: 12800, facebook: 5200, twitter: 4100, whatsapp: 2500, other: 1000 },
        legislativeInfo: generateLegislativeInfo(
          "Legisladores presentan proyecto de ley para regular la inteligencia artificial",
          "technology",
          "Tech Ethics Journal",
        ),
      },
      {
        title: "Tecnología de baterías para vehículos eléctricos muestra importantes ganancias de eficiencia",
        source: "Clean Tech News",
        url: "https://cleantechnews.com/ev-battery-efficiency-gains/",
        summary: "Nueva química extiende el alcance en un 40% mientras reduce el tiempo de carga.",
        category: "technology",
        subcategory: "innovation",
        newsType: "report",
        context: "Este avance tecnológico podría acelerar la transición hacia la movilidad eléctrica en Argentina.",
        publishedAt: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(),
        acceptance: { positive: 88, neutral: 10, negative: 2 },
        shareMetrics: { total: 16700, facebook: 6800, twitter: 5100, whatsapp: 3400, other: 1400 },
      },
    ],
  }

  // Para las categorías que no tienen datos predefinidos, generar dinámicamente
  const categories = ["health", "environment", "nacional", "provincial", "municipal", "local"]

  // Mejorar la diversidad de fuentes de noticias
  // Modificar la función getMockNewsItems para incluir más fuentes diversas

  // Añadir estas fuentes adicionales en la sección donde se definen las fuentes
  const additionalSources = [
    "El Cronista",
    "Perfil",
    "Diario Popular",
    "Crónica",
    "El Economista",
    "Tiempo Argentino",
    "La Política Online",
    "El Destape",
    "Infobae",
    "Minuto Uno",
    "iProfesional",
    "BAE Negocios",
    "Ámbito Financiero",
    "La Izquierda Diario",
    "Revista Noticias",
    "El Cohete a la Luna",
    "Revista Anfibia",
    "Chequeado",
    "RedAcción",
    "La Voz del Interior",
    "Los Andes",
    "La Capital",
    "El Litoral",
    "Río Negro",
    "El Tribuno",
  ]

  categories.forEach((cat) => {
    if (!mockNews[cat]) {
      mockNews[cat] = []

      // Generar 4-6 noticias para cada categoría
      const numNews = 4 + Math.floor(Math.random() * 3)

      for (let i = 0; i < numNews; i++) {
        const hoursAgo = 2 + Math.floor(Math.random() * 15)
        const publishedAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString()

        // Seleccionar una fuente según la categoría
        let source = ""
        if (cat === "health") {
          source = ["Health Science Journal", "Medical News Today", "WebMD", "Healthline"][
            Math.floor(Math.random() * 4)
          ]
        } else if (cat === "environment") {
          source = ["National Geographic", "Environmental Action", "Green News", "Climate Home"][
            Math.floor(Math.random() * 4)
          ]
        } else if (cat === "nacional") {
          // Modificar la selección de fuentes para usar también las adicionales
          // Buscar la sección donde se seleccionan las fuentes y modificarla para incluir las nuevas
          const allNationalSources = [
            "Clarín",
            "La Nación",
            "Infobae",
            "Página/12",
            "Ámbito Financiero",
            "El Cronista",
            "Perfil",
            "Tiempo Argentino",
            "El Destape",
            "La Política Online",
          ]
          source = allNationalSources[Math.floor(Math.random() * allNationalSources.length)]
        } else if (cat === "provincial") {
          const allProvincialSources = [
            "El Día",
            "La Capital",
            "Diario Río Negro",
            "Los Andes",
            "El Litoral",
            "La Voz del Interior",
            "El Tribuno",
            "La Gaceta",
          ]
          source = allProvincialSources[Math.floor(Math.random() * allProvincialSources.length)]
        } else if (cat === "municipal") {
          source = ["La Voz Municipal", "El Eco", "Diario Local", "Crónica Municipal"][Math.floor(Math.random() * 4)]
        } else if (cat === "local") {
          source = ["El Barrio", "Noticias Vecinales", "Mi Barrio", "Comercio Local"][Math.floor(Math.random() * 4)]
        }

        // Generar un título genérico para la categoría
        let title = ""
        let subcategory: NewsSubcategory = "other"
        let newsType: NewsType = "other"
        let context = ""

        if (cat === "health") {
          const healthTitles = [
            "Estudio revela beneficios de nuevo tratamiento",
            "Avance prometedor en investigación médica",
            "Autoridades sanitarias emiten recomendaciones actualizadas",
            "Descubren relación entre hábitos y condición de salud",
            "Campaña de prevención muestra resultados positivos",
          ]
          title = healthTitles[Math.floor(Math.random() * healthTitles.length)]

          // Determinar subcategoría para salud
          if (title.includes("estudio") || title.includes("investigación") || title.includes("descubren")) {
            subcategory = "scientific"
            newsType = "report"
            context = "Este hallazgo científico podría transformar los protocolos de tratamiento actuales."
          } else if (title.includes("autoridades") || title.includes("campaña") || title.includes("prevención")) {
            subcategory = "public_health"
            newsType = "announcement"
            context = "Esta iniciativa de salud pública busca mejorar los indicadores sanitarios de la población."
          } else {
            subcategory = "healthcare"
            newsType = "other"
            context = "Este desarrollo médico podría mejorar la calidad de vida de numerosos pacientes."
          }
        } else if (cat === "environment") {
          const environmentTitles = [
            "Informe alerta sobre impacto ambiental en región",
            "Iniciativa de conservación logra resultados importantes",
            "Científicos documentan cambios en ecosistema local",
            "Proyecto de energía renovable avanza a siguiente fase",
            "Comunidades se unen para proteger recursos naturales",
          ]
          title = environmentTitles[Math.floor(Math.random() * environmentTitles.length)]

          // Determinar subcategoría para medio ambiente
          if (title.includes("impacto") || title.includes("alerta")) {
            subcategory = "pollution"
            newsType = "report"
            context = "Este problema ambiental requiere atención urgente para evitar daños irreversibles."
          } else if (title.includes("conservación") || title.includes("proteger") || title.includes("ecosistema")) {
            subcategory = "conservation"
            newsType = "report"
            context = "Esta iniciativa de conservación es crucial para preservar la biodiversidad local."
          } else if (title.includes("energía") || title.includes("renovable")) {
            subcategory = "climate"
            newsType = "developing"
            context = "Este proyecto energético contribuye a la transición hacia una economía baja en carbono."
          } else {
            subcategory = "other"
            newsType = "other"
            context = "Esta situación ambiental tiene implicaciones para la sostenibilidad a largo plazo."
          }
        } else if (cat === "nacional") {
          const nacionalTitles = [
            "Gobierno anuncia nuevo plan económico",
            "Debate parlamentario sobre reforma clave",
            "Indicadores económicos muestran tendencia positiva",
            "Ministro presenta informe sobre gestión sectorial",
            "Acuerdo nacional busca consenso en tema estratégico",
          ]
          title = nacionalTitles[Math.floor(Math.random() * nacionalTitles.length)]

          // Determinar subcategoría para nacional
          if (title.includes("Gobierno") || title.includes("Ministro")) {
            subcategory = "executive"
            newsType = "announcement"
            context = "Esta decisión del ejecutivo nacional marca la dirección de las políticas públicas."
          } else if (title.includes("parlamentario") || title.includes("reforma")) {
            subcategory = "legislative"
            newsType = "developing"
            context = "Este debate legislativo definirá el marco normativo para los próximos años."
          } else if (title.includes("económicos") || title.includes("plan económico")) {
            subcategory = "economic_policy"
            newsType = "report"
            context = "Estos indicadores económicos reflejan el impacto de las políticas macroeconómicas actuales."
          } else {
            subcategory = "other"
            newsType = "other"
            context = "Este desarrollo nacional tiene implicaciones para diversos sectores de la sociedad."
          }
        } else if (cat === "provincial") {
          const provincialTitles = [
            "Gobernador inaugura obras de infraestructura",
            "Legislatura provincial aprueba presupuesto anual",
            "Plan de desarrollo regional muestra primeros resultados",
            "Autoridades provinciales coordinan respuesta a emergencia",
            "Inversión millonaria para mejorar servicios provinciales",
          ]
          title = provincialTitles[Math.floor(Math.random() * provincialTitles.length)]

          // Determinar subcategoría para provincial
          if (title.includes("infraestructura") || title.includes("obras")) {
            subcategory = "infrastructure"
            newsType = "announcement"
            context = "Esta obra de infraestructura busca mejorar la conectividad y servicios en la provincia."
          } else if (title.includes("Legislatura") || title.includes("presupuesto")) {
            subcategory = "fiscal"
            newsType = "report"
            context = "Esta decisión presupuestaria define las prioridades de inversión provincial."
          } else if (title.includes("desarrollo") || title.includes("inversión")) {
            subcategory = "economic_policy"
            newsType = "report"
            context = "Este plan de desarrollo busca potenciar las economías regionales de la provincia."
          } else {
            subcategory = "other"
            newsType = "other"
            context = "Esta iniciativa provincial impacta en la calidad de vida de los habitantes de la región."
          }
        } else if (cat === "municipal") {
          const municipalTitles = [
            "Municipio implementa nuevo sistema de gestión",
            "Concejo Deliberante debate ordenanza importante",
            "Intendente recorre obras en diferentes barrios",
            "Servicios municipales se modernizan con nueva tecnología",
            "Vecinos participan en consulta sobre proyecto urbano",
          ]
          title = municipalTitles[Math.floor(Math.random() * municipalTitles.length)]

          // Determinar subcategoría para municipal
          if (title.includes("sistema") || title.includes("servicios") || title.includes("tecnología")) {
            subcategory = "digital"
            newsType = "announcement"
            context = "Esta modernización de servicios municipales busca mejorar la atención al ciudadano."
          } else if (title.includes("Concejo") || title.includes("ordenanza")) {
            subcategory = "legislative"
            newsType = "developing"
            context = "Esta normativa municipal regulará aspectos clave de la vida comunitaria."
          } else if (title.includes("obras") || title.includes("barrios")) {
            subcategory = "infrastructure"
            newsType = "report"
            context = "Estas obras barriales buscan mejorar la infraestructura urbana y la calidad de vida."
          } else {
            subcategory = "other"
            newsType = "other"
            context = "Esta iniciativa municipal tiene impacto directo en la vida cotidiana de los vecinos."
          }
        } else if (cat === "local") {
          const localTitles = [
            "Barrio celebra inauguración de espacio comunitario",
            "Iniciativa vecinal transforma área abandonada",
            "Comerciantes locales lanzan campaña conjunta",
            "Escuela del barrio recibe reconocimiento por proyecto",
            "Vecinos organizan evento cultural con gran participación",
          ]
          title = localTitles[Math.floor(Math.random() * localTitles.length)]

          // Determinar subcategoría para local
          if (title.includes("espacio") || title.includes("área")) {
            subcategory = "infrastructure"
            newsType = "report"
            context = "Este espacio comunitario fortalece el tejido social y mejora el entorno urbano local."
          } else if (title.includes("comerciantes") || title.includes("campaña")) {
            subcategory = "economic_policy"
            newsType = "announcement"
            context = "Esta iniciativa comercial busca dinamizar la economía local y generar empleo."
          } else if (title.includes("escuela") || title.includes("proyecto")) {
            subcategory = "education"
            newsType = "report"
            context = "Este proyecto educativo innovador mejora las oportunidades para niños y jóvenes del barrio."
          } else {
            subcategory = "other"
            newsType = "other"
            context = "Esta actividad comunitaria fortalece los lazos vecinales y la identidad barrial."
          }
        }

        // Generar un resumen genérico
        const summary = `Este artículo analiza los desarrollos recientes en ${cat} y su impacto en diferentes sectores. Expertos ofrecen perspectivas sobre las implicaciones a corto y largo plazo.`

        // Generar URL ficticia basada en la fuente
        const urlDomain = source.toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "")
        const url = `https://www.${urlDomain}.com/article/${Math.floor(Math.random() * 100000)}`

        // Generar métricas de aceptación y share
        const acceptance = generateAcceptanceMetrics(cat, source)
        const shareMetrics = generateShareMetrics(cat, source, publishedAt)

        // Determinar si esta noticia tendrá información legislativa
        // Para categorías como nacional, provincial y municipal, aumentamos la probabilidad
        const shouldHaveLegislativeInfo =
          (cat === "nacional" || cat === "provincial" || cat === "municipal") && Math.random() < 0.4

        // Generar información legislativa si corresponde
        const legislativeInfo = shouldHaveLegislativeInfo ? generateLegislativeInfo(title, cat, source) : undefined

        // Añadir la noticia a la categoría
        mockNews[cat].push({
          title,
          source,
          url,
          summary,
          category: cat,
          subcategory,
          newsType,
          context,
          publishedAt,
          acceptance,
          shareMetrics,
          legislativeInfo,
        })
      }
    }
  })

  // Asegurarse de que todas las noticias tengan las propiedades acceptance y shareMetrics
  const result = mockNews[category] || []
  return result.map((item) => ({
    ...item,
    acceptance: item.acceptance || { positive: 50, neutral: 30, negative: 20 },
    shareMetrics: item.shareMetrics || { total: 0, facebook: 0, twitter: 0, whatsapp: 0, other: 0 },
    subcategory: item.subcategory || determineSubcategory(item.title, item.category),
    newsType: item.newsType || determineNewsType(item.title, item.summary),
    context:
      item.context ||
      generateNewsContext(
        item.category,
        item.subcategory || determineSubcategory(item.title, item.category),
        item.newsType || determineNewsType(item.title, item.summary),
      ),
  }))
}
