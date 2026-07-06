import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SiteLayout from './layout/SiteLayout'
import About from './pages/About'
import Book from './pages/Book'
import FAQ from './pages/FAQ'
import Home from './pages/Home'
import TouristLessons from './pages/TouristLessons'
import WeeklyLessons from './pages/WeeklyLessons'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="tourist-lessons" element={<TouristLessons />} />
          <Route path="weekly-lessons" element={<WeeklyLessons />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="book" element={<Book />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
