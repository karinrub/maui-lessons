import useDocumentMeta from '../hooks/useDocumentMeta'
import useDocumentTitle from '../hooks/useDocumentTitle'
import FaqSections from '../components/faq/FaqSections'

export default function FAQ() {
  useDocumentTitle('FAQ | Maui Lessons')
  useDocumentMeta({
    title: 'FAQ | Maui Lessons',
    description:
      'Everything you might want to know before picking up an instrument with Aaron — lesson locations, pricing, and what to expect on Maui.',
    path: '/faq',
  })

  return <FaqSections />
}
