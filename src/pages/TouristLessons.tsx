import VacationCinematicScene from '../components/tourist-lessons/VacationCinematicScene'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function TouristLessons() {
  useDocumentMeta({
    title: 'Ukulele Lessons for Maui Vacations | Kihei & Wailea',
    description:
      'A memorable Maui vacation activity: a private beach ukulele lesson for complete beginners. Meet at Maipoina Beach Park or along the coast through Kihei and Wailea, or Aaron comes to you.',
    path: '/tourist-lessons',
  })

  return <VacationCinematicScene />
}
