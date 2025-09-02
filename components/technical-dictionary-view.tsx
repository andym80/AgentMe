"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, BookOpen, TrendingUp, Users, Lightbulb } from "lucide-react"

// Definición de tipos para el diccionario técnico
interface TechnicalTerm {
  term: string
  definition: string
  category: "economia" | "sociologia" | "politica"
  relatedTerms: string[]
  examples: string[]
}

// Diccionario técnico
const technicalDictionary: TechnicalTerm[] = [
  // Términos de Economía
  {
    term: "Inflación",
    definition:
      "Aumento generalizado y sostenido de los precios de bienes y servicios en un país durante un período de tiempo sostenido. Cuando el nivel general de precios sube, con cada unidad de moneda se adquieren menos bienes y servicios.",
    category: "economia",
    relatedTerms: ["Deflación", "Índice de Precios al Consumidor", "Política Monetaria"],
    examples: [
      "La inflación interanual alcanzó el 140% en Argentina durante 2023.",
      "El Banco Central implementó medidas para controlar la inflación.",
    ],
  },
  {
    term: "Recesión",
    definition:
      "Período de disminución de la actividad económica. Técnicamente se define como dos trimestres consecutivos de crecimiento negativo del PIB. Durante una recesión, suele aumentar el desempleo y disminuir el consumo y la inversión.",
    category: "economia",
    relatedTerms: ["Depresión Económica", "Ciclo Económico", "Contracción"],
    examples: [
      "La economía entró en recesión tras dos trimestres de caída del PIB.",
      "Las políticas anticíclicas buscan evitar o mitigar las recesiones.",
    ],
  },
  {
    term: "Tipo de Cambio",
    definition:
      "Relación que existe entre el valor de una divisa y otra. Es el precio de una moneda expresado en términos de otra. Puede ser fijo (establecido por el gobierno) o flotante (determinado por el mercado).",
    category: "economia",
    relatedTerms: ["Devaluación", "Apreciación", "Mercado de Divisas", "Dólar Blue"],
    examples: [
      "El tipo de cambio oficial se mantuvo en 350 pesos por dólar.",
      "La brecha entre el tipo de cambio oficial y el paralelo alcanzó el 150%.",
    ],
  },
  {
    term: "Déficit Fiscal",
    definition:
      "Situación en la que los gastos de un gobierno superan a sus ingresos en un período determinado. El déficit fiscal suele financiarse mediante emisión de deuda pública o emisión monetaria.",
    category: "economia",
    relatedTerms: ["Superávit Fiscal", "Deuda Pública", "Emisión Monetaria"],
    examples: [
      "El gobierno se comprometió a reducir el déficit fiscal al 0% para fin de año.",
      "El déficit fiscal alcanzó el 5% del PIB durante la pandemia.",
    ],
  },
  {
    term: "Emisión Monetaria",
    definition:
      "Creación de dinero por parte del Banco Central. En Argentina, históricamente se ha utilizado para financiar el déficit fiscal, lo que puede generar presiones inflacionarias cuando no está respaldada por un aumento en la producción de bienes y servicios.",
    category: "economia",
    relatedTerms: ["Base Monetaria", "Inflación", "Déficit Fiscal", "Política Monetaria"],
    examples: [
      "El Banco Central redujo la emisión monetaria en un 80% durante el primer trimestre.",
      "La emisión monetaria sin respaldo productivo suele generar inflación.",
    ],
  },
  {
    term: "Cepo Cambiario",
    definition:
      "Conjunto de restricciones impuestas por el gobierno para limitar la compra de divisas extranjeras. En Argentina, estas restricciones han incluido límites mensuales para la adquisición de dólares y recargos impositivos.",
    category: "economia",
    relatedTerms: ["Control de Cambios", "Mercado Paralelo", "Brecha Cambiaria"],
    examples: [
      "El cepo cambiario limitó la compra de dólares a 200 mensuales por persona.",
      "El gobierno anunció un cronograma para la eliminación gradual del cepo cambiario.",
    ],
  },

  // Términos de Sociología
  {
    term: "Movilidad Social",
    definition:
      "Posibilidad que tienen los individuos o grupos de cambiar su posición en la jerarquía social. Puede ser ascendente (mejora de la posición) o descendente (empeoramiento), e intergeneracional (entre padres e hijos) o intrageneracional (durante la vida de una persona).",
    category: "sociologia",
    relatedTerms: ["Estratificación Social", "Desigualdad", "Clase Social"],
    examples: [
      "La educación pública de calidad es un factor clave para la movilidad social ascendente.",
      "La crisis económica redujo las posibilidades de movilidad social para la clase media.",
    ],
  },
  {
    term: "Pobreza Estructural",
    definition:
      "Condición de pobreza persistente y de largo plazo, causada por factores sistémicos como la desigualdad, la falta de acceso a educación y salud, y la discriminación. Se diferencia de la pobreza coyuntural, que es temporal y causada por crisis económicas.",
    category: "sociologia",
    relatedTerms: ["Necesidades Básicas Insatisfechas", "Pobreza Multidimensional", "Exclusión Social"],
    examples: [
      "Los programas asistenciales no resuelven la pobreza estructural sin políticas de desarrollo.",
      "Las villas miseria son manifestaciones territoriales de la pobreza estructural.",
    ],
  },
  {
    term: "Desigualdad",
    definition:
      "Distribución desigual de recursos, oportunidades y resultados entre individuos o grupos sociales. Puede manifestarse en términos económicos (ingresos, riqueza), sociales (acceso a servicios), políticos (representación) o culturales (reconocimiento).",
    category: "sociologia",
    relatedTerms: ["Coeficiente de Gini", "Equidad", "Justicia Social", "Distribución del Ingreso"],
    examples: [
      "Argentina tiene una de las distribuciones de ingreso más desiguales de América Latina.",
      "La desigualdad educativa se profundizó durante la pandemia.",
    ],
  },
  {
    term: "Capital Social",
    definition:
      "Conjunto de recursos actuales o potenciales vinculados a la posesión de una red duradera de relaciones. Incluye las conexiones sociales, la confianza interpersonal y las normas de reciprocidad que facilitan la acción colectiva.",
    category: "sociologia",
    relatedTerms: ["Redes Sociales", "Cohesión Social", "Confianza Institucional"],
    examples: [
      "Las organizaciones barriales generan capital social que permite enfrentar crisis comunitarias.",
      "La polarización política ha erosionado el capital social en muchas democracias.",
    ],
  },

  // Términos de Política
  {
    term: "Ley Bases",
    definition:
      "Proyecto legislativo impulsado por el gobierno de Javier Milei que busca establecer reformas estructurales en diversos ámbitos como el fiscal, laboral, energético y administrativo. Incluye la declaración de emergencia pública y la delegación de facultades al Poder Ejecutivo.",
    category: "politica",
    relatedTerms: ["DNU", "Reforma del Estado", "Emergencia Pública", "Facultades Delegadas"],
    examples: [
      "La Ley Bases fue aprobada en general en la Cámara de Diputados.",
      "La oposición cuestionó varios artículos de la Ley Bases por considerarlos inconstitucionales.",
    ],
  },
  {
    term: "DNU",
    definition:
      "Decreto de Necesidad y Urgencia. Instrumento legal que permite al Poder Ejecutivo dictar normas con rango de ley en situaciones excepcionales, sin la intervención previa del Congreso. Posteriormente, el Congreso debe revisar y aprobar o rechazar estos decretos.",
    category: "politica",
    relatedTerms: ["Poder Ejecutivo", "Facultades Legislativas", "Control Parlamentario"],
    examples: [
      "El gobierno emitió un DNU con más de 300 artículos para desregular la economía.",
      "La Comisión Bicameral debe dictaminar sobre la validez de los DNU.",
    ],
  },
  {
    term: "Coparticipación Federal",
    definition:
      "Sistema de distribución de recursos fiscales entre el gobierno nacional y las provincias. Establece qué porcentaje de los impuestos recaudados a nivel nacional corresponde a cada jurisdicción, según criterios establecidos por ley.",
    category: "politica",
    relatedTerms: ["Federalismo Fiscal", "Autonomía Provincial", "Recursos Tributarios"],
    examples: [
      "La Corte Suprema falló a favor de la Ciudad de Buenos Aires en el conflicto por la coparticipación.",
      "Las provincias reclaman una nueva ley de coparticipación federal más equitativa.",
    ],
  },
  {
    term: "Motosierra",
    definition:
      "Término metafórico utilizado en el discurso político argentino reciente, especialmente por Javier Milei, para referirse a los recortes drásticos del gasto público. Simboliza la eliminación de gastos considerados innecesarios o improductivos en la administración estatal.",
    category: "politica",
    relatedTerms: ["Ajuste Fiscal", "Reducción del Estado", "Déficit Cero"],
    examples: [
      "El presidente prometió aplicar la motosierra al gasto público.",
      "La motosierra se convirtió en un símbolo de la campaña electoral.",
    ],
  },
]

export default function TechnicalDictionaryView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<"all" | "economia" | "sociologia" | "politica">("all")
  const [filteredTerms, setFilteredTerms] = useState<TechnicalTerm[]>(technicalDictionary)
  const [selectedTerm, setSelectedTerm] = useState<TechnicalTerm | null>(null)

  // Filtrar términos cuando cambia la búsqueda o categoría
  useEffect(() => {
    let result = technicalDictionary

    // Filtrar por categoría
    if (activeCategory !== "all") {
      result = result.filter((term) => term.category === activeCategory)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(
        (term) =>
          term.term.toLowerCase().includes(searchLower) ||
          term.definition.toLowerCase().includes(searchLower) ||
          term.relatedTerms.some((related) => related.toLowerCase().includes(searchLower)),
      )
    }

    setFilteredTerms(result)

    // Si hay resultados y no hay término seleccionado, seleccionar el primero
    if (result.length > 0 && !selectedTerm) {
      setSelectedTerm(result[0])
    } else if (result.length === 0) {
      setSelectedTerm(null)
    }
  }, [searchTerm, activeCategory])

  // Renderizar icono según categoría
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "economia":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "sociologia":
        return <Users className="h-4 w-4 text-blue-600" />
      case "politica":
        return <Lightbulb className="h-4 w-4 text-amber-600" />
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />
    }
  }

  // Traducir categoría
  const translateCategory = (category: string) => {
    switch (category) {
      case "economia":
        return "Economía"
      case "sociologia":
        return "Sociología"
      case "politica":
        return "Política"
      default:
        return category
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Diccionario Técnico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel izquierdo: búsqueda y lista de términos */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar términos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" onValueChange={(value) => setActiveCategory(value as any)}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="economia">Economía</TabsTrigger>
                <TabsTrigger value="sociologia">Sociología</TabsTrigger>
                <TabsTrigger value="politica">Política</TabsTrigger>
              </TabsList>
            </Tabs>

            <ScrollArea className="h-[400px] border rounded-md">
              <div className="p-2 space-y-1">
                {filteredTerms.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No se encontraron términos</p>
                ) : (
                  filteredTerms.map((term, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        selectedTerm?.term === term.term ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedTerm(term)}
                    >
                      <div className="flex items-center gap-2">
                        {renderCategoryIcon(term.category)}
                        <span className="font-medium">{term.term}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{term.definition}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Panel derecho: detalle del término seleccionado */}
          <div className="md:col-span-2">
            {selectedTerm ? (
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedTerm.term}</h2>
                  <Badge className="text-xs">{translateCategory(selectedTerm.category)}</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Definición</h3>
                    <p className="text-gray-800">{selectedTerm.definition}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Términos relacionados</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((term, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-50">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Ejemplos de uso</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedTerm.examples.map((example, index) => (
                        <li key={index} className="text-gray-700 text-sm">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-md p-8 flex flex-col items-center justify-center h-full text-center text-gray-500">
                <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Ningún término seleccionado</h3>
                <p>Selecciona un término del diccionario para ver su definición detallada</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
