.PHONY: check install dev bundle start build up down logs shell clean help

help:
	@echo "  make check        - Run lint, format, and type checking"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Run local development server"
	@echo "  make bundle       - Build the application"
	@echo "  make start        - Start the production server"
	@echo "  make build        - Build the Docker image"
	@echo "  make up           - Start the application with Docker Compose"
	@echo "  make down         - Stop the application"
	@echo "  make logs         - View application logs"
	@echo "  make shell        - Access the container shell"
	@echo "  make clean        - Remove containers, images, and volumes"

check:
	npm run lint
	npm run format
	npm run check-types

install:
	npm install

dev:
	npm run dev

bundle:
	npm run build

start:
	npm run start

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec web sh

clean:
	docker compose down -v --rmi local
