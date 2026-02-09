# Fleet Management Backend API

RESTful API backend for the Fleet Management System built with Express.js, MongoDB, and Node.js.

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Development Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables (see `.env.example` for details).

3. **Start development server**

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

### Production Setup

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive instructions.

```bash
npm install --production
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (DB, env, queue, socket)
│   ├── constants/       # Application constants
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Data access layer
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── templates/       # Email templates
│   ├── utils/           # Helper utilities
│   ├── validations/     # Request validation schemas
│   ├── workers/         # Background job workers
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── scripts/             # Utility scripts (seeding, etc.)
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
└── DEPLOYMENT.md        # Deployment guide
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run seed:reset` - Reset and seed database
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## 🔑 Key Features

- **Multi-tenancy** - Company-based data isolation
- **Role-based access control** - Admin, Owner, Manager, Driver roles
- **JWT Authentication** - Access and refresh tokens
- **Real-time updates** - Socket.io integration
- **Background jobs** - Bull queue with Redis (optional)
- **Email notifications** - SendGrid or SMTP support
- **Rate limiting** - Protection against abuse
- **Validation** - Joi schema validation
- **Error handling** - Centralized error middleware
- **Audit logging** - Track important actions

## 📚 API Documentation

### Base URL

```
http://localhost:4000/api/v1
```

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Main Endpoints

- **Auth:** `/api/v1/auth` - Login, register, refresh tokens
- **Users:** `/api/v1/users` - User management
- **Vehicles:** `/api/v1/vehicles` - Vehicle CRUD operations
- **Drivers:** `/api/v1/drivers` - Driver profiles
- **Trips:** `/api/v1/trips` - Trip management
- **Routes:** `/api/v1/routes` - Route planning
- **Maintenance:** `/api/v1/maintenance` - Maintenance logs
- **Clients:** `/api/v1/clients` - Client management
- **Analytics:** `/api/v1/analytics` - Dashboard analytics
- **Admin:** `/api/v1/admin` - Admin operations

### Example Request

```bash
curl -X GET http://localhost:4000/api/v1/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🗄️ Database Models

- **Company** - Multi-tenant organization
- **User** - System users with roles
- **DriverProfile** - Driver-specific information
- **Vehicle** - Fleet vehicles
- **Trip** - Vehicle trips/journeys
- **Route** - Planned routes
- **MaintenanceLog** - Vehicle maintenance records
- **Client** - Customer/client information
- **AuditLog** - System audit trail

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting on auth endpoints
- JWT token-based authentication
- Password hashing with Argon2
- Input validation with Joi
- MongoDB injection protection

## 🌍 Environment Variables

See [.env.example](./.env.example) for all available environment variables.

### Required Variables

- `PORT` - Server port
- `MONGO_URI` - MongoDB connection string
- `ACCESS_TOKEN_SECRET` - JWT access token secret
- `REFRESH_TOKEN_SECRET` - JWT refresh token secret
- `ACCESS_TOKEN_EXPIRES_IN` - Token expiration (e.g., 15m)
- `REFRESH_TOKEN_EXPIRES_IN` - Token expiration (e.g., 7d)
- `FRONTEND_URL` - Frontend application URL

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB URI
echo $MONGO_URI

# Test connection
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```

### Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000  # Mac/Linux
netstat -ano | findstr :4000  # Windows

# Kill the process or change PORT in .env
```

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

For detailed deployment instructions, including:

- Platform-specific guides (Heroku, Railway, Docker)
- Production environment setup
- Security best practices
- Monitoring and logging

See **[DEPLOYMENT.md](./DEPLOYMENT.md)**

## 🤝 Contributing

1. Follow the existing code structure
2. Use ESLint and Prettier configurations
3. Add tests for new features
4. Update documentation

## 📄 Architecture

The application follows a layered architecture:

```
Controllers → Services → Repositories → Models
     ↓           ↓            ↓
  HTTP ←   Business Logic → Database
```

- **Controllers**: Handle HTTP requests/responses
- **Services**: Implement business logic
- **Repositories**: Data access and queries
- **Models**: Mongoose schemas

## 📞 Support

For deployment questions, refer to [DEPLOYMENT.md](./DEPLOYMENT.md).
For setup instructions, see [SETUP_COMPANY.md](../SETUP_COMPANY.md).

---

**Built with:** Node.js, Express, MongoDB, Socket.io, Bull, JWT
