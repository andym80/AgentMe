"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Importar componentes de forma dinámica con SSR deshabilitado
const AnthropicKeyConfig = dynamic(() => import("./anthropic-key-config"), { ssr: false })
const OpenAIKeyConfig = dynamic(() => import("./openai-key-config"), { ssr: false })
const AnthropicQuotaMonitor = dynamic(() => import("@/components/anthropic-quota-monitor"), { ssr: false })
const AIProviderSelector = dynamic(() => import("@/components/ai-provider-selector"), { ssr: false })

export default function SettingsPageClient() {
  const [activeTab, setActiveTab] = useState("api-keys")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true)
  }, [])

  // Si no estamos en el cliente, mostrar un placeholder
  if (!isClient) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Configuración</h1>
        <p>Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="api-keys">Claves API</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Claves API</CardTitle>
              <CardDescription>Configura las claves API para los diferentes proveedores de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {isClient && <AnthropicKeyConfig />}
              {isClient && <OpenAIKeyConfig />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {isClient && <AIProviderSelector />}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoreo de Cuotas de API</CardTitle>
              <CardDescription>Verifica el estado de tus cuotas de API para los diferentes proveedores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">{isClient && <AnthropicQuotaMonitor />}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
