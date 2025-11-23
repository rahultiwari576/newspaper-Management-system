# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### Step 2: Setup Environment (1 minute)

```bash
# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

### Step 3: Create Database (30 seconds)

```bash
# Windows PowerShell
New-Item -ItemType File -Path database\database.sqlite

# Linux/Mac
touch database/database.sqlite
```

### Step 4: Run Migrations (30 seconds)

```bash
php artisan migrate
```

### Step 5: Seed Sample Data (Optional - 30 seconds)

```bash
php artisan db:seed
```

### Step 6: Start Servers (1 minute)

**Open Terminal 1:**
```bash
php artisan serve
```

**Open Terminal 2:**
```bash
npm run dev
```

### Step 7: Open Browser

Navigate to: **http://localhost:8000**

## ✅ Verification Checklist

After setup, verify:

- [ ] Dashboard loads with statistics
- [ ] Can view customers list
- [ ] Can add a new customer
- [ ] Can view papers list
- [ ] Can add a new paper
- [ ] Can generate a bill
- [ ] Can record a payment
- [ ] Can view reports

## 🎯 First Actions

1. **Add a Paper:**
   - Go to Papers → Add Paper
   - Name: "Daily Express"
   - Price: 5.00
   - Type: Daily

2. **Add an Area:**
   - Go to Areas → Add Area
   - Name: "Central"
   - Code: "CENT001"

3. **Add a Delivery Boy:**
   - Go to Delivery Boys → Add Delivery Boy
   - Name: "John Doe"
   - Phone: "1234567890"

4. **Add a Customer:**
   - Go to Customers → Add Customer
   - Fill in details
   - Assign to Area and Delivery Boy

5. **Create Subscription:**
   - (This can be done via API or add a subscription page)
   - Or use the API: `POST /api/subscriptions`

6. **Generate Bill:**
   - Go to Bills → Generate Bill
   - Select customer
   - Set period dates
   - System calculates automatically!

7. **Record Payment:**
   - Go to Payments → Add Payment
   - Select customer and bill
   - Enter amount
   - Bill status updates automatically!

## 🔧 Troubleshooting

**Problem:** "Class not found"
```bash
composer dump-autoload
```

**Problem:** Database not found
- Check `database/database.sqlite` exists
- Check file permissions

**Problem:** Vite not working
- Make sure both servers are running
- Check port 5173 is available
- Try: `npm run dev -- --host`

**Problem:** API returns 404
- Check routes: `php artisan route:list`
- Verify API prefix: `/api/...`

## 📚 Next Steps

- Read `README.md` for full documentation
- Check `DOCUMENTATION.md` for API details
- Review `SETUP.md` for detailed setup
- Explore the codebase structure

## 💡 Tips

- Use browser DevTools to see API calls
- Check Laravel logs: `storage/logs/laravel.log`
- Use `php artisan tinker` to test models
- API endpoints are in `routes/api.php`

## 🎉 You're Ready!

The system is now running. Start managing your newspaper business!

