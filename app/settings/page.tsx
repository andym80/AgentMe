export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      <p>Cargando configuración...</p>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.location.href = '/settings-client';
          `,
        }}
      />
    </div>
  )
}
