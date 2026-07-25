import useDocumentMeta from '../hooks/useDocumentMeta'
import AaronStorySections from '../components/about/AaronStorySections'

export default function About() {
  useDocumentMeta({
    title: 'Meet Aaron Grzanich | Maui Ukulele & Guitar Teacher',
    description:
      "Meet Aaron Grzanich, a Maui-based ukulele and guitar instructor with 22 years in music. A patient, no-pressure teaching style for tourists and local students alike.",
    path: '/about',
  })

  return <AaronStorySections />
}
