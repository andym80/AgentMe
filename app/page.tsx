import PressManager from "@/components/press-manager"
import LoginForm from "@/components/login-form"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Administrador de Prensa con IA</h1>
        <p className="text-gray-600 mb-8">
          Análisis de noticias internacionales, nacionales y municipales para campañas políticas
        </p>

        <Suspense fallback={<div>Cargando...</div>}>
          <LoginForm />
          <PressManager />
        </Suspense>
      </div>
    </main>
  )
}
