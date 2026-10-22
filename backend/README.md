# DeliverX API Backend

Laravel 12 REST API for the DeliverX React + Vite frontend. Lives in `/backend` and is independent of frontend code.

## Requirements

- PHP 8.2+
- Composer
- MySQL (XAMPP) with database `deliverx_backend`

## Setup

1. Create the MySQL database (phpMyAdmin or CLI):

```sql
CREATE DATABASE deliverx_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Copy environment file and adjust credentials if needed:

```bash
cp .env.example .env
php artisan key:generate
```

3. Update `.env` database settings:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=deliverx_backend
DB_USERNAME=root
DB_PASSWORD=
```

4. Run migrations and seed demo users:

```bash
php artisan migrate --seed
```

5. Start the API server:

```bash
php artisan serve
```

API base URL: `http://localhost:8000/api/v1`

## Demo accounts (password: `password`)

| Role    | Email                 |
|---------|-----------------------|
| Admin   | admin@deliverx.com    |
| Sender  | sender@deliverx.com   |
| Courier | courier@deliverx.com  |

## Authentication

Uses **Laravel Sanctum** bearer tokens. Send `Authorization: Bearer {token}` on protected routes.

### Public

| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | `/api/v1/health`      | Health check       |
| POST   | `/api/v1/auth/register` | Register (sender/courier only) |
| POST   | `/api/v1/auth/login`  | Login, returns token |

### Authenticated (`auth:sanctum`)

| Method | Endpoint              | Description |
|--------|-----------------------|-------------|
| GET    | `/api/v1/auth/me`       | Current user |
| POST   | `/api/v1/auth/logout`   | Revoke token |

### Role-protected dashboards

| Role    | Prefix                    | Example |
|---------|---------------------------|---------|
| Admin   | `/api/v1/admin/*`         | `GET /api/v1/admin/dashboard` |
| Sender  | `/api/v1/sender/*`        | `GET /api/v1/sender/dashboard` |
| Courier | `/api/v1/courier/*`       | `GET /api/v1/courier/dashboard` |

Middleware: `role:admin`, `role:sender`, `role:courier`.

## Frontend integration

Point your React app to the API (no frontend files were changed in this setup):

```
VITE_API_URL=http://localhost:8000/api/v1
```

CORS allows `http://localhost:5173` by default (`FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` in `.env`).

## Project structure

```
app/
  Enums/UserRole.php          # admin | sender | courier
  Http/
    Controllers/Api/          # Auth + role dashboards
    Middleware/EnsureUserHasRole.php
    Requests/Auth/
    Resources/UserResource.php
routes/api.php                # Versioned REST routes
database/seeders/UserSeeder.php
```

Add deliveries, users, and notifications under `app/Http/Controllers/Api/{Admin,Sender,Courier}/` as you wire the frontend to the API.
