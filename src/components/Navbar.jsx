import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'

const linkClass = ({ isActive }) =>
  [
    'block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 md:inline-block md:px-3 md:py-2 md:text-[0.9375rem]',
    isActive
      ? 'bg-[#2F4F6F]/10 text-[#2F4F6F]'
      : 'text-neutral-600 hover:bg-[#F5F2ED] hover:text-[#2F4F6F]',
  ].join(' ')

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/50 bg-white/95 shadow-[0_1px_0_0_rgba(47,79,111,0.04)] backdrop-blur-md">
      <nav
        className="relative mx-auto flex min-h-[4.25rem] max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Principal"
      >
        <NavLink
          to="/"
          className="group flex min-w-0 shrink items-center gap-3 transition-opacity duration-200 hover:opacity-90"
        >
          <BrandLogo className="h-10 w-auto shrink-0 md:h-11" />
          <span className="min-w-0 text-left leading-tight">
            <span className="block truncate font-serif text-base font-semibold tracking-tight text-[#2F4F6F] md:text-lg">
              Profesionales <span className="text-[#2F4F6F]/45">×</span> Voz de Esperanza
            </span>
            <span className="mt-0.5 hidden text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-400 sm:block">
              Comunidad
            </span>
          </span>
        </NavLink>

        <ul className="hidden items-center gap-1 md:flex md:gap-2 lg:gap-3">
          <li>
            <NavLink to="/" end className={linkClass}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/services" className={linkClass}>
              Servicios
            </NavLink>
          </li>
          <li>
            <NavLink to="/create" className={linkClass}>
              Publicar
            </NavLink>
          </li>
        </ul>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-[#2F4F6F] shadow-sm transition hover:bg-[#F5F2ED] md:hidden"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {menuOpen ? (
        <div className="border-b border-neutral-200/60 bg-white px-4 py-4 shadow-sm md:hidden">
          <ul className="flex flex-col gap-1">
            <li>
              <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={linkClass} onClick={() => setMenuOpen(false)}>
                Servicios
              </NavLink>
            </li>
            <li>
              <NavLink to="/create" className={linkClass} onClick={() => setMenuOpen(false)}>
                Publicar
              </NavLink>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  )
}
