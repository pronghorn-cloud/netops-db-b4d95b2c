# NetOps API - Network Operations Management System

A comprehensive backend API for managing network operations, including sites, containers, devices, and network monitoring.

## ⚡ Now Using PostgreSQL!

This project has been **fully migrated from MongoDB to PostgreSQL** for improved reliability, ACID compliance, and relational data management.

## Features

- **Site Management**: Create, update, and manage network sites
- **Container Management**: Organize network equipment in containers (racks, cabinets, rooms)
- **Device Management**: Track and manage network devices with detailed specifications
- **User Authentication**: Secure JWT-based authentication and authorization
- **Role-Based Access Control**: Admin and user roles with different permissions
- **RESTful API**: Clean and intuitive API endpoints with pagination
- **TypeScript**: Full type safety and modern JavaScript features
- **PostgreSQL Database**: Robust relational database with ACID compliance
- **Data Integrity**: Foreign key constraints and CASCADE deletes
- **Performance**: Optimized indexes and connection pooling
- **Full-Text Search**: Advanced search capabilities for sites and devices

## Technology Stack

- **Runtime**: Node.js (v16+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (v12+) with node-postgres (pg)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon, ts-node, ESLint

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Run database migration to create tables
npm run migrate

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Database Setup

### PostgreSQL Connection

Configure your PostgreSQL connection in `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/netops
```

For cloud databases (Render, AWS RDS, etc.), include SSL:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

### Run Migration

Create all database tables, indexes, and constraints:

```bash
npm run migrate
```

This creates:
- ✅ `users` table with authentication
- ✅ `sites` table for locations
- ✅ `containers` table for equipment organization
- ✅ `devices` table for network devices
- ✅ All indexes for performance optimization
- ✅ Foreign key constraints with CASCADE deletes
- ✅ Automatic `updated_at` triggers
- ✅ Data validation constraints

## Documentation

- [Setup Guide](./docs/SETUP.md) - Detailed installation and configuration
- [API Documentation](./docs/API.md) - Complete API endpoint reference
- [Migration SQL](./src/migrations/001_initial_schema.sql) - Database schema

## Project Structure

```
netops-api/
├── src/
│   ├── config/          # Configuration files (database, JWT)
│   ├── controllers/     # Request handlers (auth, sites, containers, devices)
│   ├── middleware/      # Custom middleware (auth, validation, error handling)
│   ├── models/          # Database models (PostgreSQL repositories)
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts (migration runner)
│   ├── migrations/      # Database migrations (SQL files)
│   ├── utils/           # Utility functions (logger, response formatter)
│   └── index.ts         # Application entry point
├── docs/                # Documentation
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Sites
- `GET /api/sites` - Get all sites (with pagination, search, status filter)
- `GET /api/sites/:id` - Get site by ID with containers
- `POST /api/sites` - Create new site (Admin only)
- `PUT /api/sites/:id` - Update site (Admin only)
- `DELETE /api/sites/:id` - Delete site (Admin only)

### Containers
- `GET /api/containers` - Get all containers (with pagination and filters)
- `GET /api/containers/:id` - Get container by ID with site and devices
- `POST /api/containers` - Create new container (Admin only)
- `PUT /api/containers/:id` - Update container (Admin only)
- `DELETE /api/containers/:id` - Delete container (Admin only)

### Devices
- `GET /api/devices` - Get all devices (with pagination and filters)
- `GET /api/devices/:id` - Get device by ID with container and site
- `POST /api/devices` - Create new device (Admin only)
- `PUT /api/devices/:id` - Update device (Admin only)
- `DELETE /api/devices/:id` - Delete device (Admin only)

### Query Parameters

All list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term (sites: name/location, devices: name/manufacturer/model)
- `status` - Filter by status (active/inactive)
- `siteId` - Filter containers by site
- `containerId` - Filter devices by container
- `type` - Filter by device type or container type

## Database Schema

### Relationships

```
Users (authentication)

Sites
  ↓ (1:many)
Containers
  ↓ (1:many)
Devices
```

### Key Features

- **UUID Primary Keys**: Universal unique identifiers for all records
- **Foreign Keys**: Enforced relationships with CASCADE delete
- **Timestamps**: Automatic `created_at` and `updated_at` tracking
- **Indexes**: Optimized for common queries and searches
- **Constraints**: Data validation at database level
- **Full-Text Search**: GIN indexes for efficient text search

## Migration from MongoDB

This project was fully migrated from MongoDB to PostgreSQL:

### What Changed

- ✅ **Database**: MongoDB → PostgreSQL
- ✅ **ORM/Driver**: Mongoose → node-postgres (pg)
- ✅ **ID Format**: MongoDB ObjectId → PostgreSQL UUID
- ✅ **Queries**: MongoDB query operators → SQL with parameterized queries
- ✅ **Relationships**: Virtual population → SQL JOINs
- ✅ **Schema**: Mongoose schemas → SQL CREATE TABLE statements
- ✅ **Validation**: Mongoose validators → PostgreSQL constraints + app-level validation

### Benefits of PostgreSQL

- **ACID Compliance**: Full transaction support
- **Referential Integrity**: Foreign key constraints
- **Complex Queries**: Powerful SQL with JOINs and aggregations
- **Data Validation**: Built-in constraints and check constraints
- **Scalability**: Better for relational data and complex relationships
- **Tooling**: Excellent admin tools (pgAdmin, DBeaver, psql)
- **Performance**: Optimized indexes and query planning

### Migration Guide

If you have existing MongoDB data:

1. Export data from MongoDB: `mongoexport`
2. Transform data (adjust IDs, field names)
3. Run PostgreSQL migration: `npm run migrate`
4. Import transformed data using custom scripts or pgAdmin

See [SETUP.md](./docs/SETUP.md) for detailed migration instructions.

## Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production
npm start

# Run database migration
npm run migrate

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Run tests
npm test
```

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/netops

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configurable origins
- **Rate Limiting**: Prevent brute force attacks
- **Helmet**: Security headers
- **Input Validation**: Express validator + PostgreSQL constraints
- **Role-Based Access**: Admin/user permissions

## Production Deployment

### Recommended Platforms

- **Render.com** - Easy PostgreSQL + Node.js deployment
- **Heroku** - With PostgreSQL add-on
- **AWS** - EC2 + RDS PostgreSQL
- **DigitalOcean** - Managed PostgreSQL
- **Railway** - Modern deployment platform

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure `DATABASE_URL` with SSL (`?sslmode=require`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGIN`
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Run migration: `npm run migrate`
- [ ] Test all endpoints
- [ ] Enable HTTPS

## Testing

```bash
# Run all tests
npm test

# Test with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) file for details

## Support

For issues, questions, or contributions:
- 📖 Read the [Setup Guide](./docs/SETUP.md)
- 📚 Check the [API Documentation](./docs/API.md)
- 🐛 Open an issue on GitHub
- 💬 Contact the maintainers

---

**Built with ❤️ using TypeScript, Express.js, and PostgreSQL**
