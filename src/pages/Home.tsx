import HomeAmbientBackground from '../components/home/HomeAmbientBackground'
import OpeningScene from '../components/home/OpeningScene'
import StackedServicesDeck from '../components/home/StackedServicesDeck'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useHomeScrollSequence from '../hooks/useHomeScrollSequence'

export default function Home() {
  useDocumentTitle('Home | Maui Lessons')
  const scrollSequence = useHomeScrollSequence()

  return (
    <>
      <HomeAmbientBackground />
      <OpeningScene scrollSequence={scrollSequence} />
      <StackedServicesDeck scrollSequence={scrollSequence} />
    </>
  )
}
