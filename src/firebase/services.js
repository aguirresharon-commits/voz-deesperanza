import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from './config.js'

/**
 * Colección `services`: name, profession, description, location, phone, imageUrl, createdAt
 */

export async function getServices() {
  if (!db) throw new Error('Firebase no está configurado')
  const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      name: data.name,
      profession: data.profession,
      description: data.description,
      location: data.location,
      phone: data.phone,
      imageUrl: data.imageUrl ?? null,
      createdAt: data.createdAt ?? null,
    }
  })
}

export async function getServiceById(id) {
  if (!db) throw new Error('Firebase no está configurado')
  const docRef = doc(db, 'services', String(id))
  const snap = await getDoc(docRef)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    name: data.name,
    profession: data.profession,
    description: data.description,
    location: data.location,
    phone: data.phone,
    imageUrl: data.imageUrl ?? null,
    createdAt: data.createdAt ?? null,
  }
}

/**
 * @param {object} payload
 * @param {string} payload.name
 * @param {string} payload.profession
 * @param {string} payload.description
 * @param {string} payload.location
 * @param {string} payload.phone - dígitos recomendados (mismo criterio que WhatsApp)
 * @param {string | null} [payload.imageUrl]
 * @returns {Promise<string>} id del documento creado
 */
export async function createService(payload) {
  if (!db) throw new Error('Firebase no está configurado')
  const docRef = await addDoc(collection(db, 'services'), {
    name: payload.name,
    profession: payload.profession,
    description: payload.description,
    location: payload.location,
    phone: payload.phone,
    imageUrl: payload.imageUrl ?? null,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Sube una imagen a Storage y devuelve la URL pública.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadImage(file) {
  if (!storage) throw new Error('Firebase no está configurado')
  const safeName = file.name.replace(/[^\w.-]+/g, '_') || 'imagen'
  const path = `services/${Date.now()}_${safeName}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
