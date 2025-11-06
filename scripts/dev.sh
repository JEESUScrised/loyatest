#!/bin/bash

# Скрипт для запуска локальной разработки

set -e

echo "🚀 Запускаем локальную разработку системы лояльности Loya..."

# Функция для логирования
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Проверка Docker
if ! command -v docker &> /dev/null; then
    log "❌ Docker не установлен"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log "❌ Docker Compose не установлен"
    exit 1
fi

# Остановка старых контейнеров
log "🛑 Останавливаем старые контейнеры..."
docker-compose down

# Сборка образов
log "🔨 Собираем образы..."
docker-compose build

# Запуск сервисов
log "🚀 Запускаем сервисы..."
docker-compose up -d

# Ожидание запуска
log "⏳ Ожидаем запуска сервисов..."
sleep 15

# Проверка статуса
log "🔍 Проверяем статус сервисов..."

services=(
    "Backend API:3000"
    "Client Frontend:3001"
    "Cashier Frontend:3002"
    "Venue Admin Frontend:3003"
    "Tech Admin Frontend:3004"
)

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -f http://localhost:$port/health > /dev/null 2>&1; then
        log "✅ $name запущен на порту $port"
    else
        log "❌ $name не отвечает на порту $port"
    fi
done

log "🎉 Локальная разработка запущена!"
log "📱 Клиентский фронтенд: http://localhost:3001"
log "🏪 Кассирский фронтенд: http://localhost:3002"
log "🏢 Админский фронтенд: http://localhost:3003"
log "⚙️ Техническая админка: http://localhost:3004"
log "🔧 Backend API: http://localhost:3000"
log "🗄️ MongoDB: mongodb://localhost:27017"

log "💡 Для остановки используйте: docker-compose down"
