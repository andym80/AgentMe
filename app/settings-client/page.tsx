"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Importar el componente del cliente de forma dinámica con SSR deshabilitado
const SettingsPageClient = dynamic(() => import("../settings/settings-page-client"), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Cargando configuración...</div>,
})

export default function SettingsClientPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Configuración</h1>
        <p className="text-center">Cargando configuración...</p>
      </div>
    )
  }

  return <SettingsPageClient />
}
