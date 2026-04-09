import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo.jsx'

const mockServices = [
  {
    badge: 'Cuidados',
    title: 'Enfermería a domicilio',
    blurb: 'Cuidados básicos y acompañamiento con calidez y responsabilidad.',
  },
  {
    badge: 'Belleza',
    title: 'Peluquería y barbería',
    blurb: 'Cortes y color con turno previo, en un ambiente cercano.',
  },
  {
    badge: 'Hogar',
    title: 'Albañilería y refacciones',
    blurb: 'Trabajos chicos y medianos con presupuesto claro y sin vueltas.',
  },
]

export default function HomePage() {
  return (
    <>
      <section
        data-home-hero="mockup-v1"
        className="relative min-h-[calc(100vh-4.25rem)] overflow-hidden bg-gradient-to-b from-[#FFFCF9] via-[#F7F3EC] to-[#EFE8DD]"
      >
        {/* Fondo: un solo velo suave (minimalista) */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_0%,rgba(255,255,255,0.65),transparent_60%)]"
          aria-hidden
        />

        <div className="relative z-[1] mx-auto flex w-full max-w-lg flex-col items-center px-5 pb-20 pt-12 text-center sm:max-w-2xl sm:px-6 md:max-w-3xl md:pb-24 md:pt-16 lg:max-w-3xl lg:px-8 lg:pb-28 lg:pt-20">
          {/* Logo sobre el fondo (sin caja): integra con el degradado */}
          <div className="flex w-full flex-col items-center">
            <BrandLogo className="h-28 w-auto max-w-[200px] opacity-[0.97] sm:h-32 md:h-36" />

            {/* Marca: misma columna, ritmo fijo respecto al logo */}
            <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#2F4F6F]/60 md:text-[0.7rem]">
              Profesionales <span className="font-normal text-[#2F4F6F]/35">×</span> Voz de Esperanza
            </p>
          </div>

          {/* Bloque tipográfico: anchos alineados, espaciado uniforme */}
          <div className="mt-10 flex w-full max-w-[22rem] flex-col items-center sm:max-w-xl md:max-w-2xl md:mt-12">
            <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-[#2F4F6F] sm:text-3xl md:text-4xl lg:text-[2.65rem] lg:leading-[1.2]">
              Conectando profesionales con la comunidad
            </h1>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-neutral-500 md:mt-6 md:text-base">
              Encontrá servicios de confianza dentro de nuestra comunidad
            </p>
          </div>

          <div className="mt-10 flex w-full max-w-sm flex-col gap-4 sm:mt-12 sm:max-w-none sm:flex-row sm:justify-center sm:gap-5">
            <Link
              to="/services"
              className="inline-flex min-h-[3.25rem] w-full min-w-0 flex-1 items-center justify-center rounded-full bg-[#547295] px-8 text-[0.95rem] font-semibold text-white shadow-[0_12px_36px_-26px_rgba(30,55,80,0.55)] transition duration-200 hover:bg-[#486480] sm:w-auto sm:min-w-[12rem]"
            >
              Buscar profesionales
            </Link>
            <Link
              to="/create"
              className="inline-flex min-h-[3.25rem] w-full min-w-0 flex-1 items-center justify-center rounded-full border border-neutral-300/80 bg-white/60 px-8 text-[0.95rem] font-semibold text-[#2F4F6F] transition duration-200 hover:border-neutral-400/80 hover:bg-white sm:w-auto sm:min-w-[12rem]"
            >
              Publicar servicio
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[#2F4F6F]/10 bg-[#F5F2ED]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto mb-10 h-px w-16 rounded-full bg-[#2F4F6F]/25" aria-hidden />
          <h2 className="text-center font-serif text-2xl font-semibold tracking-tight text-[#2F4F6F] md:text-3xl">
            Algunos servicios
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-neutral-500">
            Ejemplos para visualizar el diseño. Más adelante conectaremos datos reales.
          </p>
          <ul className="mt-12 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {mockServices.map((item) => (
              <li key={item.title}>
                <article className="flex h-full flex-col rounded-3xl border border-neutral-200/70 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <span className="inline-flex w-fit rounded-full bg-[#2F4F6F]/[0.09] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2F4F6F]">
                    {item.badge}
                  </span>
                  <div className="mt-5 h-px w-12 rounded-full bg-[#2F4F6F]/20" aria-hidden />
                  <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-[#2F4F6F]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.blurb}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
