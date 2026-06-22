# Calendar Booking

Система бронирования встреч: владелец календаря создаёт типы событий, гости бронируют слоты без регистрации.

**Production:** https://ai-for-developers-project-387-fq8e.onrender.com

### Deploy

Автодеплой при пуше в `main` настроен. GitHub webhook запускает Render deploy на каждый push.

## Архитектура

```
┌────────────────────────────┐
│     Docker Container       │
│  ┌──────────┐ ┌──────────┐ │
│  │  Frontend │ │  Backend │ │
│  │ (Static)  │ │ (FastAPI)│ │
│  └─────┬────┘ └─────┬────┘ │
│        └─────┬─────┘      │
│              ▼            │
│         Port 8000         │
└────────────────────────────┘
```

- **Frontend** — Vite + React + TypeScript + shadcn/ui. Обслуживается как статика через FastAPI.
- **Backend** — FastAPI. Хранит данные в памяти, отдаёт frontend статику и обрабатывает SPA fallback.

## Локальный запуск

### Docker (рекомендуется)

```bash
# Собрать образ
docker build -t calendar-booking .

# Запустить (frontend + backend на порту 8000)
docker run -d -p 8000:8000 --name calendar-test calendar-booking

# Открыть http://localhost:8000
```

### Backend отдельно

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8000
# Открой http://localhost:8000/static/frontend/dist/index.html или /
```

### Frontend для разработки

```bash
cd frontend
npm install
npm run dev
# Откроется на http://localhost:5173
```

## API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/event-types` | Список типов событий |
| GET | `/event-types/{id}` | Тип события по ID |
| GET | `/availability/{eventTypeId}` | Свободные слоты (14 дней) |
| POST | `/bookings` | Создать бронирование |
| GET | `/bookings` | Все предстоящие бронирования |

## Структура проекта

```
.
├── backend/
│   ├── main.py           # FastAPI приложение + frontend serving
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/          # API клиент и типы
│   │   ├── components/   # UI компоненты (shadcn)
│   │   ├── pages/        # Страницы
│   │   └── lib/          # Утилиты
│   └── dist/             # Собранный frontend (в гите)
├── Dockerfile            # Собирает frontend + backend в один образ
├── docker-compose.yml    # (опционально) для dev
└── README.md
```

## Сценарии

### Guest (бронирование)

1. Открывает `/` — видит лендинг с кнопкой "Записаться"
2. Переходит на `/book` — выбирает длительность (30/60/90 мин)
3. На `/book/:duration` — видит доступные слоты на 14 дней
4. Выбирает слот → форма ввода данных
5. Отправляет → получает подтверждение на `/book/:duration/confirm`

### Owner (просмотр)

1. Открывает `/owner`
2. Видит список всех предстоящих бронирований

## Правила бронирования

- Слоты формируются на 14 дней вперёд, по будням, с 9:00, каждые 30 минут.
- На одно время — одна запись (независимо от типа события).
- Гость бронирует без авторизации.
- Данные сбрасываются при перезапуске backend.

## E2E Тесты

Playwright E2E тесты пользовательских сценариев.

### Запуск тестов

```bash
# Терминал 1: Запустить Docker
docker run -d -p 8000:8000 calendar-booking

# Терминал 2: Запустить тесты
cd frontend && npm run test:e2e
```

### Тестовые сценарии

| Файл | Описание |
|------|----------|
| `e2e/tests/guest-flow.spec.ts` | Полный сценарий бронирования гостем |
| `e2e/tests/owner-view.spec.ts` | Просмотр бронирований владельцем |

### CI/CD

GitHub Actions workflow (`.github/workflows/tests.yml`) запускает E2E тесты при пуше в `main`.