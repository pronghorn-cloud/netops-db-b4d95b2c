# NetOps API Setup Guide

Complete guide for setting up and running the NetOps API with PostgreSQL.

## Prerequisites

- **Node.js**: v16 or higher
- **PostgreSQL**: v12 or higher
- **npm** or **yarn**: Latest version

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd netops-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your system:
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from [PostgreSQL website](https://www.postgresql.org/download/)

2. Start PostgreSQL service:
   ```bash
   # macOS/Linux
   sudo systemctl start postgresql
   
   # Or use homebrew on macOS
   brew services start postgresql
   ```

3. Create a database:
   ```bash
   # Login to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE netops;
   
   # Create user (optional)
   CREATE USER netops_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE netops TO netops_user;
   ```

#### Option B: PostgreSQL Cloud (Render, AWS RDS, etc.)

1. Create a free PostgreSQL instance at [Render.com](https://render.com/) or [AWS RDS](https://aws.amazon.com/rds/)
2. Get your connection string
3. Whitelist your IP address if required

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/netops
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Connection String Format**:
```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

**Important**: 
- Change `JWT_SECRET` to a secure random string in production!
- For cloud PostgreSQL (Render, AWS), add `?sslmode=require` to the connection string
- Keep your database credentials secure and never commit them to version control

### 5. Run Database Migration

Before starting the application, you need to set up the database schema:

```bash
npm run migrate
```

This will create all required tables:
- **users** - User accounts with authentication
- **sites** - Physical locations/sites
- **containers** - Containers within sites (racks, cabinets, etc.)
- **devices** - Network devices within containers

The migration also creates:
- All necessary indexes for performance
- Foreign key constraints
- Check constraints for data validation
- Automatic `updated_at` timestamp triggers

**Alternative Manual Migration**:

If you prefer to run the migration manually:

```bash
psql $DATABASE_URL < src/migrations/001_initial_schema.sql
```

### 6. Run the Application

#### Development Mode (with hot reload)

```bash
npm run dev
```

#### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Run the built application
npm start
```

## Verify Installation

1. The server should start on `http://localhost:3000`
2. Check the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

3. You should see:
   ```json
   {
     "status": "ok",
     "message": "NetOps API is running",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

4. Verify database connection in the logs:
   ```
   ✅ PostgreSQL connected successfully
   📊 Database: Connected at 2024-01-01T00:00:00.000Z
   🚀 Server is running on port 3000
   ```

## Initial Setup

### Create Admin User

Register the first admin user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "securePassword123",
    "role": "admin"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123"
  }'
```

Save the returned token for authenticated requests.

## Testing the API

### Using cURL

```bash
# Set your token
TOKEN="your-jwt-token-here"

# Create a site
curl -X POST http://localhost:3000/api/sites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Office",
    "location": "New York, NY",
    "address": "123 Main St",
    "status": "active"
  }'

# Get all sites
curl -X GET http://localhost:3000/api/sites \
  -H "Authorization: Bearer $TOKEN"

# Create a container
curl -X POST http://localhost:3000/api/containers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Server Rack 1",
    "type": "rack",
    "siteId": "<site-id-from-previous-response>",
    "capacity": 42
  }'

# Create a device
curl -X POST http://localhost:3000/api/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Core Switch",
    "type": "switch",
    "manufacturer": "Cisco",
    "model": "Catalyst 9300",
    "ipAddress": "192.168.1.1",
    "containerId": "<container-id>"
  }'
```

### Using Postman

1. Import the API collection (if provided)
2. Set the environment variable `BASE_URL` to `http://localhost:3000`
3. Set the `TOKEN` variable after logging in
4. Start making requests

## Development Tools

### Linting

```bash
# Check for issues
npm run lint

# Fix issues automatically
npm run lint:fix
```

### Testing

```bash
npm test
```

### Database Tools

**psql (PostgreSQL CLI)**:
```bash
# Connect to database
psql $DATABASE_URL

# List all tables
\dt

# Describe table structure
\d users

# Run query
SELECT * FROM users;
```

**pgAdmin** (GUI Tool):
- Download from [pgAdmin website](https://www.pgadmin.org/)
- Connect using your DATABASE_URL credentials

## Troubleshooting

### PostgreSQL Connection Issues

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check your `DATABASE_URL` in `.env`
- Verify PostgreSQL is listening on the correct port (default: 5432)
- Check firewall settings

**Problem**: `error: password authentication failed`

**Solution**:
- Verify username and password in DATABASE_URL
- Check PostgreSQL `pg_hba.conf` authentication settings
- Reset password: `ALTER USER username WITH PASSWORD 'newpassword';`

### Migration Issues

**Problem**: `relation "users" already exists`

**Solution**:
- Tables already exist from a previous migration
- To reset: Drop all tables and run migration again
  ```sql
  DROP TABLE IF EXISTS devices CASCADE;
  DROP TABLE IF EXISTS containers CASCADE;
  DROP TABLE IF EXISTS sites CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```
- Then run `npm run migrate` again

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
- Change the `PORT` in `.env` to another value (e.g., 3001)
- Or kill the process using port 3000:
  ```bash
  # Find the process
  lsof -i :3000
  
  # Kill it
  kill -9 <PID>
  ```

### JWT Token Issues

**Problem**: `401 Unauthorized` or `Invalid token`

**Solution**:
- Ensure you're including the token in the Authorization header: `Bearer <token>`
- Check that the token hasn't expired (default: 7 days)
- Verify `JWT_SECRET` matches between environments
- Token format: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### TypeScript Compilation Errors

**Problem**: Build fails with TypeScript errors

**Solution**:
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` for configuration issues
- Clear the `dist` folder and rebuild: `rm -rf dist && npm run build`

### UUID Issues

**Problem**: `invalid input syntax for type uuid`

**Solution**:
- Ensure you're using valid UUIDs in foreign key fields
- PostgreSQL UUIDs are in format: `550e8400-e29b-41d4-a716-446655440000`
- Use the `id` values returned from create operations

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production` in `.env`
2. Use a strong, unique `JWT_SECRET` (generate with `openssl rand -base64 32`)
3. Configure proper `CORS_ORIGIN` (your frontend URL)
4. Use a managed PostgreSQL instance (Render, AWS RDS, Azure, etc.)
5. Enable HTTPS/SSL for database connection
6. Set up connection pooling (already configured in database.ts)

### PostgreSQL Production Settings

```env
# Production database with SSL
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# Connection pool settings (already optimized in code)
# Default: 10 max connections
# SSL: Enabled with rejectUnauthorized=false for Render.com
```

### Security Checklist

- [ ] Change default JWT_SECRET to a strong random string
- [ ] Enable HTTPS/SSL for all connections
- [ ] Configure proper CORS origins (not `*` in production)
- [ ] Set up rate limiting (already configured)
- [ ] Enable PostgreSQL SSL mode (`?sslmode=require`)
- [ ] Use environment variables for all secrets
- [ ] Enable database backups (automatic on managed services)
- [ ] Set up connection pooling limits
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Enable logging and monitoring
- [ ] Use prepared statements (already implemented)
- [ ] Implement database connection retry logic

### Database Backups

**Manual Backup**:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**Restore from Backup**:
```bash
psql $DATABASE_URL < backup_20240101.sql
```

**Automated Backups**:
- Most cloud providers (Render, AWS RDS) offer automatic backups
- Set up daily backups with 7-30 day retention
- Test restore procedures regularly

### Recommended Hosting Platforms

- **Render.com**: Easy deployment with free PostgreSQL tier (recommended)
- **Heroku**: PostgreSQL add-on available
- **AWS RDS**: Production-grade with Aurora PostgreSQL
- **DigitalOcean**: Managed PostgreSQL databases
- **Railway**: Modern deployment with PostgreSQL
- **Supabase**: PostgreSQL with additional features

### Performance Optimization

1. **Indexes**: Already created for common queries
2. **Connection Pooling**: Configured in `database.ts`
3. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
4. **Pagination**: Already implemented in all list endpoints
5. **Monitoring**: Use tools like pgAdmin, DataDog, or New Relic

## Migration from MongoDB

If you're migrating existing MongoDB data:

1. **Export MongoDB data**:
   ```bash
   mongoexport --db netops --collection users --out users.json
   mongoexport --db netops --collection sites --out sites.json
   # ... repeat for all collections
   ```

2. **Transform data** (adjust for UUID and schema differences)
3. **Import to PostgreSQL** using custom migration script
4. **Verify data integrity**
5. **Update application** (already done - using PostgreSQL models)

## Additional Resources

- [API Documentation](./API.md)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Database Schema

### Tables

1. **users** - Authentication and user management
   - id (UUID, PK)
   - username, email (unique)
   - password (hashed with bcrypt)
   - role (admin/user)
   - created_at, updated_at

2. **sites** - Physical locations
   - id (UUID, PK)
   - name, location, address, description
   - status (active/inactive)
   - created_at, updated_at

3. **containers** - Equipment containers
   - id (UUID, PK)
   - name, type (rack/cabinet/closet/room/other)
   - site_id (FK → sites)
   - location, capacity
   - status (active/inactive)
   - created_at, updated_at

4. **devices** - Network devices
   - id (UUID, PK)
   - name, type (switch/router/firewall/server/access-point/other)
   - manufacturer, model, serial_number
   - ip_address, mac_address
   - container_id (FK → containers)
   - status (active/inactive/maintenance)
   - notes
   - created_at, updated_at

### Relationships

- Sites → Containers (1:many)
- Containers → Devices (1:many)
- CASCADE delete enabled (deleting site removes containers and devices)

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review [API Documentation](./API.md)
- Open an issue on the GitHub repository
- Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`


- [API Documentation](./API.md)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Support

For issues and questions, please open an issue on the GitHub repository.
