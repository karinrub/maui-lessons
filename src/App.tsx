import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SiteLayout from './layout/SiteLayout'
import Home from './pages/Home'

// Home stays eager: it's the landing route and its prerendered HTML would
// otherwise wait on an extra chunk round-trip before becoming interactive.
// Everything else splits per route (SiteLayout owns the Suspense boundary).
const About = lazy(() => import('./pages/About'))
const Book = lazy(() => import('./pages/Book'))
const FAQ = lazy(() => import('./pages/FAQ'))
const TouristLessons = lazy(() => import('./pages/TouristLessons'))
const WeeklyLessons = lazy(() => import('./pages/WeeklyLessons'))

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
