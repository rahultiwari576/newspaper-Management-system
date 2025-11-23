# Newspaper Management System

A complete newspaper management system built with Laravel (backend) and React with Vite.js (frontend), using SQLite as the database.

## Features

- **Customer Management**: Add, edit, and manage customers
- **Paper Management**: Manage newspapers with pricing (Daily/Weekly)
- **Area/Route Management**: Organize customers by areas
- **Delivery Boy Management**: Assign delivery boys to areas
- **Subscription Management**: Assign newspapers to customers
- **Billing System**: Auto-calculate monthly bills based on paper prices and number of days
- **Payment Tracking**: Record and track payments against bills
- **Reporting**: Generate reports per customer, area, and delivery boy
- **Dashboard**: Overview with key statistics

## Tech Stack

- **Backend**: Laravel 10
- **Frontend**: React 18 with Vite.js
- **Database**: SQLite
- **API**: RESTful API

## Installation

1. **Install PHP dependencies:**
   ```bash
   composer install
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

5. **Create SQLite database:**
   ```bash
   touch database/database.sqlite
   ```

6. **Run migrations:**
   ```bash
   php artisan migrate
   ```

7. **Seed database (optional):**
   ```bash
   php artisan db:seed
   ```

## Running the Application

1. **Start Laravel server:**
   ```bash
   php artisan serve
   ```

2. **Start Vite dev server (in another terminal):**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:8000
   - API: http://localhost:8000/api

## Database Schema

### Tables

1. **papers**
   - id, name, price, type (daily/weekly), is_active, timestamps

2. **areas**
   - id, name, code (unique), description, is_active, timestamps

3. **delivery_boys**
   - id, name, phone (unique), email, address, is_active, timestamps

4. **customers**
   - id, name, phone (unique), email, address, area_id, delivery_boy_id, is_active, timestamps

5. **subscriptions**
   - id, customer_id, paper_id, start_date, end_date, is_active, timestamps

6. **bills**
   - id, customer_id, bill_number (unique), bill_date, period_start, period_end, total_days, subtotal, total_amount, paid_amount, due_amount, status (pending/partial/paid), notes, timestamps

7. **bill_items**
   - id, bill_id, paper_id, days, rate, amount, timestamps

8. **payments**
   - id, customer_id, bill_id, payment_number (unique), payment_date, amount, payment_method, notes, timestamps

9. **area_delivery_boy** (pivot table)
   - id, area_id, delivery_boy_id, timestamps

## Entity Relationship Diagram

```
Customers ──┬──> Areas
            ├──> DeliveryBoys
            ├──> Subscriptions ──> Papers
            ├──> Bills ──> BillItems ──> Papers
            └──> Payments ──> Bills

Areas <──> DeliveryBoys (many-to-many)
```

## API Endpoints

### Papers
- `GET /api/papers` - List all papers
- `POST /api/papers` - Create paper
- `GET /api/papers/{id}` - Get paper
- `PUT /api/papers/{id}` - Update paper
- `DELETE /api/papers/{id}` - Delete paper

### Areas
- `GET /api/areas` - List all areas
- `POST /api/areas` - Create area
- `GET /api/areas/{id}` - Get area
- `PUT /api/areas/{id}` - Update area
- `DELETE /api/areas/{id}` - Delete area
- `POST /api/areas/{id}/assign-delivery-boy` - Assign delivery boy to area

### Delivery Boys
- `GET /api/delivery-boys` - List all delivery boys
- `POST /api/delivery-boys` - Create delivery boy
- `GET /api/delivery-boys/{id}` - Get delivery boy
- `PUT /api/delivery-boys/{id}` - Update delivery boy
- `DELETE /api/delivery-boys/{id}` - Delete delivery boy

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Get customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Subscriptions
- `GET /api/subscriptions` - List all subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/{id}` - Get subscription
- `PUT /api/subscriptions/{id}` - Update subscription
- `DELETE /api/subscriptions/{id}` - Delete subscription

### Bills
- `GET /api/bills` - List all bills (supports ?customer_id=, ?status=)
- `POST /api/bills` - Generate bill for customer
- `GET /api/bills/{id}` - Get bill
- `PUT /api/bills/{id}` - Update bill
- `DELETE /api/bills/{id}` - Delete bill
- `POST /api/bills/generate-monthly` - Generate monthly bills for all customers

### Payments
- `GET /api/payments` - List all payments (supports ?customer_id=, ?bill_id=)
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Reports
- `GET /api/reports/customer?customer_id={id}&year={year}&month={month}` - Customer report
- `GET /api/reports/area?area_id={id}&year={year}&month={month}` - Area report
- `GET /api/reports/delivery-boy?delivery_boy_id={id}&year={year}&month={month}` - Delivery boy report

## Billing Logic

### Monthly Bill Calculation Formula

For each active subscription of a customer:

1. **Calculate Effective Days:**
   - Determine the overlap between subscription period and billing period
   - Effective Start = max(subscription_start, period_start)
   - Effective End = min(subscription_end or period_end, period_end)
   - Days = (Effective End - Effective Start) + 1

2. **Calculate Amount:**
   - **Daily Papers**: Amount = Days × Paper Price
   - **Weekly Papers**: Amount = ceil(Days / 7) × Paper Price

3. **Total Bill:**
   - Total Amount = Sum of all subscription amounts
   - Due Amount = Total Amount - Paid Amount

### Example

Customer has:
- The Times (Daily, ₹5/day) - Active for 30 days
- Weekly Magazine (Weekly, ₹25/week) - Active for 4 weeks

Bill for January (31 days):
- The Times: 31 days × ₹5 = ₹155
- Weekly Magazine: ceil(31/7) = 5 weeks × ₹25 = ₹125
- **Total: ₹280**

## Workflow

1. **Setup:**
   - Create Papers (with prices and types)
   - Create Areas
   - Create Delivery Boys
   - Assign Delivery Boys to Areas

2. **Customer Management:**
   - Add Customers (assign to Area and Delivery Boy)
   - Create Subscriptions (assign Papers to Customers)

3. **Billing:**
   - Generate bills manually for specific customers
   - Or generate monthly bills for all customers at once
   - System automatically calculates based on active subscriptions

4. **Payments:**
   - Record payments against bills
   - System updates bill status (pending → partial → paid)
   - Tracks due amounts automatically

5. **Reporting:**
   - Generate reports by customer, area, or delivery boy
   - Filter by year and month
   - View bills and payments summary

## Frontend Pages

- **Dashboard**: Overview statistics and recent activity
- **Customers**: List, add, edit customers
- **Papers**: Manage newspapers
- **Areas**: Manage areas and assign delivery boys
- **Delivery Boys**: Manage delivery personnel
- **Bills**: View and generate bills
- **Payments**: Record and track payments
- **Reports**: Generate detailed reports

## Example Data

The seeder creates:
- 4 Papers (3 daily, 1 weekly)
- 3 Areas
- 2 Delivery Boys
- 2 Customers with subscriptions

## Production Build

```bash
npm run build
```

This will create optimized production assets in `public/build`.

## License

MIT

