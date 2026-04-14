/**
 * Paloma lineal (#4F6D8A) — PNG transparente en /assets/logo-paloma.png
 */
export default function BrandLogo({ variant = 'header', className = '' }) {
  const variantClass = variant === 'hero' ? 'logo-hero' : 'logo-header'
  return (
    <img
      src="/assets/logo-paloma.png"
      alt={variant === 'hero' ? 'Paloma de la paz — Voz de Esperanza' : ''}
      className={`${variantClass} ${className}`.trim()}
      loading="eager"
      decoding="async"
      aria-hidden={variant === 'header' ? true : undefined}
    />
  )
}
