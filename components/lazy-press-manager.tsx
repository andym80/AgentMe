"use client"

import type React from "react"

import { lazy, Suspense, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertCircle } from "lucide-react"

// Lazy loading de componentes pesados
const StreamlinedPressManager = lazy(() => import("./streamlined-press-manager"))
const DashboardView = lazy(() => import("./dashboard-view"))
const CircularInterface = lazy(() => import("./circular-interface"))
const TechnicalAnalysisView = lazy(() => import("./technical-analysis-view"))
const AdvancedFeaturesPanel = lazy(() => import("./advanced-features-panel"))

// Componente de loading personalizado
function ComponentLoader({ name, progress }: { name: string; progress: number }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          Cargando {name}...
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Optimizando rendimiento... {Math.round(progress)}%
        </div>
      </CardContent>
    </Card>
  )
}

// Error boundary para componentes lazy
function LazyErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

interface LazyPressManagerProps {
  component: "streamlined" | "dashboard" | "circular" | "technical" | "advanced"
  newsItems?: any[]
  onRefreshNews?: () => void
  onMessageGenerated?: (party: any, message: string, opinions: Record<string, string>) => void
  onGenerateContent?: (party: any, contentType: string, content: any) => void
  isLoading?: boolean
  messagesGenerated?: number
}

export default function LazyPressManager({
  component,
  newsItems = [],
  onRefreshNews,
  onMessageGenerated,
  onGenerateContent,
  isLoading = false,
  messagesGenerated = 0,
}: LazyPressManagerProps) {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [hasError, setHasError] = useState(false)

  // Simular progreso de carga
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Manejar errores de carga
  const handleError = () => {
    setHasError(true)
  }

  // Componente de error
  const ErrorFallback = (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Error al cargar el componente. Por favor, recarga la página.</AlertDescription>
    </Alert>
  )

  // Componentes de loading específicos
  const LoadingComponents = {
    streamlined: <ComponentLoader name="Press Manager" progress={loadingProgress} />,
    dashboard: <ComponentLoader name="Dashboard" progress={loadingProgress} />,
    circular: <ComponentLoader name="Interfaz Circular" progress={loadingProgress} />,
    technical: <ComponentLoader name="Análisis Técnico" progress={loadingProgress} />,
    advanced: <ComponentLoader name="Funciones Avanzadas" progress={loadingProgress} />,
  }

  if (hasError) {
    return ErrorFallback
  }

  // Renderizar componente según el tipo
  switch (component) {
    case "streamlined":
      return (
        <LazyErrorBoundary fallback={LoadingComponents.streamlined}>
          <StreamlinedPressManager />
        </LazyErrorBoundary>
      )

    case "dashboard":
      return (
        <LazyErrorBoundary fallback={LoadingComponents.dashboard}>
          <DashboardView
            newsItems={newsItems}
            onRefreshNews={onRefreshNews || (() => {})}
            onMessageGenerated={onMessageGenerated || (() => {})}
            isLoading={isLoading}
            messagesGenerated={messagesGenerated}
          />
        </LazyErrorBoundary>
      )

    case "circular":
      return (
        <LazyErrorBoundary fallback={LoadingComponents.circular}>
          <CircularInterface newsItems={newsItems} onGenerateContent={onGenerateContent || (() => {})} />
        </LazyErrorBoundary>
      )

    case "technical":
      return (
        <LazyErrorBoundary fallback={LoadingComponents.technical}>
          <TechnicalAnalysisView news={newsItems} />
        </LazyErrorBoundary>
      )

    case "advanced":
      return (
        <LazyErrorBoundary fallback={LoadingComponents.advanced}>
          <AdvancedFeaturesPanel />
        </LazyErrorBoundary>
      )

    default:
      return LoadingComponents.streamlined
  }
}
