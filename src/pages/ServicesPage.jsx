import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ServiceCard from '../components/ServiceCard.jsx'
import ServiceCardSkeleton from '../components/ui/ServiceCardSkeleton.jsx'
import { mockProfessionals } from '../data/mockProfessionals.js'
import { isFirebaseConfigured } from '../firebase/config.js'
import { getServices } from '../firebase/services.js'
import { messageForListError } from '../utils/firebaseUserMessage.js'

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [item.name, item.profession, item.description, item.location]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  const useCloud = useMemo(() => isFirebaseConfigured(), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadError(null)
      if (useCloud) {
        setLoading(true)
        try {
          const list = await getServices()
          if (!cancelled) setItems(list)
        } catch (err) {
          if (!cancelled) {
            setLoadError(messageForListError(err))
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
      } else {
        setItems(mockProfessionals)
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [useCloud, retryKey])

  const filtered = useMemo(() => items.filter((p) => matchesSearch(p, search)), [items, search])

  const noSearchResults =
    !loading && !loadError && items.length > 0 && filtered.length === 0 && search.trim().length > 0

  const emptyCollection =
    !loading && !loadError && items.length === 0 && search.trim().length === 0

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10 sm:px-6 sm:py-12 md:py-16 lg:px-8 lg:py-20">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#2F4F6F] sm:text-3xl md:text-4xl">
        Servicios
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base md:text-lg">
        Buscá por nombre, profesión, zona o palabras en la descripción. Podés entrar al detalle o
        contactar por WhatsApp desde la tarjeta.
      </p>

      {!useCloud ? (
        <p className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm leading-relaxed text-amber-950">
          Modo demo: no hay variables <code className="rounded bg-white/80 px-1.5 py-0.5">.env</code>{' '}
          de Firebase. Se muestran datos de ejemplo. Creá{' '}
          <code className="rounded bg-white/80 px-1.5 py-0.5">.env</code> según{' '}
          <code className="rounded bg-white/80 px-1.5 py-0.5">.env.example</code> para usar datos
          reales.
        </p>
      ) : null}

      <div className="mt-10 max-w-xl">
        <label htmlFor="services-search" className="mb-2.5 block text-sm font-semibold tracking-tight text-neutral-800">
          Buscar
        </label>
        <input
          id="services-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nombre, oficio, zona…"
          autoComplete="off"
          disabled={loading && useCloud}
          className="w-full min-w-0 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#2F4F6F] shadow-sm outline-none transition duration-200 placeholder:text-neutral-400 focus:border-[#2F4F6F]/45 focus:ring-2 focus:ring-[#2F4F6F]/18 disabled:opacity-60 sm:px-5 sm:py-3.5 sm:text-base"
        />
      </div>

      {loadError ? (
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

      {loading && useCloud ? (
        <div className="mt-12">
          <p className="sr-only">Cargando servicios</p>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <ServiceCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!loading && !loadError && noSearchResults ? (
        <div className="mt-12 rounded-2xl border border-dashed border-neutral-300/90 bg-white/80 px-6 py-14 text-center shadow-sm">
          <p className="text-lg font-medium text-[#2F4F6F]">
            No hay resultados para &quot;{search.trim()}&quot;
          </p>
          <p className="mt-2 text-neutral-600">Probá con otras palabras o limpiá la búsqueda.</p>
          <button
            type="button"
            className="mt-6 text-sm font-semibold text-[#2F4F6F] underline-offset-4 transition hover:underline"
            onClick={() => setSearch('')}
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : null}

      {!loading && !loadError && emptyCollection ? (
        <div className="mt-12 rounded-2xl border border-neutral-200/90 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-lg font-medium text-[#2F4F6F]">No hay servicios publicados todavía</p>
          <p className="mt-3 max-w-md mx-auto text-neutral-600 leading-relaxed">
            Podés ser el primero en compartir el tuyo y ayudar a la comunidad a encontrarte.
          </p>
          <Link
            to="/create"
            className="mt-8 inline-flex min-h-[3rem] min-w-[12rem] items-center justify-center rounded-2xl bg-[#2F4F6F] px-8 text-base font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] hover:shadow-lg"
          >
            Publicar servicio
          </Link>
        </div>
      ) : null}

      {!loading && !loadError && !noSearchResults && !emptyCollection ? (
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <ServiceCard
                serviceId={p.id}
                imageUrl={p.imageUrl}
                name={p.name}
                profession={p.profession}
                description={p.description}
                location={p.location}
                phone={p.phone}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}
