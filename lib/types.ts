export interface NewsItem {
  title: string
  source: string
  url?: string
  summary: string
  content?: string
  category: string
  subcategory?: string // Nueva propiedad para subcategoría
  newsType?: string // Tipo específico de noticia
  context?: string // Contexto adicional sobre la noticia
  publishedAt: string
  // Métricas de aceptación y share
  acceptance: {
    positive: number // Porcentaje de aceptación positiva (0-100)
    neutral: number // Porcentaje de aceptación neutral (0-100)
    negative: number // Porcentaje de aceptación negativa (0-100)
  }
  shareMetrics: {
    total: number // Número total de veces compartido
    facebook: number // Veces compartido en Facebook
    twitter: number // Veces compartido en Twitter
    whatsapp: number // Veces compartido en WhatsApp
    other: number // Veces compartido en otras plataformas
  }
  // Información sobre leyes en debate
  legislativeInfo?: {
    isLegislative: boolean // Indica si la noticia está relacionada con un debate legislativo
    lawName?: string // Nombre de la ley en debate
    lawDescription?: string // Breve descripción de la ley
    voteDate?: string // Fecha estimada de votación
    votePredicciones?: {
      [key in PoliticalParty]?: {
        voteYes: number // Probabilidad de voto afirmativo (0-100)
        voteNo: number // Probabilidad de voto negativo (0-100)
        abstention: number // Probabilidad de abstención (0-100)
        justification: string // Justificación de la predicción
      }
    }
  }
}

export type PoliticalParty = "libertad-avanza" | "union-patria" | "juntos-cambio" | "frente-izquierda" | "otros"

// Nuevos tipos para categorización de noticias
export type NewsCategory =
  | "politics"
  | "nacional"
  | "provincial"
  | "municipal"
  | "local"
  | "business"
  | "economy"
  | "technology"
  | "health"
  | "environment"
  | "education"
  | "security"
  | "international"
  | "culture"
  | "sports"

export type NewsSubcategory =
  | "legislative" // Leyes, proyectos, debates parlamentarios
  | "executive" // Decisiones del poder ejecutivo
  | "judicial" // Fallos, procesos judiciales
  | "electoral" // Elecciones, campañas, encuestas
  | "diplomatic" // Relaciones internacionales
  | "economic_policy" // Políticas económicas
  | "fiscal" // Impuestos, presupuesto
  | "monetary" // Política monetaria, inflación
  | "labor" // Empleo, sindicatos
  | "markets" // Mercados financieros
  | "companies" // Empresas, corporaciones
  | "innovation" // Innovación, startups
  | "digital" // Transformación digital
  | "scientific" // Investigación científica
  | "public_health" // Salud pública, epidemiología
  | "healthcare" // Sistema de salud
  | "climate" // Cambio climático
  | "conservation" // Conservación, biodiversidad
  | "pollution" // Contaminación, residuos
  | "primary" // Educación primaria
  | "secondary" // Educación secundaria
  | "university" // Educación universitaria
  | "crime" // Delincuencia, seguridad ciudadana
  | "police" // Fuerzas policiales
  | "defense" // Defensa, fuerzas armadas
  | "infrastructure" // Obras públicas, infraestructura
  | "housing" // Vivienda
  | "transportation" // Transporte
  | "social_policy" // Políticas sociales
  | "human_rights" // Derechos humanos
  | "gender" // Género, diversidad
  | "indigenous" // Pueblos originarios
  | "religion" // Religión
  | "arts" // Artes, patrimonio
  | "media" // Medios de comunicación
  | "sports" // Deportes
  | "other" // Otros

export type NewsType =
  | "breaking" // Noticia de último momento
  | "developing" // Noticia en desarrollo
  | "analysis" // Análisis en profundidad
  | "opinion" // Artículo de opinión
  | "interview" // Entrevista
  | "report" // Reportaje
  | "investigation" // Investigación
  | "feature" // Crónica
  | "profile" // Perfil
  | "announcement" // Anuncio oficial
  | "statement" // Declaración
  | "press_release" // Comunicado de prensa
  | "fact_check" // Verificación de hechos
  | "explainer" // Explicación de un tema
  | "timeline" // Cronología de eventos
  | "summary" // Resumen de acontecimientos
  | "forecast" // Pronóstico, predicción
  | "review" // Reseña
  | "other" // Otro tipo
