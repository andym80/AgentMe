"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw } from "lucide-react"
import NewsScraper from "./news-scraper"
import AdaptedContent from "./adapted-content"
import { politicalParties } from "@/lib/political-parties"
import type { NewsItem } from "@/types/news"

export default function PressManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [adaptedContent, setAdaptedContent] = useState<string>("")
  const [selectedParty, setSelectedParty] = useState("centrist")

  const handleScrapeNews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/scrape-news")
      const data = await response.json()
      setNewsItems(data.news)
    } catch (error) {
      console.error("Error scraping news:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdaptContent = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/adapt-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newsItems,
          politicalParty: selectedParty,
        }),
      })
      const data = await response.json()
      setAdaptedContent(data.adaptedContent)
    } catch (error) {
      console.error("Error adapting content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Press Management Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Scrape international news and adapt it to your political messaging
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="party-select">Political Party:</Label>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger id="party-select" className="w-[180px]">
                  <SelectValue placeholder="Select party" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(politicalParties).map(([id, party]) => (
                    <SelectItem key={id} value={id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="scraper" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scraper">News Scraper</TabsTrigger>
              <TabsTrigger value="adapted">Adapted Content</TabsTrigger>
            </TabsList>

            <TabsContent value="scraper" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">International News Headlines</h3>
                <Button onClick={handleScrapeNews} disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Scrape Latest News
                </Button>
              </div>

              <NewsScraper newsItems={newsItems} isLoading={isLoading} />

              {newsItems.length > 0 && (
                <Button onClick={handleAdaptContent} disabled={isLoading} className="w-full mt-4">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Adapt Content for {politicalParties[selectedParty].name}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="adapted">
              <AdaptedContent
                content={adaptedContent}
                politicalParty={politicalParties[selectedParty]}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
