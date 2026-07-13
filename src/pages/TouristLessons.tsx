import VacationCinematicScene from '../components/tourist-lessons/VacationCinematicScene'
import useDocumentMeta from '../hooks/useDocumentMeta'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function TouristLessons() {
  useDocumentTitle('Vacation Lessons | Maui Lessons')
  useDocumentMeta({
    title: 'Vacation Ukulele Lessons on Maui | Maui Lessons',
    description:
      'A private ukulele lesson taught by a local musician, made for complete beginners. Lessons meet at Maipoina Beach Park and along the coast through Kihei and Wailea — or Aaron will come to you.',
    path: '/tourist-lessons',
  })

  return <VacationCinematicScene />
}
