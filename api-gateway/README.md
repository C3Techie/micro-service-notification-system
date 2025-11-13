# API Gateway - Notification System

## 📋 Overview

The API Gateway is the entry point for the Distributed Notification System, built using NestJS microservices architecture. It handles notification requests, validates them, and routes messages to appropriate queues (email/push) via RabbitMQ.

## 🏗️ Architecture

```
API Gateway (Port 8000)
        ↓
   RabbitMQ (Message Queue)
        ↓
Email Service    Push Service
```

## 🚀 Features

- **Request Validation** - Comprehensive DTO validation using class-validator
- **Message Routing** - Routes notifications to email/push queues via RabbitMQ
- **Health Monitoring** - Health check endpoints for service monitoring
- **Error Handling** - Graceful error handling with circuit breaker pattern
- **Idempotency** - Prevents duplicate notifications using request_id
- **Docker Ready** - Full containerization with Docker
- **API Documentation** - Swagger/OpenAPI documentation
- **Logging** - Comprehensive logging with correlation IDs

## 🛠️ Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Message Queue**: RabbitMQ
- **Containerization**: Docker
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Logging**: NestJS Logger

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## 🏃‍♂️ Quick Start

### Method 1: Docker (Recommended)

```bash
# Clone the repository
git clone [repository-url](https://github.com/C3Techie/micro-service-notification-system.git)
cd micro-service-notification-system

# Start all services
docker-compose up --build

# The API Gateway will be available at:
# http://localhost:8000
```

### Method 2: Local Development

```bash
# Navigate to api-gateway
cd api-gateway

# Install dependencies
npm install

# Start development server
npm run start:dev

# The API Gateway will be available at:
# http://localhost:8000
```

## 📚 API Documentation

Once running, access the Swagger documentation at:
**http://localhost:8000/api/docs**

## 🔌 API Endpoints

### Health Check
```http
GET /api/v1/notifications/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "message": "API Gateway is healthy"
}
```

### Send Notification
```http
POST /api/v1/notifications
Content-Type: application/json
```

**Request Body:**
```json
{
  "notification_type": "email",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "template_code": "welcome_email",
  "variables": {
    "name": "John Doe",
    "link": "https://example.com",
    "meta": {
      "company": "Your Company",
      "role": "user"
    }
  },
  "request_id": "unique-request-123",
  "priority": 1,
  "metadata": {
    "source": "user_registration",
    "campaign_id": "campaign-001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notification_id": "3313d443-c8e2-4b41-88c5-ae5399bb386d",
    "status": "pending",
    "request_id": "unique-request-123"
  },
  "message": "Notification queued successfully"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://guest:guest@rabbitmq:5672` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | API Gateway port | `8000` |

### RabbitMQ Setup

The system uses the following queues:
- `email.queue` - For email notifications
- `push.queue` - For push notifications  
- `failed.queue` - Dead letter queue for failed messages

Exchange: `notifications.direct`

## 🐳 Docker Configuration

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "start:prod"]
```

### docker-compose.yml Services
```yaml
api-gateway:
  build: ./api-gateway
  ports: ["8000:8000"]
  environment:
    RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672
    NODE_ENV: production
  depends_on:
    - rabbitmq

rabbitmq:
  image: rabbitmq:3-management
  ports: ["5672:5672", "15672:15672"]

redis:
  image: redis:alpine
  ports: ["6379:6379"]

postgres:
  image: postgres:13
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: password
    POSTGRES_DB: main
  ports: ["5432:5432"]
```

## 🧪 Testing

### Manual Testing with curl

```bash
# Health check
curl http://localhost:8000/api/v1/notifications/health

# Send email notification
curl -X POST http://localhost:8000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "email",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "template_code": "welcome_email",
    "variables": {
      "name": "John Doe",
      "link": "https://example.com"
    },
    "request_id": "test-001"
  }'
```

### Check RabbitMQ Management
Access RabbitMQ management console at:
**http://localhost:15672** (guest/guest)

## 📊 Monitoring

### Health Checks
- API Gateway: `http://localhost:8000/api/v1/notifications/health`
- RabbitMQ: `http://localhost:15672` (Management UI)

### Logs
```bash
# View Docker logs
docker-compose logs api-gateway

# View specific service logs
docker-compose logs -f api-gateway
```

## 🚀 Deployment

### Production Deployment
```bash
# Build and start production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale api-gateway=3
```

<!-- ### CI/CD Pipeline
The project includes GitHub Actions workflow for automated testing and deployment. -->

## 🔍 Troubleshooting

### Common Issues

1. **RabbitMQ Connection Failed**
   - Check if RabbitMQ container is running: `docker-compose ps`
   - Verify connection URL in environment variables

2. **Port Already in Use**
   - Change port in `docker-compose.yml` or `src/main.ts`
   - Check running processes: `netstat -ano | findstr :8000`

3. **Build Failures**
   - Clear Docker cache: `docker system prune`
   - Rebuild from scratch: `docker-compose build --no-cache`

### Debug Mode
```bash
# Start with debug logging
NODE_ENV=development npm run start:dev

# Or with Docker
docker-compose up api-gateway --build
```


## 📝 License

This project is part of the HNG Internship Stage 4 Backend Task.

## 👥 Team

- **API Gateway**: C3Techie
- **User Service**: C3Techie
- **Email Service**: Romauld
- **Push Service**: Romauld
- **Template Service**: [Team Member]

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/api/docs`
3. Check service logs with `docker-compose logs`

---

**🎯 API Gateway Status: PRODUCTION READY**