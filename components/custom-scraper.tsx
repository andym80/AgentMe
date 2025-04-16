"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import { scrapeWebsite } from "@/lib/scrape-action"
import type { NewsItem } from "@/lib/types"

interface CustomScraperProps {
  onNewsFound: (news: NewsItem[]) => void
}

export default function CustomScraper({ onNewsFound }: CustomScraperProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScrape = async () => {
    if (!url) return

    setIsLoading(true)
    setError(null)

    try {
      // Validate URL
      new URL(url)

      const results = await scrapeWebsite(url)

      if (results.length === 0) {
        setError("No news articles found on this page. Try a different URL.")
      } else {
        onNewsFound(results)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid URL or scraping failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom News Source</CardTitle>
        <CardDescription>Scrape news from a specific website</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter news website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleScrape} disabled={!url || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Scrape
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Note: Please ensure you have permission to scrape content from the website.
      </CardFooter>
    </Card>
  )
}
