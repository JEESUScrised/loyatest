# YooKassa Test Server

Простой сервер для тестирования интеграции с Юкассой для проекта Loya.

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start

# Запуск в режиме разработки (с автоперезагрузкой)
npm run dev
```

## API Эндпоинты

### POST /api/admin/payments/create
Создание платежа через Юкассу

**Тело запроса:**
```json
{
  "amount": 1000,
  "currency": "RUB",
  "description": "Продление подписки Loya на 1 месяц",
  "returnUrl": "https://example.com/return",
  "metadata": {
    "type": "subscription_renewal",
    "months": "1",
    "venue_code": "VKU"
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "3087213e-000f-5001-9000-12c1f70311fb",
    "status": "pending",
    "confirmation": {
      "type": "redirect",
      "confirmation_url": "https://yoomoney.ru/checkout/payments/v2/contract?orderId=..."
    }
  }
}
```

### GET /api/admin/payments/:id/status
Получение статуса платежа

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "3087213e-000f-5001-9000-12c1f70311fb",
    "status": "succeeded",
    "amount": {
      "value": "1000.00",
      "currency": "RUB"
    },
    "created_at": "2024-01-01T12:00:00.000Z",
    "description": "Продление подписки Loya на 1 месяц"
  }
}
```

### GET /health
Проверка здоровья сервера

### GET /
Информация о сервере и доступных эндпоинтах

## Конфигурация

Сервер использует тестовые данные Юкассы:
- **Shop ID:** 1184633
- **API Key:** test__UW59qNHWI_40gv3XfJTubp_5zQtFKft2UOLRSy8oxI
- **Base URL:** https://api.yookassa.ru/v3

## Тестирование

После запуска сервера можно протестировать API:

```bash
# Проверка здоровья
curl http://localhost:3001/health

# Создание платежа
curl -X POST http://localhost:3001/api/admin/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "RUB",
    "description": "Тестовый платеж",
    "returnUrl": "https://example.com/return"
  }'
```

## Логирование

Сервер выводит подробные логи всех запросов и ответов для удобства отладки.
