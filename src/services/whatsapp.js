/**
 * Deja solo dígitos para usar en wa.me (incluí código de país, ej. 54911…).
 */
export function normalizePhoneDigits(phone) {
  return String(phone ?? '').replace(/\D/g, '')
}

/**
 * URL de WhatsApp Web / app. `phone` debe incluir país en dígitos (sin +).
 */
export function buildWhatsAppUrl(phone, message) {
  const digits = normalizePhoneDigits(phone)
  if (!digits) return '#'

  const base = `https://wa.me/${digits}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
