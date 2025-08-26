import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { NewsItem } from "@/types/news"
import { politicalParties } from "@/lib/political-parties"

export async function POST(request: Request) {
  try {
    const { newsItems, politicalParty } = await request.json()

    if (!newsItems || !Array.isArray(newsItems) || newsItems.length === 0) {
      return NextResponse.json({ error: "No news items provided" }, { status: 400 })
    }

    if (!politicalParty || !politicalParties[politicalParty]) {
      return NextResponse.json({ error: "Invalid political party" }, { status: 400 })
    }

    const party = politicalParties[politicalParty]

    // Format news items for the prompt
    const newsItemsText = newsItems.map((item: NewsItem) => `- ${item.title} (${item.source})`).join("\n")

    // Generate adapted content using AI
    const { text: adaptedContent } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Based on the following international news headlines:
        
        ${newsItemsText}
        
        Create a political press release or statement from the perspective of a ${party.ideology} political party called "${party.name}".
        
        The statement should:
        1. Address the most important headlines in a way that aligns with ${party.name}'s political stance
        2. Frame the news in a way that supports the party's key positions: ${party.keyPositions.join(", ")}
        3. Use language and tone typical of ${party.ideology} political discourse
        4. Be structured as a cohesive statement that could be delivered by a party spokesperson
        5. Be approximately 300-400 words in length
        
        The statement should sound authentic and persuasive to ${party.ideology} voters.
      `,
      system: `You are an expert political communications strategist who specializes in crafting messaging for ${party.ideology} political parties. You understand the nuances of political language and can adapt news to support specific political narratives.`,
    })

    return NextResponse.json({ adaptedContent })
  } catch (error) {
    console.error("Error adapting content:", error)
    return NextResponse.json({ error: "Failed to adapt content" }, { status: 500 })
  }
}
