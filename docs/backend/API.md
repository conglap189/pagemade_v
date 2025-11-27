# API Documentation

Complete API reference for the PageMaker application.

**Base URL:** `http://localhost:5000`  
**API Version:** v1  
**Authentication:** Session-based (Flask-Login) + Bearer Token support

> ⚠️ **NOTE**: This documentation was created before the 7-layer architecture refactoring.  
> Some field names may be outdated. Please refer to [MODEL_REFERENCE.md](../MODEL_REFERENCE.md) for accurate field names.
> 
> **Known outdated fields**:
> - `username` → Use `email` for authentication
> - `full_name` → Use `name` for display name
> - User model uses `email` (not `username`) and `name` (not `full_name`)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Sites](#sites)
3. [Pages](#pages)
4. [Assets](#assets)
5. [Admin](#admin)
6. [Error Responses](#error-responses)

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /auth/api/register`

**Request Body:**
```json
{
  "username": "string (3-50 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (min 8 chars, required)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "is_admin": false,
    "created_at": "2025-11-17T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Validation error (duplicate username/email, invalid format)

---

### Login

Authenticate user and create session.

**Endpoint:** `POST /auth/api/login`

**Request Body:**
```json
{
  "username": "string (username or email, required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "is_admin": false
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

### Logout

End user session.

**Endpoint:** `POST /auth/api/logout`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Profile

Get current user's profile.

**Endpoint:** `GET /auth/api/profile`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "is_admin": false,
    "created_at": "2025-11-17T10:30:00Z",
    "sites_count": 5
  }
}
```

**Errors:**
- `401` - Not authenticated

---

### Update Profile

Update current user's profile.

**Endpoint:** `PUT /auth/api/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "email": "string (optional)",
  "username": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "newemail@example.com"
  }
}
```

---

### Change Password

Change user's password.

**Endpoint:** `POST /auth/api/change-password`

**Authentication:** Required

**Request Body:**
```json
{
  "current_password": "string (required)",
  "new_password": "string (min 8 chars, required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- `401` - Current password incorrect

---

## Sites

### List User Sites

Get all sites owned by current user.

**Endpoint:** `GET /sites/api/sites`

**Authentication:** Required

**Query Parameters:**
- `page` (integer, default: 1)
- `per_page` (integer, default: 20, max: 100)
- `published_only` (boolean, default: false)

**Response (200 OK):**
```json
{
  "sites": [
    {
      "id": 1,
      "name": "My Portfolio",
      "subdomain": "myportfolio",
      "description": "Personal portfolio website",
      "is_published": true,
      "created_at": "2025-11-17T10:30:00Z",
      "updated_at": "2025-11-17T11:00:00Z",
      "pages_count": 5,
      "url": "https://myportfolio.pagemade.com"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

---

### Get Site

Get site details by ID.

**Endpoint:** `GET /sites/api/sites/:id`

**Authentication:** Required (must be owner)

**Response (200 OK):**
```json
{
  "site": {
    "id": 1,
    "name": "My Portfolio",
    "subdomain": "myportfolio",
    "description": "Personal portfolio website",
    "is_published": true,
    "created_at": "2025-11-17T10:30:00Z",
    "updated_at": "2025-11-17T11:00:00Z",
    "user_id": 1,
    "pages": [
      {
        "id": 1,
        "title": "Home",
        "slug": "home",
        "is_published": true
      }
    ]
  }
}
```

**Errors:**
- `403` - Not owner of site
- `404` - Site not found

---

### Create Site

Create a new site.

**Endpoint:** `POST /sites/api/sites`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (required)",
  "subdomain": "string (3-63 chars, lowercase, alphanumeric + hyphens, required)",
  "description": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "site": {
    "id": 1,
    "name": "My Portfolio",
    "subdomain": "myportfolio",
    "description": "Personal portfolio website",
    "is_published": false,
    "created_at": "2025-11-17T10:30:00Z",
    "user_id": 1
  }
}
```

**Errors:**
- `400` - Validation error (invalid subdomain, duplicate subdomain)

---

### Update Site

Update site details.

**Endpoint:** `PUT /sites/api/sites/:id`

**Authentication:** Required (must be owner)

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "is_published": "boolean (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "site": {
    "id": 1,
    "name": "Updated Name",
    "subdomain": "myportfolio",
    "description": "Updated description",
    "is_published": true
  }
}
```

**Errors:**
- `403` - Not owner of site
- `404` - Site not found

---

### Delete Site

Delete a site and all its pages.

**Endpoint:** `DELETE /sites/api/sites/:id`

**Authentication:** Required (must be owner)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Site deleted successfully"
}
```

**Errors:**
- `403` - Not owner of site
- `404` - Site not found

---

### Check Subdomain Availability

Check if subdomain is available.

**Endpoint:** `GET /sites/api/check-subdomain?subdomain=mysite`

**Query Parameters:**
- `subdomain` (string, required)

**Response (200 OK):**
```json
{
  "available": true,
  "subdomain": "mysite"
}
```

---

## Pages

### List Site Pages

Get all pages for a site.

**Endpoint:** `GET /pages/api/sites/:site_id/pages`

**Authentication:** Required (must be site owner)

**Query Parameters:**
- `published_only` (boolean, default: false)

**Response (200 OK):**
```json
{
  "pages": [
    {
      "id": 1,
      "title": "Home",
      "slug": "home",
      "is_published": true,
      "created_at": "2025-11-17T10:30:00Z",
      "updated_at": "2025-11-17T11:00:00Z",
      "site_id": 1
    }
  ],
  "total": 1
}
```

---

### Get Page

Get page details.

**Endpoint:** `GET /pages/api/pages/:id`

**Authentication:** Required (must be site owner)

**Response (200 OK):**
```json
{
  "page": {
    "id": 1,
    "title": "Home",
    "slug": "home",
    "content": "<h1>Welcome</h1>",
    "meta_title": "Home Page",
    "meta_description": "Welcome to my site",
    "is_published": true,
    "created_at": "2025-11-17T10:30:00Z",
    "updated_at": "2025-11-17T11:00:00Z",
    "site_id": 1,
    "site": {
      "id": 1,
      "name": "My Portfolio",
      "subdomain": "myportfolio"
    }
  }
}
```

**Errors:**
- `403` - Not owner
- `404` - Page not found

---

### Create Page

Create a new page.

**Endpoint:** `POST /pages/api/sites/:site_id/pages`

**Authentication:** Required (must be site owner)

**Request Body:**
```json
{
  "title": "string (required)",
  "slug": "string (lowercase, alphanumeric + hyphens, required)",
  "content": "string (HTML, optional)",
  "meta_title": "string (optional)",
  "meta_description": "string (optional)",
  "template_id": "integer (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "page": {
    "id": 1,
    "title": "About",
    "slug": "about",
    "content": "<h1>About Us</h1>",
    "is_published": false,
    "site_id": 1
  }
}
```

**Errors:**
- `400` - Validation error (invalid slug, duplicate slug)
- `403` - Not site owner
- `404` - Site not found

---

### Update Page

Update page content and metadata.

**Endpoint:** `PUT /pages/api/pages/:id`

**Authentication:** Required (must be site owner)

**Request Body:**
```json
{
  "title": "string (optional)",
  "content": "string (HTML, optional)",
  "meta_title": "string (optional)",
  "meta_description": "string (optional)",
  "is_published": "boolean (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "page": {
    "id": 1,
    "title": "Updated Title",
    "content": "<h1>Updated Content</h1>",
    "is_published": true
  }
}
```

---

### Delete Page

Delete a page.

**Endpoint:** `DELETE /pages/api/pages/:id`

**Authentication:** Required (must be site owner)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Page deleted successfully"
}
```

**Errors:**
- `403` - Not owner
- `404` - Page not found

---

### Save Page from PageMaker

Save page content from GrapesJS editor.

**Endpoint:** `POST /pages/api/pagemaker/save`

**Authentication:** Required

**Request Body:**
```json
{
  "page_id": "integer (required)",
  "html": "string (HTML content, required)",
  "css": "string (CSS styles, optional)",
  "components": "object (GrapesJS components, optional)",
  "styles": "object (GrapesJS styles, optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Page saved successfully",
  "page": {
    "id": 1,
    "title": "Home",
    "updated_at": "2025-11-17T11:00:00Z"
  }
}
```

---

## Assets

### List User Assets

Get all assets owned by current user.

**Endpoint:** `GET /assets/api/assets`

**Authentication:** Required

**Query Parameters:**
- `page` (integer, default: 1)
- `per_page` (integer, default: 50)
- `file_type` (string, optional: 'image', 'video', 'document')
- `site_id` (integer, optional)

**Response (200 OK):**
```json
{
  "assets": [
    {
      "id": 1,
      "filename": "logo-abc123.png",
      "original_filename": "logo.png",
      "file_type": "image",
      "file_size": 45678,
      "file_path": "/uploads/2025/11/logo-abc123.png",
      "url": "https://example.com/uploads/2025/11/logo-abc123.png",
      "created_at": "2025-11-17T10:30:00Z",
      "user_id": 1,
      "site_id": 1
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 50
}
```

---

### Upload Asset

Upload a new file/image.

**Endpoint:** `POST /assets/api/upload`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file, required)
- `site_id` (integer, optional)

**Response (201 Created):**
```json
{
  "success": true,
  "asset": {
    "id": 1,
    "filename": "photo-xyz789.jpg",
    "original_filename": "photo.jpg",
    "file_type": "image",
    "file_size": 123456,
    "url": "https://example.com/uploads/2025/11/photo-xyz789.jpg",
    "created_at": "2025-11-17T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Invalid file type or size
- `413` - File too large (max 10MB)

---

### Delete Asset

Delete an asset file.

**Endpoint:** `DELETE /assets/api/assets/:id`

**Authentication:** Required (must be owner)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

**Errors:**
- `403` - Not owner
- `404` - Asset not found

---

## Admin

### List All Users

Get all users (admin only).

**Endpoint:** `GET /admin/api/users`

**Authentication:** Required (admin only)

**Query Parameters:**
- `page` (integer, default: 1)
- `per_page` (integer, default: 50)

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "is_admin": false,
      "created_at": "2025-11-17T10:30:00Z",
      "sites_count": 5,
      "pages_count": 15
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 50
}
```

**Errors:**
- `403` - Not admin

---

### Get User Details

Get specific user details (admin only).

**Endpoint:** `GET /admin/api/users/:id`

**Authentication:** Required (admin only)

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "is_admin": false,
    "created_at": "2025-11-17T10:30:00Z",
    "sites": [
      {
        "id": 1,
        "name": "My Portfolio",
        "subdomain": "myportfolio",
        "is_published": true
      }
    ],
    "stats": {
      "sites_count": 1,
      "pages_count": 5,
      "assets_count": 10
    }
  }
}
```

---

### Update User

Update user details (admin only).

**Endpoint:** `PUT /admin/api/users/:id`

**Authentication:** Required (admin only)

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "is_admin": "boolean (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "is_admin": true
  }
}
```

---

### Delete User

Delete user and all their data (admin only).

**Endpoint:** `DELETE /admin/api/users/:id`

**Authentication:** Required (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### System Stats

Get system statistics (admin only).

**Endpoint:** `GET /admin/api/stats`

**Authentication:** Required (admin only)

**Response (200 OK):**
```json
{
  "stats": {
    "users_count": 150,
    "sites_count": 450,
    "pages_count": 1200,
    "assets_count": 3500,
    "published_sites": 320,
    "storage_used": "2.5 GB"
  }
}
```

---

## Error Responses

All error responses follow this format:

**Format:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "status_code": 400
}
```

### Common Status Codes

- `400 Bad Request` - Validation error, invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied (not owner, not admin)
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not supported
- `413 Payload Too Large` - File size exceeds limit
- `500 Internal Server Error` - Server error

### Error Examples

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Username must be between 3 and 50 characters",
  "field": "username",
  "status_code": 400
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Invalid username or password",
  "status_code": 401
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "error": "Access denied",
  "message": "You do not have permission to access this resource",
  "status_code": 403
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "error": "Resource not found",
  "message": "Site with ID 123 not found",
  "resource_type": "Site",
  "resource_id": 123,
  "status_code": 404
}
```

---

## Rate Limiting

API rate limiting is applied to prevent abuse:

- **Authenticated requests:** 1000 requests/hour
- **Unauthenticated requests:** 100 requests/hour
- **Upload endpoints:** 50 requests/hour

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1700230400
```

---

## Pagination

List endpoints support pagination via query parameters:

**Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "per_page": 20,
  "total_pages": 8
}
```

---

## CORS

CORS is enabled for the following origins:

- `http://localhost:3000` (Next.js dev)
- `http://localhost:5000` (Flask dev)
- Production domain (configured in environment)

**Allowed Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS  
**Allowed Headers:** Content-Type, Authorization, X-Requested-With  
**Credentials:** Supported

---

## Changelog

### v1.0.0 (2025-11-17)
- Initial API release
- Authentication endpoints
- Sites CRUD
- Pages CRUD
- Assets management
- Admin panel

---

**Last Updated:** November 17, 2025  
**API Version:** 1.0.0
