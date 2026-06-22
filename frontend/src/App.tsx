import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { DurationPage } from '@/pages/DurationPage'
import { SchedulePage } from '@/pages/SchedulePage'
import { BookingConfirmPage } from '@/pages/BookingConfirmPage'
import { OwnerPage } from '@/pages/OwnerPage'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isOwner = location.pathname.startsWith('/owner')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <Link to="/" className="font-semibold text-lg">
              Календарь записей
            </Link>
            <div className="flex gap-4">
              <Link
                to="/"
                className={`text-sm ${location.pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                Главная
              </Link>
              <Link
                to="/owner"
                className={`text-sm ${isOwner ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                Панель владельца
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/book" element={<DurationPage />} />
          <Route path="/book/:durationId/schedule" element={<SchedulePage />} />
          <Route path="/book/:eventTypeId/confirm" element={<BookingConfirmPage />} />
          <Route path="/owner" element={<OwnerPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App