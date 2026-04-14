import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { auth, db } from './config.js'

/** Host US por defecto; cuentas EU/AP deben usar api-eu.cloudinary.com / api-ap.cloudinary.com */
const CLOUDINARY_API_HOST =
  (import.meta.env.VITE_CLOUDINARY_API_HOST && String(import.meta.env.VITE_CLOUDINARY_API_HOST).trim()) ||
  'api.cloudinary.com'
const CLOUDINARY_CLOUD_NAME =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME).trim()) ||
  'ddzguwswh'
const CLOUDINARY_UPLOAD_PRESET =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET && String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET).trim()) ||
  'voz_esperanza_upload'

const CLOUDINARY_UPLOAD_URL = `https://${CLOUDINARY_API_HOST}/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

/**
 * Colección `services`: name, profession, description, location, phone, imageUrl, userId?, createdAt
 */

function mapServiceDoc(docSnap) {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    name: data.name,
    profession: data.profession,
    description: data.description,
    location: data.location,
    phone: data.phone,
    imageUrl: data.imageUrl ?? null,
    userId: data.userId ?? null,
    createdAt: data.createdAt ?? null,
  }
}

export async function getServices() {
  if (!db) throw new Error('Firebase no está configurado')
  const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapServiceDoc)
}

/**
 * @param {number} [max=3]
 */
/**
 * Servicios publicados por un usuario (requiere índice compuesto userId + createdAt en Firestore).
 * @param {string} userId
 */
export async function getServicesByUser(userId) {
  if (!db) throw new Error('Firebase no está configurado')
  const q = query(
    collection(db, 'services'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapServiceDoc)
}

export async function getLatestServices(max = 3) {
  if (!db) throw new Error('Firebase no está configurado')
  const q = query(
    collection(db, 'services'),
    orderBy('createdAt', 'desc'),
    limit(Math.max(1, Math.min(50, max))),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapServiceDoc)
}

export async function getServiceById(id) {
  if (!db) throw new Error('Firebase no está configurado')
  const docRef = doc(db, 'services', String(id))
  const snap = await getDoc(docRef)
  if (!snap.exists()) return null
  return mapServiceDoc(snap)
}

/**
 * @param {object} payload
 * @param {string} payload.name
 * @param {string} payload.profession
 * @param {string} payload.description
 * @param {string} payload.location
 * @param {string} payload.phone - dígitos recomendados (mismo criterio que WhatsApp)
 * @param {string | null} [payload.imageUrl]
 * @param {string} [payload.userId] - uid de Firebase Auth si el usuario está logueado
 * @returns {Promise<string>} id del documento creado
 */
export async function createService(payload) {
  if (!db) throw new Error('Firebase no está configurado')
  const docData = {
    name: payload.name,
    profession: payload.profession,
    description: payload.description,
    location: payload.location,
    phone: payload.phone,
    imageUrl: payload.imageUrl ?? null,
    createdAt: serverTimestamp(),
  }
  const uid = payload.userId ?? auth?.currentUser?.uid ?? null
  if (uid) {
    docData.userId = uid
  }
  const docRef = await addDoc(collection(db, 'services'), docData)
  return docRef.id
}

const DEFAULT_UPLOAD_TIMEOUT_MS = 60_000

/**
 * Sube una imagen a Cloudinary y devuelve la URL HTTPS.
 * @param {File} file
 * @param {{ timeoutMs?: number }} [options] - por defecto 60s; si la subida se cuelga se rechaza.
 * @returns {Promise<string>}
 */
export async function uploadImage(file, options = {}) {
  const timeoutMs =
    typeof options.timeoutMs === 'number' ? options.timeoutMs : DEFAULT_UPLOAD_TIMEOUT_MS

  if (!(file instanceof Blob) || file.size <= 0) {
    throw new Error('Archivo de imagen inválido o vacío')
  }

  const formData = new FormData()
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  const uploadName =
    file instanceof File && file.name && String(file.name).trim()
      ? file.name.trim()
      : 'upload.jpg'
  formData.append('file', file, uploadName)

  const controller = new AbortController()
  const timer =
    timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null

  try {
    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const apiMsg =
        data?.error?.message && typeof data.error.message === 'string'
          ? data.error.message.trim()
          : ''
      throw new Error(apiMsg || `Error subiendo imagen (${res.status})`)
    }

    if (!data?.secure_url) {
      throw new Error('Error subiendo imagen')
    }
    return data.secure_url
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw Object.assign(new Error('Upload timeout'), { code: 'deadline-exceeded' })
    }
    throw err
  } finally {
    if (timer) clearTimeout(timer)
  }
}
