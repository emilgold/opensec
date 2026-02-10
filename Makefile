.PHONY: dev dev-backend dev-frontend build up down clean

# Development
dev: dev-backend dev-frontend

dev-backend:
	cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm install && npm run dev

# Docker
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

clean:
	docker compose down -v
	rm -f backend/data/opensec.db
