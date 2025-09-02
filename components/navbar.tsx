"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, User, LogOut, Menu, X, Activity } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { safeStorage, isClient } from "@/lib/storage-utils"

interface NavbarProps {
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

function NavbarComponent({ onMenuToggle, isMenuOpen = false }: NavbarProps) {
  const [user, setUser] = useState<{ name: string; party: string; avatar?: string } | null>(null)
  const [notifications, setNotifications] = useState(3)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Cargar datos del usuario desde localStorage
    if (isClient) {
      const userData = safeStorage.getItem("user_data")
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }

    // Simular estado de conexión
    const checkConnection = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
    }
  }, [])

  const handleLogout = () => {
    if (isClient) {
      safeStorage.removeItem("user_data")
      safeStorage.removeItem("selected_party")
      setUser(null)
      window.location.reload()
    }
  }

  const getPartyColor = (party: string) => {
    const colors: Record<string, string> = {
      "Frente de Todos": "bg-blue-500",
      "Juntos por el Cambio": "bg-yellow-500",
      "La Libertad Avanza": "bg-purple-500",
      "Frente de Izquierda": "bg-red-500",
      "Hacemos por Nuestro País": "bg-green-500",
    }
    return colors[party] || "bg-gray-500"
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Logo y título */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Press Manager AI</h1>
              <p className="text-xs text-muted-foreground">Gestión Política Inteligente</p>
            </div>
          </div>
        </div>

        {/* Estado de conexión */}
        <div className="flex items-center space-x-2 ml-4">
          <div className="flex items-center space-x-1">
            <Activity className={`h-4 w-4 ${isOnline ? "text-green-500" : "text-red-500"}`} />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {isOnline ? "En línea" : "Sin conexión"}
            </span>
          </div>
        </div>

        {/* Espaciador */}
        <div className="flex-1" />

        {/* Controles de la derecha */}
        <div className="flex items-center space-x-2">
          {/* Toggle de tema */}
          <ModeToggle />

          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Menú de usuario */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${getPartyColor(user.party)}`} />
                      <p className="text-xs leading-none text-muted-foreground">{user.party}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}

// Named export
export function Navbar(props: NavbarProps) {
  return <NavbarComponent {...props} />
}

// Default export
export default NavbarComponent
