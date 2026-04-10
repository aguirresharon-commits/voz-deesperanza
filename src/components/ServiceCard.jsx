import { Link } from 'react-router-dom'
import WhatsAppIcon from './icons/WhatsAppIcon.jsx'
import { buildWhatsAppUrl } from '../services/whatsapp.js'

const defaultWaText = 'Hola, te contacto desde Voz de Esperanza.'

export default function ServiceCard({
  serviceId,
  imageUrl,
  name,
  profession,
  description,
  location,
  phone,
  whatsappMessage = defaultWaText,
}) {
  const waHref = buildWhatsAppUrl(phone, whatsappMessage)
  const waLinkInvalid = waHref === '#'

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-48 w-full shrink-0 bg-gradient-to-b from-neutral-100 to-neutral-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Foto de ${name}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-sm text-neutral-400"
            aria-hidden
          >
            Sin imagen
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col border-t border-[#2F4F6F]/10 px-8 pb-8 pt-7">
        <span className="inline-flex w-fit rounded-full bg-[#2F4F6F]/[0.09] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#2F4F6F]">
          {profession}
        </span>

        <h2 className="mt-5 font-serif text-xl font-semibold leading-snug tracking-tight text-[#2F4F6F]">
          {name}
        </h2>

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-neutral-600">{description}</p>

        <div className="mt-6 space-y-3 text-sm">
          <p className="text-neutral-500">
            <span className="font-medium text-neutral-700">Ubicación</span>
            <span className="text-neutral-400"> · </span>
            {location}
          </p>
          {serviceId ? (
            <Link
              to={`/services/${serviceId}`}
              className="inline-block font-semibold text-[#2F4F6F] underline-offset-4 transition duration-200 hover:underline"
            >
              Ver detalle
            </Link>
          ) : null}
        </div>

        <div className="mt-8 flex flex-1 flex-col justify-end">
          <a
            href={waHref}
            target={waLinkInvalid ? undefined : '_blank'}
            rel={waLinkInvalid ? undefined : 'noopener noreferrer'}
            onClick={waLinkInvalid ? (e) => e.preventDefault() : undefined}
            className="inline-flex min-h-[3.125rem] w-full items-center justify-center gap-2 rounded-2xl border border-[#b8e8cc] bg-white px-4 text-sm font-semibold text-neutral-800 shadow-sm transition duration-200 hover:border-[#9ddbb8] hover:bg-[#f7fdf9]"
          >
            <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25D366]" />
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}
