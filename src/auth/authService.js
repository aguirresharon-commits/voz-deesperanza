import { GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth'
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
    await signInWithPopup(auth, googleProvider)
  } catch (err) {
    console.error('[Voz de Esperanza][Auth] Error al iniciar sesión con Google:', err)
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
