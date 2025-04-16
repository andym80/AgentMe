"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ApiKeyConfig from "./api-key-config"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    aiModel: "gpt-4o",
    temperature: 0.7,
    maxTokens: 1000,
    useCustomPrompt: false,
    customPrompt: "",
    includeSourceLinks: true,
    autoRefresh: false,
    refreshInterval: 30,
  })

  const handleSave = () => {
    // En una aplicación real, esto guardaría en localStorage o una base de datos
    alert("¡Configuración guardada!")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Configuración del Administrador de Prensa IA</h1>

      <div className="grid gap-6">
        <ApiKeyConfig />

        <Card>
          <CardHeader>
            <CardTitle>Configuración del Modelo de IA</CardTitle>
            <CardDescription>Configura el modelo de IA utilizado para la adaptación de contenido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-model">Modelo de IA</Label>
              <Select value={settings.aiModel} onValueChange={(value) => setSettings({ ...settings, aiModel: value })}>
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Más rápido)</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="temperature">Temperatura: {settings.temperature}</Label>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[settings.temperature]}
                onValueChange={(value) => setSettings({ ...settings, temperature: value[0] })}
              />
              <p className="text-xs text-gray-500">
                Valores más bajos producen resultados más consistentes y enfocados. Valores más altos producen
                resultados más creativos y variados.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">Longitud Máxima de Salida</Label>
              <Input
                id="max-tokens"
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: Number.parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500">Número máximo de tokens en la respuesta generada.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalización de Contenido</CardTitle>
            <CardDescription>Personaliza cómo se adapta el contenido para tu campaña</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-prompt">Usar Plantilla de Prompt Personalizada</Label>
              <Switch
                id="custom-prompt-toggle"
                checked={settings.useCustomPrompt}
                onCheckedChange={(checked) => setSettings({ ...settings, useCustomPrompt: checked })}
              />
            </div>

            {settings.useCustomPrompt && (
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Plantilla de Prompt Personalizada</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Ingresa tu plantilla de prompt personalizada..."
                  value={settings.customPrompt}
                  onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-gray-500">
                  Usa {"{news}"} como marcador de posición para el contenido de noticias y {"{party}"} para el partido
                  político.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-sources">Incluir Enlaces a Fuentes</Label>
                <p className="text-xs text-gray-500">Incluir referencias a las fuentes de noticias originales</p>
              </div>
              <Switch
                id="include-sources"
                checked={settings.includeSourceLinks}
                onCheckedChange={(checked) => setSettings({ ...settings, includeSourceLinks: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Actualización de Noticias</CardTitle>
            <CardDescription>Configura la actualización automática de noticias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-refresh">Actualización Automática</Label>
                <p className="text-xs text-gray-500">Actualizar noticias automáticamente a intervalos regulares</p>
              </div>
              <Switch
                id="auto-refresh"
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => setSettings({ ...settings, autoRefresh: checked })}
              />
            </div>

            {settings.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Intervalo de Actualización (minutos)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  min={5}
                  max={120}
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: Number.parseInt(e.target.value) })}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>Guardar Configuración</Button>
      </div>
    </div>
  )
}
