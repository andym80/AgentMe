import type { PoliticalParty } from "./types"

// Tipos para la base de conocimiento
export interface HistoricalEvent {
  period: string
  event: string
  description: string
  impact: string
  relevantTo: string[] // Categorías relevantes
}

export interface PhilosophicalConcept {
  name: string
  description: string
  originPeriod: string
  keyThinkers: string[]
  relevantTo: string[] // Categorías relevantes
}

export interface PoliticalReference {
  figure: string
  period: string
  contribution: string
  ideology: string
  relevantTo: string[] // Categorías relevantes
}

export interface StatisticalReference {
  topic: string
  period: string
  data: string
  source: string
  relevantTo: string[] // Categorías relevantes
}

export interface PartyIdeology {
  core: string[]
  economic: string[]
  social: string[]
  international: string[]
  historical: PoliticalReference[]
  philosophical: PhilosophicalConcept[]
}

// Base de conocimiento histórico por partido
export const partyIdeologies: Record<PoliticalParty, PartyIdeology> = {
  "libertad-avanza": {
    core: ["Libertarianismo", "Liberalismo clásico", "Minarquismo", "Individualismo", "Propiedad privada"],
    economic: [
      "Libre mercado sin intervención estatal",
      "Eliminación de regulaciones económicas",
      "Reducción drástica de impuestos",
      "Privatización de empresas públicas",
      "Competencia monetaria y eliminación del banco central",
    ],
    social: [
      "Libertades individuales por encima de políticas colectivistas",
      "Reducción del Estado en todos los ámbitos sociales",
      "Sistemas privados de salud y educación",
      "Contratos voluntarios como base de la organización social",
    ],
    international: [
      "Apertura comercial unilateral",
      "Reducción de la participación en organismos internacionales",
      "Relaciones basadas en el comercio libre",
      "Oposición a bloques económicos regulados",
    ],
    historical: [],
    philosophical: [],
  },
  "union-patria": {
    core: ["Justicialismo", "Nacionalismo popular", "Tercera posición", "Soberanía política", "Justicia social"],
    economic: [
      "Economía mixta con fuerte presencia estatal",
      "Industrialización por sustitución de importaciones",
      "Protección de sectores estratégicos",
      "Distribución del ingreso",
      "Mercado interno como motor económico",
    ],
    social: [
      "Derechos sociales garantizados por el Estado",
      "Sindicalismo como columna vertebral",
      "Inclusión de sectores populares",
      "Políticas universales de salud y educación",
    ],
    international: [
      "Integración latinoamericana",
      "Multilateralismo con autonomía",
      "Soberanía sobre recursos naturales",
      "Posición antiimperialista",
    ],
    historical: [],
    philosophical: [],
  },
  "juntos-cambio": {
    core: ["Republicanismo", "Institucionalismo", "Liberalismo moderado", "Federalismo", "Modernización"],
    economic: [
      "Economía de mercado con regulaciones eficientes",
      "Apertura comercial gradual",
      "Equilibrio fiscal",
      "Atracción de inversiones",
      "Reducción selectiva del Estado",
    ],
    social: [
      "Meritocracia con igualdad de oportunidades",
      "Educación como motor de movilidad social",
      "Sistemas mixtos de salud y seguridad social",
      "Modernización de servicios públicos",
    ],
    international: [
      "Inserción inteligente en el mundo",
      "Alianzas con democracias occidentales",
      "Regionalismo abierto",
      "Diplomacia comercial activa",
    ],
    historical: [],
    philosophical: [],
  },
  "frente-izquierda": {
    core: [
      "Marxismo",
      "Socialismo revolucionario",
      "Anticapitalismo",
      "Internacionalismo proletario",
      "Lucha de clases",
    ],
    economic: [
      "Propiedad colectiva de los medios de producción",
      "Planificación económica democrática",
      "Nacionalización de sectores estratégicos",
      "Control obrero de la producción",
      "Distribución según necesidades",
    ],
    social: [
      "Derechos sociales universales garantizados",
      "Organización de trabajadores como base del poder popular",
      "Eliminación de privilegios de clase",
      "Educación y salud como derechos inalienables",
    ],
    international: [
      "Solidaridad internacional de los trabajadores",
      "Antiimperialismo militante",
      "Oposición a organismos financieros internacionales",
      "Integración basada en la cooperación entre pueblos",
    ],
    historical: [],
    philosophical: [],
  },
  otros: {
    core: ["Pragmatismo político", "Centrismo", "Gradualismo", "Consenso", "Políticas basadas en evidencia"],
    economic: [
      "Economía mixta con equilibrio público-privado",
      "Regulaciones inteligentes",
      "Sostenibilidad fiscal",
      "Innovación y desarrollo tecnológico",
      "Inclusión con crecimiento",
    ],
    social: [
      "Políticas sociales focalizadas y universales según necesidad",
      "Educación como prioridad estratégica",
      "Sistemas de salud integrados",
      "Diálogo social permanente",
    ],
    international: [
      "Multilateralismo pragmático",
      "Integración selectiva",
      "Diplomacia comercial y cultural",
      "Cooperación en temas globales",
    ],
    historical: [],
    philosophical: [],
  },
}

// Base de eventos históricos relevantes para Argentina
export const historicalEvents: HistoricalEvent[] = []

// Estadísticas históricas relevantes
export const historicalStatistics: StatisticalReference[] = []

// Función para obtener eventos históricos relevantes para una categoría
export function getRelevantHistoricalEvents(category: string, limit = 3): HistoricalEvent[] {
  return historicalEvents
    .filter((event) => event.relevantTo.includes(category))
    .sort(() => 0.5 - Math.random()) // Ordenar aleatoriamente
    .slice(0, limit)
}

// Función para obtener estadísticas relevantes para una categoría
export function getRelevantStatistics(category: string, limit = 2): StatisticalReference[] {
  return historicalStatistics
    .filter((stat) => stat.relevantTo.includes(category))
    .sort(() => 0.5 - Math.random()) // Ordenar aleatoriamente
    .slice(0, limit)
}

// Función para obtener referencias filosóficas relevantes para un partido y categoría
export function getPhilosophicalReferences(party: PoliticalParty, category: string, limit = 2): PhilosophicalConcept[] {
  return partyIdeologies[party].philosophical
    .filter((concept) => concept.relevantTo.includes(category))
    .sort(() => 0.5 - Math.random()) // Ordenar aleatoriamente
    .slice(0, limit)
}

// Función para obtener referencias políticas históricas relevantes para un partido y categoría
export function getPoliticalReferences(party: PoliticalParty, category: string, limit = 2): PoliticalReference[] {
  return partyIdeologies[party].historical
    .filter((ref) => ref.relevantTo.includes(category))
    .sort(() => 0.5 - Math.random()) // Ordenar aleatoriamente
    .slice(0, limit)
}

// Función para obtener principios ideológicos de un partido relevantes para una categoría
export function getIdeologicalPrinciples(party: PoliticalParty, category: string, limit = 3): string[] {
  let principles: string[] = []

  // Seleccionar el conjunto de principios según la categoría
  if (category === "economy" || category === "business") {
    principles = partyIdeologies[party].economic
  } else if (category === "social" || category === "health" || category === "education") {
    principles = partyIdeologies[party].social
  } else if (category === "internacional" || category === "politics") {
    principles = [...partyIdeologies[party].international, ...partyIdeologies[party].core]
  } else {
    // Para otras categorías, usar principios centrales
    principles = partyIdeologies[party].core
  }

  // Devolver un subconjunto aleatorio de principios
  return principles.sort(() => 0.5 - Math.random()).slice(0, limit)
}

export function getHistoricalContext(party: PoliticalParty, category: string): string {
  return `Contexto histórico para ${party} en ${category}`
}
