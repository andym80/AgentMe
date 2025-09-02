"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Lightbulb,
  Zap,
  Brain,
  Target,
  Calendar,
  FileText,
  Download,
  Upload,
  Settings,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
} from "lucide-react"

interface AdvancedFeature {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "beta"
  category: "ai" | "analytics" | "export" | "automation"
  icon: React.ReactNode
}

const ADVANCED_FEATURES: AdvancedFeature[] = [
  {
    id: "nlp_advanced",
    name: "Análisis NLP Avanzado",
    description: "Procesamiento de lenguaje natural con modelos de última generación",
    status: "active",
    category: "ai",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: "smart_cache",
    name: "Sistema de Caché Inteligente",
    description: "Optimización automática de rendimiento con caché predictivo",
    status: "active",
    category: "automation",
    icon: <Database className="h-5 w-5" />,
  },
  {
    id: "multiformat_export",
    name: "Exportación Multiformato",
    description: "Exporta análisis en PDF, Excel, Word y formatos personalizados",
    status: "active",
    category: "export",
    icon: <Download className="h-5 w-5" />,
  },
  {
    id: "editorial_calendar",
    name: "Calendario Editorial",
    description: "Planificación y programación automática de contenido político",
    status: "beta",
    category: "automation",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "sentiment_tracking",
    name: "Seguimiento de Sentimientos",
    description: "Monitoreo en tiempo real de cambios en la opinión pública",
    status: "active",
    category: "analytics",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "ai_recommendations",
    name: "Recomendaciones IA",
    description: "Sugerencias inteligentes basadas en tendencias y contexto",
    status: "beta",
    category: "ai",
    icon: <Lightbulb className="h-5 w-5" />,
  },
]

export default function AdvancedFeaturesPanel() {
  const [activeFeatures, setActiveFeatures] = useState<string[]>(
    ADVANCED_FEATURES.filter((f) => f.status === "active").map((f) => f.id),
  )
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [customPrompt, setCustomPrompt] = useState("")
  const [exportFormat, setExportFormat] = useState("pdf")
  const [automationSettings, setAutomationSettings] = useState({
    autoRefresh: true,
    smartNotifications: false,
    predictiveAnalysis: true,
    realTimeUpdates: false,
  })

  // Filtrar características por categoría
  const filteredFeatures = useMemo(() => {
    if (selectedCategory === "all") return ADVANCED_FEATURES
    return ADVANCED_FEATURES.filter((feature) => feature.category === selectedCategory)
  }, [selectedCategory])

  // Estadísticas de características
  const featureStats = useMemo(() => {
    const total = ADVANCED_FEATURES.length
    const active = activeFeatures.length
    const beta = ADVANCED_FEATURES.filter((f) => f.status === "beta").length
    const byCategory = ADVANCED_FEATURES.reduce(
      (acc, feature) => {
        acc[feature.category] = (acc[feature.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return { total, active, beta, byCategory }
  }, [activeFeatures])

  // Alternar característica
  const toggleFeature = useCallback((featureId: string) => {
    setActiveFeatures((prev) => {
      if (prev.includes(featureId)) {
        return prev.filter((id) => id !== featureId)
      } else {
        return [...prev, featureId]
      }
    })
  }, [])

  // Exportar configuración
  const handleExportConfig = useCallback(() => {
    const config = {
      activeFeatures,
      automationSettings,
      customPrompt,
      exportFormat,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `configuracion_avanzada_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [activeFeatures, automationSettings, customPrompt, exportFormat])

  // Importar configuración
  const handleImportConfig = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string)
          setActiveFeatures(config.activeFeatures || [])
          setAutomationSettings(config.automationSettings || automationSettings)
          setCustomPrompt(config.customPrompt || "")
          setExportFormat(config.exportFormat || "pdf")
        } catch (error) {
          console.error("Error importing config:", error)
          alert("Error al importar la configuración")
        }
      }
      reader.readAsText(file)
    },
    [automationSettings],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                Panel de Características Avanzadas
              </CardTitle>
              <p className="text-muted-foreground mt-1">Configura y gestiona funcionalidades avanzadas del sistema</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" id="import-config" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("import-config")?.click()}
                className="bg-transparent"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportConfig} className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Características Activas</p>
                <p className="text-2xl font-bold text-green-600">{featureStats.active}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={(featureStats.active / featureStats.total) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Beta</p>
                <p className="text-2xl font-bold text-yellow-600">{featureStats.beta}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Funciones experimentales
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">IA Avanzada</p>
                <p className="text-2xl font-bold text-purple-600">{featureStats.byCategory.ai || 0}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Zap className="h-3 w-3 mr-1" />
              Modelos ML activos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Automatización</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Object.values(automationSettings).filter(Boolean).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 mr-1" />
              Procesos automáticos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel principal */}
      <Tabs defaultValue="features" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Características
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Automatización
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportación
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Avanzada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Categoría:</span>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="ai">Inteligencia Artificial</SelectItem>
                    <SelectItem value="analytics">Análisis</SelectItem>
                    <SelectItem value="export">Exportación</SelectItem>
                    <SelectItem value="automation">Automatización</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de características */}
          <div className="grid gap-4">
            {filteredFeatures.map((feature) => (
              <Card
                key={feature.id}
                className={`transition-all ${
                  activeFeatures.includes(feature.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          feature.category === "ai"
                            ? "bg-purple-100"
                            : feature.category === "analytics"
                              ? "bg-green-100"
                              : feature.category === "export"
                                ? "bg-blue-100"
                                : "bg-orange-100"
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{feature.name}</h3>
                          <Badge
                            variant={
                              feature.status === "active"
                                ? "default"
                                : feature.status === "beta"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              feature.status === "active"
                                ? "bg-green-100 text-green-800"
                                : feature.status === "beta"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ""
                            }
                          >
                            {feature.status === "active" ? "Activo" : feature.status === "beta" ? "Beta" : "Inactivo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {feature.category === "ai"
                              ? "IA"
                              : feature.category === "analytics"
                                ? "Análisis"
                                : feature.category === "export"
                                  ? "Exportación"
                                  : "Automatización"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={activeFeatures.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        disabled={feature.status === "inactive"}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Automatización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Actualización Automática</div>
                    <div className="text-sm text-gray-600">Actualizar noticias cada 5 minutos</div>
                  </div>
                  <Switch
                    checked={automationSettings.autoRefresh}
                    onCheckedChange={(checked) => setAutomationSettings((prev) => ({ ...prev, autoRefresh: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Notificaciones Inteligentes</div>
                    <div className="text-sm text-gray-600">Alertas basadas en cambios significativos</div>
                  </div>
                  <Switch
                    checked={automationSettings.smartNotifications}
                    onCheckedChange={(checked) =>
                      setAutomationSettings((prev) => ({ ...prev, smartNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Análisis Predictivo</div>
                    <div className="text-sm text-gray-600">Predicciones automáticas de tendencias</div>
                  </div>
                  <Switch
                    checked={automationSettings.predictiveAnalysis}
                    onCheckedChange={(checked) =>
                      setAutomationSettings((prev) => ({ ...prev, predictiveAnalysis: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Actualizaciones en Tiempo Real</div>
                    <div className="text-sm text-gray-600">Sincronización continua de datos</div>
                  </div>
                  <Switch
                    checked={automationSettings.realTimeUpdates}
                    onCheckedChange={(checked) =>
                      setAutomationSettings((prev) => ({ ...prev, realTimeUpdates: checked }))
                    }
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nota sobre Rendimiento</AlertTitle>
                <AlertDescription>
                  Las actualizaciones en tiempo real pueden afectar el rendimiento del sistema. Se recomienda para uso
                  en producción con recursos adecuados.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Configuración de Exportación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Formato de Exportación</label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="word">Word (.docx)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Plantilla</label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Estándar</SelectItem>
                      <SelectItem value="executive">Ejecutivo</SelectItem>
                      <SelectItem value="detailed">Detallado</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Configuración Personalizada</label>
                <Textarea placeholder="Configuración JSON personalizada para exportación..." rows={4} />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Análisis Actual
                </Button>
                <Button variant="outline" className="bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Configuración de IA Avanzada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt Personalizado del Sistema</label>
                <Textarea
                  placeholder="Instrucciones específicas para el modelo de IA..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo de Lenguaje</label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="custom">Modelo Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperatura</label>
                  <Input type="number" min="0" max="2" step="0.1" defaultValue="0.7" />
                </div>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertTitle>Configuración Avanzada</AlertTitle>
                <AlertDescription>
                  Los cambios en la configuración de IA afectarán la calidad y estilo de los análisis generados. Se
                  recomienda probar con datos de muestra antes de aplicar en producción.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Probar Configuración
                </Button>
                <Button variant="outline" className="bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restaurar Valores por Defecto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
