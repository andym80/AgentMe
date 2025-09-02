import type { PoliticalParty } from "./types"

// Tipos para la base de conocimiento ético
export interface EthicalPrinciple {
  name: string
  description: string
  relevantTo: string[] // Categorías relevantes
}

export interface MoralDilemma {
  issue: string
  description: string
  perspectives: {
    progressive: string
    conservative: string
    libertarian: string
    communitarian: string
  }
  relevantTo: string[] // Categorías relevantes
}

export interface EthicalFramework {
  name: string
  description: string
  keyPrinciples: string[]
  relevantTo: string[] // Categorías relevantes
}

// Principios éticos contemporáneos
export const ethicalPrinciples: EthicalPrinciple[] = [
  {
    name: "Autonomía individual",
    description:
      "Respeto por la capacidad de las personas para tomar decisiones sobre su propia vida sin coerción externa.",
    relevantTo: ["politics", "social", "health", "education"],
  },
  {
    name: "Justicia distributiva",
    description:
      "Distribución equitativa de beneficios y cargas en la sociedad, considerando necesidades, méritos y derechos.",
    relevantTo: ["economy", "social", "politics", "municipal"],
  },
  {
    name: "Bien común",
    description:
      "Priorización del bienestar colectivo sobre intereses particulares en decisiones que afectan a la comunidad.",
    relevantTo: ["politics", "social", "municipal", "health", "environment"],
  },
  {
    name: "Responsabilidad intergeneracional",
    description: "Obligación moral de considerar el impacto de decisiones actuales en las generaciones futuras.",
    relevantTo: ["environment", "economy", "politics"],
  },
  {
    name: "Transparencia",
    description: "Acceso a información clara y veraz sobre decisiones públicas y sus fundamentos.",
    relevantTo: ["politics", "municipal", "nacional"],
  },
  {
    name: "No maleficencia",
    description: "Obligación de no causar daño intencionalmente a otros en nuestras acciones.",
    relevantTo: ["health", "environment", "technology", "social"],
  },
  {
    name: "Consentimiento informado",
    description: "Derecho de las personas a recibir información completa antes de tomar decisiones que les afectan.",
    relevantTo: ["health", "technology", "social"],
  },
  {
    name: "Pluralismo",
    description: "Respeto por la diversidad de valores, creencias y formas de vida en la sociedad.",
    relevantTo: ["politics", "social", "education", "culture"],
  },
  {
    name: "Subsidiariedad",
    description:
      "Principio que sostiene que los asuntos deben ser manejados por la autoridad competente más pequeña o local.",
    relevantTo: ["politics", "municipal", "nacional"],
  },
  {
    name: "Precaución",
    description:
      "Ante amenazas de daños graves o irreversibles, la falta de certeza científica no debe usarse como razón para postergar medidas preventivas.",
    relevantTo: ["environment", "health", "technology"],
  },
]

// Dilemas morales contemporáneos
export const moralDilemmas: MoralDilemma[] = [
  {
    issue: "Aborto",
    description:
      "Debate sobre el derecho a la interrupción voluntaria del embarazo frente al derecho a la vida desde la concepción.",
    perspectives: {
      progressive: "Derecho de la mujer a decidir sobre su propio cuerpo y su proyecto de vida.",
      conservative: "Defensa de la vida desde la concepción como valor fundamental no negociable.",
      libertarian: "Rechazo a la intervención estatal en decisiones personales, sea para prohibir o para financiar.",
      communitarian: "Necesidad de políticas integrales de educación sexual y apoyo a la maternidad.",
    },
    relevantTo: ["health", "social", "politics"],
  },
  {
    issue: "Eutanasia",
    description:
      "Debate sobre el derecho a decidir sobre el final de la propia vida en casos de enfermedades terminales o sufrimiento extremo.",
    perspectives: {
      progressive: "Autonomía personal para decidir sobre el final digno de la propia vida.",
      conservative: "Inviolabilidad de la vida humana y riesgos de pendiente resbaladiza.",
      libertarian: "Libertad individual absoluta sobre la propia vida sin interferencia estatal.",
      communitarian: "Necesidad de cuidados paliativos universales antes de considerar otras opciones.",
    },
    relevantTo: ["health", "social", "politics"],
  },
  {
    issue: "Impuestos progresivos",
    description:
      "Debate sobre la justicia de establecer tasas impositivas más altas para quienes tienen mayores ingresos.",
    perspectives: {
      progressive: "Mecanismo necesario para reducir desigualdades y financiar servicios públicos.",
      conservative: "Riesgo de desincentivar el esfuerzo y la inversión productiva.",
      libertarian: "Forma de confiscación que viola el derecho de propiedad sobre lo producido.",
      communitarian: "Responsabilidad de contribuir proporcionalmente al bienestar colectivo.",
    },
    relevantTo: ["economy", "politics", "social"],
  },
  {
    issue: "Límites a la libertad de expresión",
    description: "Debate sobre si deben existir restricciones al discurso que promueve el odio o la discriminación.",
    perspectives: {
      progressive: "Necesidad de proteger a grupos vulnerables del discurso de odio y discriminación.",
      conservative: "Riesgo de censura y pérdida de libertades fundamentales.",
      libertarian: "Rechazo a cualquier restricción estatal sobre la expresión de ideas.",
      communitarian: "Equilibrio entre libertad individual y responsabilidad por el impacto social del discurso.",
    },
    relevantTo: ["politics", "social", "education"],
  },
  {
    issue: "Regulación ambiental",
    description:
      "Debate sobre el nivel adecuado de intervención estatal para proteger el medio ambiente frente a intereses económicos.",
    perspectives: {
      progressive: "Necesidad de regulaciones estrictas para prevenir daños irreversibles al ecosistema.",
      conservative: "Equilibrio entre protección ambiental y desarrollo económico sostenible.",
      libertarian: "Soluciones basadas en derechos de propiedad bien definidos y mecanismos de mercado.",
      communitarian: "Responsabilidad colectiva por la preservación de bienes comunes naturales.",
    },
    relevantTo: ["environment", "economy", "politics"],
  },
  {
    issue: "Inteligencia artificial y privacidad",
    description: "Debate sobre los límites éticos en el uso de datos personales para el desarrollo de sistemas de IA.",
    perspectives: {
      progressive: "Necesidad de regulación preventiva para evitar discriminación algorítmica y vigilancia masiva.",
      conservative: "Cautela ante innovaciones que pueden alterar valores tradicionales y estructuras sociales.",
      libertarian: "Libertad de innovación con consentimiento individual sobre el uso de datos personales.",
      communitarian: "Desarrollo tecnológico orientado al bien común con participación democrática.",
    },
    relevantTo: ["technology", "politics", "social"],
  },
  {
    issue: "Migración y fronteras",
    description:
      "Debate sobre el derecho de los estados a controlar sus fronteras frente al derecho de las personas a migrar.",
    perspectives: {
      progressive: "Defensa de derechos humanos universales y políticas de acogida e integración.",
      conservative: "Prioridad a la seguridad nacional y preservación de la identidad cultural.",
      libertarian: "Libre circulación de personas como extensión de la libertad individual.",
      communitarian: "Equilibrio entre apertura y capacidad de integración efectiva.",
    },
    relevantTo: ["politics", "social", "internacional"],
  },
  {
    issue: "Educación religiosa en escuelas públicas",
    description: "Debate sobre la presencia de educación religiosa en el sistema educativo financiado por el Estado.",
    perspectives: {
      progressive: "Defensa de la educación laica y científica separada de creencias religiosas.",
      conservative: "Importancia de valores tradicionales y formación moral basada en principios religiosos.",
      libertarian: "Libertad de elección educativa para las familias sin imposición estatal.",
      communitarian: "Respeto por la diversidad de creencias con énfasis en valores cívicos compartidos.",
    },
    relevantTo: ["education", "politics", "social"],
  },
  {
    issue: "Legalización de drogas",
    description: "Debate sobre la despenalización o legalización del consumo y comercio de sustancias psicoactivas.",
    perspectives: {
      progressive: "Enfoque de reducción de daños y tratamiento como problema de salud pública.",
      conservative: "Mantenimiento de prohibiciones para proteger valores familiares y salud social.",
      libertarian: "Derecho absoluto a decidir sobre el propio cuerpo sin interferencia estatal.",
      communitarian: "Políticas integrales que consideren impacto en comunidades vulnerables.",
    },
    relevantTo: ["health", "security", "social", "politics"],
  },
  {
    issue: "Renta básica universal",
    description:
      "Debate sobre la implementación de un ingreso mínimo garantizado para toda la población sin condiciones.",
    perspectives: {
      progressive: "Mecanismo para garantizar dignidad y reducir desigualdades estructurales.",
      conservative: "Riesgo de desincentivar el trabajo y crear dependencia estatal.",
      libertarian: "Preferencia por impuesto negativo a la renta que no distorsione incentivos.",
      communitarian: "Valoración del trabajo no remunerado y fortalecimiento de lazos sociales.",
    },
    relevantTo: ["economy", "social", "politics"],
  },
]

// Marcos éticos contemporáneos
export const ethicalFrameworks: EthicalFramework[] = [
  {
    name: "Utilitarismo",
    description:
      "Evalúa acciones según su capacidad para maximizar el bienestar general o la felicidad del mayor número de personas.",
    keyPrinciples: ["Consecuencialismo", "Maximización del bienestar", "Imparcialidad", "Cálculo de utilidad"],
    relevantTo: ["politics", "economy", "social"],
  },
  {
    name: "Deontología kantiana",
    description:
      "Juzga acciones según su adherencia a reglas morales universales, independientemente de sus consecuencias.",
    keyPrinciples: ["Imperativo categórico", "Dignidad humana", "Autonomía moral", "Universalización de máximas"],
    relevantTo: ["politics", "social", "health"],
  },
  {
    name: "Ética de la virtud",
    description:
      "Enfatiza el desarrollo de carácter y virtudes como base para la acción moral, más que reglas o consecuencias.",
    keyPrinciples: ["Excelencia de carácter", "Prudencia", "Término medio", "Florecimiento humano"],
    relevantTo: ["education", "social", "politics"],
  },
  {
    name: "Ética del cuidado",
    description:
      "Prioriza las relaciones interpersonales y la atención a necesidades concretas sobre principios abstractos.",
    keyPrinciples: ["Interdependencia", "Empatía", "Responsabilidad relacional", "Contexto"],
    relevantTo: ["social", "health", "education"],
  },
  {
    name: "Contractualismo",
    description:
      "Deriva principios morales de acuerdos hipotéticos entre personas racionales en condiciones de imparcialidad.",
    keyPrinciples: ["Consentimiento", "Imparcialidad", "Ventaja mutua", "Velo de ignorancia"],
    relevantTo: ["politics", "economy", "social"],
  },
  {
    name: "Ética del discurso",
    description: "Fundamenta normas morales en procedimientos de diálogo racional entre todos los afectados por ellas.",
    keyPrinciples: ["Comunicación sin distorsiones", "Inclusión", "Reciprocidad", "Consenso racional"],
    relevantTo: ["politics", "social", "education"],
  },
  {
    name: "Ética ambiental",
    description:
      "Extiende la consideración moral más allá de los seres humanos para incluir otros seres vivos y ecosistemas.",
    keyPrinciples: [
      "Valor intrínseco de la naturaleza",
      "Sostenibilidad",
      "Justicia intergeneracional",
      "Principio de precaución",
    ],
    relevantTo: ["environment", "politics", "economy"],
  },
  {
    name: "Ética de la justicia",
    description:
      "Se centra en la distribución equitativa de bienes, derechos y oportunidades según principios de imparcialidad.",
    keyPrinciples: ["Igualdad de oportunidades", "Diferencia", "Imparcialidad", "Bienes primarios"],
    relevantTo: ["politics", "economy", "social"],
  },
]

// Posiciones éticas de los partidos políticos
export const partyEthicalPositions: Record<PoliticalParty, { framework: string; principles: string[] }> = {
  "libertad-avanza": {
    framework: "Ética de los derechos naturales",
    principles: [
      "Autonomía individual absoluta",
      "Propiedad privada como derecho natural",
      "No agresión",
      "Libertad negativa",
      "Responsabilidad individual",
    ],
  },
  "union-patria": {
    framework: "Ética comunitarista con elementos de justicia social",
    principles: ["Justicia social", "Solidaridad", "Bien común", "Dignidad del trabajo", "Soberanía popular"],
  },
  "juntos-cambio": {
    framework: "Ética liberal institucionalista",
    principles: [
      "Estado de derecho",
      "Igualdad ante la ley",
      "Meritocracia con igualdad de oportunidades",
      "Responsabilidad fiscal",
      "Pluralismo",
    ],
  },
  "frente-izquierda": {
    framework: "Ética de la emancipación colectiva",
    principles: [
      "Igualdad sustantiva",
      "Solidaridad de clase",
      "Antimperialismo",
      "Democracia participativa",
      "Internacionalismo",
    ],
  },
  otros: {
    framework: "Ética pragmática pluralista",
    principles: ["Diálogo democrático", "Evidencia científica", "Sostenibilidad", "Inclusión", "Gradualismo"],
  },
}

// Función para obtener dilemas morales relevantes para una categoría
export function getRelevantMoralDilemmas(category: string, limit = 2): MoralDilemma[] {
  return moralDilemmas
    .filter((dilemma) => dilemma.relevantTo.includes(category))
    .sort(() => 0.5 - Math.random()) // Ordenar aleatoriamente
    .slice(0, limit)
}

// Función para obtener principios éticos relevantes para una categoría
export function getRelevantEthicalPrinciples(category: string, limit = 3): EthicalPrinciple[] {
  return ethicalPrinciples
    .filter((principle) => principle.relevantTo.includes(category))
    .sort(() => 0.5 - Math.random()) // Ordenar aleatoriamente
    .slice(0, limit)
}

// Función para obtener marcos éticos relevantes para una categoría
export function getRelevantEthicalFrameworks(category: string, limit = 2): EthicalFramework[] {
  return ethicalFrameworks
    .filter((framework) => framework.relevantTo.includes(category))
    .sort(() => 0.5 - Math.random()) // Ordenar aleatoriamente
    .slice(0, limit)
}

// Función para obtener la posición ética de un partido sobre un dilema específico
export function getPartyPositionOnDilemma(party: PoliticalParty, dilemma: MoralDilemma): string {
  switch (party) {
    case "libertad-avanza":
      return dilemma.perspectives.libertarian
    case "union-patria":
      return dilemma.perspectives.progressive
    case "juntos-cambio":
      return dilemma.perspectives.conservative
    case "frente-izquierda":
      return dilemma.perspectives.progressive
    default:
      return dilemma.perspectives.communitarian
  }
}
