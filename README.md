# Task Management System API

A robust backend API for a Task Management System built with Node.js, Express.js, and MySQL. Features email-based OTP authentication, JWT tokens, rate limiting, and comprehensive activity logging.

## Features

- **Authentication**
  - Email-based OTP authentication (passwordless)
  - JWT access tokens (15 min expiry) + refresh tokens (7 days)
  - Secure token refresh mechanism
  
- **Task Management**
  - CRUD operations for tasks
  - Filtering by status and priority
  - Pagination support
  - Task statistics dashboard
  
- **Security**
  - Rate limiting (OTP, auth, general API)
  - Helmet.js security headers
  - Input validation with Joi
  - SQL injection prevention via Sequelize ORM
  
- **Activity Logging**
  - Comprehensive audit trail
  - Tracks all CRUD operations
  - Records IP address and user agent

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT + OTP
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston

## Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middlewares
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Joi validation schemas
│   └── app.js           # Express app setup
├── server.js            # Entry point
├── package.json
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- MySQL >= 8.x
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd regrip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. **Create MySQL database**
   ```sql
   CREATE DATABASE task_management_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

6. **Access API Documentation**
   
   Open http://localhost:3000/api-docs in your browser.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/request-otp` | Request OTP | No |
| POST | `/api/auth/verify-otp` | Verify OTP & Login | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/tasks` | Create task | Yes |
| GET | `/api/tasks` | Get all tasks | Yes |
| GET | `/api/tasks/:id` | Get task by ID | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| GET | `/api/tasks/stats` | Get statistics | Yes |

### Query Parameters (GET /api/tasks)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max: 100) |
| status | string | - | Filter: pending, in_progress, completed |
| priority | string | - | Filter: low, medium, high |
| sortBy | string | created_at | Sort field |
| order | string | DESC | Sort order: ASC, DESC |

## Authentication Flow

1. **Request OTP**
   ```bash
   POST /api/auth/request-otp
   Body: { "email": "user@example.com" }
   ```

2. **Verify OTP (Login)**
   ```bash
   POST /api/auth/verify-otp
   Body: { "email": "user@example.com", "otp": "123456" }
   Response: { accessToken, refreshToken, user }
   ```

3. **Use Access Token**
   ```bash
   Authorization: Bearer <accessToken>
   ```

4. **Refresh Token (when access token expires)**
   ```bash
   POST /api/auth/refresh
   Body: { "refreshToken": "<refreshToken>" }
   ```

## Example Requests

### Create Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task management API",
    "priority": "high",
    "due_date": "2024-12-31T23:59:59Z"
  }'
```

### Get Tasks with Filters
```bash
curl "http://localhost:3000/api/tasks?status=pending&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

## Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| OTP Request | 5 requests | 15 minutes |
| Auth (Login) | 10 requests | 15 minutes |
| General API | 100 requests | 1 minute |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_NAME | Database name | task_management_dev |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | - |
| JWT_ACCESS_SECRET | Access token secret | - |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| SMTP_HOST | SMTP server host | smtp.gmail.com |
| SMTP_USER | SMTP username | - |
| SMTP_PASS | SMTP password | - |

## Deployment

### Recommended Platforms
- **Railway** - Easy MySQL + Node.js deployment
- **Render** - Free tier available
- **Heroku** - Classic PaaS option
- **AWS EC2/ECS** - For production scale
- **DigitalOcean App Platform**

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT secrets
- [ ] Enable SSL/TLS for database
- [ ] Set up proper CORS origins
- [ ] Configure logging to external service
- [ ] Set up database backups
- [ ] Use connection pooling
- [ ] Enable HTTPS

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run db:migrate # Run database migrations
npm run lint       # Run ESLint
npm test           # Run tests
```

## License

ISC

## Author

Built for REGRIP INDIA PVT. LTD. Backend Assignment
