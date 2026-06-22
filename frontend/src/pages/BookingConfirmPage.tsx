import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/api/client'
import type { EventType, TimeSlot } from '@/api/types'

const durationToEventType: Record<string, string> = {
  '30': 'consultation',
  '60': 'demo',
  '90': 'strategy',
}

const eventTypeNames: Record<string, string> = {
  'consultation': 'Короткая встреча (30 мин)',
  'demo': 'Стандартная встреча (60 мин)',
  'strategy': 'Длительная встреча (90 мин)',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BookingConfirmPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [loading, setLoading] = useState(true)

  const slot = location.state?.slot as TimeSlot | undefined

  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (eventTypeId) {
      api.getEventType(eventTypeId)
        .then((res) => {
          if ('code' in res && res.code === 'NOT_FOUND') {
            setError('Тип встречи не найден')
          } else {
            setEventType(res as EventType)
          }
        })
        .catch(() => setError('Ошибка загрузки'))
        .finally(() => setLoading(false))
    } else if (location.state?.eventType) {
      setEventType(location.state.eventType as EventType)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [eventTypeId, location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slot || !eventType) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await api.createBooking({
        eventTypeId: eventType.id,
        guestName,
        guestEmail,
        startTime: slot.startTime,
      })

      if ('code' in response) {
        if (response.code === 'SLOT_UNAVAILABLE') {
          setError('Это время уже занято. Выберите другое.')
        } else {
          setError('Что-то пошло не так. Попробуйте снова.')
        }
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Ошибка создания записи. Попробуйте снова.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Загрузка...</div>
  if (!slot) return <div className="p-8 text-center">Не выбран слот</div>

  if (success) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">Запись подтверждена!</h2>
            <p className="text-muted-foreground mb-6">
              Ваша встреча запланирована на {formatDate(slot.startTime)} в {formatTime(slot.startTime)}
            </p>
            <Button onClick={() => navigate('/')}>Записаться снова</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Завершить бронирование</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="font-medium">{eventType?.name || eventTypeNames[eventTypeId || '']}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(slot.startTime)} в {formatTime(slot.startTime)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Иван Петров"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="ivan@example.com"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting || !eventType}>
                {submitting ? 'Бронирование...' : 'Подтвердить запись'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}