export interface NewsItem {
  title: string
  source: string
  url?: string
  summary: string
  content?: string
  category: string
  publishedAt: string
  acceptance: {
    positive: number
    neutral: number
    negative: number
  }
  shareMetrics: {
    total: number
    facebook: number
    twitter: number
    whatsapp: number
    other: number
  }
  legislativeInfo?: {
    isLegislative: boolean
    lawName?: string
    lawDescription?: string
    voteDate?: string
    votePredicciones?: {
      [key in PoliticalParty]?: {
        voteYes: number
        voteNo: number
        abstention: number
        justification: string
      }
    }
  }
}

export type PoliticalParty = "libertad-avanza" | "union-patria" | "juntos-cambio" | "frente-izquierda" | "otros"

export type ResponseType = "quick" | "detailed"

export type AdaptationFunction =
  | "adapted-message"
  | "legislative-info"
  | "historical-contrast"
  | "topic-opinion"
  | "adapted-solutions"
  | "vote-predictions"
  | "political-context"
  | "advanced-analysis"
  | "technical-dictionary"
  | "technical-analysis"
  | "quick-response"
