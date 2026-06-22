.PHONY: start stop build build-docker test-e2e

start:
	cd backend && uvicorn main:app --port 8000

stop:
	pkill -f "uvicorn" || true

build:
	cd frontend && npm run build

build-docker: build
	docker build -t calendar-booking .

test-e2e:
	cd frontend && npm run test:e2e