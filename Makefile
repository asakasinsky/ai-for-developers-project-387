.PHONY: start stop docker-start docker-stop build build-docker test-e2e

start:
	cd backend && uvicorn main:app --port $(or $(PORT),8000)

stop:
	pkill -f "uvicorn" || true

docker-start:
	docker run -d -p 8000:8000 --name calendar-booking --rm calendar-booking:latest

docker-stop:
	docker stop calendar-booking || true

build:
	cd frontend && npm run build

build-docker: build
	docker build -t calendar-booking .

test-e2e:
	cd frontend && npm run test:e2e