import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase/config.js'
import { createService, uploadImage } from '../firebase/services.js'
import { normalizePhoneDigits } from '../services/whatsapp.js'
import { messageForPublishError } from '../utils/firebaseUserMessage.js'

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
  const imageInputRef = useRef(null)

  const firebaseReady = isFirebaseConfigured()

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
    if (!form.description.trim()) next.description = 'Agregá una descripción'
    if (!form.location.trim()) next.location = 'Indicá zona o ubicación'
    const digits = normalizePhoneDigits(form.phone)
    if (digits.length < 8) {
      next.phone = 'Incluí un teléfono válido (con código de área o país)'
    }
    return next
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) {
      setImageFile(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Elegí un archivo de imagen' }))
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'La imagen debe pesar menos de 5 MB' }))
      e.target.value = ''
      return
    }
    setErrors((prev) => ({ ...prev, image: undefined }))
    setImageFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (!firebaseReady) {
      setSubmitError(
        'Falta configurar Firebase: copiá .env.example a .env en la raíz del proyecto y completá las variables.',
      )
      return
    }

    setSubmitError(null)
    setSubmitting(true)
    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }
      const phoneDigits = normalizePhoneDigits(form.phone)
      const id = await createService({
        name: form.name.trim(),
        profession: form.profession.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        phone: phoneDigits,
        imageUrl,
      })
      setCreatedServiceId(id)
      setSubmitted(true)
      setForm(initialForm)
      setImageFile(null)
      if (imageInputRef.current) imageInputRef.current.value = ''
    } catch (err) {
      setSubmitError(messageForPublishError(err))
    } finally {
      setSubmitting(false)
    }
  }

  function handlePublishAnother() {
    setSubmitted(false)
    setCreatedServiceId(null)
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
            Ya podés compartir tu perfil con la comunidad o volver al listado cuando quieras.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/services/${createdServiceId}`}
              className="inline-flex min-h-[3.375rem] flex-1 items-center justify-center rounded-2xl bg-[#2F4F6F] px-6 text-center text-base font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] hover:shadow-lg"
            >
              Ver publicación
            </Link>
            <Link
              to="/services"
              className="inline-flex min-h-[3.375rem] flex-1 items-center justify-center rounded-2xl border-2 border-[#2F4F6F] bg-white px-6 text-base font-semibold text-[#2F4F6F] transition duration-200 hover:bg-[#2F4F6F]/5"
            >
              Volver al listado
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
        Completá los datos para que la comunidad pueda encontrarte. La imagen es opcional.
      </p>

      {!firebaseReady ? (
        <p className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm leading-relaxed text-amber-950">
          Para guardar en Firebase necesitás un archivo <code className="rounded bg-white/80 px-1">.env</code>{' '}
          (copiá <code className="rounded bg-white/80 px-1">.env.example</code>) con las credenciales
          del proyecto.
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
              Descripción
            </label>
            <textarea
              id="create-service-description"
              rows={4}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className={`${inputClass} resize-y min-h-[7rem]`}
              disabled={submitting}
              aria-invalid={errors.description ? 'true' : 'false'}
            />
            {errors.description ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.description}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="create-service-location" className={labelClass}>
              Ubicación
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
              aria-invalid={errors.location ? 'true' : 'false'}
            />
            {errors.location ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.location}
              </p>
            ) : null}
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
            disabled={submitting}
            className="inline-flex min-h-[3.375rem] w-full items-center justify-center rounded-2xl bg-[#2F4F6F] px-6 text-base font-semibold text-white shadow-md transition duration-200 hover:bg-[#263f59] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
          >
            {submitting ? 'Publicando…' : 'Publicar servicio'}
          </button>
        </div>
      </form>
      </div>
    </main>
  )
}
