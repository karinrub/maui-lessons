import useDocumentMeta from '../hooks/useDocumentMeta'
import useDocumentTitle from '../hooks/useDocumentTitle'
import SkillLevelSection from '../components/weekly/SkillLevelSection'
import WeeklyJourneySections from '../components/weekly/WeeklyJourneySections'

export default function WeeklyLessons() {
  useDocumentTitle('Ongoing Lessons | Maui Lessons')
  useDocumentMeta({
    title: 'Ongoing Ukulele & Guitar Lessons on Maui | Maui Lessons',
    description:
      'Aaron has spent over twenty years teaching music, and the ukulele has been his focus for the last eight. Steady, private ongoing lessons on Maui for beginner, intermediate, and advanced students.',
    path: '/weekly-lessons',
  })

  return (
    <>
      <SkillLevelSection />
      <WeeklyJourneySections />
    </>
  )
}
