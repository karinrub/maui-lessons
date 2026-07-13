import HomeAmbientBackground from '../components/home/HomeAmbientBackground'
import HomeFinale from '../components/home/HomeFinale'
import MeetAaron from '../components/home/MeetAaron'
import OpeningScene from '../components/home/OpeningScene'
import StackedServicesDeck from '../components/home/StackedServicesDeck'
import useDocumentMeta from '../hooks/useDocumentMeta'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useHomeScrollSequence from '../hooks/useHomeScrollSequence'

export default function Home() {
  useDocumentTitle('Home | Maui Lessons')
  useDocumentMeta({
    title: 'Maui Ukulele & Guitar Lessons | Maui Lessons',
    description:
      "Learn your first ukulele song on one of the world's most beautiful beaches — private ukulele and guitar lessons on Maui with Aaron Grzanich.",
    path: '/',
  })
  const scrollSequence = useHomeScrollSequence()

  return (
    <>
      <HomeAmbientBackground />
      <OpeningScene scrollSequence={scrollSequence} />
      <StackedServicesDeck scrollSequence={scrollSequence} />
      <MeetAaron />
      <HomeFinale />
    </>
  )
}
