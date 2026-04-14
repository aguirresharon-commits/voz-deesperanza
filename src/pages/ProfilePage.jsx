import { deleteDoc, doc } from 'firebase/firestore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { updateUserProfilePhoto } from '../auth/authService.js'
import ServiceCard from '../components/ServiceCard.jsx'
import ServiceCardSkeleton from '../components/ui/ServiceCardSkeleton.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { db, isFirebaseConfigured } from '../firebase/config.js'
import {
  deleteReview,
  getReviewsForUser,
  getServicesByUser,
  getUserProfile,
  updateReview,
  updateUserBio,
} from '../firebase/services.js'
import { messageForListError } from '../utils/firebaseUserMessage.js'
import { withTimeout } from '../utils/withTimeout.js'

const PROFILE_READ_TIMEOUT_MS = 15_000
const PROFILE_WRITE_TIMEOUT_MS = 20_000

function GoldStars() {
  return (
    <div className="flex items-center gap-0.5 text-[#C9A227]" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.267 5.274c.269 1.121-.964 2.002-1.957 1.318L12 18.896l-4.816 2.856c-.993.684-2.226-.197-1.957-1.318l1.267-5.274-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clipRule="evenodd"
          />
        </svg>
      ))}
    </div>
  )
}

function ProfileHeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="mx-auto h-36 w-36 rounded-full bg-neutral-200/90" />
      <div className="mx-auto h-7 w-48 rounded-lg bg-neutral-200/90" />
      <div className="space-y-3">
        <div className="h-6 w-36 rounded bg-neutral-200/85" />
        <div className="h-20 w-full rounded-xl bg-neutral-200/70" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-28 rounded bg-neutral-200/85" />
          <div className="h-px flex-1 bg-neutral-200/80" />
        </div>
        <div className="h-32 w-full rounded-3xl bg-neutral-200/70" />
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
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const avatarInputRef = useRef(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState(null)
  const [avatarLoadError, setAvatarLoadError] = useState(false)
  const [bio, setBio] = useState(null)
  const [bioLoading, setBioLoading] = useState(false)
  const [bioError, setBioError] = useState(null)
  const [bioEditing, setBioEditing] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [bioSaving, setBioSaving] = useState(false)
  const [bioSaveError, setBioSaveError] = useState(null)
  const [bioSaved, setBioSaved] = useState(false)
  const [bioSavedMessage, setBioSavedMessage] = useState('')
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState(null)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [reviewDraftText, setReviewDraftText] = useState('')
  const [reviewDraftRating, setReviewDraftRating] = useState(null)
  const [reviewSavingId, setReviewSavingId] = useState(null)
  const [reviewSaveError, setReviewSaveError] = useState(null)
  const [reviewSavedId, setReviewSavedId] = useState(null)
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState(null)
  const [reviewDeletingId, setReviewDeletingId] = useState(null)
  const [reviewDeleteError, setReviewDeleteError] = useState(null)
  const [reviewDeletedId, setReviewDeletedId] = useState(null)

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

  useEffect(() => {
    if (authLoading) return undefined

    if (!user || !useCloud) {
      setBio(null)
      setBioLoading(false)
      setBioError(null)
      setBioEditing(false)
      setBioDraft('')
      setBioSaving(false)
      setBioSaveError(null)
      setBioSaved(false)
      setBioSavedMessage('')
      return undefined
    }

    let cancelled = false
    async function loadBio() {
      setBioError(null)
      setBioLoading(true)
      try {
        const profile = await withTimeout(
          getUserProfile(user.uid),
          PROFILE_READ_TIMEOUT_MS,
          'La carga de tu presentación tardó demasiado',
        )
        if (cancelled) return
        setBio(profile?.bio ?? null)
      } catch (err) {
        if (!cancelled) setBioError('No se pudo cargar tu presentación.')
      } finally {
        // Aunque se cancele por un re-render, liberamos el loading.
        setBioLoading(false)
      }
    }

    loadBio()
    return () => {
      cancelled = true
      setBioLoading(false)
    }
  }, [user, authLoading, useCloud])

  useEffect(() => {
    if (authLoading) return undefined

    if (!user) {
      setReviews([])
      setReviewsLoading(false)
      setReviewsError(null)
      setEditingReviewId(null)
      setReviewDraftText('')
      setReviewDraftRating(null)
      setReviewSavingId(null)
      setReviewSaveError(null)
      setReviewSavedId(null)
      setConfirmDeleteReviewId(null)
      setReviewDeletingId(null)
      setReviewDeleteError(null)
      setReviewDeletedId(null)
      return undefined
    }

    if (!useCloud) {
      setReviews([
        {
          id: 'demo-review-1',
          targetUserId: user.uid,
          authorId: 'demo-author-2',
          authorName: 'Luciana Soriano',
          rating: 5,
          text: 'Matías fue de gran ayuda, muy amable y profesional. Definitivamente lo recomendaría.',
          createdAt: null,
          updatedAt: null,
        },
      ])
      setReviewsLoading(false)
      setReviewsError(null)
      return undefined
    }

    let cancelled = false
    async function loadReviews() {
      setReviewsError(null)
      setReviewsLoading(true)
      try {
        const list = await withTimeout(
          getReviewsForUser(user.uid),
          PROFILE_READ_TIMEOUT_MS,
          'La carga de reseñas tardó demasiado',
        )
        if (!cancelled) setReviews(list)
      } catch (err) {
        if (!cancelled) setReviewsError('No se pudieron cargar las reseñas.')
      } finally {
        setReviewsLoading(false)
      }
    }

    loadReviews()
    return () => {
      cancelled = true
      setReviewsLoading(false)
    }
  }, [user, authLoading, useCloud])

  const listSkeleton = Boolean(user) && useCloud && loading

  const emptyOwnServices =
    !authLoading && Boolean(user) && useCloud && !loading && !loadError && items.length === 0

  const displayName = (user?.displayName ?? '').trim() || 'Usuario'
  const avatarInitial = displayName.charAt(0).toUpperCase() || '?'
  const hasBio = Boolean((bio ?? '').trim())
  const bioText = (bio ?? '').trim()
  const bioDraftTrimmed = bioDraft.trim()
  const bioDraftLen = bioDraft.length
  const bioDraftLenTrimmed = bioDraftTrimmed.length
  const bioDraftInvalid =
    bioDraftLenTrimmed < 20 || bioDraftLenTrimmed > 500

  async function reloadBio() {
    if (!user || !useCloud) return
    setBioError(null)
    setBioLoading(true)
    try {
      const profile = await withTimeout(
        getUserProfile(user.uid),
        PROFILE_READ_TIMEOUT_MS,
        'La carga de tu presentación tardó demasiado',
      )
      setBio(profile?.bio ?? null)
    } catch (err) {
      setBioError('No se pudo cargar tu presentación.')
    } finally {
      setBioLoading(false)
    }
  }

  async function reloadReviews() {
    if (!user || !useCloud) return
    setReviewsError(null)
    setReviewsLoading(true)
    try {
      const list = await withTimeout(
        getReviewsForUser(user.uid),
        PROFILE_READ_TIMEOUT_MS,
        'La carga de reseñas tardó demasiado',
      )
      setReviews(list)
    } catch (err) {
      setReviewsError('No se pudieron cargar las reseñas.')
    } finally {
      setReviewsLoading(false)
    }
  }

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

  async function handleSaveBio() {
    if (!user || !useCloud) return
    setBioSaveError(null)
    setBioSaved(false)
    setBioSavedMessage('')

    if (bioDraftInvalid) {
      setBioSaveError('La presentación debe tener entre 20 y 500 caracteres.')
      return
    }

    setBioSaving(true)
    try {
      await withTimeout(
        updateUserBio({ userId: user.uid, bio: bioDraftTrimmed }),
        PROFILE_WRITE_TIMEOUT_MS,
        'El guardado tardó demasiado',
      )
      setBio(bioDraftTrimmed)
      setBioEditing(false)
      setBioSaved(true)
      setBioSavedMessage('Biografía actualizada correctamente')
    } catch (err) {
      const isTimeout =
        err && typeof err === 'object' && 'code' in err && err.code === 'deadline-exceeded'
      setBioSaveError(isTimeout ? 'El guardado tardó demasiado. Intentá nuevamente.' : 'No se pudo guardar. Intentá nuevamente.')
    } finally {
      setBioSaving(false)
    }
  }

  async function handleSaveReview(reviewId) {
    if (!reviewId) return
    if (reviewSavingId) return

    const text = (reviewDraftText ?? '').trim()
    const rating = typeof reviewDraftRating === 'number' ? reviewDraftRating : null

    setReviewSaveError(null)
    setReviewSavedId(null)

    if (!text) {
      setReviewSaveError('La reseña no puede estar vacía.')
      return
    }
    if (!rating) {
      setReviewSaveError('Elegí una calificación.')
      return
    }

    setReviewSavingId(reviewId)
    try {
      if (useCloud) {
        await updateReview({ reviewId, text, rating })
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, text, rating, updatedAt: r.updatedAt ?? {} } : r)),
      )
      setEditingReviewId(null)
      setReviewSavedId(reviewId)
    } catch (err) {
      setReviewSaveError('No se pudo guardar la reseña. Intentá nuevamente.')
    } finally {
      setReviewSavingId(null)
    }
  }

  async function handleConfirmDeleteReview(review) {
    if (!review || !user?.uid) return
    if (reviewDeletingId || reviewSavingId) return
    if (review.authorId !== user.uid) return

    setReviewDeleteError(null)
    setReviewDeletedId(null)
    setReviewDeletingId(review.id)
    try {
      if (useCloud) {
        await deleteReview(review.id)
      }
      setReviews((prev) => prev.filter((x) => x.id !== review.id))
      setConfirmDeleteReviewId(null)
      setEditingReviewId((prev) => (prev === review.id ? null : prev))
      setReviewDeletedId(review.id)
    } catch (err) {
      setReviewDeleteError('No se pudo eliminar la reseña. Intentá nuevamente.')
    } finally {
      setReviewDeletingId(null)
    }
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-lg px-4 pb-[max(4rem,env(safe-area-inset-bottom,0px))] pt-2 sm:px-6 md:max-w-5xl md:px-8 md:pb-20 md:pt-4">
      <header className="relative flex items-center justify-center border-b border-neutral-300/60 pb-5 pt-2">
        <Link
          to="/"
          className="absolute left-0 top-1/2 inline-flex min-h-[2.75rem] min-w-[2.75rem] -translate-y-1/2 items-center justify-center rounded-2xl text-[#2C3E50] transition duration-200 hover:bg-black/[0.04]"
          aria-label="Volver al inicio"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="font-serif text-xl font-semibold tracking-tight text-[#2C3E50] sm:text-2xl">
          Mi perfil
        </h1>
      </header>

      {authLoading ? (
        <div className="mt-10 space-y-10">
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
        <div className="mt-10 rounded-[1.75rem] border border-neutral-200/90 bg-white px-6 py-12 text-center shadow-sm">
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
          <section className="mt-8 md:mx-auto md:max-w-lg">
            <div className="flex flex-col items-center text-center">
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
                    setAvatarLoadError(false)
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
                {user.photoURL && !avatarLoadError ? (
                  <img
                    src={user.photoURL}
                    alt={`Foto de perfil de ${displayName}`}
                    className="h-36 w-36 rounded-full border border-neutral-200/80 object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <div
                    className="flex h-36 w-36 items-center justify-center rounded-full border border-neutral-200/80 bg-[#2F4F6F]/[0.08] font-serif text-4xl font-semibold text-[#2F4F6F] shadow-sm"
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

              <p className="mt-6 font-serif text-2xl font-semibold tracking-tight text-[#2C3E50]">
                {displayName}
              </p>
            </div>

            <div className="mt-10 w-full text-left">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-lg font-semibold text-[#2C3E50] sm:text-xl">Presentación</h2>
                {!bioEditing ? (
                  <button
                    type="button"
                    disabled={bioSaving}
                    className="inline-flex min-h-[2.5rem] items-center justify-center rounded-2xl border border-neutral-200/90 bg-white px-4 text-sm font-semibold text-[#2F4F6F] shadow-sm transition duration-200 hover:bg-[#F7F5F2]/80 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => {
                      setBioSaved(false)
                      setBioSavedMessage('')
                      setBioSaveError(null)
                      setBioError(null)
                      setBioDraft(hasBio ? bioText : '')
                      setBioEditing(true)
                    }}
                  >
                    {hasBio ? 'Editar' : 'Agregar presentación'}
                  </button>
                ) : null}
              </div>

              {bioEditing ? (
                <div className="mt-4">
                  <textarea
                    value={bioDraft}
                    onChange={(e) => {
                      setBioSaved(false)
                      setBioSavedMessage('')
                      setBioSaveError(null)
                      setBioDraft(e.target.value)
                    }}
                    rows={5}
                    maxLength={500}
                    disabled={bioSaving}
                    className="w-full resize-none rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-800 shadow-sm outline-none transition focus:border-[#2F4F6F]/35 focus:ring-4 focus:ring-[#2F4F6F]/10 disabled:cursor-wait disabled:bg-neutral-50 sm:text-[0.95rem] md:text-base"
                    aria-label="Editar presentación"
                    placeholder="Agregá una breve presentación sobre vos"
                  />

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-neutral-500">{bioDraftLen} / 500</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={bioSaving}
                        className="inline-flex min-h-[2.5rem] items-center justify-center rounded-2xl border border-neutral-200/90 bg-white px-4 text-sm font-semibold text-neutral-700 transition duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => {
                          setBioEditing(false)
                          setBioSaveError(null)
                          setBioSaved(false)
                          setBioSavedMessage('')
                          setBioDraft(hasBio ? bioText : '')
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={bioSaving || bioDraftInvalid}
                        aria-busy={bioSaving}
                        className="inline-flex min-h-[2.5rem] items-center justify-center rounded-2xl bg-[#2F4F6F] px-4 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={handleSaveBio}
                      >
                        {bioSaving ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                  </div>

                  {bioSaveError ? (
                    <p className="mt-3 text-sm text-red-700" role="alert">
                      {bioSaveError}
                    </p>
                  ) : null}
                </div>
              ) : bioLoading ? (
                <p className="mt-4 text-sm text-neutral-500">Cargando…</p>
              ) : bioError ? (
                <div className="mt-4">
                  <p className="text-sm text-red-700" role="alert">
                    {bioError}
                  </p>
                  <button
                    type="button"
                    disabled={bioLoading}
                    className="mt-3 inline-flex min-h-[2.25rem] items-center justify-center rounded-2xl border border-neutral-200/90 bg-white px-3 text-xs font-semibold text-[#2F4F6F] transition duration-200 hover:bg-[#F7F5F2]/80 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={reloadBio}
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <>
                  {hasBio ? (
                    <p className="mt-4 font-sans text-sm leading-relaxed text-neutral-700 sm:text-[0.95rem] md:text-base">
                      {bioText}
                    </p>
                  ) : (
                    <p className="mt-4 font-sans text-sm leading-relaxed text-neutral-500 sm:text-[0.95rem] md:text-base">
                      Agregá una breve presentación sobre vos
                    </p>
                  )}

                  {bioSaved && bioSavedMessage ? (
                    <p className="mt-3 text-sm text-emerald-700" role="status">
                      {bioSavedMessage}
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-12 w-full">
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 font-serif text-lg font-semibold text-[#2C3E50] sm:text-xl">
                  Reseñas
                </h2>
                <div className="h-px min-w-0 flex-1 bg-neutral-300/80" />
              </div>

              {reviewsLoading ? (
                <p className="mt-6 text-sm text-neutral-500">Cargando…</p>
              ) : reviewsError ? (
                <div className="mt-6">
                  <p className="text-sm text-red-700" role="alert">
                    {reviewsError}
                  </p>
                  <button
                    type="button"
                    disabled={reviewsLoading}
                    className="mt-3 inline-flex min-h-[2.25rem] items-center justify-center rounded-2xl border border-neutral-200/90 bg-white px-3 text-xs font-semibold text-[#2F4F6F] transition duration-200 hover:bg-[#F7F5F2]/80 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={reloadReviews}
                  >
                    Reintentar
                  </button>
                </div>
              ) : reviews.length === 0 ? (
                <p className="mt-6 text-sm text-neutral-500">Este perfil aún no tiene reseñas</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {reviews.map((r) => {
                    const authorName = (r.authorName ?? '').trim() || 'Usuario'
                    const initials = authorName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((x) => x.charAt(0).toUpperCase())
                      .join('')
                      .slice(0, 2)
                    const isAuthor = Boolean(user?.uid) && r.authorId === user.uid
                    const isEditing = editingReviewId === r.id
                    const isSaving = reviewSavingId === r.id
                    const isDeleting = reviewDeletingId === r.id
                    const isBusy = isSaving || Boolean(reviewSavingId) || isDeleting || Boolean(reviewDeletingId)
                    const showConfirmDelete = confirmDeleteReviewId === r.id

                    return (
                      <div
                        key={r.id}
                        className="rounded-[1.75rem] border border-neutral-200/90 bg-white/60 px-5 py-5 shadow-sm"
                      >
                        <div className="flex gap-3">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8e4df] font-sans text-sm font-semibold text-[#2C3E50]"
                            aria-hidden
                          >
                            {initials || '??'}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-sans text-[0.95rem] font-semibold text-[#2C3E50]">
                                  {authorName}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <span className="font-sans text-xs text-neutral-500">
                                    {typeof r.rating === 'number' ? `${r.rating} / 5` : 'Sin calificación'}
                                  </span>
                                </div>
                              </div>

                              {isAuthor ? (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    className="inline-flex min-h-[2.25rem] items-center justify-center rounded-2xl border border-neutral-200/90 bg-white px-3 text-xs font-semibold text-[#2F4F6F] transition duration-200 hover:bg-[#F7F5F2]/80 disabled:cursor-not-allowed disabled:opacity-60"
                                    onClick={() => {
                                      setReviewDeletedId(null)
                                      setReviewDeleteError(null)
                                      setConfirmDeleteReviewId(null)
                                      setReviewSavedId(null)
                                      setReviewSaveError(null)
                                      setEditingReviewId(r.id)
                                      setReviewDraftText(r.text ?? '')
                                      setReviewDraftRating(typeof r.rating === 'number' ? r.rating : null)
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    className="inline-flex min-h-[2.25rem] items-center justify-center rounded-2xl border border-red-200/90 bg-white px-3 text-xs font-semibold text-red-800 transition duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    onClick={() => {
                                      setReviewSavedId(null)
                                      setReviewSaveError(null)
                                      setReviewDeletedId(null)
                                      setReviewDeleteError(null)
                                      setConfirmDeleteReviewId(r.id)
                                    }}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              ) : null}
                            </div>

                            {showConfirmDelete ? (
                              <div
                                className="mt-3 rounded-2xl border border-red-200/80 bg-white px-4 py-3"
                                role="alertdialog"
                                aria-label="Confirmación de eliminación"
                              >
                                <p className="text-sm text-neutral-800">¿Querés eliminar esta reseña?</p>
                                <div className="mt-3 flex flex-wrap justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    className="inline-flex min-h-[2.25rem] items-center justify-center rounded-2xl border border-neutral-200/90 bg-white px-3 text-xs font-semibold text-neutral-700 transition duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    onClick={() => setConfirmDeleteReviewId(null)}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    aria-busy={isDeleting}
                                    className="inline-flex min-h-[2.25rem] items-center justify-center rounded-2xl bg-red-700 px-3 text-xs font-semibold text-white transition duration-200 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                                    onClick={() => handleConfirmDeleteReview(r)}
                                  >
                                    {isDeleting ? 'Eliminando…' : 'Eliminar'}
                                  </button>
                                </div>
                                {reviewDeleteError ? (
                                  <p className="mt-3 text-sm text-red-700" role="alert">
                                    {reviewDeleteError}
                                  </p>
                                ) : null}
                              </div>
                            ) : null}

                            {isEditing ? (
                              <div className="mt-3">
                                <label className="sr-only" htmlFor={`review-text-${r.id}`}>
                                  Editar reseña
                                </label>
                                <textarea
                                  id={`review-text-${r.id}`}
                                  value={reviewDraftText}
                                  onChange={(e) => {
                                    setReviewSaveError(null)
                                    setReviewSavedId(null)
                                    setReviewDraftText(e.target.value)
                                  }}
                                  rows={4}
                                  disabled={isSaving}
                                  className="w-full resize-none rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-800 shadow-sm outline-none transition focus:border-[#2F4F6F]/35 focus:ring-4 focus:ring-[#2F4F6F]/10 disabled:cursor-wait disabled:bg-neutral-50"
                                />

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-neutral-600">Calificación</span>
                                    <select
                                      value={reviewDraftRating ?? ''}
                                      disabled={isSaving}
                                      className="min-h-[2.25rem] rounded-2xl border border-neutral-200/90 bg-white px-3 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-[#2F4F6F]/35 focus:ring-4 focus:ring-[#2F4F6F]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                      onChange={(e) => {
                                        setReviewSaveError(null)
                                        setReviewSavedId(null)
                                        const v = Number(e.target.value)
                                        setReviewDraftRating(Number.isFinite(v) ? v : null)
                                      }}
                                      aria-label="Seleccionar calificación"
                                    >
                                      <option value="" disabled>
                                        Elegí…
                                      </option>
                                      <option value={1}>1</option>
                                      <option value={2}>2</option>
                                      <option value={3}>3</option>
                                      <option value={4}>4</option>
                                      <option value={5}>5</option>
                                    </select>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      className="inline-flex min-h-[2.5rem] items-center justify-center rounded-2xl border border-neutral-200/90 bg-white px-4 text-sm font-semibold text-neutral-700 transition duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                                      onClick={() => {
                                        setEditingReviewId(null)
                                        setReviewSaveError(null)
                                        setReviewSavedId(null)
                                        setReviewDeletedId(null)
                                        setReviewDeleteError(null)
                                        setConfirmDeleteReviewId(null)
                                        setReviewDraftText('')
                                        setReviewDraftRating(null)
                                      }}
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      aria-busy={isSaving}
                                      className="inline-flex min-h-[2.5rem] items-center justify-center rounded-2xl bg-[#2F4F6F] px-4 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] disabled:cursor-not-allowed disabled:opacity-70"
                                      onClick={() => handleSaveReview(r.id)}
                                    >
                                      {isSaving ? 'Guardando…' : 'Guardar'}
                                    </button>
                                  </div>
                                </div>

                                {reviewSaveError ? (
                                  <p className="mt-3 text-sm text-red-700" role="alert">
                                    {reviewSaveError}
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-neutral-700">
                                {r.text}
                              </p>
                            )}

                            {reviewSavedId === r.id ? (
                              <p className="mt-3 text-sm text-emerald-700" role="status">
                                Reseña actualizada
                              </p>
                            ) : null}
                            {reviewDeletedId === r.id ? (
                              <p className="mt-3 text-sm text-emerald-700" role="status">
                                Reseña eliminada
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-6 h-px w-full bg-neutral-300/70" />

              <p className="mt-6 text-center font-sans text-[0.95rem] font-semibold text-[#2C3E50]">
                Ver todas las reseñas &gt;
              </p>
            </div>
          </section>

          {!useCloud ? (
            <p className="mt-10 rounded-[1.75rem] border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm leading-relaxed text-amber-950">
              Modo demo: no hay variables <code className="rounded bg-white/80 px-1.5 py-0.5">.env</code>{' '}
              de Firebase. Configurá el proyecto para ver tus publicaciones reales.
            </p>
          ) : null}

          {loadError ? (
            <div
              className="mt-10 rounded-[1.75rem] border border-red-200/90 bg-red-50/95 px-6 py-6 text-red-950 shadow-sm"
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
              className="mt-6 rounded-[1.75rem] border border-red-200/90 bg-red-50/95 px-6 py-4 text-red-950 shadow-sm"
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

          <section id="mis-servicios" className="mt-16 scroll-mt-24 md:mt-20">
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
              <div className="rounded-[1.75rem] border border-neutral-200/90 bg-white px-6 py-14 text-center shadow-sm">
                <p className="text-lg font-medium text-[#2F4F6F]">Aún no tenés servicios publicados</p>
                <p className="mx-auto mt-3 max-w-md leading-relaxed text-neutral-600">
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
                        className="inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-xl border border-neutral-200/90 bg-[#F7F5F2]/80 px-4 text-sm font-semibold text-[#2F4F6F] transition duration-200 hover:bg-[#F7F5F2]"
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
