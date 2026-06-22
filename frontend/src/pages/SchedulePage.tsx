import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/api/client'
import type { TimeSlot } from '@/api/types'

interface GroupedSlots {
  date: string;
  dateDisplay: string;
  slots: TimeSlot[];
}

const durationToEventType: Record<string, string> = {
  '30': 'consultation',
  '60': 'demo',
  '90': 'strategy',
}

const eventTypeNames: Record<string, string> = {
  '30': 'Короткая встреча (30 мин)',
  '60': 'Стандартная встреча (60 мин)',
  '90': 'Длительная встреча (90 мин)',
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

function isSameDay(d1: string, d2: string): boolean {
  return d1.split('T')[0] === d2.split('T')[0]
}

export function SchedulePage() {
  const { durationId } = useParams<{ durationId: string }>()
  const navigate = useNavigate()
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  useEffect(() => {
    if (!durationId) return

    const eventTypeId = durationToEventType[durationId]
    if (!eventTypeId) {
      setError('Invalid duration')
      setLoading(false)
      return
    }

    api.getAvailableSlots(eventTypeId)
      .then(setSlots)
      .catch(() => setError('Failed to load schedule'))
      .finally(() => setLoading(false))
  }, [durationId])

  const groupedSlots = slots.reduce<GroupedSlots[]>((acc, slot) => {
    const existing = acc.find((g) => isSameDay(g.date, slot.startTime))
    if (existing) {
      existing.slots.push(slot)
    } else {
      acc.push({
        date: slot.startTime.split('T')[0],
        dateDisplay: formatDate(slot.startTime),
        slots: [slot],
      })
    }
    return acc
  }, [])

  const handleContinue = () => {
    if (!selectedSlot || !durationId) return
    const eventTypeId = durationToEventType[durationId]
    navigate(`/book/${eventTypeId}/confirm`, {
      state: { slot: selectedSlot },
    })
  }

  if (loading) return <div className="p-8 text-center">Загрузка...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate('/book')} className="mb-6">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Назад к выбору длительности
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{eventTypeNames[durationId || ''] || 'Расписание'}</CardTitle>
          <p className="text-sm text-muted-foreground">Выберите удобное время</p>
        </CardHeader>
      </Card>

      <div className="flex gap-4 mb-6">
        <Badge variant="success" className="px-3 py-1">
          Доступно
        </Badge>
        <Badge variant="danger" className="px-3 py-1">
          Занято
        </Badge>
      </div>

      {groupedSlots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Нет доступных слотов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedSlots.map((group) => (
            <div key={group.date}>
              <h2 className="text-lg font-semibold mb-4">{group.dateDisplay}</h2>
              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {group.slots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime
                  const isAvailable = slot.available

                  return (
                    <Button
                      key={slot.startTime}
                      variant={isAvailable ? (isSelected ? 'default' : 'outline') : 'secondary'}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`relative ${!isAvailable ? 'opacity-60' : ''}`}
                    >
                      {formatTime(slot.startTime)}
                      {!isAvailable && (
                        <Badge
                          variant="danger"
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center"
                        />
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="font-medium">
                Выбрано: {formatDate(selectedSlot.startTime)} в {formatTime(selectedSlot.startTime)}
              </p>
            </div>
            <Button onClick={handleContinue}>Продолжить</Button>
          </div>
        </div>
      )}
    </div>
  )
}