import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { PoliticalParty } from "@/types/political"

interface AdaptedContentProps {
  content: string
  politicalParty: PoliticalParty
  isLoading: boolean
}

export default function AdaptedContent({ content, politicalParty, isLoading }: AdaptedContentProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!content) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          No adapted content yet. First scrape news and then click "Adapt Content" to generate political messaging.
        </p>
      </div>
    )
  }

  return (
    <Card className="border-t-4" style={{ borderTopColor: politicalParty.color }}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{politicalParty.name} Perspective</h3>
          <Badge style={{ backgroundColor: politicalParty.color }}>{politicalParty.ideology}</Badge>
        </div>

        <div className="prose max-w-none">
          {content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
