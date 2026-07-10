import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'
import SkillLevelSection from '../components/weekly/SkillLevelSection'

const howItWorksSteps = ['Step 1', 'Step 2', 'Step 3'] as const

export default function WeeklyLessons() {
  useDocumentTitle('Ongoing Lessons | Maui Lessons')

  return (
    <>
      <SkillLevelSection />

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
