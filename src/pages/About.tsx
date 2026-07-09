import useDocumentTitle from '../hooks/useDocumentTitle'
import AaronStorySections from '../components/about/AaronStorySections'
import './About.css'

const topBushImage = new URL('../../assets/images/no_bacground_bush_2.png', import.meta.url).href

export default function About() {
  useDocumentTitle('About Aaron | Maui Lessons')

  return (
    <>
      <div className="about-top-bush" aria-hidden="true">
        <img src={topBushImage} alt="" />
      </div>

      <AaronStorySections />
    </>
  )
}
