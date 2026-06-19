import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/api/client'
import type { EventType, TimeSlot } from '@/api/types'

interface GroupedSlots {
  date: string;
  slots: TimeSlot[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function isSameDay(d1: string, d2: string): boolean {
  return d1.split('T')[0] === d2.split('T')[0]
}

export function AvailabilityPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  useEffect(() => {
    if (!eventTypeId) return

    Promise.all([
      api.getEventType(eventTypeId).then((res) => {
        if ('code' in res && res.code === 'NOT_FOUND') {
          throw new Error('Event type not found')
        }
        return res as EventType
      }),
      api.getAvailableSlots(eventTypeId),
    ])
      .then(([et, slots]) => {
        setEventType(et)
        const available = slots.filter((s) => s.available)
        const grouped = available.reduce<GroupedSlots[]>((acc, slot) => {
          const existing = acc.find((g) => isSameDay(g.date, slot.startTime))
          if (existing) {
            existing.slots.push(slot)
          } else {
            acc.push({ date: slot.startTime.split('T')[0], slots: [slot] })
          }
          return acc
        }, [])
        setGroupedSlots(grouped)
      })
      .catch(() => setError('Failed to load availability'))
      .finally(() => setLoading(false))
  }, [eventTypeId])

  const handleBook = () => {
    if (!selectedSlot || !eventTypeId) return
    navigate(`/book/${eventTypeId}/confirm`, {
      state: { slot: selectedSlot, eventType },
    })
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>
  if (!eventType) return null

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Event Types
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{eventType.name}</h1>
        <p className="text-muted-foreground">{eventType.description}</p>
      </div>

      {groupedSlots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No available slots in the next 14 days</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedSlots.map((group) => (
            <div key={group.date}>
              <h2 className="text-lg font-semibold mb-4">{formatDate(group.date)}</h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {group.slots.map((slot) => (
                  <Button
                    key={slot.startTime}
                    variant={selectedSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                    onClick={() => setSelectedSlot(slot)}
                    className="justify-center"
                  >
                    {formatTime(slot.startTime)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="font-medium">Selected: {formatDate(selectedSlot.startTime)} at {formatTime(selectedSlot.startTime)}</p>
            </div>
            <Button onClick={handleBook}>Continue to Booking</Button>
          </div>
        </div>
      )}
    </div>
  )
}