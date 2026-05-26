import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookmarksProvider } from './context/BookmarksContext'
import { AppLayout } from './components/AppLayout'
import { GlobalBookmarkModal } from './components/GlobalBookmarkModal'
import { ArchivedPage } from './pages/ArchivedPage'
import { DetailPage } from './pages/DetailPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <BookmarksProvider>
      <BrowserRouter>
        <GlobalBookmarkModal />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="archived" element={<ArchivedPage />} />
            <Route path="bookmark/:id" element={<DetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BookmarksProvider>
  )
}
