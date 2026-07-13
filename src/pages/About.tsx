import useDocumentMeta from '../hooks/useDocumentMeta'
import useDocumentTitle from '../hooks/useDocumentTitle'
import AaronStorySections from '../components/about/AaronStorySections'

export default function About() {
  useDocumentTitle('About Aaron | Maui Lessons')
  useDocumentMeta({
    title: 'About Aaron | Maui Lessons',
    description:
      'Meet Aaron Grzanich — twenty-two years chasing music, with a patient, no-pressure approach focused on the joy of playing ukulele on Maui.',
    path: '/about',
  })

  return <AaronStorySections />
}
