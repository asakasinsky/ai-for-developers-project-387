# Calendar Booking

Система бронирования встреч: владелец календаря создаёт типы событий, гости бронируют слоты без регистрации.

**Production:** https://ai-for-developers-project-386-5uwg.onrender.com

## Архитектура

```
┌──────────────┐      ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │     │    Prism    │
│  (Vite+React)│      │  (FastAPI)  │     │   (mock)    │
└──────────────┘      └─────────────┘     └─────────────┘
```

- **Frontend** — Vite + React + TypeScript + shadcn/ui. Работает только через API.
- **Backend** — FastAPI. Хранит данные в памяти.
- **Prism** — Опционально, для локального мока API во время разработки.

## Быстрый старт

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 3000
```

### Frontend (с backend)

```bash
cd frontend
npm install
VITE_API_BASE=http://localhost:3000 npm run dev
```

### Frontend (с моком Prism)

```bash
cd frontend
npm install
npm run dev:mock
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
│   ├── main.py           # FastAPI приложение
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/          # API клиент и типы
│   │   ├── components/   # UI компоненты (shadcn)
│   │   ├── pages/        # Страницы
│   │   └── lib/          # Утилиты
│   ├── prism.mock.json   # OpenAPI спецификация для Prism
│   └── ...
├── spec/
│   └── booking-api.tsp   # TypeSpec контракт
└── README.md
```

## Сценарии

### Guest (бронирование)

1. Открывает `/` — видит список типов событий
2. Выбирает тип — попадает на `/book/:id`
3. Видит доступные слоты на 14 дней
4. Выбирает слот → форма ввода данных
5. Отправляет → получает подтверждение

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
# Терминал 1: Запустить backend
cd backend && uvicorn main:app --port 3000

# Терминал 2: Запустить frontend
cd frontend && VITE_API_BASE=http://localhost:3000 npm run dev

# Терминал 3: Запустить тесты
cd frontend && npm run test:e2e
```

### Тестовые сценарии

| Файл | Описание |
|------|----------|
| `e2e/tests/guest-flow.spec.ts` | Полный сценарий бронирования гостем |
| `e2e/tests/conflict-handling.spec.ts` | Обработка конфликта занятых слотов |
| `e2e/tests/owner-view.spec.ts` | Просмотр бронирований владельцем |

### CI/CD

GitHub Actions workflow (`.github/workflows/tests.yml`) запускает E2E тесты при пуше в `main` и при PR.