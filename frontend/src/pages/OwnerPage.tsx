import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/api/client'
import type { Booking } from '@/api/types'

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ru-RU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function OwnerPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listUpcomingBookings()
      .then(setBookings)
      .catch(() => setError('Не удалось загрузить записи'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-center">Загрузка...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Предстоящие записи</h1>
          <p className="text-muted-foreground">Все запланированные встречи</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Нет предстоящих записей</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{booking.eventTypeId}</CardTitle>
                    <CardDescription>
                      Создана {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDateTime(booking.startTime)}</p>
                    <p className="text-sm text-muted-foreground">
                      — {formatDateTime(booking.endTime)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Гость</p>
                    <p className="text-sm text-muted-foreground">{booking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}