"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart3, Home, Settings, Newspaper, Globe, Building, MapPin } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            <span>Administrador de Prensa IA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isActive("/") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Inicio
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isActive("/dashboard") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Panel
            </Link>
            <Link
              href="/settings"
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isActive("/settings") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-4 mr-4">
            <span className="flex items-center text-xs text-muted-foreground gap-1">
              <Globe className="h-3 w-3" /> Internacional
            </span>
            <span className="flex items-center text-xs text-muted-foreground gap-1">
              <Building className="h-3 w-3" /> Nacional
            </span>
            <span className="flex items-center text-xs text-muted-foreground gap-1">
              <MapPin className="h-3 w-3" /> Municipal
            </span>
          </div>
          <ModeToggle />
          <Button size="sm">Mejorar Plan</Button>
        </div>
      </div>
    </header>
  )
}
