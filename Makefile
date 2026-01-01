.PHONY: help install dev lint format build-local start-local build up down logs shell clean

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies (npm install)"
	@echo "  make dev          - Run local development server (npm run dev)"
	@echo "  make lint         - Run linter (npm run lint)"
	@echo "  make format       - Format code (npm run format)"
	@echo ""
	@echo "Local Build:"
	@echo "  make build-local  - Build the application locally (npm run build)"
	@echo "  make start-local  - Start the production server locally (npm run start)"
	@echo ""
	@echo "Docker:"
	@echo "  make build        - Build the Docker image"
	@echo "  make up           - Start the application with Docker Compose (detached)"
	@echo "  make down         - Stop the application"
	@echo "  make logs         - View application logs"
	@echo "  make shell        - Access the container shell"
	@echo "  make clean        - Remove containers, images, and volumes"

# Development
install:
	npm install

dev:
	npm run dev

lint:
	npm run lint

format:
	npm run format

# Local Build
build-local:
	npm run build

start-local:
	node .next/standalone/server.js

# Docker
build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

shell:
	docker-compose exec web sh

clean:
	docker-compose down -v --rmi local
