import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

const skillLevels = ['Beginner', 'Intermediate', 'Advanced'] as const
const howItWorksSteps = ['Step 1', 'Step 2', 'Step 3'] as const

export default function WeeklyLessons() {
  useDocumentTitle('Ongoing Lessons | Maui Lessons')

  return (
    <>
      <section className="cp-section">
        <p className="cp-section-label">Ongoing Lessons</p>
        <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>[Page heading]</h1>
        <div className="ph-lines" style={{ maxWidth: 540 }}>
          <div className="ph-line ph-line--long" />
          <div className="ph-line ph-line--med" />
        </div>
      </section>

      <section className="cp-section">
        <p className="cp-section-label">Skill Levels</p>
        <div className="cp-grid cp-grid--3">
          {skillLevels.map((label) => (
            <div key={label} className="cp-card">
              <p className="cp-card-label">{label}</p>
              <div className="ph-lines">
                <div className="ph-line ph-line--long" />
                <div className="ph-line ph-line--med" />
                <div className="ph-line ph-line--short" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cp-section">
        <p className="cp-section-label">How It Works</p>
        <h2 className="cp-heading">[Section heading]</h2>
        <div className="cp-grid cp-grid--3">
          {howItWorksSteps.map((label) => (
            <div key={label} className="cp-card">
              <p className="cp-card-label">{label}</p>
              <div className="ph-lines">
                <div className="ph-line ph-line--long" />
                <div className="ph-line ph-line--med" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cp-section">
        <p className="cp-section-label">Video</p>
        <div className="ph-block" style={{ height: 360 }}>Video placeholder</div>
      </section>

      <section className="cp-section">
        <p className="cp-section-label">Pricing</p>
        <div style={{ maxWidth: 400 }}>
          <div className="cp-card">
            <p className="cp-card-label">Per lesson / monthly</p>
            <div className="ph-lines">
              <div className="ph-line ph-line--short" />
              <div className="ph-line ph-line--med" />
            </div>
          </div>
        </div>
      </section>

      <div className="cp-cta-section">
        <h2 className="cp-heading">[Booking call to action heading]</h2>
        <Link to="/book" className="cp-button">Book a Lesson</Link>
      </div>
    </>
  )
}
