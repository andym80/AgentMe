import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto"

// Función para derivar una clave de 32 bytes a partir de una contraseña
function deriveKey(password: string): Buffer {
  // Usar createHash como alternativa a scryptSync
  return createHash("sha256").update(password).digest()
}

// Función para encriptar texto
export function encrypt(text: string, secretKey: string): string {
  // Crear un IV (Vector de Inicialización) aleatorio
  const iv = randomBytes(16)

  // Derivar una clave de 32 bytes a partir de la clave secreta
  const key = deriveKey(secretKey)

  // Crear un cifrador
  const cipher = createCipheriv("aes-256-cbc", key, iv)

  // Encriptar el texto
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  // Devolver el IV y el texto encriptado como una sola cadena
  return iv.toString("hex") + ":" + encrypted
}

// Función para desencriptar texto
export function decrypt(encryptedText: string, secretKey: string): string {
  // Separar el IV y el texto encriptado
  const parts = encryptedText.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const encrypted = parts[1]

  // Derivar una clave de 32 bytes a partir de la clave secreta
  const key = deriveKey(secretKey)

  // Crear un descifrador
  const decipher = createDecipheriv("aes-256-cbc", key, iv)

  // Desencriptar el texto
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
