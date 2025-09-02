"\"use client"

// Función para encriptar texto
export function encrypt(text: string, secretKey: string): string {
  try {
    // Implementación simple de encriptación para demo
    // En producción, usar una biblioteca de encriptación más robusta
    let result = ""
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i)
      const keyCharCode = secretKey.charCodeAt(i % secretKey.length)
      result += String.fromCharCode(charCode ^ keyCharCode)
    }
    return btoa(result) // Codificar en Base64 para mejor manejo de caracteres
  } catch (error) {
    console.error("Error en la encriptación:", error)
    return "" // En caso de error, devolver una cadena vacía
  }
}

// Función para desencriptar texto
export function decrypt(encryptedText: string, secretKey: string): string {
  try {
    // Implementación simple de desencriptación para demo
    const decodedText = atob(encryptedText) // Decodificar desde Base64
    let result = ""
    for (let i = 0; i < decodedText.length; i++) {
      const charCode = decodedText.charCodeAt(i)
      const keyCharCode = secretKey.charCodeAt(i % secretKey.length)
      result += String.fromCharCode(charCode ^ keyCharCode)
    }
    return result
  } catch (error) {
    console.error("Error en la desencriptación:", error)
    return "" // En caso de error, devolver una cadena vacía
  }
}

export function getEncryptedItem(key: string): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Error al obtener ${key} de localStorage:`, error)
    return null
  }
}
