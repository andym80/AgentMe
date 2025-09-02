"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseLazyDataOptions<T> {
  initialData?: T
  cacheKey?: string
  cacheDuration?: number // en milisegundos
  retryAttempts?: number
  retryDelay?: number
}

interface LazyDataState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  isStale: boolean
  lastFetched: number | null
}

export function useLazyData<T>(fetchFn: () => Promise<T>, options: UseLazyDataOptions<T> = {}) {
  const {
    initialData = null,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutos por defecto
    retryAttempts = 3,
    retryDelay = 1000,
  } = options

  const [state, setState] = useState<LazyDataState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isStale: false,
    lastFetched: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fetchFnRef = useRef(fetchFn)
  const hasInitialized = useRef(false)

  // Actualizar la referencia de fetchFn sin causar re-renders
  useEffect(() => {
    fetchFnRef.current = fetchFn
  }, [fetchFn])

  // Función para verificar si los datos están en caché y son válidos
  const getCachedData = useCallback((): T | null => {
    if (!cacheKey || typeof window === "undefined") return null

    try {
      const cached = localStorage.getItem(`lazy_data_${cacheKey}`)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()

      if (now - timestamp < cacheDuration) {
        return data
      }
    } catch (error) {
      console.warn("Error reading cached data:", error)
    }

    return null
  }, [cacheKey, cacheDuration])

  // Función para guardar datos en caché
  const setCachedData = useCallback(
    (data: T) => {
      if (!cacheKey || typeof window === "undefined") return

      try {
        const cacheEntry = {
          data,
          timestamp: Date.now(),
        }
        localStorage.setItem(`lazy_data_${cacheKey}`, JSON.stringify(cacheEntry))
      } catch (error) {
        console.warn("Error caching data:", error)
      }
    },
    [cacheKey],
  )

  // Función principal de fetch con reintentos
  const fetchData = useCallback(
    async (attempt = 1): Promise<void> => {
      // Cancelar fetch anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        const data = await fetchFnRef.current()

        // Verificar si la operación fue cancelada
        if (abortControllerRef.current?.signal.aborted) {
          return
        }

        setState((prev) => ({
          ...prev,
          data,
          isLoading: false,
          error: null,
          isStale: false,
          lastFetched: Date.now(),
        }))

        // Guardar en caché
        setCachedData(data)
      } catch (error) {
        // Verificar si la operación fue cancelada
        if (abortControllerRef.current?.signal.aborted) {
          return
        }

        const errorObj = error instanceof Error ? error : new Error(String(error))

        if (attempt < retryAttempts) {
          // Reintentar después de un delay
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(attempt + 1)
          }, retryDelay * attempt)
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorObj,
          }))
        }
      }
    },
    [retryAttempts, retryDelay, setCachedData],
  )

  // Función para refrescar datos
  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Función para invalidar caché
  const invalidateCache = useCallback(() => {
    if (!cacheKey || typeof window === "undefined") return

    try {
      localStorage.removeItem(`lazy_data_${cacheKey}`)
      setState((prev) => ({
        ...prev,
        isStale: true,
      }))
    } catch (error) {
      console.warn("Error invalidating cache:", error)
    }
  }, [cacheKey])

  // Cargar datos iniciales - solo una vez
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Intentar cargar desde caché primero
    const cachedData = getCachedData()
    if (cachedData) {
      setState((prev) => ({
        ...prev,
        data: cachedData,
        lastFetched: Date.now(),
        isStale: false,
      }))
    } else {
      // Si no hay caché, hacer fetch
      fetchData()
    }

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, []) // Dependencias vacías para ejecutar solo una vez

  return {
    ...state,
    refresh,
    invalidateCache,
    isCached: !!getCachedData(),
  }
}
