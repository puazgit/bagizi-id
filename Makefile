# Bagizi-ID SaaS Platform - Development Makefile
# Quick commands for Docker container management

# Default target
.PHONY: help
help:
	@echo "🎯 Bagizi-ID SaaS Platform - Development Commands"
	@echo ""
	@echo "📦 Docker Management:"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - Show logs from all services"
	@echo "  make clean       - Stop and remove all containers, networks, volumes"
	@echo ""
	@echo "🗄️  Database Management:"
	@echo "  make db-up       - Start only PostgreSQL"
	@echo "  make db-reset    - Reset database (WARNING: Deletes all data)"
	@echo "  make db-migrate  - Run Prisma migrations"
	@echo "  make db-seed     - Seed database with sample data"
	@echo "  make db-studio   - Open Prisma Studio"
	@echo ""
	@echo "🔄 Cache Management:"
	@echo "  make redis-up    - Start only Redis"
	@echo "  make redis-cli   - Connect to Redis CLI"
	@echo "  make redis-flush - Flush all Redis data"
	@echo ""
	@echo "🔧 Development Tools:"
	@echo "  make install     - Install Node.js dependencies"
	@echo "  make dev         - Start Next.js development server"
	@echo "  make build       - Build production bundle"
	@echo "  make test        - Run tests"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  make status      - Show container status"
	@echo "  make pgadmin     - Open pgAdmin (localhost:5050)"
	@echo "  make redis-gui   - Open Redis Commander (localhost:8081)"

# Docker Management
.PHONY: up down restart logs clean status
up:
	@echo "🚀 Starting Bagizi-ID development environment..."
	docker-compose up -d
	@echo "✅ All services are running!"
	@echo "   📊 pgAdmin: http://localhost:5050"
	@echo "   🔄 Redis GUI: http://localhost:8081"
	@echo "   🗄️  PostgreSQL: localhost:5432"
	@echo "   ⚡ Redis: localhost:6379"

down:
	@echo "🛑 Stopping Bagizi-ID services..."
	docker-compose down

restart:
	@echo "♻️ Restarting Bagizi-ID services..."
	docker-compose restart

logs:
	docker-compose logs -f

clean:
	@echo "🧹 Cleaning up all containers, networks, and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f

status:
	@echo "📊 Container Status:"
	docker-compose ps

# Database Management
.PHONY: db-up db-reset db-migrate db-seed db-studio
db-up:
	@echo "🗄️ Starting PostgreSQL..."
	docker-compose up -d postgres
	@echo "✅ PostgreSQL is ready on localhost:5432"

db-reset:
	@echo "⚠️  WARNING: This will delete all database data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down postgres
	docker volume rm bagizi-id_postgres_data || true
	docker-compose up -d postgres
	@echo "✅ Database reset complete"

db-migrate:
	@echo "🔄 Running Prisma migrations..."
	npx prisma migrate dev
	@echo "✅ Migrations applied successfully"

db-seed:
	@echo "🌱 Seeding database..."
	npx prisma db seed
	@echo "✅ Database seeded successfully"

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	npx prisma studio

# Redis Management  
.PHONY: redis-up redis-cli redis-flush
redis-up:
	@echo "⚡ Starting Redis..."
	docker-compose up -d redis
	@echo "✅ Redis is ready on localhost:6379"

redis-cli:
	@echo "💻 Connecting to Redis CLI..."
	docker-compose exec redis redis-cli -a bagizi_redis_password

redis-flush:
	@echo "🧹 Flushing Redis data..."
	docker-compose exec redis redis-cli -a bagizi_redis_password FLUSHALL
	@echo "✅ Redis data cleared"

# Development Tools
.PHONY: install dev build test
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

dev:
	@echo "🚀 Starting Next.js development server..."
	npm run dev

build:
	@echo "🏗️ Building production bundle..."
	npm run build

test:
	@echo "🧪 Running tests..."
	npm test

# Quick shortcuts
.PHONY: pgadmin redis-gui
pgadmin:
	@echo "📊 Opening pgAdmin..."
	@echo "URL: http://localhost:5050"
	@echo "Email: admin@bagizi.id"
	@echo "Password: bagizi_admin"
	open http://localhost:5050 2>/dev/null || echo "Please open http://localhost:5050 manually"

redis-gui:
	@echo "🔄 Opening Redis Commander..."
	@echo "URL: http://localhost:8081"
	@echo "User: admin"
	@echo "Password: bagizi_redis_admin" 
	open http://localhost:8081 2>/dev/null || echo "Please open http://localhost:8081 manually"

# Complete setup for new developers
.PHONY: setup
setup:
	@echo "🎯 Setting up Bagizi-ID development environment..."
	make install
	make up
	@echo "⏳ Waiting for services to be ready..."
	sleep 10
	make db-migrate
	@echo ""
	@echo "🎉 Setup complete! Your development environment is ready."
	@echo ""
	@echo "📊 Access URLs:"
	@echo "   🌐 App: http://localhost:3000 (run 'make dev' to start)"
	@echo "   📊 pgAdmin: http://localhost:5050"
	@echo "   🔄 Redis GUI: http://localhost:8081"
	@echo "   🎨 Prisma Studio: Run 'make db-studio'"