/** Datos de ejemplo hasta conectar Firestore (Fase 7). Teléfono con código de país en dígitos. */
export const mockProfessionals = [
  {
    id: '1',
    name: 'María González',
    profession: 'Enfermera',
    description:
      'Cuidados básicos a domicilio, control de signos y acompañamiento a familias.',
    location: 'Zona norte',
    phone: '5491112345678',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
  },
  {
    id: '2',
    name: 'Lucas Pérez',
    profession: 'Albañil',
    description: 'Refacciones, revoque y trabajos de albañilería general.',
    location: 'CABA y alrededores',
    phone: '5491123456789',
  },
  {
    id: '3',
    name: 'Ana Ruiz',
    profession: 'Peluquería',
    description: 'Cortes, color y peinados. Turnos con reserva previa.',
    location: 'Barrio centro',
    phone: '5491134567890',
    imageUrl:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
  },
]

export function getProfessionalById(id) {
  return mockProfessionals.find((p) => p.id === String(id))
}
