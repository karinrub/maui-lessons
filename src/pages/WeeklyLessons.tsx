import useDocumentMeta from '../hooks/useDocumentMeta'
import useDocumentTitle from '../hooks/useDocumentTitle'
import WeeklyJourneySections from '../components/weekly/WeeklyJourneySections'

export default function WeeklyLessons() {
  useDocumentTitle('Ongoing Lessons | Maui Lessons')
  useDocumentMeta({
    title: 'Ongoing Ukulele & Guitar Lessons on Maui | Maui Lessons',
    description:
      'Private ongoing ukulele and guitar lessons on Maui for adults and younger students. Learn at a patient pace with Aaron, who brings 22 years in music.',
    path: '/weekly-lessons',
  })

  return <WeeklyJourneySections />
}
