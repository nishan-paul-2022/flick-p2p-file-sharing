# Load environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: check install dev bundle start build up down logs shell clean help kill-port ensure-network

help:
	@echo "  make check        - Run lint, format, and type checking"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Run local Next.js dev server on PORT"
	@echo "  make bundle       - Build the Next.js application"
	@echo "  make start        - Start the Next.js production server"
	@echo "  make build        - Build the Docker image"
	@echo "  make up           - Start with Docker Compose (main_network)"
	@echo "  make down         - Stop Docker containers"
	@echo "  make kill-port    - Forcefully free up the current PORT"
	@echo "  make logs         - View Docker logs"
	@echo "  make clean        - Deep clean Docker environment"

check:
	npm run lint
	npm run format
	npm run check-types

install:
	npm install

dev:
	npm run dev -- --port $(PORT)

bundle:
	npm run build

start:
	npm run start -- --port $(PORT)

build:
	docker compose build

ensure-network:
	@docker network inspect main_network >/dev/null 2>&1 || docker network create main_network

up: ensure-network
	docker compose up -d

down:
	docker compose down

kill-port:
	@if [ -z "$(PORT)" ]; then echo "Error: PORT is not set in .env"; exit 1; fi
	@fuser -k $(PORT)/tcp 2>/dev/null || true
	@if lsof -Pi :$(PORT) -sTCP:LISTEN -t >/dev/null; then \
		lsof -ti :$(PORT) | xargs kill -9 || true; \
	fi
	@CONTAINER_ID=$$(docker ps -q --filter "publish=$(PORT)"); \
	if [ ! -z "$$CONTAINER_ID" ]; then \
		docker stop $$CONTAINER_ID || true; \
	fi
	@sleep 1

logs:
	docker compose logs -f

shell:
	docker compose exec web sh

clean:
	docker compose down -v --rmi local
