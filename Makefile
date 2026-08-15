SHELL := /bin/sh
COMPOSE := docker compose

.DEFAULT_GOAL := help

.PHONY: help up down stop restart build logs ps shell db-shell migrate seed lint test

help: ## Show the available commands
	@awk 'BEGIN {FS = ":.*## "; printf "Project Pulse development commands:\n\n"} /^[a-zA-Z_-]+:.*## / {printf "  %-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.env:
	@cp .env.example .env
	@echo "Created .env from .env.example"

up: .env ## Build and start the frontend, API and PostgreSQL
	@$(COMPOSE) config --quiet
	@$(COMPOSE) up --build --detach --wait --wait-timeout 120
	@$(COMPOSE) ps
	@container_port="$$( $(COMPOSE) exec -T api printenv PORT )"; \
		host_address="$$( $(COMPOSE) port api "$$container_port" )"; \
		host_port="$${host_address##*:}"; \
		frontend_address="$$( $(COMPOSE) port frontend 3000 )"; \
		frontend_port="$${frontend_address##*:}"; \
		echo "Frontend ready at http://localhost:$$frontend_port"; \
		echo "API ready at http://localhost:$$host_port"; \
		echo "Swagger ready at http://localhost:$$host_port/api-docs"

down: ## Stop containers while preserving database data
	@$(COMPOSE) down

stop: ## Stop containers without removing them
	@$(COMPOSE) stop

restart: ## Restart the complete development stack
	@$(COMPOSE) restart

build: .env ## Rebuild service images
	@$(COMPOSE) build

logs: ## Follow frontend, API and PostgreSQL logs
	@$(COMPOSE) logs --follow --tail=200

ps: ## Show container status
	@$(COMPOSE) ps

shell: .env ## Open a shell inside the API container
	@$(COMPOSE) exec api sh

db-shell: .env ## Open psql inside the PostgreSQL container
	@$(COMPOSE) exec postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

migrate: .env ## Run pending database migrations
	@$(COMPOSE) exec api npm run db:migrate

seed: .env ## Run idempotent bootstrap seeders
	@$(COMPOSE) exec api npm run db:seed

lint: .env ## Run backend lint inside Docker
	@$(COMPOSE) run --rm api npm run lint

test: .env ## Run backend tests inside Docker
	@$(COMPOSE) run --rm api npm test
