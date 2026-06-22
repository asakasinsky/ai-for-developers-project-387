import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Запись на встречу</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Выберите удобное время для вашей встречи
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/book">
              <Calendar className="w-5 h-5 mr-2" />
              Записаться
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}