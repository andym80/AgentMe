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
    historical: [
      {
        figure: "Friedrich Hayek",
        period: "1899-1992",
        contribution: "Teoría del orden espontáneo y crítica al constructivismo social",
        ideology: "Liberalismo clásico",
        relevantTo: ["economy", "politics"],
      },
      {
        figure: "Ludwig von Mises",
        period: "1881-1973",
        contribution: "Teoría de la acción humana y crítica al socialismo",
        ideology: "Escuela Austríaca",
        relevantTo: ["economy", "business"],
      },
      {
        figure: "Milton Friedman",
        period: "1912-2006",
        contribution: "Monetarismo y defensa del capitalismo de libre mercado",
        ideology: "Liberalismo económico",
        relevantTo: ["economy", "business"],
      },
      {
        figure: "Ayn Rand",
        period: "1905-1982",
        contribution: "Filosofía objetivista y ética del egoísmo racional",
        ideology: "Objetivismo",
        relevantTo: ["politics", "social"],
      },
      {
        figure: "Murray Rothbard",
        period: "1926-1995",
        contribution: "Desarrollo del anarcocapitalismo",
        ideology: "Anarcocapitalismo",
        relevantTo: ["economy", "politics"],
      },
    ],
    philosophical: [
      {
        name: "Individualismo metodológico",
        description:
          "Doctrina que sostiene que los fenómenos sociales deben explicarse en términos de individuos y sus acciones",
        originPeriod: "Siglo XIX-XX",
        keyThinkers: ["Carl Menger", "Ludwig von Mises", "Friedrich Hayek"],
        relevantTo: ["economy", "politics", "social"],
      },
      {
        name: "Orden espontáneo",
        description:
          "Concepto que describe cómo el orden social emerge de las acciones individuales sin planificación central",
        originPeriod: "Siglo XVIII-XX",
        keyThinkers: ["Adam Smith", "Friedrich Hayek"],
        relevantTo: ["economy", "social"],
      },
      {
        name: "Propiedad como derecho natural",
        description: "Concepción de la propiedad privada como un derecho natural anterior al Estado",
        originPeriod: "Siglo XVII-XVIII",
        keyThinkers: ["John Locke", "Robert Nozick"],
        relevantTo: ["politics", "economy"],
      },
    ],
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
    historical: [
      {
        figure: "Juan Domingo Perón",
        period: "1895-1974",
        contribution: "Fundador del movimiento justicialista y la doctrina de la tercera posición",
        ideology: "Justicialismo",
        relevantTo: ["politics", "nacional"],
      },
      {
        figure: "Eva Perón",
        period: "1919-1952",
        contribution: "Desarrollo de la ayuda social directa y la inclusión de sectores marginados",
        ideology: "Justicialismo",
        relevantTo: ["social", "politics"],
      },
      {
        figure: "Arturo Jauretche",
        period: "1901-1974",
        contribution: "Crítica al colonialismo cultural y desarrollo del pensamiento nacional",
        ideology: "Nacionalismo popular",
        relevantTo: ["politics", "culture"],
      },
      {
        figure: "Raúl Scalabrini Ortiz",
        period: "1898-1959",
        contribution: "Análisis de la dependencia económica y la defensa de la soberanía nacional",
        ideology: "Nacionalismo económico",
        relevantTo: ["economy", "politics"],
      },
      {
        figure: "John Maynard Keynes",
        period: "1883-1946",
        contribution: "Teoría económica que justifica la intervención estatal para estimular la demanda",
        ideology: "Keynesianismo",
        relevantTo: ["economy", "business"],
      },
    ],
    philosophical: [
      {
        name: "Humanismo social",
        description: "Concepción que pone al ser humano y su dignidad en el centro de la acción política",
        originPeriod: "Siglo XX",
        keyThinkers: ["Jacques Maritain", "Emmanuel Mounier", "Juan Domingo Perón"],
        relevantTo: ["social", "politics"],
      },
      {
        name: "Doctrina social de la Iglesia",
        description: "Conjunto de enseñanzas sociales católicas que influyeron en el justicialismo",
        originPeriod: "Siglo XIX-XX",
        keyThinkers: ["Papa León XIII", "Papa Pío XI", "Papa Juan XXIII"],
        relevantTo: ["social", "politics"],
      },
      {
        name: "Teoría de la dependencia",
        description: "Marco teórico que explica el subdesarrollo como consecuencia de relaciones económicas desiguales",
        originPeriod: "Siglo XX",
        keyThinkers: ["Raúl Prebisch", "Celso Furtado", "Fernando Henrique Cardoso"],
        relevantTo: ["economy", "international"],
      },
    ],
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
    historical: [
      {
        figure: "Domingo Faustino Sarmiento",
        period: "1811-1888",
        contribution: "Impulso a la educación pública y la modernización institucional",
        ideology: "Liberalismo progresista",
        relevantTo: ["education", "politics"],
      },
      {
        figure: "Bartolomé Mitre",
        period: "1821-1906",
        contribution: "Organización nacional y desarrollo institucional",
        ideology: "Liberalismo",
        relevantTo: ["politics", "nacional"],
      },
      {
        figure: "Raúl Alfonsín",
        period: "1927-2009",
        contribution: "Recuperación democrática y modernización institucional",
        ideology: "Socialdemocracia",
        relevantTo: ["politics", "social"],
      },
      {
        figure: "Arturo Illia",
        period: "1900-1983",
        contribution: "Gobierno democrático con énfasis en la ética pública",
        ideology: "Radicalismo",
        relevantTo: ["politics", "health"],
      },
      {
        figure: "Mariano Grondona",
        period: "1932-2019",
        contribution: "Análisis de las condiciones culturales para el desarrollo institucional",
        ideology: "Liberalismo conservador",
        relevantTo: ["politics", "culture"],
      },
    ],
    philosophical: [
      {
        name: "Republicanismo",
        description:
          "Tradición política que enfatiza la importancia de las instituciones, la división de poderes y el estado de derecho",
        originPeriod: "Siglo XVIII-XIX",
        keyThinkers: ["Montesquieu", "James Madison", "Alexis de Tocqueville"],
        relevantTo: ["politics", "nacional"],
      },
      {
        name: "Liberalismo institucional",
        description:
          "Corriente que destaca la importancia de las reglas formales para el desarrollo económico y social",
        originPeriod: "Siglo XX",
        keyThinkers: ["Douglass North", "Francis Fukuyama"],
        relevantTo: ["economy", "politics"],
      },
      {
        name: "Teoría de la modernización",
        description:
          "Marco teórico que explica el desarrollo como un proceso de transformación institucional y cultural",
        originPeriod: "Siglo XX",
        keyThinkers: ["Seymour Martin Lipset", "Samuel Huntington"],
        relevantTo: ["politics", "social"],
      },
    ],
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
    historical: [
      {
        figure: "Karl Marx",
        period: "1818-1883",
        contribution: "Análisis del capitalismo y teoría de la lucha de clases",
        ideology: "Marxismo",
        relevantTo: ["economy", "politics"],
      },
      {
        figure: "Vladimir Lenin",
        period: "1870-1924",
        contribution: "Teoría del imperialismo y estrategia revolucionaria",
        ideology: "Marxismo-leninismo",
        relevantTo: ["politics", "international"],
      },
      {
        figure: "Rosa Luxemburgo",
        period: "1871-1919",
        contribution: "Crítica al reformismo y defensa de la democracia socialista",
        ideology: "Marxismo revolucionario",
        relevantTo: ["politics", "economy"],
      },
      {
        figure: "León Trotsky",
        period: "1879-1940",
        contribution: "Teoría de la revolución permanente y crítica al estalinismo",
        ideology: "Trotskismo",
        relevantTo: ["politics", "international"],
      },
      {
        figure: "Antonio Gramsci",
        period: "1891-1937",
        contribution: "Análisis de la hegemonía cultural y estrategia revolucionaria",
        ideology: "Marxismo occidental",
        relevantTo: ["politics", "culture"],
      },
    ],
    philosophical: [
      {
        name: "Materialismo histórico",
        description:
          "Concepción que explica el desarrollo histórico a partir de las condiciones materiales y la lucha de clases",
        originPeriod: "Siglo XIX",
        keyThinkers: ["Karl Marx", "Friedrich Engels"],
        relevantTo: ["politics", "economy", "social"],
      },
      {
        name: "Teoría crítica",
        description: "Enfoque que analiza las contradicciones sociales y busca la emancipación humana",
        originPeriod: "Siglo XX",
        keyThinkers: ["Theodor Adorno", "Max Horkheimer", "Herbert Marcuse"],
        relevantTo: ["politics", "culture", "social"],
      },
      {
        name: "Teoría de la alienación",
        description:
          "Análisis de cómo el capitalismo separa al trabajador del producto de su trabajo y de su esencia humana",
        originPeriod: "Siglo XIX",
        keyThinkers: ["Karl Marx", "György Lukács"],
        relevantTo: ["economy", "social", "labor"],
      },
    ],
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
    historical: [
      {
        figure: "John Dewey",
        period: "1859-1952",
        contribution: "Filosofía pragmatista aplicada a la política y la educación",
        ideology: "Pragmatismo",
        relevantTo: ["politics", "education"],
      },
      {
        figure: "Anthony Giddens",
        period: "1938-presente",
        contribution: "Desarrollo de la teoría de la tercera vía",
        ideology: "Socialdemocracia renovada",
        relevantTo: ["politics", "social"],
      },
      {
        figure: "Amartya Sen",
        period: "1933-presente",
        contribution: "Enfoque de capacidades y desarrollo humano",
        ideology: "Liberalismo social",
        relevantTo: ["economy", "social"],
      },
      {
        figure: "Daron Acemoglu",
        period: "1967-presente",
        contribution: "Análisis de la relación entre instituciones y desarrollo económico",
        ideology: "Institucionalismo",
        relevantTo: ["economy", "politics"],
      },
      {
        figure: "Martha Nussbaum",
        period: "1947-presente",
        contribution: "Enfoque de capacidades y teoría de la justicia",
        ideology: "Liberalismo político",
        relevantTo: ["politics", "social"],
      },
    ],
    philosophical: [
      {
        name: "Pragmatismo",
        description: "Corriente filosófica que evalúa las ideas según sus consecuencias prácticas",
        originPeriod: "Siglo XIX-XX",
        keyThinkers: ["Charles Sanders Peirce", "William James", "John Dewey"],
        relevantTo: ["politics", "social"],
      },
      {
        name: "Teoría de la justicia como equidad",
        description: "Concepción que busca principios de justicia que personas libres e iguales aceptarían",
        originPeriod: "Siglo XX",
        keyThinkers: ["John Rawls"],
        relevantTo: ["politics", "social"],
      },
      {
        name: "Enfoque de capacidades",
        description: "Marco normativo que evalúa el bienestar en términos de libertades sustantivas",
        originPeriod: "Siglo XX-XXI",
        keyThinkers: ["Amartya Sen", "Martha Nussbaum"],
        relevantTo: ["economy", "social", "development"],
      },
    ],
  },
}

// Base de eventos históricos relevantes para Argentina
export const historicalEvents: HistoricalEvent[] = [
  {
    period: "1946-1955",
    event: "Primer y segundo gobierno de Perón",
    description:
      "Período caracterizado por la industrialización, ampliación de derechos sociales y laborales, y consolidación del movimiento obrero organizado.",
    impact:
      "Transformación de la estructura social argentina con la incorporación de sectores populares a la vida política y económica.",
    relevantTo: ["politics", "nacional", "economy", "social"],
  },
  {
    period: "1955-1973",
    event: "Proscripción del peronismo",
    description:
      "Etapa de inestabilidad política con alternancia entre gobiernos militares y civiles débiles, con el peronismo prohibido.",
    impact: "Profundización de la polarización política y surgimiento de movimientos de resistencia.",
    relevantTo: ["politics", "nacional"],
  },
  {
    period: "1976-1983",
    event: "Dictadura militar",
    description:
      "Régimen autoritario que implementó el terrorismo de Estado y un programa económico de desindustrialización y apertura financiera.",
    impact: "Violaciones masivas a los derechos humanos y transformación regresiva de la estructura económica.",
    relevantTo: ["politics", "nacional", "economy", "human-rights"],
  },
  {
    period: "1983-1989",
    event: "Gobierno de Alfonsín",
    description:
      "Recuperación democrática con énfasis en derechos humanos y modernización institucional, finalizado en crisis hiperinflacionaria.",
    impact: "Consolidación de instituciones democráticas y juicio a las juntas militares.",
    relevantTo: ["politics", "nacional", "economy"],
  },
  {
    period: "1989-1999",
    event: "Gobierno de Menem",
    description:
      "Implementación de reformas neoliberales, privatizaciones y apertura económica bajo el Consenso de Washington.",
    impact: "Transformación del modelo económico y social con aumento del desempleo y la desigualdad.",
    relevantTo: ["politics", "nacional", "economy", "business"],
  },
  {
    period: "2001-2002",
    event: "Crisis económica y social",
    description:
      "Colapso del modelo de convertibilidad con default de la deuda externa, corralito bancario y estallido social.",
    impact: "Profunda crisis política y económica que llevó al cuestionamiento del sistema político tradicional.",
    relevantTo: ["politics", "nacional", "economy", "social"],
  },
  {
    period: "2003-2015",
    event: "Gobiernos kirchneristas",
    description:
      "Período de recuperación económica con políticas heterodoxas, ampliación de derechos y confrontación con sectores concentrados.",
    impact: "Reducción de la pobreza y desigualdad, pero con crecientes desequilibrios macroeconómicos.",
    relevantTo: ["politics", "nacional", "economy", "social"],
  },
  {
    period: "2015-2019",
    event: "Gobierno de Macri",
    description: "Intento de normalización económica con apertura comercial, desregulación y endeudamiento externo.",
    impact: "Crisis económica con inflación, recesión y aumento de la pobreza.",
    relevantTo: ["politics", "nacional", "economy", "business"],
  },
  {
    period: "2019-2023",
    event: "Gobierno de Alberto Fernández",
    description:
      "Gestión marcada por la pandemia de COVID-19, renegociación de la deuda y tensiones internas en la coalición gobernante.",
    impact: "Deterioro económico con alta inflación y aumento de la pobreza en contexto de crisis global.",
    relevantTo: ["politics", "nacional", "economy", "health"],
  },
  {
    period: "2023-presente",
    event: "Gobierno de Javier Milei",
    description:
      "Implementación de programa de desregulación económica, reducción del Estado y liberalización de mercados.",
    impact: "Transformación del rol del Estado y reconfiguración del sistema político tradicional.",
    relevantTo: ["politics", "nacional", "economy", "business"],
  },
]

// Estadísticas históricas relevantes
export const historicalStatistics: StatisticalReference[] = [
  {
    topic: "Inflación histórica",
    period: "1945-2023",
    data: "Argentina ha experimentado 14 años con inflación superior al 100% anual, siendo los picos más altos en 1989 (3079%) y 1990 (2314%).",
    source: "INDEC, Fundación de Investigaciones Económicas Latinoamericanas (FIEL)",
    relevantTo: ["economy", "nacional"],
  },
  {
    topic: "Pobreza e indigencia",
    period: "1988-2023",
    data: "La pobreza ha oscilado entre un mínimo del 18% (1993) y un máximo del 57.5% (2002), con ciclos de reducción y aumento vinculados a crisis económicas.",
    source: "INDEC, Observatorio de la Deuda Social Argentina (UCA)",
    relevantTo: ["social", "economy", "nacional"],
  },
  {
    topic: "Deuda externa",
    period: "1976-2023",
    data: "La deuda externa creció de USD 8.000 millones en 1976 a USD 400.000 millones en 2023, con defaults en 1982, 2001 y reestructuraciones en 2005, 2010 y 2020.",
    source: "Ministerio de Economía, Banco Mundial",
    relevantTo: ["economy", "internacional", "nacional"],
  },
  {
    topic: "Distribución del ingreso",
    period: "1974-2023",
    data: "El coeficiente de Gini pasó de 0.36 en 1974 a 0.54 en 2002, mejorando a 0.41 en 2015 y volviendo a empeorar a 0.44 en 2023.",
    source: "INDEC, CEPAL",
    relevantTo: ["social", "economy", "nacional"],
  },
  {
    topic: "Industrialización",
    period: "1950-2023",
    data: "La participación de la industria en el PBI pasó del 30% en 1974 al 15% en 2023, con una pérdida de 700.000 empleos industriales entre 1976 y 2002.",
    source: "INDEC, UIA",
    relevantTo: ["economy", "business", "nacional"],
  },
  {
    topic: "Empleo público",
    period: "1960-2023",
    data: "El empleo público total (nacional, provincial y municipal) pasó de representar el 12% de la población económicamente activa en 1960 al 18% en 2023.",
    source: "Ministerio de Trabajo, CIPPEC",
    relevantTo: ["economy", "politics", "nacional", "provincial", "municipal"],
  },
  {
    topic: "Cobertura educativa",
    period: "1950-2023",
    data: "La tasa de escolarización primaria aumentó del 80% en 1950 al 99% en 2023, mientras que la secundaria pasó del 30% al 89% en el mismo período.",
    source: "Ministerio de Educación, UNESCO",
    relevantTo: ["education", "social", "nacional"],
  },
  {
    topic: "Cobertura de salud",
    period: "1970-2023",
    data: "La población con cobertura formal de salud (obra social o prepaga) pasó del 60% en 1970 al 63% en 2023, con un mínimo del 52% en 2002.",
    source: "Ministerio de Salud, OPS",
    relevantTo: ["health", "social", "nacional"],
  },
  {
    topic: "Urbanización",
    period: "1950-2023",
    data: "La población urbana aumentó del 65% en 1950 al 92% en 2023, con el Gran Buenos Aires concentrando el 37% de la población total del país.",
    source: "INDEC, ONU-Hábitat",
    relevantTo: ["social", "municipal", "nacional"],
  },
  {
    topic: "Exportaciones por sector",
    period: "1980-2023",
    data: "Las exportaciones primarias y agroindustriales pasaron de representar el 70% del total en 1980 al 65% en 2023, con un mínimo del 55% en 1998.",
    source: "INDEC, Ministerio de Economía",
    relevantTo: ["economy", "business", "internacional"],
  },
]

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
