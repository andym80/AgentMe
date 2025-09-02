"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Target, TrendingUp, BarChart3, Play, Pause, RotateCcw, Settings, Eye, MessageSquare } from "lucide-react"
import type { NewsItem, PoliticalParty } from "@/lib/types"

interface CircularInterfaceProps {
  newsItems: NewsItem[]
  onGenerateContent: (party: PoliticalParty, contentType: string, content: any) => void
}

interface CircularNode {
  id: string
  title: string
  category: string
  sentiment: number
  relevance: number
  angle: number
  radius: number
  selected: boolean
  color: string
}

interface PoliticalPosition {
  party: PoliticalParty
  x: number
  y: number
  influence: number
  color: string
  label: string
}

const POLITICAL_POSITIONS: PoliticalPosition[] = [
  {
    party: "libertad-avanza",
    x: 150,
    y: 80,
    influence: 0.8,
    color: "#8b5cf6",
    label: "La Libertad Avanza",
  },
  {
    party: "union-patria",
    x: 50,
    y: 150,
    influence: 0.7,
    color: "#3b82f6",
    label: "Unión por la Patria",
  },
  {
    party: "juntos-cambio",
    x: 150,
    y: 220,
    influence: 0.6,
    color: "#f59e0b",
    label: "Juntos por el Cambio",
  },
  {
    party: "frente-izquierda",
    x: 250,
    y: 150,
    influence: 0.4,
    color: "#ef4444",
    label: "Frente de Izquierda",
  },
]

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
}

export default function CircularInterface({ newsItems, onGenerateContent }: CircularInterfaceProps) {
  // Estados principales
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [selectedParty, setSelectedParty] = useState<PoliticalParty>("libertad-avanza")
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [viewMode, setViewMode] = useState<"sentiment" | "relevance" | "category">("sentiment")
  const [influenceRadius, setInfluenceRadius] = useState(100)
  const [rotationAngle, setRotationAngle] = useState(0)

  // Referencias
  const animationRef = useRef<number>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Convertir noticias a nodos circulares
  const circularNodes = useMemo((): CircularNode[] => {
    if (!newsItems.length) return []

    return newsItems.slice(0, 20).map((news, index) => {
      const angle = (index / newsItems.length) * 2 * Math.PI + rotationAngle
      const sentiment = news.acceptance ? (news.acceptance.positive - news.acceptance.negative) / 100 : 0
      const relevance = Math.random() * 0.8 + 0.2 // Simulado
      const radius = 80 + relevance * 40

      let color = SENTIMENT_COLORS.neutral
      if (sentiment > 0.2) color = SENTIMENT_COLORS.positive
      else if (sentiment < -0.2) color = SENTIMENT_COLORS.negative

      return {
        id: `node_${index}`,
        title: news.title.substring(0, 50) + "...",
        category: news.category,
        sentiment,
        relevance,
        angle,
        radius,
        selected: selectedNodes.includes(`node_${index}`),
        color,
      }
    })
  }, [newsItems, rotationAngle, selectedNodes])

  // Manejar selección de nodos
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodes((prev) => {
      if (prev.includes(nodeId)) {
        return prev.filter((id) => id !== nodeId)
      } else {
        return [...prev, nodeId]
      }
    })
  }, [])

  // Iniciar/pausar animación
  const toggleAnimation = useCallback(() => {
    setIsAnimating((prev) => !prev)
  }, [])

  // Resetear vista
  const resetView = useCallback(() => {
    setSelectedNodes([])
    setRotationAngle(0)
    setIsAnimating(false)
  }, [])

  // Generar contenido basado en selección
  const handleGenerateContent = useCallback(() => {
    if (selectedNodes.length === 0) {
      alert("Selecciona al menos un nodo para generar contenido")
      return
    }

    const selectedNewsItems = selectedNodes
      .map((nodeId) => {
        const index = Number.parseInt(nodeId.split("_")[1])
        return newsItems[index]
      })
      .filter(Boolean)

    onGenerateContent(selectedParty, "circular_analysis", {
      nodes: selectedNodes,
      newsItems: selectedNewsItems,
      viewMode,
      party: selectedParty,
    })
  }, [selectedNodes, selectedParty, viewMode, newsItems, onGenerateContent])

  // Animación continua
  useEffect(() => {
    if (!isAnimating) return

    const animate = () => {
      setRotationAngle((prev) => prev + 0.01 * animationSpeed)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, animationSpeed])

  // Renderizar canvas SVG
  const renderCircularView = useMemo(() => {
    const centerX = 200
    const centerY = 200
    const selectedPartyPosition = POLITICAL_POSITIONS.find((p) => p.party === selectedParty)

    return (
      <svg width="400" height="400" className="border rounded-lg bg-gray-50">
        {/* Círculos de referencia */}
        <circle cx={centerX} cy={centerY} r="80" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
        <circle cx={centerX} cy={centerY} r="120" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />

        {/* Posiciones políticas */}
        {POLITICAL_POSITIONS.map((position) => (
          <g key={position.party}>
            <circle
              cx={position.x}
              cy={position.y}
              r={position.influence * 20}
              fill={position.color}
              fillOpacity={position.party === selectedParty ? 0.3 : 0.1}
              stroke={position.color}
              strokeWidth={position.party === selectedParty ? 2 : 1}
            />
            <text
              x={position.x}
              y={position.y + 30}
              textAnchor="middle"
              fontSize="10"
              fill={position.color}
              fontWeight={position.party === selectedParty ? "bold" : "normal"}
            >
              {position.label.split(" ")[0]}
            </text>
          </g>
        ))}

        {/* Nodos de noticias */}
        {circularNodes.map((node) => {
          const x = centerX + Math.cos(node.angle) * node.radius
          const y = centerY + Math.sin(node.angle) * node.radius
          const size = node.selected ? 8 : 5

          return (
            <g key={node.id}>
              <circle
                cx={x}
                cy={y}
                r={size}
                fill={node.color}
                stroke={node.selected ? "#000" : "none"}
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleNodeClick(node.id)}
              />
              {node.selected && (
                <text x={x} y={y - 15} textAnchor="middle" fontSize="8" fill="#374151" className="pointer-events-none">
                  {node.title.substring(0, 20)}...
                </text>
              )}
            </g>
          )
        })}

        {/* Líneas de conexión para nodos seleccionados */}
        {selectedPartyPosition &&
          selectedNodes.map((nodeId) => {
            const node = circularNodes.find((n) => n.id === nodeId)
            if (!node) return null

            const nodeX = centerX + Math.cos(node.angle) * node.radius
            const nodeY = centerY + Math.sin(node.angle) * node.radius

            return (
              <line
                key={`connection_${nodeId}`}
                x1={selectedPartyPosition.x}
                y1={selectedPartyPosition.y}
                x2={nodeX}
                y2={nodeY}
                stroke={selectedPartyPosition.color}
                strokeWidth="1"
                strokeOpacity="0.5"
                strokeDasharray="3,3"
              />
            )
          })}

        {/* Centro */}
        <circle cx={centerX} cy={centerY} r="3" fill="#6b7280" />
      </svg>
    )
  }, [circularNodes, selectedNodes, selectedParty, handleNodeClick])

  // Estadísticas de la selección actual
  const selectionStats = useMemo(() => {
    if (selectedNodes.length === 0) {
      return {
        count: 0,
        avgSentiment: 0,
        avgRelevance: 0,
        categories: [],
      }
    }

    const selectedNodesData = selectedNodes
      .map((nodeId) => circularNodes.find((n) => n.id === nodeId))
      .filter(Boolean) as CircularNode[]

    const avgSentiment = selectedNodesData.reduce((acc, node) => acc + node.sentiment, 0) / selectedNodesData.length
    const avgRelevance = selectedNodesData.reduce((acc, node) => acc + node.relevance, 0) / selectedNodesData.length
    const categories = [...new Set(selectedNodesData.map((node) => node.category))]

    return {
      count: selectedNodes.length,
      avgSentiment: Math.round(avgSentiment * 100) / 100,
      avgRelevance: Math.round(avgRelevance * 100) / 100,
      categories,
    }
  }, [selectedNodes, circularNodes])

  return (
    <div className="space-y-6">
      {/* Controles principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Interfaz Circular Interactiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Selección de partido */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Partido Político</label>
              <Select value={selectedParty} onValueChange={(value: PoliticalParty) => setSelectedParty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLITICAL_POSITIONS.map((position) => (
                    <SelectItem key={position.party} value={position.party}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: position.color }} />
                        {position.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modo de vista */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Modo de Vista</label>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sentiment">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Sentimiento
                    </div>
                  </SelectItem>
                  <SelectItem value="relevance">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Relevancia
                    </div>
                  </SelectItem>
                  <SelectItem value="category">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Categoría
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Velocidad de animación */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Velocidad</label>
              <Slider
                value={[animationSpeed]}
                onValueChange={(value) => setAnimationSpeed(value[0])}
                max={3}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Controles de animación */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Controles</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={toggleAnimation} className="bg-transparent">
                  {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={resetView} className="bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista circular principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas circular */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Circular de Noticias
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div ref={containerRef}>{renderCircularView}</div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de estadísticas */}
        <div className="space-y-4">
          {/* Estadísticas de selección */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Selección Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectionStats.count}</div>
                  <div className="text-sm text-gray-600">Nodos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {selectionStats.avgSentiment > 0 ? "+" : ""}
                    {selectionStats.avgSentiment}
                  </div>
                  <div className="text-sm text-gray-600">Sentimiento</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Relevancia Promedio</div>
                <Progress value={selectionStats.avgRelevance * 100} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">{Math.round(selectionStats.avgRelevance * 100)}%</div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Categorías</div>
                <div className="flex flex-wrap gap-1">
                  {selectionStats.categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leyenda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Leyenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-xs font-medium">Sentimientos</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs">Positivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs">Negativo</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium">Tamaño</div>
                <div className="text-xs text-gray-600">El tamaño del nodo indica la relevancia de la noticia</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium">Distancia</div>
                <div className="text-xs text-gray-600">La distancia del centro indica el impacto político</div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardContent className="p-4">
              <Button onClick={handleGenerateContent} disabled={selectedNodes.length === 0} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Generar Análisis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Información de la Vista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">Noticias Totales</div>
              <div className="text-gray-600">{newsItems.length} elementos</div>
            </div>
            <div>
              <div className="font-medium mb-1">Nodos Visibles</div>
              <div className="text-gray-600">{circularNodes.length} nodos</div>
            </div>
            <div>
              <div className="font-medium mb-1">Partido Activo</div>
              <div className="text-gray-600">{POLITICAL_POSITIONS.find((p) => p.party === selectedParty)?.label}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
