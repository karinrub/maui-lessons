import HomeAmbientBackground from '../components/home/HomeAmbientBackground'
import HomeFinale from '../components/home/HomeFinale'
import MeetAaron from '../components/home/MeetAaron'
import OpeningScene from '../components/home/OpeningScene'
import StackedServicesDeck from '../components/home/StackedServicesDeck'
import useDocumentMeta from '../hooks/useDocumentMeta'
import useHomeScrollSequence from '../hooks/useHomeScrollSequence'

export default function Home() {
  useDocumentMeta({
    title: 'Ukulele & Guitar Lessons in Maui, Hawaii | Maui Lessons',
    description:
      'Private, one-on-one ukulele and guitar lessons on Maui with instructor Aaron Grzanich. Beginner-friendly beach lessons in Kihei and Wailea for visiting tourists and local students.',
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
