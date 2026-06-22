import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const durations = [
  { id: '30', minutes: 30, name: 'Короткая', description: '30 минут' },
  { id: '60', minutes: 60, name: 'Стандартная', description: '1 час' },
  { id: '90', minutes: 90, name: 'Длительная', description: '1.5 часа' },
]

export function DurationPage() {
  const navigate = useNavigate()

  const handleSelect = (value: string) => {
    navigate(`/book/${value}/schedule`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
        <ChevronLeft className="w-4 h-4 mr-2" />
        На главную
      </Button>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Выберите длительность</CardTitle>
            <CardDescription>
              Сколько времени вам нужно для встречи?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select onValueChange={handleSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите длительность..." />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.description})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <div className="font-semibold">30 мин</div>
                <div className="text-xs text-muted-foreground">Быстрый созвон</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="font-semibold">60 мин</div>
                <div className="text-xs text-muted-foreground">Стандартная</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="font-semibold">90 мин</div>
                <div className="text-xs text-muted-foreground">Детальная</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}