import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

const durationToSlotsCount: Record<string, number> = {
  '30': 1,
  '60': 2,
  '90': 3,
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
    timeZone: 'UTC',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
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
  const [hoveredInfo, setHoveredInfo] = useState<{ groupIdx: number; startSlotIdx: number } | null>(null)

  const neededSlots = durationId ? durationToSlotsCount[durationId] : 1

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

  const isSlotInRange = (groupIdx: number, slotIdx: number): boolean => {
    if (!hoveredInfo) return false
    if (hoveredInfo.groupIdx !== groupIdx) return false
    return slotIdx >= hoveredInfo.startSlotIdx && slotIdx < hoveredInfo.startSlotIdx + neededSlots
  }

  const getSelectedSlotPosition = (): { groupIdx: number; slotIdx: number } | null => {
    if (!selectedSlot) return null
    for (let gi = 0; gi < groupedSlots.length; gi++) {
      const si = groupedSlots[gi].slots.findIndex(s => s.startTime === selectedSlot.startTime)
      if (si !== -1) return { groupIdx: gi, slotIdx: si }
    }
    return null
  }

  const isSlotInSelectedRange = (groupIdx: number, slotIdx: number): boolean => {
    const pos = getSelectedSlotPosition()
    if (!pos) return false
    if (pos.groupIdx !== groupIdx) return false
    return slotIdx >= pos.slotIdx && slotIdx < pos.slotIdx + neededSlots
  }

  const isSelectedRangeAvailable = (groupIdx: number): boolean => {
    const pos = getSelectedSlotPosition()
    if (!pos || pos.groupIdx !== groupIdx) return true
    const group = groupedSlots[groupIdx]
    for (let i = pos.slotIdx; i < Math.min(pos.slotIdx + neededSlots, group.slots.length); i++) {
      if (!group.slots[i].available) return false
    }
    return true
  }

  const isRangeValidForSlot = (groupIdx: number, slotIdx: number): boolean => {
    const group = groupedSlots[groupIdx]
    // Check if there are enough slots remaining in the day
    if (slotIdx + neededSlots > group.slots.length) return false
    for (let i = slotIdx; i < slotIdx + neededSlots; i++) {
      if (!group.slots[i].available) return false
    }
    return true
  }

  const getRangeStatus = (groupIdx: number): 'green' | 'red' | null => {
    if (!hoveredInfo || hoveredInfo.groupIdx !== groupIdx) return null

    const group = groupedSlots[groupIdx]
    // Not enough slots remaining in the day
    if (hoveredInfo.startSlotIdx + neededSlots > group.slots.length) return 'red'
    for (let i = hoveredInfo.startSlotIdx; i < hoveredInfo.startSlotIdx + neededSlots; i++) {
      if (!group.slots[i].available) {
        return 'red'
      }
    }
    return 'green'
  }

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
          <p className="text-sm text-muted-foreground">
            Наведите на слот чтобы увидеть {neededSlots} следующих{neededSlots > 1 ? ' слота' : ''}
          </p>
        </CardHeader>
      </Card>

      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-green-500" />
          <span className="text-sm">Хватает места</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-red-500" />
          <span className="text-sm">Не хватает места</span>
        </div>
      </div>

      {groupedSlots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Нет доступных слотов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedSlots.map((group, groupIdx) => (
            <div key={group.date}>
              <h2 className="text-lg font-semibold mb-4">{group.dateDisplay}</h2>
              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {group.slots.map((slot, slotIdx) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime
                  const isAvailable = slot.available
                  const isInRange = isSlotInRange(groupIdx, slotIdx)
                  const isInSelRange = isSlotInSelectedRange(groupIdx, slotIdx)
                  const rangeStatus = getRangeStatus(groupIdx)
                  const selRangeStatus = isSelectedRangeAvailable(groupIdx)

                  const canSelect = isAvailable && isRangeValidForSlot(groupIdx, slotIdx)
                  const showGreen = isInRange && rangeStatus === 'green'
                  const showRed = (isInRange && rangeStatus === 'red') || (isInSelRange && !selRangeStatus)

                  return (
                    <div
                      key={slot.startTime}
                      className="relative"
                      onMouseEnter={() => isAvailable && setHoveredInfo({ groupIdx, startSlotIdx: slotIdx })}
                      onMouseLeave={() => setHoveredInfo(null)}
                    >
                      <Button
                        variant={isSelected || !isAvailable || isInSelRange ? 'default' : 'outline'}
                        disabled={!canSelect}
                        onClick={() => { if (canSelect) { setSelectedSlot(slot); setHoveredInfo(null); } }}
                        title={!canSelect && isAvailable ? `Нужно ${neededSlots * 30} минут подряд` : ''}
                        className={`w-full transition-all ${isInSelRange ? '!opacity-100' : ''} ${
                          showGreen ? 'ring-2 ring-green-500 ring-offset-2' :
                          showRed ? 'ring-2 ring-red-500 ring-offset-2' : ''
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </Button>
                    </div>
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