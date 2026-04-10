import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isFirebaseConfigured } from '../firebase/config.js'

const navLinkClass = ({ isActive }) =>
  [
    'flex w-full min-h-[2.875rem] items-center justify-start rounded-xl border px-4 py-2.5 text-[0.9375rem] font-semibold tracking-tight transition-all duration-200 md:inline-flex md:w-auto md:min-h-[2.5rem] md:justify-center md:px-3.5 md:py-2 md:text-[0.9rem]',
    isActive
      ? 'border-[#2F4F6F]/45 bg-[#E8EDF3] text-[#2F4F6F] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
      : 'border-neutral-200/95 bg-white/85 text-[#4b5563] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[#2F4F6F]/28 hover:bg-white hover:text-[#2F4F6F] hover:shadow-[0_2px_8px_-2px_rgba(47,79,111,0.12)] active:scale-[0.99]',
  ].join(' ')

const loginButtonClass =
  'flex w-full min-h-[3rem] items-center justify-center gap-2.5 rounded-xl border border-[#3d5a7a]/25 bg-[#547295] px-4 py-2.5 text-[0.9375rem] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(47,79,111,0.45)] transition-all duration-200 hover:border-[#2F4F6F]/40 hover:bg-[#486480] hover:shadow-[0_6px_20px_-6px_rgba(47,79,111,0.5)] active:scale-[0.99] md:inline-flex md:w-auto md:min-h-[2.5rem] md:px-4'

const logoutButtonClass =
  'flex w-full min-h-[2.875rem] items-center justify-center rounded-xl border border-neutral-200/95 bg-white/85 px-4 py-2.5 text-[0.9375rem] font-semibold text-[#4b5563] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-red-200/90 hover:bg-red-50/90 hover:text-red-900 md:inline-flex md:w-auto md:min-h-[2.5rem] md:px-3.5'

const userChipClass =
  'flex max-w-full min-h-[2.875rem] items-center rounded-xl border border-neutral-200/95 bg-[#f3f1ec] px-4 py-2.5 text-[0.9375rem] font-medium text-[#2F4F6F] md:inline-flex md:min-h-[2.5rem] md:max-w-[12rem] md:px-3.5 md:py-2'

function NavbarAuthItems({ loginError, onLogin, onLogout, user, loading, firebaseReady }) {
  if (!firebaseReady || loading) return null

  if (!user) {
    return (
      <li className="max-md:mt-3 max-md:border-t max-md:border-neutral-200/90 max-md:pt-4">
        <div className="flex flex-col items-stretch">
          <button type="button" className={loginButtonClass} onClick={onLogin}>
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
            Iniciar sesión con Google
          </button>
          {loginError ? (
            <p className="mt-2 text-center text-red-600 text-sm md:text-left" role="alert">
              {loginError}
            </p>
          ) : null}
        </div>
      </li>
    )
  }

  return (
    <>
      <li className="min-w-0 max-md:mt-3 max-md:border-t max-md:border-neutral-200/90 max-md:pt-4">
        <span className={[userChipClass, 'truncate'].join(' ')} title={user.displayName}>
          {user.displayName}
        </span>
      </li>
      <li>
        <button type="button" className={logoutButtonClass} onClick={onLogout}>
          Cerrar sesión
        </button>
      </li>
    </>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const location = useLocation()
  const firebaseReady = isFirebaseConfigured()
  const { user, loading, loginWithGoogle, logout } = useAuth()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (user) setLoginError(null)
  }, [user])

  async function handleLogin() {
    setLoginError(null)
    try {
      await loginWithGoogle()
    } catch {
      setLoginError('No se pudo iniciar sesión. Intentá de nuevo.')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e8e4df]/90 bg-[#F5F2ED]">
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

        <ul className="hidden items-center gap-2 md:flex md:gap-2 lg:gap-3">
          <li>
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/services" className={navLinkClass}>
              Servicios
            </NavLink>
          </li>
          <li>
            <NavLink to="/create" className={navLinkClass}>
              Publicar
            </NavLink>
          </li>
          {firebaseReady && !loading && user ? (
            <li>
              <NavLink to="/profile" className={navLinkClass}>
                Mi perfil
              </NavLink>
            </li>
          ) : null}
          <NavbarAuthItems
            firebaseReady={firebaseReady}
            loading={loading}
            loginError={loginError}
            user={user}
            onLogin={handleLogin}
            onLogout={() => {
              void logout()
            }}
          />
        </ul>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-300/60 bg-[#F5F2ED] text-[#2F4F6F] transition hover:bg-[#ebe7e0] md:hidden"
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
        <div className="border-b border-[#e8e4df]/90 bg-[#F5F2ED] px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-2.5">
            <li>
              <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Servicios
              </NavLink>
            </li>
            <li>
              <NavLink to="/create" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Publicar
              </NavLink>
            </li>
            {firebaseReady && !loading && user ? (
              <li>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Mi perfil
                </NavLink>
              </li>
            ) : null}
            <NavbarAuthItems
              firebaseReady={firebaseReady}
              loading={loading}
              loginError={loginError}
              user={user}
              onLogin={handleLogin}
              onLogout={() => {
                void logout()
                setMenuOpen(false)
              }}
            />
          </ul>
        </div>
      ) : null}
    </header>
  )
}
