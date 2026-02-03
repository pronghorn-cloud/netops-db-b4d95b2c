# NetOps API Documentation

Complete API reference for the Network Operations Management System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

**Fields**:
- `username` (string, required): Unique username (3-30 characters)
- `email` (string, required): Valid email address
- `password` (string, required): Password (min 6 characters)
- `role` (string, optional): User role - "user" or "admin" (default: "user")

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Login

Authenticate and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Get Current User

Get authenticated user's information.

**Endpoint**: `GET /api/auth/me`

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-09-01T12:00:00.000Z"
  }
}
```

---

## Site Endpoints

### Get All Sites

Retrieve all network sites.

**Endpoint**: `GET /api/sites`

**Authentication**: Required

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by name or location

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Main Office",
      "location": "New York, NY",
      "address": "123 Main St",
      "description": "Primary office location",
      "status": "active",
      "createdAt": "2023-09-01T12:00:00.000Z",
      "updatedAt": "2023-09-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Site by ID

Retrieve a specific site.

**Endpoint**: `GET /api/sites/:id`

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Main Office",
    "location": "New York, NY",
    "address": "123 Main St",
    "description": "Primary office location",
    "status": "active",
    "containers": [],
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T12:00:00.000Z"
  }
}
```

### Create Site

Create a new network site.

**Endpoint**: `POST /api/sites`

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Main Office",
  "location": "New York, NY",
  "address": "123 Main St",
  "description": "Primary office location",
  "status": "active"
}
```

**Fields**:
- `name` (string, required): Site name
- `location` (string, required): Geographic location
- `address` (string, optional): Physical address
- `description` (string, optional): Site description
- `status` (string, optional): "active" or "inactive" (default: "active")

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Main Office",
    "location": "New York, NY",
    "address": "123 Main St",
    "description": "Primary office location",
    "status": "active",
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T12:00:00.000Z"
  }
}
```

### Update Site

Update an existing site.

**Endpoint**: `PUT /api/sites/:id`

**Authentication**: Required (Admin only)

**Request Body**: (All fields optional)
```json
{
  "name": "Main Office - Updated",
  "location": "New York, NY",
  "address": "456 Updated St",
  "description": "Updated description",
  "status": "inactive"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Main Office - Updated",
    "location": "New York, NY",
    "address": "456 Updated St",
    "description": "Updated description",
    "status": "inactive",
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-02T14:30:00.000Z"
  }
}
```

### Delete Site

Delete a site.

**Endpoint**: `DELETE /api/sites/:id`

**Authentication**: Required (Admin only)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Site deleted successfully"
  }
}
```

---

## Container Endpoints

### Get All Containers

Retrieve all containers.

**Endpoint**: `GET /api/containers`

**Authentication**: Required

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `siteId` (string, optional): Filter by site ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Rack A1",
      "type": "rack",
      "siteId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "location": "Room 101",
      "capacity": 42,
      "status": "active",
      "createdAt": "2023-09-01T12:00:00.000Z"
    }
  ]
}
```

### Get Container by ID

**Endpoint**: `GET /api/containers/:id`

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "name": "Rack A1",
    "type": "rack",
    "siteId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "site": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Main Office",
      "location": "New York, NY"
    },
    "location": "Room 101",
    "capacity": 42,
    "status": "active",
    "devices": [],
    "createdAt": "2023-09-01T12:00:00.000Z"
  }
}
```

### Create Container

**Endpoint**: `POST /api/containers`

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Rack A1",
  "type": "rack",
  "siteId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "location": "Room 101",
  "capacity": 42,
  "status": "active"
}
```

**Fields**:
- `name` (string, required): Container name
- `type` (string, required): Container type (e.g., "rack", "cabinet", "closet")
- `siteId` (string, required): Associated site ID
- `location` (string, optional): Physical location within site
- `capacity` (number, optional): Maximum capacity
- `status` (string, optional): "active" or "inactive"

**Response**: `201 Created`

### Update Container

**Endpoint**: `PUT /api/containers/:id`

**Authentication**: Required (Admin only)

### Delete Container

**Endpoint**: `DELETE /api/containers/:id`

**Authentication**: Required (Admin only)

---

## Device Endpoints

### Get All Devices

Retrieve all network devices.

**Endpoint**: `GET /api/devices`

**Authentication**: Required

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `containerId` (string, optional): Filter by container ID
- `type` (string, optional): Filter by device type
- `status` (string, optional): Filter by status

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Switch-Core-01",
      "type": "switch",
      "manufacturer": "Cisco",
      "model": "Catalyst 9300",
      "serialNumber": "FCW2234A1B2",
      "ipAddress": "192.168.1.1",
      "containerId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "status": "active",
      "createdAt": "2023-09-01T12:00:00.000Z"
    }
  ]
}
```

### Get Device by ID

**Endpoint**: `GET /api/devices/:id`

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "name": "Switch-Core-01",
    "type": "switch",
    "manufacturer": "Cisco",
    "model": "Catalyst 9300",
    "serialNumber": "FCW2234A1B2",
    "ipAddress": "192.168.1.1",
    "macAddress": "00:1A:2B:3C:4D:5E",
    "containerId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "container": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Rack A1",
      "type": "rack"
    },
    "status": "active",
    "notes": "Core distribution switch",
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T12:00:00.000Z"
  }
}
```

### Create Device

**Endpoint**: `POST /api/devices`

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Switch-Core-01",
  "type": "switch",
  "manufacturer": "Cisco",
  "model": "Catalyst 9300",
  "serialNumber": "FCW2234A1B2",
  "ipAddress": "192.168.1.1",
  "macAddress": "00:1A:2B:3C:4D:5E",
  "containerId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "status": "active",
  "notes": "Core distribution switch"
}
```

**Fields**:
- `name` (string, required): Device name
- `type` (string, required): Device type (e.g., "switch", "router", "firewall", "server")
- `manufacturer` (string, optional): Device manufacturer
- `model` (string, optional): Device model
- `serialNumber` (string, optional): Serial number
- `ipAddress` (string, optional): IP address
- `macAddress` (string, optional): MAC address
- `containerId` (string, required): Container ID where device is located
- `status` (string, optional): "active" or "inactive"
- `notes` (string, optional): Additional notes

**Response**: `201 Created`

### Update Device

**Endpoint**: `PUT /api/devices/:id`

**Authentication**: Required (Admin only)

### Delete Device

**Endpoint**: `DELETE /api/devices/:id`

**Authentication**: Required (Admin only)

---

## Error Examples

### Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token."
}
```

### Authorization Error

```json
{
  "success": false,
  "error": "Insufficient permissions. Admin access required."
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Site not found"
}
```

---

## Rate Limiting

API requests are limited to:
- **100 requests per 15 minutes** per IP address

When limit is exceeded:
```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response includes**:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## Filtering and Search

Many endpoints support filtering:

**Example**: Search sites
```
GET /api/sites?search=office&status=active
```

**Example**: Filter devices by type
```
GET /api/devices?type=switch&status=active
```
