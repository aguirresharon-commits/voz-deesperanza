/**
 * Rechaza con `code: 'deadline-exceeded'` si la promesa no se resuelve a tiempo.
 * Evita estados de carga indefinidos cuando la red o Firebase no responden.
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} [message]
 * @returns {Promise<T>}
 */
export function withTimeout(promise, ms, message = 'Tiempo de espera agotado') {
  if (ms <= 0 || !Number.isFinite(ms)) return promise
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(Object.assign(new Error(message), { code: 'deadline-exceeded' }))
    }, ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}
