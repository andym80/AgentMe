"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    party: "libertad-avanza",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // En una aplicación real, aquí iría la lógica de autenticación
    // Por ahora, simplemente simulamos un inicio de sesión exitoso

    toast({
      title: "Inicio de sesión exitoso",
      description: `Has iniciado sesión como representante de ${getPartyName(formData.party)}`,
    })

    setIsLoggedIn(true)

    // Guardar la preferencia de partido en localStorage
    localStorage.setItem("preferredParty", formData.party)
  }

  const getPartyName = (partyId: string): string => {
    const parties: Record<string, string> = {
      "libertad-avanza": "La Libertad Avanza",
      "union-patria": "Unión por la Patria",
      "juntos-cambio": "Juntos por el Cambio",
      "frente-izquierda": "Frente de Izquierda",
      otros: "Otros partidos",
    }
    return parties[partyId] || partyId
  }

  if (isLoggedIn) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sesión iniciada</CardTitle>
          <CardDescription>Has iniciado sesión como representante de {getPartyName(formData.party)}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            Cerrar sesión
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Accede a tu cuenta para gestionar tu campaña política</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Alineación política (para adaptar contenido)</Label>
            <RadioGroup
              value={formData.party}
              onValueChange={(value) => setFormData({ ...formData, party: value })}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="libertad-avanza" id="libertad-avanza" />
                <Label htmlFor="libertad-avanza">La Libertad Avanza</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="union-patria" id="union-patria" />
                <Label htmlFor="union-patria">Unión por la Patria</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="juntos-cambio" id="juntos-cambio" />
                <Label htmlFor="juntos-cambio">Juntos por el Cambio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="frente-izquierda" id="frente-izquierda" />
                <Label htmlFor="frente-izquierda">Frente de Izquierda</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="otros" id="otros" />
                <Label htmlFor="otros">Otros partidos</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Iniciar sesión</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
