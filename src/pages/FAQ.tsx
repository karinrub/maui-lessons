import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

type FaqItem = { q: string }
type FaqCategory = { label: string; items: FaqItem[] }

const faqCategories: FaqCategory[] = [
  {
    label: 'Getting Started',
    items: [
      { q: '[Do I need prior experience?]' },
      { q: '[What age groups do you teach?]' },
      { q: '[What should I bring to a lesson?]' },
    ],
  },
  {
    label: 'Location & Logistics',
    items: [
      { q: '[Where do lessons take place?]' },
      { q: '[How do I get there?]' },
      { q: '[Is parking available?]' },
    ],
  },
  {
    label: 'Pricing & Booking',
    items: [
      { q: '[How much does a lesson cost?]' },
      { q: '[What is your cancellation policy?]' },
      { q: '[Can I book for a group or family?]' },
    ],
  },
  {
    label: 'Equipment',
    items: [
      { q: '[Do you provide ukuleles?]' },
      { q: '[Can I bring my own instrument?]' },
    ],
  },
]

export default function FAQ() {
  useDocumentTitle('FAQ | Maui Lessons')

  return (
    <>
      <section className="cp-section">
        <p className="cp-section-label">FAQ</p>
        <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>[Page heading]</h1>
        <div className="ph-lines" style={{ maxWidth: 480 }}>
          <div className="ph-line ph-line--long" />
          <div className="ph-line ph-line--med" />
        </div>
      </section>

      {faqCategories.map((category) => (
        <section key={category.label} className="cp-section">
          <p className="cp-section-label">{category.label}</p>
          {category.items.map((item) => (
            <div key={item.q} className="cp-faq-item">
              <p className="cp-faq-q">{item.q}</p>
              <div className="ph-lines">
                <div className="ph-line ph-line--long" />
                <div className="ph-line ph-line--med" />
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="cp-cta-section">
        <h2 className="cp-heading">[Still have questions? Call to action heading]</h2>
        <Link to="/book" className="cp-button">Book a Lesson</Link>
      </div>
    </>
  )
}
