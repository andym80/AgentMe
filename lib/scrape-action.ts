"use server"

import type { NewsItem } from "./types"
import * as cheerio from "cheerio"

export async function scrapeWebsite(url: string): Promise<NewsItem[]> {
  try {
    // Validar que la URL sea válida
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    // En una implementación real, esto usaría proper error handling,
    // respect robots.txt, y handle rate limiting
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PressManagerBot/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const results: NewsItem[] = []

    // Obtener el dominio base para URLs relativas
    const baseUrl = new URL(url).origin

    // This is a simplified example - real implementation would be
    // customized for each news source's HTML structure
    $("article").each((i, el) => {
      const title = $(el).find("h2, h3").first().text().trim()
      const summary = $(el).find("p").first().text().trim()
      let articleUrl = $(el).find("a").attr("href")
      const source = new URL(url).hostname.replace("www.", "")

      // Convertir URLs relativas a absolutas
      if (articleUrl && !articleUrl.startsWith("http")) {
        if (articleUrl.startsWith("/")) {
          articleUrl = baseUrl + articleUrl
        } else {
          articleUrl = baseUrl + "/" + articleUrl
        }
      }

      if (title) {
        results.push({
          title,
          summary: summary || "No summary available",
          url: articleUrl,
          source,
          category: "news",
          publishedAt: new Date().toISOString(),
        })
      }
    })

    return results
  } catch (error) {
    console.error("Error scraping website:", error)
    return []
  }
}
