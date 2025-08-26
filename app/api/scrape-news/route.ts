import { NextResponse } from "next/server"
import type { NewsItem } from "@/types/news"
import { newsSources } from "@/lib/news-sources"

export async function GET() {
  try {
    // In a real implementation, this would use Puppeteer, Cheerio, or a news API
    // For demo purposes, we'll return mock data
    const mockNews: NewsItem[] = await Promise.all(
      newsSources.map(async (source) => {
        // Simulate fetching from different sources
        const randomCategories = ["Politics", "Economy", "International", "Society", "Technology"]
        const categories = [
          randomCategories[Math.floor(Math.random() * randomCategories.length)],
          randomCategories[Math.floor(Math.random() * randomCategories.length)],
        ].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates

        return {
          title: `${source.mockTitles[Math.floor(Math.random() * source.mockTitles.length)]}`,
          source: source.name,
          date: new Date().toLocaleDateString(),
          summary: `This is a summary of the news article from ${source.name}. In a real implementation, this would be scraped from the actual news source.`,
          url: `https://example.com/${source.id}/article`,
          categories,
        }
      }),
    )

    return NextResponse.json({ news: mockNews })
  } catch (error) {
    console.error("Error scraping news:", error)
    return NextResponse.json({ error: "Failed to scrape news" }, { status: 500 })
  }
}
