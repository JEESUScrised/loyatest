#!/bin/bash

# Скрипт для деплоя всех фронтендов

set -e

echo "🚀 Начинаем деплой системы лояльности Loya..."

# Проверка переменных окружения
if [ -z "$NODE_ENV" ]; then
    echo "❌ NODE_ENV не установлена"
    exit 1
fi

# Функция для логирования
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Функция для проверки статуса сервиса
check_service() {
    local service_name=$1
    local port=$2
    
    log "🔍 Проверяем $service_name на порту $port..."
    
    for i in {1..30}; do
        if curl -f http://localhost:$port/health > /dev/null 2>&1; then
            log "✅ $service_name запущен успешно"
            return 0
        fi
        sleep 2
    done
    
    log "❌ $service_name не запустился"
    return 1
}

# Остановка старых контейнеров
log "🛑 Останавливаем старые контейнеры..."
docker-compose -f docker-compose.prod.yml down

# Сборка новых образов
log "🔨 Собираем новые образы..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Запуск сервисов
log "🚀 Запускаем сервисы..."
docker-compose -f docker-compose.prod.yml up -d

# Ожидание запуска сервисов
log "⏳ Ожидаем запуска сервисов..."
sleep 10

# Проверка статуса сервисов
check_service "Backend API" 3000
check_service "Client Frontend" 3001
check_service "Cashier Frontend" 3002
check_service "Venue Admin Frontend" 3003
check_service "Tech Admin Frontend" 3004

# Проверка Nginx
log "🔍 Проверяем Nginx..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    log "✅ Nginx работает"
else
    log "❌ Nginx не отвечает"
    exit 1
fi

# Очистка старых образов
log "🧹 Очищаем старые образы..."
docker system prune -f

log "🎉 Деплой завершен успешно!"
log "📱 Клиентский фронтенд: https://app.loya.ru"
log "🏪 Кассирский фронтенд: https://cashier.loya.ru"
log "🏢 Админский фронтенд: https://admin.loya.ru"
log "⚙️ Техническая админка: https://tech.loya.ru"
