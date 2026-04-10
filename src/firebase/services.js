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
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from './config.js'

const CLOUDINARY_CLOUD_NAME = 'ddzguwswh'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

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

/**
 * Actualiza la URL de imagen de un servicio ya creado (tras subir la imagen).
 * @param {string} serviceId
 * @param {string} imageUrl
 */
export async function updateServiceImageUrl(serviceId, imageUrl) {
  if (!db) throw new Error('Firebase no está configurado')
  await updateDoc(doc(db, 'services', String(serviceId)), { imageUrl })
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

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'voz_esperanza_upload')

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

    if (!res.ok) {
      throw new Error('Error subiendo imagen')
    }

    const data = await res.json()
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
