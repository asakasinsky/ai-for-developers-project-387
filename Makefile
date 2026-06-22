.PHONY: build run stop logs clean test test:e2e help

APP_NAME := calendar-booking
PORT := 8000

help: ## Показать эту помощь
	@grep -E '^##|^(\w+):' Makefile | sed -E 's/## //;s/: / - /'

build: ## Собрать Docker образ
	docker build -t $(APP_NAME) .

run: ## Запустить контейнер
	docker run -d -p $(PORT):$(PORT) --name $(APP_NAME)-dev $(APP_NAME)

stop: ## Остановить контейнер
	docker stop $(APP_NAME)-dev || true
	docker rm $(APP_NAME)-dev || true

logs: ## Показать логи контейнера
	docker logs -f $(APP_NAME)-dev

clean: stop ## Остановить и удалить контейнер

rebuild: stop build run ## Пересобрать и запустить

test: ## Запустить unit-тесты (если есть)
	cd frontend && npm run test || true

test:e2e: ## Запустить E2E тесты
	cd frontend && npm run test:e2e

dev: ## Запустить в dev режиме (backend + frontend отдельно)
	@echo "Запуск backend на порту 8000..."
	cd backend && uvicorn main:app --port 8000 &
	@echo "Запуск frontend на порту 5173..."
	cd frontend && npm run dev

dev:stop: ## Остановить dev режим
	pkill -f "uvicorn main:app" || true
	pkill -f "vite" || true