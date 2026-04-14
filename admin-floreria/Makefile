.PHONY: help build up down restart logs ps clean migrate-api migrate-ecommerce migrate-web migrate-all backup restore dev-up dev-down prod-deploy health

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml
BACKUP_DIR = backups
TIMESTAMP = $(shell date +%Y%m%d_%H%M%S)

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# === COMANDOS DE PRODUCCIÓN ===

check-traefik: ## Verificar configuración de Traefik
	@chmod +x check-traefik-setup.sh
	./check-traefik-setup.sh

traefik-logs: ## Ver logs de Traefik
	docker logs traefik -f

traefik-restart: ## Reiniciar Traefik
	docker restart traefik

build: ## Construir todas las imágenes
	docker-compose -f $(COMPOSE_FILE) build

build-nocache: ## Construir sin usar caché
	docker-compose -f $(COMPOSE_FILE) build --no-cache

up: ## Iniciar todos los servicios
	docker-compose -f $(COMPOSE_FILE) up -d

down: ## Detener todos los servicios
	docker-compose -f $(COMPOSE_FILE) down

restart: ## Reiniciar todos los servicios
	docker-compose -f $(COMPOSE_FILE) restart

logs: ## Ver logs de todos los servicios
	docker-compose -f $(COMPOSE_FILE) logs -f

ps: ## Ver estado de los contenedores
	docker-compose -f $(COMPOSE_FILE) ps

clean: ## Limpiar contenedores, imágenes y volúmenes no usados
	docker system prune -af
	docker volume prune -f

# === COMANDOS DE DESARROLLO ===

dev-up: ## Iniciar servicios de desarrollo (PostgreSQL, pgAdmin, Redis, MailHog)
	docker-compose -f $(COMPOSE_DEV_FILE) up -d
	@echo "✅ Servicios de desarrollo iniciados:"
	@echo "   - PostgreSQL: localhost:5432"
	@echo "   - pgAdmin: http://localhost:5050"
	@echo "   - Redis: localhost:6379"
	@echo "   - MailHog: http://localhost:8025"

dev-down: ## Detener servicios de desarrollo
	docker-compose -f $(COMPOSE_DEV_FILE) down

dev-logs: ## Ver logs de servicios de desarrollo
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

# === MIGRACIONES ===

migrate-api: ## Ejecutar migraciones de API
	docker-compose -f $(COMPOSE_FILE) run --rm api-perfumeria npx prisma migrate deploy

migrate-ecommerce: ## Ejecutar migraciones de ecommerce-be
	docker-compose -f $(COMPOSE_FILE) run --rm ecommerce-be npx prisma migrate deploy

migrate-web: ## Ejecutar migraciones de web-perfume
	docker-compose -f $(COMPOSE_FILE) run --rm web-perfume npx prisma migrate deploy

migrate-all: migrate-api migrate-ecommerce migrate-web ## Ejecutar todas las migraciones

migrate-status: ## Ver estado de migraciones
	@echo "=== API Perfumeria ==="
	docker-compose -f $(COMPOSE_FILE) run --rm api-perfumeria npx prisma migrate status || true
	@echo ""
	@echo "=== Ecommerce BE ==="
	docker-compose -f $(COMPOSE_FILE) run --rm ecommerce-be npx prisma migrate status || true
	@echo ""
	@echo "=== Web Perfume ==="
	docker-compose -f $(COMPOSE_FILE) run --rm web-perfume npx prisma migrate status || true

# === BACKUP Y RESTORE ===

backup: ## Crear backup de la base de datos
	@mkdir -p $(BACKUP_DIR)
	docker-compose -f $(COMPOSE_FILE) exec -T postgres pg_dump -U perfumeria_user perfumeria_db > $(BACKUP_DIR)/backup_$(TIMESTAMP).sql
	@echo "✅ Backup creado: $(BACKUP_DIR)/backup_$(TIMESTAMP).sql"

restore: ## Restaurar último backup (especificar con FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Error: Especifica el archivo con FILE=ruta/al/backup.sql"; \
		exit 1; \
	fi
	@echo "⚠️  Restaurando backup: $(FILE)"
	cat $(FILE) | docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U perfumeria_user perfumeria_db
	@echo "✅ Backup restaurado"

# === DESPLIEGUE ===

prod-deploy: ## Despliegue completo en producción
	@echo "🚀 Iniciando despliegue..."
	./deploy.sh

rollback: ## Hacer rollback (especificar con SERVICE=nombre)
	@if [ -z "$(SERVICE)" ]; then \
		echo "❌ Error: Especifica el servicio con SERVICE=nombre"; \
		echo "Servicios: api-perfumeria, ecommerce-be, web-perfume, client-perfumeria, all"; \
		exit 1; \
	fi
	./rollback.sh $(SERVICE)

# === HEALTH CHECKS ===

health: ## Verificar salud de los servicios
	@echo "Verificando servicios..."
	@echo ""
	@echo "=== Web Perfume ==="
	@curl -f http://localhost:3000/api/health 2>/dev/null && echo "✅ OK" || echo "❌ FAIL"
	@echo ""
	@echo "=== PostgreSQL ==="
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_isready -U perfumeria_user && echo "✅ OK" || echo "❌ FAIL"

# === LOGS INDIVIDUALES ===

logs-web: ## Ver logs de web-perfume
	docker-compose -f $(COMPOSE_FILE) logs -f web-perfume

logs-api: ## Ver logs de api-perfumeria
	docker-compose -f $(COMPOSE_FILE) logs -f api-perfumeria

logs-ecommerce: ## Ver logs de ecommerce-be
	docker-compose -f $(COMPOSE_FILE) logs -f ecommerce-be

logs-client: ## Ver logs de client-perfumeria
	docker-compose -f $(COMPOSE_FILE) logs -f client-perfumeria

logs-db: ## Ver logs de PostgreSQL
	docker-compose -f $(COMPOSE_FILE) logs -f postgres

# === SHELL ACCESS ===

shell-web: ## Acceder al shell de web-perfume
	docker-compose -f $(COMPOSE_FILE) exec web-perfume sh

shell-api: ## Acceder al shell de api-perfumeria
	docker-compose -f $(COMPOSE_FILE) exec api-perfumeria sh

shell-ecommerce: ## Acceder al shell de ecommerce-be
	docker-compose -f $(COMPOSE_FILE) exec ecommerce-be sh

shell-db: ## Acceder al shell de PostgreSQL
	docker-compose -f $(COMPOSE_FILE) exec postgres psql -U perfumeria_user perfumeria_db

# === PRISMA ===

prisma-studio: ## Abrir Prisma Studio
	docker-compose -f $(COMPOSE_FILE) exec web-perfume npx prisma studio

prisma-generate: ## Generar Prisma Client en todos los servicios
	docker-compose -f $(COMPOSE_FILE) run --rm api-perfumeria npx prisma generate
	docker-compose -f $(COMPOSE_FILE) run --rm ecommerce-be npx prisma generate
	docker-compose -f $(COMPOSE_FILE) run --rm web-perfume npx prisma generate

# === MONITORING ===

stats: ## Ver estadísticas de uso de recursos
	docker stats

top: ## Ver procesos en los contenedores
	docker-compose -f $(COMPOSE_FILE) top
