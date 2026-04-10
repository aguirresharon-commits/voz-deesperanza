import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isFirebaseConfigured } from '../firebase/config.js'
import { createService, updateServiceImageUrl, uploadImage } from '../firebase/services.js'
import { messageForPublishError } from '../utils/firebaseUserMessage.js'
import { normalizePhoneDigits } from '../services/whatsapp.js'

const PHONE_MIN_DIGITS = 8
const PHONE_MAX_DIGITS = 15
const DESCRIPTION_MAX_LENGTH = 300
const PHONE_ERROR_MESSAGE = 'Ingresá un número válido'
/** Límite al subir a Storage (exportaciones grandes, imágenes de IA, etc.) */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/**
 * Acepta cualquier imagen: MIME `image/*` (incl. PNG/JPEG/WebP/GIF/SVG/HEIC…)
 * y, si el navegador no informa MIME, por extensión típica.
 */
const IMAGE_EXT_FALLBACK =
  /\.(jpe?g|jpe|png|gif|webp|bmp|svg|heic|heif|tif|tiff|avif|ico|jfif|jp2|jpx|psd|xcf)$/i

function isAllowedImageFile(file) {
  const t = (file?.type ?? '').trim().toLowerCase()
  if (t.startsWith('image/')) return true
  const name = file?.name ?? ''
  if (IMAGE_EXT_FALLBACK.test(name)) return true
  if (t === 'application/octet-stream' && IMAGE_EXT_FALLBACK.test(name)) return true
  return false
}

const initialForm = {
  name: '',
  profession: '',
  description: '',
  location: '',
  phone: '',
}

export default function CreateService() {
  const [form, setForm] = useState(initialForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [createdServiceId, setCreatedServiceId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [imageUploadWarning, setImageUploadWarning] = useState(null)
  const [imageUploadPending, setImageUploadPending] = useState(false)
  const imageInputRef = useRef(null)

  const firebaseReady = isFirebaseConfigured()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setSubmitted(false)
    setSubmitError(null)
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Completá tu nombre'
    if (!form.profession.trim()) next.profession = 'Completá la profesión u oficio'

    const descriptionTrimmed = form.description.trim()
    if (descriptionTrimmed.length > DESCRIPTION_MAX_LENGTH) {
      next.description = `La descripción no puede superar ${DESCRIPTION_MAX_LENGTH} caracteres.`
    }

    const digits = normalizePhoneDigits(form.phone)
    if (
      digits.length === 0 ||
      digits.length < PHONE_MIN_DIGITS ||
      digits.length > PHONE_MAX_DIGITS
    ) {
      next.phone = PHONE_ERROR_MESSAGE
    }
    return next
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) {
      setImageFile(null)
      return
    }
    if (!isAllowedImageFile(file)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Elegí un archivo de imagen (cualquier formato habitual: JPG, PNG, GIF, WebP, etc.).',
      }))
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        image: `La imagen debe pesar menos de ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`,
      }))
      e.target.value = ''
      return
    }
    setErrors((prev) => ({ ...prev, image: undefined }))
    setImageFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting || authLoading) return
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (!firebaseReady) {
      setSubmitError(
        'Falta configurar Firebase: copiá .env.example a .env en la raíz del proyecto y completá las variables.',
      )
      return
    }

    if (!user?.uid) {
      setSubmitError(
        'Iniciá sesión con Google (menú superior) para publicar. Así el servicio queda vinculado a tu cuenta, aparece en Mi perfil y en la búsqueda de Servicios.',
      )
      return
    }

    setSubmitError(null)
    setSubmitting(true)
    const fileToUpload = imageFile
    try {
      const phoneDigits = normalizePhoneDigits(form.phone)
      const descriptionTrimmed = form.description.trim()
      const id = await createService({
        name: form.name.trim(),
        profession: form.profession.trim(),
        description: descriptionTrimmed.slice(0, DESCRIPTION_MAX_LENGTH),
        location: form.location.trim(),
        phone: phoneDigits,
        imageUrl: null,
        userId: user?.uid,
      })

      setCreatedServiceId(id)
      setSubmitted(true)
      setForm(initialForm)
      setImageFile(null)
      setImageUploadWarning(null)
      setImageUploadPending(Boolean(fileToUpload))
      if (imageInputRef.current) imageInputRef.current.value = ''
      setSubmitting(false)

      if (fileToUpload) {
        try {
          const imageUrl = await uploadImage(fileToUpload, { timeoutMs: 60_000 })
          await updateServiceImageUrl(id, imageUrl)
        } catch (uploadErr) {
          setImageUploadWarning(messageForPublishError(uploadErr))
        } finally {
          setImageUploadPending(false)
        }
      }
    } catch (err) {
      setSubmitError(messageForPublishError(err))
    } finally {
      setSubmitting(false)
    }
  }

  function handlePublishAnother() {
    setSubmitted(false)
    setCreatedServiceId(null)
    setImageUploadWarning(null)
    setImageUploadPending(false)
  }

  if (submitted && createdServiceId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2F4F6F]/80">
            Listo
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#2F4F6F] md:text-3xl">
            Servicio publicado con éxito
          </h1>
          <p className="mt-4 leading-relaxed text-neutral-600">
            Tu servicio ya está en la base de datos: lo vas a ver en <strong>Mi perfil</strong> y en{' '}
            <strong>Servicios</strong> (búsqueda de la comunidad), ordenado por fecha de publicación.
          </p>
          {imageUploadPending ? (
            <p
              className="mt-6 rounded-2xl border border-[#2F4F6F]/20 bg-[#2F4F6F]/[0.06] px-4 py-4 text-sm leading-relaxed text-[#2F4F6F]"
              role="status"
              aria-live="polite"
            >
              Subiendo imagen… Podés seguir navegando; si falla la subida, te avisamos abajo.
            </p>
          ) : null}
          {imageUploadWarning ? (
            <p
              className="mt-6 rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-4 text-sm leading-relaxed text-amber-950"
              role="status"
            >
              <strong>No se pudo subir la imagen.</strong> {imageUploadWarning} Los datos del servicio
              sí quedaron guardados: deberías verlos en Mi perfil y en Servicios (quizá sin foto).
            </p>
          ) : null}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={`/services/${createdServiceId}`}
              className="inline-flex min-h-[3.375rem] flex-1 items-center justify-center rounded-2xl bg-[#2F4F6F] px-6 text-center text-base font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] hover:shadow-lg sm:min-w-[10rem]"
            >
              Ver publicación
            </Link>
            <Link
              to="/profile"
              className="inline-flex min-h-[3.375rem] flex-1 items-center justify-center rounded-2xl border-2 border-[#2F4F6F] bg-white px-6 text-base font-semibold text-[#2F4F6F] transition duration-200 hover:bg-[#2F4F6F]/5 sm:min-w-[10rem]"
            >
              Ir a mi perfil
            </Link>
            <Link
              to="/services"
              className="inline-flex min-h-[3.375rem] flex-1 items-center justify-center rounded-2xl border border-neutral-300/90 bg-[#F5F2ED] px-6 text-base font-semibold text-[#2F4F6F] transition duration-200 hover:bg-[#ebe7e0] sm:min-w-[10rem]"
            >
              Ver en Servicios
            </Link>
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">
            <button
              type="button"
              onClick={handlePublishAnother}
              className="font-semibold text-[#2F4F6F] underline-offset-4 transition hover:underline"
            >
              Publicar otro servicio
            </button>
          </p>
        </div>
      </main>
    )
  }

  const inputClass =
    'w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-base text-[#2F4F6F] shadow-sm outline-none transition duration-200 placeholder:text-neutral-400 focus:border-[#2F4F6F]/45 focus:ring-2 focus:ring-[#2F4F6F]/18 disabled:opacity-60'
  const labelClass = 'mb-2.5 block text-sm font-semibold tracking-tight text-neutral-800'

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#2F4F6F] md:text-4xl">
        Publicar servicio
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
        Completá los datos para que la comunidad pueda encontrarte. Podés adjuntar cualquier imagen
        (foto, diseño, imagen generada, etc.); es opcional.
      </p>

      {!firebaseReady ? (
        <p className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm leading-relaxed text-amber-950">
          Para guardar en Firebase necesitás un archivo <code className="rounded bg-white/80 px-1">.env</code>{' '}
          (copiá <code className="rounded bg-white/80 px-1">.env.example</code>) con las credenciales
          del proyecto.
        </p>
      ) : null}

      {firebaseReady && !authLoading && !user ? (
        <p className="mt-8 rounded-2xl border border-[#2F4F6F]/20 bg-[#2F4F6F]/[0.06] px-5 py-4 text-sm leading-relaxed text-[#2F4F6F]">
          <strong>Iniciá sesión con Google</strong> (menú superior) antes de publicar. Solo así el
          servicio queda asociado a tu cuenta, aparece en <strong>Mi perfil</strong> y en la búsqueda
          de <strong>Servicios</strong>.
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-10 rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-sm md:p-9"
        noValidate
      >
        {submitError ? (
          <p
            className="mb-6 rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-4 text-sm leading-relaxed text-red-950"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}

        <div className="space-y-8">
          <div>
            <label htmlFor="create-service-name" className={labelClass}>
              Nombre
            </label>
            <input
              id="create-service-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={inputClass}
              disabled={submitting}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="create-service-profession" className={labelClass}>
              Profesión u oficio
            </label>
            <input
              id="create-service-profession"
              type="text"
              autoComplete="organization-title"
              value={form.profession}
              onChange={(e) => updateField('profession', e.target.value)}
              className={inputClass}
              disabled={submitting}
              aria-invalid={errors.profession ? 'true' : 'false'}
            />
            {errors.profession ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.profession}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="create-service-description" className={labelClass}>
              Descripción <span className="font-normal text-neutral-500">(opcional)</span>
            </label>
            <textarea
              id="create-service-description"
              rows={4}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className={`${inputClass} resize-y min-h-[7rem]`}
              disabled={submitting}
              maxLength={DESCRIPTION_MAX_LENGTH}
              aria-invalid={errors.description ? 'true' : 'false'}
            />
            <p className="mt-2 text-sm text-neutral-500">
              Opcional. Hasta {DESCRIPTION_MAX_LENGTH} caracteres.
            </p>
            {errors.description ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.description}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="create-service-location" className={labelClass}>
              Ubicación <span className="font-normal text-neutral-500">(opcional)</span>
            </label>
            <input
              id="create-service-location"
              type="text"
              autoComplete="address-level2"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              className={inputClass}
              placeholder="Barrio, ciudad o zona"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="create-service-phone" className={labelClass}>
              Teléfono (WhatsApp)
            </label>
            <input
              id="create-service-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={inputClass}
              placeholder="Ej: 54 9 11 1234-5678"
              disabled={submitting}
              aria-invalid={errors.phone ? 'true' : 'false'}
            />
            <p className="mt-2 text-sm text-neutral-500">
              Incluí código de país para que el contacto por WhatsApp funcione bien. Se guardan solo
              dígitos.
            </p>
            {errors.phone ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="create-service-image" className={labelClass}>
              Imagen <span className="font-normal text-neutral-500">(opcional)</span>
            </label>
            <input
              id="create-service-image"
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={submitting}
              className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#2F4F6F]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#2F4F6F] hover:file:bg-[#2F4F6F]/15 disabled:opacity-60"
            />
            {errors.image ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.image}
              </p>
            ) : null}
            {imagePreview ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                <img
                  src={imagePreview}
                  alt="Vista previa del servicio"
                  className="max-h-56 w-full object-contain"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12">
          <button
            type="submit"
            disabled={submitting || (firebaseReady && (authLoading || !user))}
            className="inline-flex min-h-[3.375rem] w-full items-center justify-center rounded-2xl bg-[#2F4F6F] px-6 text-base font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
          >
            {submitting
              ? 'Publicando…'
              : firebaseReady && authLoading
                ? 'Comprobando sesión…'
                : firebaseReady && !user
                  ? 'Iniciá sesión para publicar'
                  : 'Publicar servicio'}
          </button>
        </div>
      </form>
      </div>
    </main>
  )
}
