import SpeechGenerator from "@/components/speech-generator"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Gestor de Prensa Político</h1>
      <SpeechGenerator />
    </main>
  )
}
