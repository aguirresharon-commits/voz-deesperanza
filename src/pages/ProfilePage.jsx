import { deleteDoc, doc } from 'firebase/firestore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { updateUserProfilePhoto } from '../auth/authService.js'
import ServiceCard from '../components/ServiceCard.jsx'
import ServiceCardSkeleton from '../components/ui/ServiceCardSkeleton.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { db, isFirebaseConfigured } from '../firebase/config.js'
import { getServicesByUser } from '../firebase/services.js'
import { messageForListError } from '../utils/firebaseUserMessage.js'

function ProfileHeaderSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-200/90 bg-white px-5 py-8 shadow-sm sm:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="h-24 w-24 rounded-full bg-neutral-200/90" />
        <div className="mt-5 h-7 w-48 rounded-lg bg-neutral-200/90" />
        <div className="mt-3 h-4 w-64 max-w-full rounded bg-neutral-200/80" />
        <div className="mt-8 w-full border-y border-neutral-200/80 py-5">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((k) => (
              <div key={k} className="flex flex-col items-center gap-2">
                <div className="h-6 w-10 rounded bg-neutral-200/90" />
                <div className="h-3 w-14 rounded bg-neutral-200/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const useCloud = useMemo(() => isFirebaseConfigured(), [])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const avatarInputRef = useRef(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState(null)

  useEffect(() => {
    if (authLoading) return undefined

    if (!user) {
      setItems([])
      setLoadError(null)
      setLoading(false)
      return undefined
    }

    if (!useCloud) {
      setItems([])
      setLoadError(null)
      setLoading(false)
      return undefined
    }

    let cancelled = false

    async function load() {
      setLoadError(null)
      setLoading(true)
      try {
        const list = await getServicesByUser(user.uid)
        if (!cancelled) setItems(list)
      } catch (err) {
        if (!cancelled) {
          setLoadError(messageForListError(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, useCloud, retryKey])

  const listSkeleton = Boolean(user) && useCloud && loading

  const emptyOwnServices =
    !authLoading &&
    Boolean(user) &&
    useCloud &&
    !loading &&
    !loadError &&
    items.length === 0

  const professionTags = useMemo(() => {
    const set = new Set()
    for (const p of items) {
      const t = (p.profession ?? '').trim()
      if (t) set.add(t)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'))
  }, [items])

  const uniqueLocations = useMemo(() => {
    const set = new Set()
    for (const p of items) {
      const t = (p.location ?? '').trim()
      if (t) set.add(t)
    }
    return set.size
  }, [items])

  const aboutParagraph = useMemo(() => {
    if (professionTags.length > 0) {
      return `Ofrecés servicios relacionados con ${professionTags.join(', ')}. Podés ampliar tu alcance publicando más rubros o actualizando tus datos de contacto.`
    }
    return 'Cuando publiques un servicio, aquí verás un resumen de tu actividad y los rubros en los que participás en la comunidad Voz de Esperanza.'
  }, [professionTags])

  const aboutPreview =
    aboutParagraph.length > 160 && !aboutExpanded
      ? `${aboutParagraph.slice(0, 157).trimEnd()}…`
      : aboutParagraph

  const displayName = (user?.displayName ?? '').trim() || 'Usuario'
  const emailLine = user?.email ?? '—'
  const avatarInitial = displayName.charAt(0).toUpperCase() || '?'

  async function handleDeleteService(serviceId) {
    if (!db || !useCloud) return
    const ok = window.confirm(
      '¿Eliminar este servicio de forma permanente? Esta acción no se puede deshacer.',
    )
    if (!ok) return
    setDeletingId(serviceId)
    setDeleteError(null)
    try {
      await deleteDoc(doc(db, 'services', serviceId))
      setItems((prev) => prev.filter((x) => x.id !== serviceId))
    } catch (err) {
      setDeleteError(messageForListError(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-16">
      {/* Cabecera tipo app móvil: volver + título */}
      <header className="relative flex items-center justify-center pb-6 pt-1">
        <Link
          to="/"
          className="absolute left-0 top-1/2 inline-flex min-h-[2.75rem] min-w-[2.75rem] -translate-y-1/2 items-center justify-center rounded-2xl text-sm font-semibold text-neutral-500 transition duration-200 hover:bg-white/80 hover:text-[#2F4F6F]"
          aria-label="Volver al inicio"
        >
          ←
        </Link>
        <h1 className="font-serif text-xl font-semibold tracking-tight text-[#2F4F6F] sm:text-2xl md:text-3xl">
          Mi perfil
        </h1>
      </header>

      {authLoading ? (
        <div className="space-y-10">
          <p className="sr-only">Cargando</p>
          <ProfileHeaderSkeleton />
          <div>
            <div className="mb-6 h-7 w-40 animate-pulse rounded-lg bg-neutral-200/90" />
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i}>
                  <ServiceCardSkeleton />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : !user ? (
        <div className="rounded-2xl border border-neutral-200/90 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-base leading-relaxed text-neutral-600 md:text-lg">
            Debés iniciar sesión para ver tu perfil
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex min-h-[3rem] min-w-[12rem] items-center justify-center rounded-2xl bg-[#2F4F6F] px-8 text-base font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] hover:shadow-lg"
          >
            Ir al inicio
          </Link>
        </div>
      ) : (
        <>
          {/* Bloque superior: datos de usuario (estructura similar a la referencia) */}
          <section className="rounded-2xl border border-neutral-200/90 bg-white px-5 py-8 shadow-sm sm:px-8">
            <div className="mx-auto flex max-w-lg flex-col items-center text-center">
              <div className="relative">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    setAvatarError(null)
                    setAvatarUploading(true)
                    try {
                      await updateUserProfilePhoto(file)
                    } catch (err) {
                      const msg =
                        err instanceof Error && err.message ? err.message : 'No se pudo actualizar la foto.'
                      setAvatarError(msg)
                    } finally {
                      setAvatarUploading(false)
                    }
                  }}
                />
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={`Foto de perfil de ${displayName}`}
                    className="h-24 w-24 rounded-full border border-neutral-200/80 object-cover shadow-sm sm:h-28 sm:w-28"
                  />
                ) : (
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-full border border-neutral-200/80 bg-[#2F4F6F]/[0.08] text-3xl font-semibold text-[#2F4F6F] shadow-sm sm:h-28 sm:w-28"
                    aria-hidden
                  >
                    {avatarInitial}
                  </div>
                )}
                <button
                  type="button"
                  disabled={avatarUploading}
                  aria-busy={avatarUploading}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/90 bg-[#2F4F6F] text-lg font-bold leading-none text-white shadow-[0_2px_8px_rgba(47,79,111,0.35)] transition duration-200 hover:bg-[#263f59] hover:shadow-[0_4px_12px_rgba(47,79,111,0.4)] active:scale-95 disabled:cursor-wait disabled:opacity-85"
                  title="Cambiar foto de perfil"
                  aria-label="Elegir foto de perfil"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarUploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    '+'
                  )}
                </button>
              </div>
              {avatarError ? (
                <p className="mt-3 max-w-sm text-center text-sm text-red-700" role="alert">
                  {avatarError}
                </p>
              ) : null}

              <p className="mt-5 font-serif text-xl font-semibold tracking-tight text-[#2F4F6F] sm:text-2xl">
                {displayName}
              </p>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base">
                {emailLine}
              </p>

              {/* Estadísticas: servicios, rubros, zonas */}
              <div className="mt-8 w-full border-y border-neutral-200/80 py-5">
                <dl className="grid grid-cols-3 gap-2 divide-x divide-neutral-200/80 text-center">
                  <div className="px-1">
                    <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-neutral-400 sm:text-xs">
                      Servicios
                    </dt>
                    <dd className="mt-1 font-serif text-xl font-semibold tabular-nums text-[#2F4F6F] sm:text-2xl">
                      {listSkeleton ? '—' : items.length}
                    </dd>
                  </div>
                  <div className="px-1">
                    <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-neutral-400 sm:text-xs">
                      Rubros
                    </dt>
                    <dd className="mt-1 font-serif text-xl font-semibold tabular-nums text-[#2F4F6F] sm:text-2xl">
                      {listSkeleton ? '—' : professionTags.length}
                    </dd>
                  </div>
                  <div className="px-1">
                    <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-neutral-400 sm:text-xs">
                      Zonas
                    </dt>
                    <dd className="mt-1 font-serif text-xl font-semibold tabular-nums text-[#2F4F6F] sm:text-2xl">
                      {listSkeleton ? '—' : uniqueLocations}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 w-full text-left">
                <h2 className="font-serif text-lg font-semibold text-neutral-900">Sobre mí</h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                  {aboutPreview}
                  {aboutParagraph.length > 160 ? (
                    <>
                      {' '}
                      <button
                        type="button"
                        className="font-semibold text-[#2F4F6F] underline-offset-4 transition hover:underline"
                        onClick={() => setAboutExpanded((v) => !v)}
                      >
                        {aboutExpanded ? 'Leer menos' : 'Leer más'}
                      </button>
                    </>
                  ) : null}
                </p>
              </div>

              <div className="mt-8 w-full text-left">
                <h2 className="font-serif text-lg font-semibold text-neutral-900">Intereses</h2>
                {professionTags.length === 0 ? (
                  <p className="mt-3 text-sm text-neutral-500">
                    Los rubros de tus servicios aparecerán aquí como etiquetas.
                  </p>
                ) : (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {professionTags.map((tag) => (
                      <li
                        key={tag}
                        className="inline-flex items-center rounded-full border border-neutral-200/90 bg-[#F5F2ED]/80 px-3 py-1.5 text-xs font-medium text-neutral-700 sm:text-sm"
                      >
                        <span className="mr-1.5 text-[#2F4F6F]" aria-hidden>
                          ·
                        </span>
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {!useCloud ? (
            <p className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm leading-relaxed text-amber-950">
              Modo demo: no hay variables <code className="rounded bg-white/80 px-1.5 py-0.5">.env</code>{' '}
              de Firebase. Configurá el proyecto para ver tus publicaciones reales.
            </p>
          ) : null}

          {loadError ? (
            <div
              className="mt-10 rounded-2xl border border-red-200/90 bg-red-50/95 px-6 py-6 text-red-950 shadow-sm"
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

          {deleteError ? (
            <div
              className="mt-6 rounded-2xl border border-red-200/90 bg-red-50/95 px-6 py-4 text-red-950 shadow-sm"
              role="alert"
            >
              <p className="text-sm leading-relaxed">{deleteError}</p>
              <button
                type="button"
                className="mt-3 text-sm font-semibold underline-offset-4 hover:underline"
                onClick={() => setDeleteError(null)}
              >
                Cerrar
              </button>
            </div>
          ) : null}

          {/* Sección principal: servicios */}
          <section className="mt-12">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#2F4F6F] md:text-3xl">
                  Mis servicios
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
                  Gestioná lo que publicaste: ver el detalle o eliminar una publicación.
                </p>
              </div>
              <Link
                to="/create"
                className="inline-flex min-h-[2.875rem] shrink-0 items-center justify-center self-start rounded-2xl border border-[#2F4F6F]/25 bg-white px-5 text-sm font-semibold text-[#2F4F6F] shadow-sm transition duration-200 hover:border-[#2F4F6F]/40 hover:bg-[#2F4F6F]/5"
              >
                Publicar servicio
              </Link>
            </div>

            {listSkeleton ? (
              <div>
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

            {emptyOwnServices ? (
              <div className="rounded-2xl border border-neutral-200/90 bg-white px-6 py-14 text-center shadow-sm">
                <p className="text-lg font-medium text-[#2F4F6F]">Aún no tenés servicios publicados</p>
                <p className="mt-3 mx-auto max-w-md leading-relaxed text-neutral-600">
                  Publicá un servicio para que aparezca aquí.
                </p>
                <Link
                  to="/create"
                  className="mt-8 inline-flex min-h-[3rem] min-w-[12rem] items-center justify-center rounded-2xl bg-[#2F4F6F] px-8 text-base font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] hover:shadow-lg"
                >
                  Publicar servicio
                </Link>
              </div>
            ) : null}

            {!listSkeleton && !loadError && !emptyOwnServices && user && useCloud ? (
              <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <li key={p.id} className="flex flex-col gap-0">
                    <ServiceCard
                      serviceId={p.id}
                      imageUrl={p.imageUrl}
                      name={p.name}
                      profession={p.profession}
                      description={p.description}
                      location={p.location}
                      phone={p.phone}
                    />
                    <div className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3 shadow-sm">
                      <Link
                        to={`/services/${p.id}`}
                        className="inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-xl border border-neutral-200/90 bg-[#F5F2ED]/60 px-4 text-sm font-semibold text-[#2F4F6F] transition duration-200 hover:bg-[#F5F2ED]"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === p.id}
                        className="inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-xl border border-red-200/90 bg-white px-4 text-sm font-semibold text-red-800 transition duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleDeleteService(p.id)}
                      >
                        {deletingId === p.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </>
      )}
    </main>
  )
}
