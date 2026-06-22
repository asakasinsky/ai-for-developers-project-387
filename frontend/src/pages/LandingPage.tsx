import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, Users } from 'lucide-react'

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

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Гибкое расписание</h3>
              <p className="text-sm text-muted-foreground">
                Выбирайте удобное время из доступных слотов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Персональный подход</h3>
              <p className="text-sm text-muted-foreground">
                Встречи 30, 60 или 90 минут
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Простое бронирование</h3>
              <p className="text-sm text-muted-foreground">
                Запишитесь в несколько кликов
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}