import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, updateProfile } from 'firebase/auth'
import { uploadImage } from '../firebase/services.js'
import { auth } from '../firebase/config.js'

const MAX_PROFILE_PHOTO_BYTES = 10 * 1024 * 1024

const googleProvider = new GoogleAuthProvider()

export async function loginWithGoogle() {
  if (!auth) {
    console.error(
      '[Voz de Esperanza][Auth] Firebase Auth no está disponible: revisá las variables de entorno (VITE_FIREBASE_*).',
    )
    throw new Error('Auth no configurado')
  }
  try {
    // Popup suele ser el flujo más directo. En algunos navegadores aparece un warning de COOP
    // pero el login igualmente funciona. Si el popup está bloqueado, hacemos fallback a redirect.
    await signInWithPopup(auth, googleProvider)
  } catch (err) {
    const code =
      err && typeof err === 'object' && 'code' in err && typeof err.code === 'string'
        ? err.code
        : ''

    // Fallback: si el popup fue bloqueado / interrumpido, usamos redirect.
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      try {
        await signInWithRedirect(auth, googleProvider)
        return
      } catch (redirectErr) {
        console.error('[Voz de Esperanza][Auth] Error al iniciar sesión con Google (redirect):', redirectErr)
        throw redirectErr
      }
    }

    console.error('[Voz de Esperanza][Auth] Error al iniciar sesión con Google (popup):', err)
    throw err
  }
}

export async function logout() {
  if (!auth) {
    console.error('[Voz de Esperanza][Auth] Firebase Auth no está disponible.')
    return
  }
  try {
    await signOut(auth)
  } catch (err) {
    console.error('[Voz de Esperanza][Auth] Error al cerrar sesión:', err)
    throw err
  }
}

/**
 * Sube una imagen y la asigna como foto de perfil en Firebase Auth.
 * @param {File} file
 */
export async function updateUserProfilePhoto(file) {
  if (!auth?.currentUser) {
    throw new Error('No hay sesión')
  }
  if (!file || typeof file.type !== 'string' || !file.type.startsWith('image/')) {
    throw new Error('Elegí un archivo de imagen.')
  }
  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    throw new Error('La imagen debe pesar menos de 10 MB.')
  }
  const url = await uploadImage(file)
  await updateProfile(auth.currentUser, { photoURL: url })
}
