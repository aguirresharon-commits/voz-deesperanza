/**
 * Logo principal (PNG en /public/logo.png): paloma con rama de olivo.
 */
export default function BrandLogo({ className = 'h-10 w-auto' }) {
  return (
    <img
      src="/logo.png"
      alt="Voz de Esperanza — paloma con rama de olivo"
      className={`object-contain mix-blend-multiply ${className}`.trim()}
      loading="eager"
      decoding="async"
    />
  )
}
