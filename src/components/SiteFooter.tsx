import { Link } from 'react-router-dom'

// Mirrors the home finale's footer content (nav links + copyright) so every
// route ends with the same footer treatment.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Footer navigation">
        <Link to="/tourist-lessons">Vacation Lessons</Link>
        <Link to="/weekly-lessons">Ongoing Lessons</Link>
        <Link to="/about">About</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/book">Book a Lesson</Link>
      </nav>
      <p className="site-footer__copyright">© {new Date().getFullYear()} Maui Lessons</p>
    </footer>
  )
}
