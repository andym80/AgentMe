// Diccionario técnico para términos de economía y sociología
export interface DictionaryEntry {
  term: string
  definition: string
  category: "economia" | "sociologia" | "politica" | "general"
  relatedTerms?: string[]
  examples?: string[]
}

export const technicalDictionary: DictionaryEntry[] = [
  // Términos de Economía
  {
    term: "Inflación",
    definition:
      "Aumento generalizado y sostenido de los precios de bienes y servicios en un país durante un período de tiempo.",
    category: "economia",
    relatedTerms: ["Deflación", "Estanflación", "IPC", "Política monetaria"],
    examples: ["Argentina registró una inflación del 211.4% en 2023"],
  },
  {
    term: "Recesión",
    definition:
      "Período de disminución de la actividad económica, generalmente definido como dos trimestres consecutivos de caída en el PIB.",
    category: "economia",
    relatedTerms: ["Depresión económica", "Ciclo económico", "Contracción"],
    examples: ["La economía entró en recesión tras la pandemia"],
  },
  {
    term: "Tipo de cambio",
    definition:
      "Relación que existe entre el valor de una divisa y otra, es decir, la cantidad de pesos que se necesitan para comprar un dólar, un euro u otra moneda.",
    category: "economia",
    relatedTerms: ["Devaluación", "Apreciación", "Mercado cambiario", "Dólar blue"],
    examples: ["El tipo de cambio oficial se mantiene en 350 pesos por dólar"],
  },
  {
    term: "Déficit fiscal",
    definition: "Situación en la que los gastos del Estado superan a los ingresos en un período determinado.",
    category: "economia",
    relatedTerms: ["Superávit fiscal", "Deuda pública", "Ajuste fiscal"],
    examples: ["El gobierno busca reducir el déficit fiscal al 0% para 2024"],
  },
  {
    term: "Emisión monetaria",
    definition: "Creación de dinero por parte del banco central de un país, que aumenta la base monetaria.",
    category: "economia",
    relatedTerms: ["Base monetaria", "Política monetaria", "Inflación"],
    examples: ["La emisión monetaria para financiar el déficit fiscal contribuyó a la inflación"],
  },
  {
    term: "Cepo cambiario",
    definition: "Conjunto de restricciones impuestas por el gobierno para limitar la compra de divisas extranjeras.",
    category: "economia",
    relatedTerms: ["Control de cambios", "Mercado paralelo", "Brecha cambiaria"],
    examples: ["El cepo cambiario limita la compra de dólares a 200 por mes"],
  },
  {
    term: "Devaluación",
    definition: "Reducción del valor de la moneda nacional respecto a otras monedas extranjeras.",
    category: "economia",
    relatedTerms: ["Tipo de cambio", "Depreciación", "Política cambiaria"],
    examples: ["La devaluación del 54% en diciembre de 2023 impactó en los precios"],
  },
  {
    term: "Riesgo país",
    definition:
      "Indicador que mide la diferencia de tasa que pagan los bonos de un país respecto a los bonos del Tesoro de Estados Unidos.",
    category: "economia",
    relatedTerms: ["Bonos soberanos", "Default", "Mercados emergentes"],
    examples: ["El riesgo país de Argentina superó los 1500 puntos básicos"],
  },
  {
    term: "Coparticipación federal",
    definition:
      "Sistema de distribución de recursos fiscales entre el gobierno nacional y las provincias en Argentina.",
    category: "economia",
    relatedTerms: ["Federalismo fiscal", "Recursos tributarios", "Transferencias"],
    examples: ["La disputa por la coparticipación entre Nación y CABA llegó a la Corte Suprema"],
  },
  {
    term: "Ajuste fiscal",
    definition:
      "Conjunto de medidas destinadas a reducir el déficit público mediante recortes de gastos o aumento de ingresos.",
    category: "economia",
    relatedTerms: ["Déficit fiscal", "Austeridad", "Política fiscal"],
    examples: ["El gobierno implementó un ajuste fiscal del 5% del PIB"],
  },

  // Términos de Sociología
  {
    term: "Movilidad social",
    definition: "Movimiento de individuos o grupos entre diferentes posiciones socioeconómicas en una sociedad.",
    category: "sociologia",
    relatedTerms: ["Estratificación social", "Clase social", "Desigualdad"],
    examples: ["La educación pública fue históricamente un motor de movilidad social en Argentina"],
  },
  {
    term: "Pobreza estructural",
    definition:
      "Condición de pobreza persistente que se mantiene a lo largo del tiempo debido a factores estructurales de la sociedad.",
    category: "sociologia",
    relatedTerms: ["NBI", "Pobreza multidimensional", "Exclusión social"],
    examples: ["La pobreza estructural afecta al 28% de la población argentina"],
  },
  {
    term: "Indigencia",
    definition: "Situación en la que los ingresos de un hogar no alcanzan para cubrir una canasta básica alimentaria.",
    category: "sociologia",
    relatedTerms: ["Pobreza", "Línea de indigencia", "Inseguridad alimentaria"],
    examples: ["La tasa de indigencia alcanzó el 18% en el primer trimestre de 2024"],
  },
  {
    term: "Desigualdad social",
    definition: "Distribución desigual de oportunidades, recursos y recompensas entre diferentes grupos sociales.",
    category: "sociologia",
    relatedTerms: ["Coeficiente de Gini", "Brecha social", "Equidad"],
    examples: ["La desigualdad social se profundizó tras la crisis económica"],
  },
  {
    term: "Clientelismo político",
    definition:
      "Práctica política basada en el intercambio de favores, bienes o servicios a cambio de apoyo político o electoral.",
    category: "sociologia",
    relatedTerms: ["Patronazgo", "Asistencialismo", "Punteros políticos"],
    examples: ["El clientelismo político sigue siendo una práctica común en algunas regiones"],
  },
  {
    term: "Movimientos sociales",
    definition: "Grupos organizados que actúan colectivamente para promover o resistir cambios en la sociedad.",
    category: "sociologia",
    relatedTerms: ["Acción colectiva", "Protesta social", "Organizaciones de base"],
    examples: ["Los movimientos sociales se movilizaron contra el ajuste económico"],
  },
  {
    term: "Piquete",
    definition:
      "Forma de protesta que consiste en el bloqueo de calles, rutas o accesos como método de visibilización de demandas sociales.",
    category: "sociologia",
    relatedTerms: ["Movimientos piqueteros", "Protesta social", "Corte de ruta"],
    examples: ["Los piquetes en el centro porteño reclaman por programas sociales"],
  },
  {
    term: "Economía informal",
    definition:
      "Actividades económicas que no están reguladas ni protegidas por el Estado y que operan fuera del marco legal formal.",
    category: "sociologia",
    relatedTerms: ["Trabajo no registrado", "Empleo precario", "Cuentapropismo"],
    examples: ["El 40% de los trabajadores argentinos se desempeña en la economía informal"],
  },
  {
    term: "Segregación urbana",
    definition: "Separación espacial de diferentes grupos sociales en distintas áreas de una ciudad o región.",
    category: "sociologia",
    relatedTerms: ["Gentrificación", "Asentamientos informales", "Barrios cerrados"],
    examples: ["La segregación urbana se manifiesta en el contraste entre countries y villas miseria"],
  },
  {
    term: "Capital social",
    definition:
      "Conjunto de recursos actuales o potenciales vinculados a la posesión de una red duradera de relaciones más o menos institucionalizadas.",
    category: "sociologia",
    relatedTerms: ["Redes sociales", "Cohesión social", "Confianza interpersonal"],
    examples: ["El capital social facilita el acceso a oportunidades laborales"],
  },

  // Términos de Política
  {
    term: "Ley Bases",
    definition:
      "Proyecto de ley impulsado por el gobierno de Javier Milei que busca reformas estructurales en diversos ámbitos del Estado.",
    category: "politica",
    relatedTerms: ["Reforma del Estado", "Facultades delegadas", "Privatizaciones"],
    examples: ["La Ley Bases fue aprobada en general en la Cámara de Diputados"],
  },
  {
    term: "DNU",
    definition:
      "Decreto de Necesidad y Urgencia, instrumento legal que permite al Poder Ejecutivo dictar normas con rango de ley en situaciones excepcionales.",
    category: "politica",
    relatedTerms: ["Poder Ejecutivo", "Legislación", "Control parlamentario"],
    examples: ["El DNU 70/2023 desreguló numerosos sectores de la economía"],
  },
  {
    term: "Motosierra",
    definition:
      "Término utilizado metafóricamente para referirse a los recortes drásticos del gasto público implementados por el gobierno de Javier Milei.",
    category: "politica",
    relatedTerms: ["Ajuste fiscal", "Reducción del Estado", "Déficit cero"],
    examples: ["La motosierra del gobierno eliminó miles de contratos estatales"],
  },
  {
    term: "Casta política",
    definition:
      "Expresión utilizada para referirse a la clase política tradicional, a la que se acusa de privilegios y corrupción.",
    category: "politica",
    relatedTerms: ["Antipolitica", "Establishment", "Elite política"],
    examples: ["El discurso contra la casta política fue central en la campaña de Milei"],
  },
  {
    term: "Libertario",
    definition:
      "Corriente política que defiende la libertad individual, la reducción del Estado y el libre mercado como principios fundamentales.",
    category: "politica",
    relatedTerms: ["Liberalismo", "Anarcocapitalismo", "Minarquismo"],
    examples: ["El movimiento libertario ganó popularidad entre los jóvenes"],
  },
]

// Función para buscar términos en el diccionario
export function searchTerm(query: string): DictionaryEntry[] {
  const normalizedQuery = query.toLowerCase().trim()

  return technicalDictionary.filter(
    (entry) =>
      entry.term.toLowerCase().includes(normalizedQuery) || entry.definition.toLowerCase().includes(normalizedQuery),
  )
}

// Función para obtener términos por categoría
export function getTermsByCategory(category: DictionaryEntry["category"]): DictionaryEntry[] {
  return technicalDictionary.filter((entry) => entry.category === category)
}

// Función para detectar términos técnicos en un texto
export function detectTechnicalTerms(text: string): DictionaryEntry[] {
  const normalizedText = text.toLowerCase()
  return technicalDictionary.filter((entry) => normalizedText.includes(entry.term.toLowerCase()))
}

// Función para enriquecer un texto con definiciones
export function enrichTextWithDefinitions(text: string): {
  enrichedText: string
  detectedTerms: DictionaryEntry[]
} {
  const detectedTerms = detectTechnicalTerms(text)
  let enrichedText = text

  // Ordenamos los términos por longitud (de mayor a menor) para evitar reemplazos parciales
  const sortedTerms = [...detectedTerms].sort((a, b) => b.term.length - a.term.length)

  sortedTerms.forEach((term) => {
    const regex = new RegExp(`\\b${term.term}\\b`, "gi")
    enrichedText = enrichedText.replace(
      regex,
      `<span class="technical-term" data-term="${term.term}">${term.term}</span>`,
    )
  })

  return { enrichedText, detectedTerms }
}
