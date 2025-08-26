import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { NewsItem } from "@/types/news"

interface NewsScraperProps {
  newsItems: NewsItem[]
  isLoading: boolean
}

export default function NewsScraper({ newsItems, isLoading }: NewsScraperProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (newsItems.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No news items yet. Click "Scrape Latest News" to fetch headlines.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {newsItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline">{item.source}</Badge>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
            <h4 className="font-medium mb-1">{item.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
            <div className="flex gap-2 mt-2">
              {item.categories.map((category, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
