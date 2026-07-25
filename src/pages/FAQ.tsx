import useDocumentMeta from '../hooks/useDocumentMeta'
import FaqSections from '../components/faq/FaqSections'

export default function FAQ() {
  useDocumentMeta({
    title: 'Ukulele & Guitar Lesson FAQ | Maui Lessons',
    description:
      'Pricing, lesson locations in Kihei and Wailea, what to expect, and how vacation and ongoing lessons work with Maui ukulele and guitar instructor Aaron Grzanich.',
    path: '/faq',
  })

  return <FaqSections />
}
