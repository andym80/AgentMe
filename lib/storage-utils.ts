"use client"

// Verificar si estamos en el cliente
export const isClient = typeof window !== "undefined"

// Función para verificar si localStorage está disponible
export function isLocalStorageAvailable() {
  if (!isClient) return false

  try {
    const testKey = "__test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

// Funciones seguras para localStorage
export const safeStorage = {
  getItem: (key: string): string | null => {
    if (!isLocalStorageAvailable()) return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error al obtener ${key}:`, error)
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!isLocalStorageAvailable()) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error)
      return false
    }
  },

  removeItem: (key: string): boolean => {
    if (!isLocalStorageAvailable()) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error)
      return false
    }
  },

  hasItem: (key: string): boolean => {
    if (!isLocalStorageAvailable()) return false
    try {
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.error(`Error al verificar ${key}:`, error)
      return false
    }
  },
}

// Hook personalizado para localStorage
import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
    if (isLocalStorageAvailable()) {
      const item = localStorage.getItem(key)
      if (item) {
        try {
          setStoredValue(JSON.parse(item))
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error)
        }
      }
    }
  }, [key])

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      if (isLocalStorageAvailable()) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, isReady] as const
}
