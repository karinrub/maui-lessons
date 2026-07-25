import useDocumentMeta from '../hooks/useDocumentMeta'
import WeeklyJourneySections from '../components/weekly/WeeklyJourneySections'

export default function WeeklyLessons() {
  useDocumentMeta({
    title: 'Guitar & Ukulele Teacher in Kihei & Wailea, Maui',
    description:
      'Private, ongoing guitar and ukulele lessons for Maui locals in Kihei and Wailea, from beginners to advanced. Learn at a patient pace with instructor Aaron Grzanich, 22 years in music.',
    path: '/weekly-lessons',
  })

  return <WeeklyJourneySections />
}
