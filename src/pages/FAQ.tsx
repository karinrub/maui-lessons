import useDocumentTitle from '../hooks/useDocumentTitle'
import FaqSections from '../components/faq/FaqSections'

export default function FAQ() {
  useDocumentTitle('FAQ | Maui Lessons')

  return <FaqSections />
}
