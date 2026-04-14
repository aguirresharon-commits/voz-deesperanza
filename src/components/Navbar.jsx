import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isFirebaseConfigured } from '../firebase/config.js'

const drawerText = 'text-[#2C3E50]'
const drawerItemClass =
  `flex w-full items-center gap-3.5 py-3 pl-0.5 pr-2 text-left text-[0.95rem] font-medium leading-snug tracking-tight ${drawerText} transition-colors hover:text-[#2F4F6F] active:bg-black/[0.03]`

const drawerNavActive = 'font-semibold text-[#2F4F6F]'

const drawerPillClass =
  'flex min-h-[3rem] w-full items-center justify-center gap-2.5 rounded-full border border-neutral-300/90 bg-[#f0ede8] px-4 text-[0.9375rem] font-semibold text-[#2C3E50] shadow-sm transition hover:bg-[#e8e4df] active:scale-[0.99]'

function IconPerson({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconWrench({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconHome({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSearch({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconPlus({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function DrawerDivider() {
  return <div className="my-1 h-px w-full bg-neutral-300/70" role="separator" />
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const location = useLocation()
  const firebaseReady = isFirebaseConfigured()
  const { user, loading, loginWithGoogle, logout } = useAuth()

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (user) setLoginError(null)
  }, [user])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  function drawerNavClass({ isActive }) {
    return [drawerItemClass, isActive ? drawerNavActive : ''].filter(Boolean).join(' ')
  }

  const showUserDrawer = firebaseReady && !loading && user
  const displayName = (user?.displayName ?? '').trim() || 'Usuario'
  const emailLine = user?.email ?? ''

  return (
    <header className="sticky top-0 z-30 w-full min-w-0 border-b border-[#e8e4df]/90 bg-[#F7F5F2]">
      <nav
        className="relative flex w-full min-h-[4.25rem] min-w-0 items-center justify-between gap-3 px-3 sm:gap-4 sm:px-4 md:px-5 lg:px-6 xl:px-8"
        aria-label="Principal"
      >
        <NavLink
          to="/"
          className="navbar-brand group min-w-0 shrink text-[#2F4F6F] transition-opacity duration-200 hover:opacity-90"
        >
          <BrandLogo variant="header" />
          <div className="navbar-brand-text">
            <span className="navbar-title font-serif truncate">
              Profesionales <span className="text-[#2F4F6F]/45">×</span> Voz de Esperanza
            </span>
            <span className="navbar-brand-tagline hidden sm:block">Comunidad</span>
          </div>
        </NavLink>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-300/60 bg-[#F7F5F2] text-[#2F4F6F] transition hover:bg-[#ebe7e0]"
          aria-label={drawerOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? (
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

      {drawerOpen ? (
        <div className="fixed inset-0 z-40" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-[#2C3E50]/25"
            aria-label="Cerrar menú"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="absolute right-0 top-0 z-[41] flex h-full w-[min(100%,20rem)] flex-col bg-[#F7F5F2] shadow-[-6px_0_28px_rgba(44,62,80,0.12)]"
            aria-label="Menú lateral"
          >
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2C3E50] transition hover:bg-black/[0.05]"
                aria-label="Cerrar"
                onClick={() => setDrawerOpen(false)}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {showUserDrawer ? (
              <div className="px-6 pb-2 text-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="mx-auto h-20 w-20 rounded-full border border-neutral-200/90 object-cover shadow-sm"
                  />
                ) : (
                  <div
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200/90 bg-[#2F4F6F]/[0.08] font-serif text-2xl font-semibold text-[#2F4F6F] shadow-sm"
                    aria-hidden
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="mt-4 font-serif text-lg font-semibold tracking-tight text-[#2C3E50]">{displayName}</p>
                {emailLine ? (
                  <p className="mt-1.5 font-sans text-sm font-normal text-neutral-500">{emailLine}</p>
                ) : null}
                <DrawerDivider />
              </div>
            ) : null}

            <nav className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 font-sans">
              {showUserDrawer ? (
                <>
                  <NavLink to="/profile" className={drawerNavClass} onClick={() => setDrawerOpen(false)} end>
                    <IconPerson className="shrink-0 text-[#2C3E50]" />
                    Mi perfil
                  </NavLink>
                  <NavLink
                    to="/profile#mis-servicios"
                    className={drawerNavClass}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <IconWrench className="shrink-0 text-[#2C3E50]" />
                    Mis servicios
                  </NavLink>
                  <DrawerDivider />
                </>
              ) : null}

              <NavLink to="/" className={drawerNavClass} onClick={() => setDrawerOpen(false)} end>
                <IconHome className="shrink-0 text-[#2C3E50]" />
                Inicio
              </NavLink>
              <NavLink to="/services" className={drawerNavClass} onClick={() => setDrawerOpen(false)}>
                <IconSearch className="shrink-0 text-[#2C3E50]" />
                Buscar profesionales
              </NavLink>
              <NavLink to="/create" className={drawerNavClass} onClick={() => setDrawerOpen(false)}>
                <IconPlus className="shrink-0 text-[#2C3E50]" />
                Publicar servicio
              </NavLink>

              <DrawerDivider />
            </nav>

            <div className="border-t border-neutral-300/60 px-6 py-5">
              {firebaseReady && !loading && user ? (
                <button
                  type="button"
                  className={drawerPillClass}
                  onClick={() => {
                    setDrawerOpen(false)
                    void logout()
                  }}
                >
                  Cerrar sesión
                </button>
              ) : firebaseReady && !loading ? (
                <button
                  type="button"
                  className={drawerPillClass}
                  onClick={async () => {
                    setLoginError(null)
                    try {
                      await loginWithGoogle()
                      setDrawerOpen(false)
                    } catch (err) {
                      const code =
                        err && typeof err === 'object' && 'code' in err && typeof err.code === 'string'
                          ? err.code
                          : ''
                      if (code) {
                        setLoginError(`No se pudo iniciar sesión (${code}).`)
                      } else {
                        setLoginError('No se pudo iniciar sesión. Intentá de nuevo.')
                      }
                    }
                  }}
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Conectar con Google
                </button>
              ) : null}
              {loginError && !user ? (
                <p className="mt-3 text-center text-sm text-red-600" role="alert">
                  {loginError}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  )
}
