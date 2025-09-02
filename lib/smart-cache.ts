"use client"

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
  key: string
}

export class SmartCache {
  private static instance: SmartCache
  private cache: Map<string, CacheItem<any>>
  private maxSize: number
  private defaultTTL: number // tiempo de vida en milisegundos
  private isClient: boolean

  private constructor(maxSize = 100, defaultTTL = 30 * 60 * 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    this.isClient = typeof window !== "undefined"

    if (this.isClient) {
      this.initFromStorage()
      // Configurar limpieza periódica
      setInterval(() => this.cleanExpired(), 60 * 1000) // Limpiar cada minuto
    }
  }

  public static getInstance(): SmartCache {
    if (!SmartCache.instance) {
      SmartCache.instance = new SmartCache()
    }
    return SmartCache.instance
  }

  private initFromStorage(): void {
    if (!this.isClient) return

    try {
      const storedCache = localStorage.getItem("smart_cache")
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache)

        // Convertir el objeto a Map
        Object.entries(parsedCache).forEach(([key, value]) => {
          const item = value as CacheItem<any>
          // Solo restaurar elementos que no han expirado
          if (item.expiresAt > Date.now()) {
            this.cache.set(key, item)
          }
        })
      }
    } catch (error) {
      console.error("Error al inicializar caché desde localStorage:", error)
      // Si hay error, limpiar el caché
      localStorage.removeItem("smart_cache")
    }
  }

  private saveToStorage(): void {
    if (!this.isClient) return

    try {
      // Convertir Map a objeto para almacenamiento
      const cacheObject: Record<string, CacheItem<any>> = {}
      this.cache.forEach((value, key) => {
        cacheObject[key] = value
      })

      localStorage.setItem("smart_cache", JSON.stringify(cacheObject))
    } catch (error) {
      console.error("Error al guardar caché en localStorage:", error)
    }
  }

  private generateKey(prefix: string, params: any): string {
    // Crear una clave única basada en el prefijo y los parámetros
    const paramsStr = JSON.stringify(params)
    return `${prefix}:${paramsStr}`
  }

  public async get<T>(
    prefix: string,
    params: any,
    fetchFunction: () => Promise<T>,
    ttl: number = this.defaultTTL,
  ): Promise<T> {
    const key = this.generateKey(prefix, params)
    const cachedItem = this.cache.get(key)

    // Si el elemento está en caché y no ha expirado, devolverlo
    if (cachedItem && cachedItem.expiresAt > Date.now()) {
      // Actualizar estadísticas de uso
      this.updateUsageStats(key)
      return cachedItem.data
    }

    // Si no está en caché o ha expirado, obtener datos frescos
    try {
      const data = await fetchFunction()
      this.set(prefix, params, data, ttl)
      return data
    } catch (error) {
      // Si hay un error y tenemos datos en caché (aunque hayan expirado), usarlos como fallback
      if (cachedItem) {
        console.warn("Error al obtener datos frescos, usando caché expirado como fallback:", error)
        return cachedItem.data
      }
      throw error
    }
  }

  public set<T>(prefix: string, params: any, data: T, ttl: number = this.defaultTTL): void {
    const key = this.generateKey(prefix, params)
    const now = Date.now()

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      key,
    })

    // Si el caché excede el tamaño máximo, eliminar los elementos menos usados
    if (this.cache.size > this.maxSize) {
      this.evictLeastUsed()
    }

    // Guardar en localStorage
    if (this.isClient) {
      this.saveToStorage()
    }
  }

  public invalidate(prefix: string, params?: any): void {
    if (params) {
      // Invalidar una entrada específica
      const key = this.generateKey(prefix, params)
      this.cache.delete(key)
    } else {
      // Invalidar todas las entradas con el prefijo dado
      const keysToDelete: string[] = []
      this.cache.forEach((_, key) => {
        if (key.startsWith(`${prefix}:`)) {
          keysToDelete.push(key)
        }
      })

      keysToDelete.forEach((key) => this.cache.delete(key))
    }

    // Actualizar localStorage
    if (this.isClient) {
      this.saveToStorage()
    }
  }

  public clear(): void {
    this.cache.clear()
    if (this.isClient) {
      localStorage.removeItem("smart_cache")
    }
  }

  private cleanExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      if (item.expiresAt < now) {
        keysToDelete.push(key)
      }
    })

    if (keysToDelete.length > 0) {
      keysToDelete.forEach((key) => this.cache.delete(key))
      if (this.isClient) {
        this.saveToStorage()
      }
    }
  }

  private updateUsageStats(key: string): void {
    // Implementación simple: actualizar el timestamp para indicar uso reciente
    const item = this.cache.get(key)
    if (item) {
      item.timestamp = Date.now()
    }
  }

  private evictLeastUsed(): void {
    // Encontrar la entrada menos usada recientemente
    let oldestKey: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    })

    // Eliminar la entrada más antigua
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Métodos para estadísticas y diagnóstico
  public getStats(): {
    size: number
    maxSize: number
    averageAge: number
    oldestItem: number
    newestItem: number
  } {
    const now = Date.now()
    let totalAge = 0
    let oldestTime = now
    let newestTime = 0

    this.cache.forEach((item) => {
      const age = now - item.timestamp
      totalAge += age

      if (item.timestamp < oldestTime) oldestTime = item.timestamp
      if (item.timestamp > newestTime) newestTime = item.timestamp
    })

    const size = this.cache.size
    const averageAge = size > 0 ? totalAge / size : 0

    return {
      size,
      maxSize: this.maxSize,
      averageAge,
      oldestItem: now - oldestTime,
      newestItem: now - newestTime,
    }
  }
}

// Función de ayuda para usar el caché en componentes
export function useSmartCache() {
  return SmartCache.getInstance()
}
