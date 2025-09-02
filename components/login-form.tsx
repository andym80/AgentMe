"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react"

interface LoginFormProps {
  onLogin?: (userData: {
    email: string
    name: string
    party: string
  }) => void
  onRegister?: (userData: {
    email: string
    name: string
    party: string
    password: string
  }) => void
}

const POLITICAL_PARTIES = [
  { id: "libertad-avanza", name: "La Libertad Avanza", color: "bg-yellow-500" },
  { id: "union-patria", name: "Unión por la Patria", color: "bg-blue-500" },
  { id: "juntos-cambio", name: "Juntos por el Cambio", color: "bg-orange-500" },
  { id: "frente-izquierda", name: "Frente de Izquierda", color: "bg-red-500" },
  { id: "hacemos-por-nuestro-pais", name: "Hacemos por Nuestro País", color: "bg-purple-500" },
  { id: "otros", name: "Otros Partidos", color: "bg-gray-500" },
]

export function LoginForm({ onLogin, onRegister }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    party: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validaciones básicas
      if (!formData.email || !formData.password) {
        throw new Error("Por favor, completa todos los campos obligatorios")
      }

      if (!isLogin && !formData.name) {
        throw new Error("El nombre es obligatorio para el registro")
      }

      if (!isLogin && !formData.party) {
        throw new Error("Debes seleccionar un partido político")
      }

      if (!isLogin && !acceptTerms) {
        throw new Error("Debes aceptar los términos y condiciones")
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error("Por favor, ingresa un email válido")
      }

      // Validar longitud de contraseña
      if (formData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (isLogin) {
        // Simular login exitoso
        const userData = {
          email: formData.email,
          name: formData.name || formData.email.split("@")[0],
          party: formData.party || "otros",
        }
        onLogin?.(userData)
      } else {
        // Simular registro exitoso
        const userData = {
          email: formData.email,
          name: formData.name,
          party: formData.party,
          password: formData.password,
        }
        onRegister?.(userData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    const demoParty = POLITICAL_PARTIES[Math.floor(Math.random() * POLITICAL_PARTIES.length)]
    const userData = {
      email: "demo@pressmanager.ai",
      name: "Usuario Demo",
      party: demoParty.id,
    }
    onLogin?.(userData)
  }

  const selectedParty = POLITICAL_PARTIES.find((p) => p.id === formData.party)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? "Accede a tu cuenta de Press Manager AI"
              : "Únete a Press Manager AI para gestionar tu comunicación política"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Tu contraseña"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="party">Partido Político</Label>
                <Select
                  value={formData.party}
                  onValueChange={(value) => setFormData({ ...formData, party: value })}
                  required={!isLogin}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu partido político">
                      {selectedParty && (
                        <div className="flex items-center space-x-2">
                          <div className={`h-3 w-3 rounded-full ${selectedParty.color}`} />
                          <span>{selectedParty.name}</span>
                        </div>
                      )}
                    </SelectValue>
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
            )}

            {!isLogin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  Acepto los{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    términos y condiciones
                  </a>{" "}
                  y la{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    política de privacidad
                  </a>
                </Label>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Procesando..."
              ) : isLogin ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Cuenta
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full bg-transparent" onClick={handleDemoLogin}>
              Acceso Demo
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                  setFormData({ email: "", password: "", name: "", party: "" })
                }}
              >
                {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Named export

// Default export
export default LoginForm
