import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import WhatsAppIcon from '../components/icons/WhatsAppIcon.jsx'
import ServiceDetailSkeleton from '../components/ui/ServiceDetailSkeleton.jsx'
import { getProfessionalById } from '../data/mockProfessionals.js'
import { isFirebaseConfigured } from '../firebase/config.js'
import { getServiceById } from '../firebase/services.js'
import { buildWhatsAppUrl } from '../services/whatsapp.js'
import { messageForDetailError } from '../utils/firebaseUserMessage.js'

const defaultWaText = 'Hola, te contacto desde Voz de Esperanza.'

export default function ServiceDetail() {
  const { serviceId } = useParams()
  const useCloud = isFirebaseConfigured()

  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)

      if (useCloud) {
        try {
          const data = await getServiceById(serviceId)
          if (!cancelled) setService(data)
        } catch (err) {
          if (!cancelled) {
            setLoadError(messageForDetailError(err))
            setService(null)
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
      } else {
        const local = getProfessionalById(serviceId)
        if (!cancelled) {
          setService(local)
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [serviceId, useCloud, retryKey])

  if (loading) {
    return <ServiceDetailSkeleton />
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-16 lg:px-8 lg:py-20">
        <div
          className="rounded-2xl border border-red-200/90 bg-red-50/95 px-6 py-6 text-red-950 shadow-sm"
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
        <Link
          to="/services"
          className="mt-8 inline-flex text-sm font-semibold text-[#2F4F6F] underline-offset-4 transition hover:underline"
        >
          Volver al listado
        </Link>
      </main>
    )
  }

  if (!service) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-16 lg:px-8 lg:py-20">
        <p className="text-lg text-neutral-700">No encontramos este servicio.</p>
        <Link
          to="/services"
          className="mt-6 inline-flex min-h-[2.75rem] items-center justify-center rounded-2xl bg-[#2F4F6F] px-5 text-sm font-semibold text-white transition duration-200 hover:bg-[#263f59]"
        >
          Volver al listado
        </Link>
      </main>
    )
  }

  const waHref = buildWhatsAppUrl(service.phone, defaultWaText)

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20">
      <Link
        to="/services"
        className="inline-flex text-sm font-semibold text-neutral-500 transition duration-200 hover:text-[#2F4F6F]"
      >
        ← Servicios
      </Link>

      <article className="mt-8 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition duration-200 hover:shadow-md">
        <div className="relative aspect-[21/9] w-full bg-neutral-100 sm:aspect-[2/1]">
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={`Foto de ${service.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              Sin imagen
            </div>
          )}
        </div>

        <div className="p-7 md:p-10">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#2F4F6F] md:text-4xl">
            {service.name}
          </h1>
          <span className="mt-4 inline-flex w-fit rounded-full bg-[#2F4F6F]/[0.09] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2F4F6F]">
            {service.profession}
          </span>

          <div className="mt-10 space-y-8 text-neutral-700">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Sobre el servicio
              </h2>
              <p className="mt-3 leading-relaxed text-base">{service.description}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Ubicación
              </h2>
              <p className="mt-3 leading-relaxed">{service.location}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Teléfono
              </h2>
              <p className="mt-3 font-mono text-sm text-neutral-800">{service.phone}</p>
            </div>
          </div>

          <div className="mt-12">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 text-base font-semibold text-white shadow-md shadow-[#25D366]/20 transition duration-200 hover:bg-[#20bd5a] hover:shadow-lg sm:min-h-[3.75rem] sm:text-lg"
            >
              <WhatsAppIcon className="h-7 w-7 shrink-0" />
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </article>
    </main>
  )
}
