import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Footer navigation">
        <Link to="/faq">FAQ</Link>
        <Link to="/book">Book</Link>
      </nav>
    </footer>
  )
}
