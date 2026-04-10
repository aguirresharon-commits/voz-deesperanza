import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain,
  )
}

const app = isFirebaseConfigured()
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp()
  : null

/** `null` si faltan variables en `.env` */
export const db = app ? getFirestore(app) : null

/** `null` si faltan variables en `.env` */
export const auth = app ? getAuth(app) : null

if (import.meta.env.DEV) {
  if (app && db && auth) {
    console.info('[Voz de Esperanza][Firebase] Conectado.', {
      projectId: firebaseConfig.projectId,
      firestore: true,
      auth: true,
    })
  } else {
    const missing = []
    if (!firebaseConfig.apiKey) missing.push('VITE_FIREBASE_API_KEY')
    if (!firebaseConfig.projectId) missing.push('VITE_FIREBASE_PROJECT_ID')
    if (!firebaseConfig.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN')
    console.warn(
      '[Voz de Esperanza][Firebase] Sin conexión: faltan variables obligatorias en .env →',
      missing.length ? missing.join(', ') : '(revisá .env.example)',
    )
  }
}
