"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Lock, Flag, ArrowRight } from "lucide-react"

type PoliticalParty = "libertad-avanza" | "union-patria" | "juntos-cambio" | "frente-izquierda" | "otros"

interface LoginFormProps {
  onLogin?: (party: PoliticalParty) => void
}

function LoginFormComponent({ onLogin }: LoginFormProps = {}) {
  const [selectedParty, setSelectedParty] = useState<PoliticalParty | "">("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const parties = [
    {
      id: "libertad-avanza" as const,
      name: "La Libertad Avanza",
      color: "bg-purple-600",
      description: "Libertad económica y reducción del Estado",
    },
    {
      id: "union-patria" as const,
      name: "Unión por la Patria",
      color: "bg-blue-600",
      description: "Justicia social y soberanía nacional",
    },
    {
      id: "juntos-cambio" as const,
      name: "Juntos por el Cambio",
      color: "bg-yellow-600",
      description: "Instituciones sólidas y desarrollo sustentable",
    },
    {
      id: "frente-izquierda" as const,
      name: "Frente de Izquierda",
      color: "bg-red-600",
      description: "Derechos de los trabajadores y transformación social",
    },
    {
      id: "otros" as const,
      name: "Otros Partidos",
      color: "bg-gray-600",
      description: "Otras fuerzas políticas",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedParty) return

    setIsLoading(true)

    // Simulate login process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onLogin?.(selectedParty as PoliticalParty)
    setIsLoading(false)
  }

  const handleDemoAccess = (party: PoliticalParty) => {
    setSelectedParty(party)
    setUsername("demo")
    setPassword("demo")
    onLogin?.(party)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Flag className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Press Manager AI</CardTitle>
          <CardDescription>Accede al sistema de gestión política inteligente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="party">Partido Político</Label>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu partido político" />
                </SelectTrigger>
                <SelectContent>
                  {parties.map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      <div className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${party.color}`} />
                        <span>{party.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedParty && (
                <p className="text-sm text-muted-foreground">
                  {parties.find((p) => p.id === selectedParty)?.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!selectedParty || isLoading}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O accede con demo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {parties.slice(0, 4).map((party) => (
              <Button
                key={party.id}
                variant="outline"
                size="sm"
                onClick={() => handleDemoAccess(party.id)}
                className="justify-start"
              >
                <div className={`h-3 w-3 rounded-full ${party.color} mr-2`} />
                <span className="text-xs">{party.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Demo
                </Badge>
              </Button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">Sistema de análisis político para campañas argentinas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Named export
export function LoginForm(props: LoginFormProps) {
  return <LoginFormComponent {...props} />
}

// Default export
export default LoginFormComponent
