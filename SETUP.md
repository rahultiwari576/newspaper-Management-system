# Setup Guide

## Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 16+ and npm
- SQLite (usually comes with PHP)

## Step-by-Step Installation

### 1. Install PHP Dependencies

```bash
composer install
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

The `.env` file is already configured for SQLite. No additional database setup needed!

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Create SQLite Database

Create the database file:

```bash
# On Windows (PowerShell)
New-Item -ItemType File -Path database\database.sqlite

# On Linux/Mac
touch database/database.sqlite
```

### 6. Run Migrations

Create all database tables:

```bash
php artisan migrate
```

### 7. Seed Database (Optional)

Populate with sample data:

```bash
php artisan db:seed
```

This creates:
- 4 sample papers
- 3 sample areas
- 2 sample delivery boys
- 2 sample customers with subscriptions

### 8. Start Development Servers

**Terminal 1 - Laravel Server:**
```bash
php artisan serve
```

**Terminal 2 - Vite Dev Server:**
```bash
npm run dev
```

### 9. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:8000
- **API:** http://localhost:8000/api

## Troubleshooting

### Issue: "Class not found" errors

Run:
```bash
composer dump-autoload
```

### Issue: Database connection errors

1. Make sure `database/database.sqlite` exists
2. Check file permissions (should be writable)
3. Verify `.env` has `DB_CONNECTION=sqlite`

### Issue: Vite not working

1. Make sure both servers are running
2. Check that port 5173 (Vite default) is not in use
3. Try clearing cache: `php artisan cache:clear`

### Issue: React components not loading

1. Make sure `npm install` completed successfully
2. Check browser console for errors
3. Verify `@vitejs/plugin-react` is installed: `npm list @vitejs/plugin-react`

## Production Build

When ready for production:

1. Build frontend assets:
   ```bash
   npm run build
   ```

2. Optimize Laravel:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. Set production environment:
   - Edit `.env`: `APP_ENV=production` and `APP_DEBUG=false`

## Quick Start Checklist

- [ ] `composer install`
- [ ] `npm install`
- [ ] `cp .env.example .env`
- [ ] `php artisan key:generate`
- [ ] Create `database/database.sqlite`
- [ ] `php artisan migrate`
- [ ] `php artisan db:seed` (optional)
- [ ] `php artisan serve` (Terminal 1)
- [ ] `npm run dev` (Terminal 2)
- [ ] Open http://localhost:8000

## Next Steps

1. Log in to the dashboard
2. Explore the sample data (if seeded)
3. Create your own papers, areas, and customers
4. Generate bills and record payments
5. Generate reports to see the system in action

