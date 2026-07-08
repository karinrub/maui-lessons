import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'
import './About.css'

const gallerySlots = ['Gallery image 1', 'Gallery image 2', 'Gallery image 3'] as const
const topBushImage = new URL('../../assets/images/no_bacground_bush_2.png', import.meta.url).href

export default function About() {
  useDocumentTitle('About Aaron | Maui Lessons')

  return (
    <>
      <div className="about-top-bush" aria-hidden="true">
        <img src={topBushImage} alt="" />
      </div>

      <section className="cp-section">
        <p className="cp-section-label">About</p>
        <div className="cp-two-col cp-two-col--wide-right">
          <div className="ph-block" style={{ height: 400 }}>Portrait</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>[Aaron's name / headline]</h1>
            <div className="ph-lines">
              <div className="ph-line ph-line--long" />
              <div className="ph-line ph-line--long" />
              <div className="ph-line ph-line--med" />
            </div>
          </div>
        </div>
      </section>

      <section className="cp-section">
        <p className="cp-section-label">Teaching Approach</p>
        <h2 className="cp-heading">[Section heading]</h2>
        <div className="cp-two-col">
          <div className="ph-lines">
            <div className="ph-line ph-line--long" />
            <div className="ph-line ph-line--long" />
            <div className="ph-line ph-line--med" />
          </div>
          <div className="ph-lines">
            <div className="ph-line ph-line--long" />
            <div className="ph-line ph-line--med" />
            <div className="ph-line ph-line--short" />
          </div>
        </div>
      </section>

      <section className="cp-section">
        <p className="cp-section-label">Gallery</p>
        <div className="cp-grid cp-grid--3">
          {gallerySlots.map((label) => (
            <div key={label} className="ph-block" style={{ height: 220 }}>
              {label}
            </div>
          ))}
        </div>
      </section>

      <div className="cp-cta-section">
        <h2 className="cp-heading">[Call to action heading]</h2>
        <Link to="/book" className="cp-button">Book a Lesson</Link>
      </div>
    </>
  )
}
