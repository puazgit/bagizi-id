# Bagizi-ID SaaS Platform - Docker Development Setup

## 🚀 Quick Start

Untuk memulai development environment dengan cepat:

```bash
# Setup lengkap untuk developer baru
make setup

# Atau manual step-by-step:
make install  # Install Node.js dependencies
make up       # Start Docker services  
make db-migrate  # Run Prisma migrations
make dev      # Start Next.js dev server
```

## 📦 Services yang Tersedia

### 🗄️ PostgreSQL Database
- **Image**: `postgres:17-alpine`
- **Port**: `5432`
- **Database**: `bagizi_db`
- **User**: `bagizi_user` 
- **Password**: `bagizi_password`

### 📊 pgAdmin (Database GUI)
- **Image**: `dpage/pgadmin4:latest`
- **URL**: http://localhost:5050
- **Email**: `admin@bagizi.id`
- **Password**: `bagizi_admin`

### ⚡ Redis Cache
- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Password**: `bagizi_redis_password`

### 🔄 Redis Commander (Redis GUI)
- **Image**: `rediscommander/redis-commander:latest`
- **URL**: http://localhost:8081
- **User**: `admin`
- **Password**: `bagizi_redis_admin`

## 🛠️ Commands Tersedia

### Docker Management
```bash
make up          # Start semua services
make down        # Stop semua services
make restart     # Restart semua services
make logs        # Show logs
make clean       # Hapus containers, networks, volumes
make status      # Status containers
```

### Database Management
```bash
make db-up       # Start hanya PostgreSQL
make db-reset    # Reset database (HATI-HATI!)
make db-migrate  # Run Prisma migrations
make db-seed     # Seed sample data
make db-studio   # Buka Prisma Studio
```

### Redis Management
```bash
make redis-up    # Start hanya Redis
make redis-cli   # Connect ke Redis CLI
make redis-flush # Hapus semua data Redis
```

### Development
```bash
make install     # Install dependencies
make dev         # Start Next.js dev server
make build       # Build production
make test        # Run tests
```

## 🔧 Configuration Files

- `docker-compose.yml` - Docker services definition
- `.env.local` - Environment variables
- `docker/postgres/init/` - PostgreSQL initialization scripts
- `docker/redis/redis.conf` - Redis configuration
- `docker/pgadmin/servers.json` - pgAdmin server configuration

## 📊 Database Information

### Development Databases
- `bagizi_db` - Main development database
- `bagizi_test` - Testing database  
- `bagizi_shadow` - Prisma shadow database for migrations

### Extensions Enabled
- `uuid-ossp` - UUID generation
- `pg_trgm` - Text similarity
- `btree_gin` - Advanced indexing

## ⚠️ Important Notes

1. **Data Persistence**: Semua data disimpan dalam Docker volumes yang persistent
2. **Environment**: File `.env.local` berisi konfigurasi development
3. **Security**: Credentials hanya untuk development, JANGAN gunakan di production
4. **Performance**: Redis dikonfigurasi untuk development dengan memory limit 256MB

## 🔒 Production Deployment

File ini hanya untuk development. Untuk production:
1. Gunakan environment variables yang aman
2. Setup SSL/TLS untuk database connections
3. Konfigurasi backup dan monitoring
4. Gunakan managed database services jika memungkinkan

## 🚨 Troubleshooting

### Port sudah digunakan
```bash
# Check port usage
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :5050  # pgAdmin
lsof -i :8081  # Redis Commander

# Stop conflicting services
sudo pkill -f postgres
sudo pkill -f redis
```

### Reset Docker environment
```bash
make clean
docker system prune -a -f
make up
```

### Database connection issues
```bash
# Check PostgreSQL health
docker-compose exec postgres pg_isready -U bagizi_user

# View PostgreSQL logs
docker-compose logs postgres
```