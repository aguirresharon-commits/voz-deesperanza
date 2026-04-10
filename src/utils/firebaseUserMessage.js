/**
 * Convierte errores técnicos de Firebase en textos claros para la persona usuaria.
 */
export function messageForListError(err) {
  const code = err && typeof err === 'object' && 'code' in err ? err.code : ''
  if (code === 'permission-denied') {
    return 'No pudimos leer los servicios por permisos en Firebase. Quien administra el proyecto puede revisar las reglas de Firestore.'
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'No pudimos cargar los servicios. Verificá tu conexión e intentá nuevamente.'
  }
  return 'No pudimos cargar los servicios. Intentá nuevamente en unos minutos.'
}

export function messageForDetailError(err) {
  const code = err && typeof err === 'object' && 'code' in err ? err.code : ''
  if (code === 'permission-denied') {
    return 'No pudimos abrir este servicio por permisos en Firebase. Revisá las reglas de Firestore.'
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'No pudimos cargar este servicio. Verificá tu conexión e intentá nuevamente.'
  }
  return 'No pudimos cargar este servicio. Intentá nuevamente en unos minutos.'
}

export function messageForPublishError(err) {
  const code = err && typeof err === 'object' && 'code' in err ? err.code : ''
  if (code === 'permission-denied') {
    return 'No pudimos publicar por permisos en Firebase. Revisá las reglas de Firestore y Storage.'
  }
  if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
    return 'No pudimos subir la imagen por permisos en Storage. Revisá las reglas de Firebase Storage.'
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'La publicación tardó demasiado. Verificá tu conexión e intentá nuevamente.'
  }
  return 'Hubo un problema al publicar. Intentá nuevamente.'
}
