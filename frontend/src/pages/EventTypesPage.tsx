import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/api/client'
import type { EventType } from '@/api/types'

export function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listEventTypes()
      .then(setEventTypes)
      .catch(() => setError('Failed to load event types'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Book a Meeting</h1>
      <p className="text-muted-foreground mb-8">Select an event type to see available times</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventTypes.map((eventType) => (
          <Card key={eventType.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{eventType.name}</CardTitle>
              <CardDescription>{eventType.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{eventType.durationMinutes} minutes</span>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild className="w-full">
                <Link to={`/book/${eventType.id}`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Availability
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {eventTypes.length === 0 && (
        <p className="text-center text-muted-foreground">No event types available</p>
      )}
    </div>
  )
}