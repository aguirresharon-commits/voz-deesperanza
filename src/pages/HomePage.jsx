import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo.jsx'
import { isFirebaseConfigured } from '../firebase/config.js'
import { getLatestServices } from '../firebase/services.js'
import { messageForListError } from '../utils/firebaseUserMessage.js'

const HOME_PREVIEW_LIMIT = 3

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

function serviceDocToPreview(service) {
  const desc = (service.description ?? '').trim()
  const blurb =
    desc.length > 160 ? `${desc.slice(0, 157).trimEnd()}…` : desc || 'Sin descripción.'
  return {
    id: service.id,
    badge: (service.profession ?? '').trim() || 'Servicio',
    title: (service.name ?? '').trim() || 'Profesional',
    blurb,
  }
}

export default function HomePage() {
  const useCloud = useMemo(() => isFirebaseConfigured(), [])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(useCloud)
  const [loadError, setLoadError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!useCloud) return undefined

    let cancelled = false

    async function load() {
      setLoadError(null)
      setLoading(true)
      try {
        const list = await getLatestServices(HOME_PREVIEW_LIMIT)
        if (!cancelled) setPreviews(list.map(serviceDocToPreview))
      } catch (err) {
        if (!cancelled) setLoadError(messageForListError(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [useCloud, retryKey])

  const listItems = useCloud
    ? previews
    : mockServices.map((item) => ({
        id: item.title,
        badge: item.badge,
        title: item.title,
        blurb: item.blurb,
      }))

  return (
    <section className="min-h-[calc(100vh-4.25rem)] bg-[#F5F2ED]">
      {/* Hero + bloque inferior: mismo fondo, sin cortes ni otro color */}
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-5 pb-16 pt-12 text-center sm:max-w-2xl sm:px-6 md:max-w-3xl md:pb-20 md:pt-16 lg:max-w-3xl lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex w-full flex-col items-center">
          <BrandLogo variant="hero" />
          <div className="mt-4 flex w-full max-w-[22rem] flex-col items-center sm:mt-5 sm:max-w-xl md:mt-6 md:max-w-2xl">
            <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-[#2F4F6F] sm:text-3xl md:text-4xl lg:text-[2.65rem] lg:leading-[1.2]">
              Conectando profesionales con la comunidad
            </h1>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-neutral-500 md:mt-6 md:text-base">
              Encontrá servicios de confianza dentro de nuestra comunidad
            </p>
          </div>
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-4 sm:mt-12 sm:max-w-none sm:flex-row sm:justify-center sm:gap-5">
          <Link
            to="/services"
            className="inline-flex min-h-[3.25rem] w-full min-w-0 flex-1 items-center justify-center rounded-full bg-[#547295] px-8 text-[0.95rem] font-semibold text-white shadow-[0_12px_36px_-26px_rgba(30,55,80,0.45)] transition duration-200 hover:bg-[#486480] sm:w-auto sm:min-w-[12rem]"
          >
            Buscar profesionales
          </Link>
          <Link
            to="/create"
            className="inline-flex min-h-[3.25rem] w-full min-w-0 flex-1 items-center justify-center rounded-full border border-neutral-300/90 bg-[#F5F2ED] px-8 text-[0.95rem] font-semibold text-[#2F4F6F] transition duration-200 hover:border-neutral-400/90 hover:bg-[#ebe7e0] sm:w-auto sm:min-w-[12rem]"
          >
            Publicar servicio
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-4 sm:px-6 md:pb-24 lg:px-8 lg:pb-28">
        <h2 className="text-center font-serif text-2xl font-semibold tracking-tight text-[#2F4F6F] md:text-3xl">
          Algunos servicios
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-neutral-500">
          {useCloud
            ? 'Los últimos servicios publicados en la comunidad.'
            : 'Ejemplos para visualizar el diseño. Más adelante conectaremos datos reales.'}
        </p>

        {useCloud && loadError ? (
          <div
            className="mt-12 rounded-2xl border border-red-200/90 bg-red-50/95 px-6 py-6 text-red-950 shadow-sm"
            role="alert"
          >
            <p className="text-base leading-relaxed">{loadError}</p>
            <button
              type="button"
              className="mt-5 inline-flex min-h-[2.75rem] items-center justify-center rounded-2xl border border-red-300/80 bg-white px-5 text-sm font-semibold text-red-900 transition duration-200 hover:bg-red-100/80"
              onClick={() => {
                setLoadError(null)
                setRetryKey((k) => k + 1)
              }}
            >
              Intentar nuevamente
            </button>
          </div>
        ) : null}

        {useCloud && loading ? (
          <ul className="mt-12 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {Array.from({ length: HOME_PREVIEW_LIMIT }).map((_, i) => (
              <li key={i}>
                <article
                  className="flex h-full animate-pulse flex-col rounded-3xl border border-neutral-200/70 bg-white p-8 shadow-sm"
                  aria-hidden
                >
                  <span className="inline-flex h-5 w-20 rounded-full bg-neutral-200/90" />
                  <div className="mt-5 h-px w-12 rounded-full bg-[#2F4F6F]/20" aria-hidden />
                  <div className="mt-5 h-7 w-4/5 rounded-lg bg-neutral-200/90" />
                  <div className="mt-3 h-3.5 w-full rounded bg-neutral-200/80" />
                  <div className="mt-2 h-3.5 w-11/12 rounded bg-neutral-200/80" />
                </article>
              </li>
            ))}
          </ul>
        ) : null}

        {useCloud && !loading && !loadError && listItems.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-neutral-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-lg font-medium text-[#2F4F6F]">Aún no hay servicios publicados</p>
          </div>
        ) : null}

        {!useCloud || (!loading && !loadError && listItems.length > 0) ? (
          <ul className="mt-12 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {listItems.map((item) => (
              <li key={item.id}>
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
        ) : null}
      </div>
    </section>
  )
}
