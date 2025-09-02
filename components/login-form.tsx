"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Users, Flag } from "lucide-react"
import { safeStorage, isClient } from "@/lib/storage-utils"

interface LoginFormProps {
  onLogin?: (userData: { name: string; party: string; email: string }) => void
}

const POLITICAL_PARTIES = [
  {
    id: "frente-de-todos",
    name: "Frente de Todos",
    description: "Coalición peronista progresista",
    color: "bg-blue-500",
    leader: "Alberto Fernández / Cristina Kirchner",
  },
  {
    id: "juntos-por-el-cambio",
    name: "Juntos por el Cambio",
    description: "Coalición centro-derecha",
    color: "bg-yellow-500",
    leader: "Mauricio Macri / Patricia Bullrich",
  },
  {
    id: "la-libertad-avanza",
    name: "La Libertad Avanza",
    description: "Movimiento libertario",
    color: "bg-purple-500",
    leader: "Javier Milei",
  },
  {
    id: "frente-de-izquierda",
    name: "Frente de Izquierda",
    description: "Coalición de izquierda",
    color: "bg-red-500",
    leader: "Nicolás del Caño / Myriam Bregman",
  },
  {
    id: "hacemos-por-nuestro-pais",
    name: "Hacemos por Nuestro País",
    description: "Centro político",
    color: "bg-green-500",
    leader: "Juan Schiaretti",
  },
]

function LoginFormComponent({ onLogin }: LoginFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    party: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.party) {
      setError("Por favor, completa todos los campos")
      return
    }

    if (!formData.email.includes("@")) {
      setError("Por favor, ingresa un email válido")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simular autenticación
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const selectedParty = POLITICAL_PARTIES.find((p) => p.id === formData.party)
      const userData = {
        name: formData.name,
        email: formData.email,
        party: selectedParty?.name || formData.party,
        loginTime: new Date().toISOString(),
      }

      // Guardar en localStorage
      if (isClient) {
        safeStorage.setItem("user_data", JSON.stringify(userData))
        safeStorage.setItem("selected_party", formData.party)
      }

      setSuccess(true)

      // Llamar callback si existe
      if (onLogin) {
        onLogin(userData)
      }

      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setError("Error al iniciar sesión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    const demoData = {
      name: "Usuario Demo",
      email: "demo@pressmanager.ai",
      party: "frente-de-todos",
    }

    setFormData(demoData)

    // Auto-submit después de un breve delay
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.requestSubmit()
      }
    }, 500)
  }

  const selectedParty = POLITICAL_PARTIES.find((p) => p.id === formData.party)

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">¡Bienvenido!</h3>
            <p className="text-sm text-muted-foreground">Iniciando sesión como {formData.name}...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
          <div>
            <CardTitle className="text-2xl">Press Manager AI</CardTitle>
            <CardDescription>Accede a tu plataforma de gestión política</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="party">Afiliación Política</Label>
            <Select
              value={formData.party}
              onValueChange={(value) => handleInputChange("party", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu partido político" />
              </SelectTrigger>
              <SelectContent>
                {POLITICAL_PARTIES.map((party) => (
                  <SelectItem key={party.id} value={party.id}>
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${party.color}`} />
                      <span>{party.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedParty && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-start space-x-2">
                <Flag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{selectedParty.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedParty.description}</p>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">{selectedParty.leader}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          <Users className="mr-2 h-4 w-4" />
          Acceso Demo
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Named export
export function LoginForm(props: LoginFormProps) {
  return <LoginFormComponent {...props} />
}

// Default export
export default LoginFormComponent
