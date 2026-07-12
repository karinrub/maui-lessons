import useDocumentTitle from '../hooks/useDocumentTitle'
import SkillLevelSection from '../components/weekly/SkillLevelSection'
import WeeklyJourneySections from '../components/weekly/WeeklyJourneySections'

export default function WeeklyLessons() {
  useDocumentTitle('Ongoing Lessons | Maui Lessons')

  return (
    <>
      <SkillLevelSection />
      <WeeklyJourneySections />
    </>
  )
}
