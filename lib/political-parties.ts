import type { PoliticalParty } from "@/types/political"

export const politicalParties: Record<string, PoliticalParty> = {
  progressive: {
    name: "Progressive Alliance",
    ideology: "Progressive",
    color: "#0ea5e9",
    keyPositions: [
      "Environmental protection",
      "Social justice",
      "Public healthcare",
      "Economic equality",
      "International cooperation",
    ],
  },
  centrist: {
    name: "Centrist Coalition",
    ideology: "Centrist",
    color: "#8b5cf6",
    keyPositions: [
      "Balanced budgets",
      "Pragmatic reforms",
      "Public-private partnerships",
      "Moderate regulation",
      "International trade",
    ],
  },
  conservative: {
    name: "Conservative Union",
    ideology: "Conservative",
    color: "#ef4444",
    keyPositions: [
      "Traditional values",
      "Free markets",
      "Limited government",
      "Strong national defense",
      "Individual responsibility",
    ],
  },
  libertarian: {
    name: "Liberty Party",
    ideology: "Libertarian",
    color: "#f59e0b",
    keyPositions: ["Personal freedom", "Minimal government", "Free markets", "Civil liberties", "Non-interventionism"],
  },
  green: {
    name: "Green Future",
    ideology: "Environmentalist",
    color: "#10b981",
    keyPositions: [
      "Climate action",
      "Sustainable development",
      "Renewable energy",
      "Environmental justice",
      "Ecological economics",
    ],
  },
}
