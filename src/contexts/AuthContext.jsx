import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth'
import * as authService from '../auth/authService.js'
import { auth } from '../firebase/config.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return undefined
    }

    // Completa el flujo de signInWithRedirect al volver de Google.
    // Si falla (p.ej. auth/unauthorized-domain), lo dejamos en consola para debugging.
    getRedirectResult(auth).catch((err) => {
      console.error('[Voz de Esperanza][Auth] Redirect result error:', err)
    })

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setUser(null)
      } else {
        const rawName = (fbUser.displayName ?? '').trim()
        setUser({
          uid: fbUser.uid,
          displayName: rawName || 'Usuario',
          email: fbUser.email ?? '',
          photoURL: fbUser.photoURL ?? null,
        })
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithGoogle = useCallback(async () => {
    await authService.loginWithGoogle()
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      logout,
    }),
    [user, loading, loginWithGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
