# Newspaper Management System - Complete Documentation

## Table of Contents
1. [Database Schema](#database-schema)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [API Endpoints](#api-endpoints)
4. [Billing Logic](#billing-logic)
5. [Workflow](#workflow)
6. [Example Data](#example-data)

## Database Schema

### 1. papers
Stores newspaper information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | varchar(255) | NOT NULL | Newspaper name |
| price | decimal(10,2) | NOT NULL | Price per unit |
| type | enum | NOT NULL, DEFAULT 'daily' | Type: 'daily' or 'weekly' |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |

### 2. areas
Stores area/route information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | varchar(255) | NOT NULL | Area name |
| code | varchar(50) | UNIQUE, NOT NULL | Area code |
| description | text | NULLABLE | Area description |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |

### 3. delivery_boys
Stores delivery boy information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | varchar(255) | NOT NULL | Delivery boy name |
| phone | varchar(20) | UNIQUE, NOT NULL | Phone number |
| email | varchar(255) | UNIQUE, NULLABLE | Email address |
| address | text | NULLABLE | Address |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |

### 4. customers
Stores customer information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | varchar(255) | NOT NULL | Customer name |
| phone | varchar(20) | UNIQUE, NOT NULL | Phone number |
| email | varchar(255) | UNIQUE, NULLABLE | Email address |
| address | text | NOT NULL | Customer address |
| area_id | bigint | FOREIGN KEY → areas.id | Assigned area |
| delivery_boy_id | bigint | FOREIGN KEY → delivery_boys.id, NULLABLE | Assigned delivery boy |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |

### 5. subscriptions
Stores customer subscriptions to papers.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| customer_id | bigint | FOREIGN KEY → customers.id | Customer reference |
| paper_id | bigint | FOREIGN KEY → papers.id | Paper reference |
| start_date | date | NOT NULL | Subscription start date |
| end_date | date | NULLABLE | Subscription end date (NULL = ongoing) |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |

### 6. bills
Stores billing information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| customer_id | bigint | FOREIGN KEY → customers.id | Customer reference |
| bill_number | varchar(255) | UNIQUE, NOT NULL | Unique bill number |
| bill_date | date | NOT NULL | Bill generation date |
| period_start | date | NOT NULL | Billing period start |
| period_end | date | NOT NULL | Billing period end |
| total_days | integer | NOT NULL | Total days in period |
| subtotal | decimal(10,2) | DEFAULT 0 | Subtotal amount |
| total_amount | decimal(10,2) | DEFAULT 0 | Total bill amount |
| paid_amount | decimal(10,2) | DEFAULT 0 | Total paid amount |
| due_amount | decimal(10,2) | DEFAULT 0 | Due amount |
| status | enum | DEFAULT 'pending' | Status: 'pending', 'partial', 'paid' |
| notes | text | NULLABLE | Additional notes |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |

### 7. bill_items
Stores individual items in a bill.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| bill_id | bigint | FOREIGN KEY → bills.id | Bill reference |
| paper_id | bigint | FOREIGN KEY → papers.id | Paper reference |
| days | integer | NOT NULL | Number of days |
| rate | decimal(10,2) | NOT NULL | Rate per unit |
| amount | decimal(10,2) | NOT NULL | Calculated amount |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |

### 8. payments
Stores payment records.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| customer_id | bigint | FOREIGN KEY → customers.id | Customer reference |
| bill_id | bigint | FOREIGN KEY → bills.id, NULLABLE | Bill reference (if linked) |
| payment_number | varchar(255) | UNIQUE, NOT NULL | Unique payment number |
| payment_date | date | NOT NULL | Payment date |
| amount | decimal(10,2) | NOT NULL | Payment amount |
| payment_method | enum | DEFAULT 'cash' | Method: 'cash', 'bank_transfer', 'cheque', 'online' |
| notes | text | NULLABLE | Additional notes |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |

### 9. area_delivery_boy (Pivot Table)
Many-to-many relationship between areas and delivery boys.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| area_id | bigint | FOREIGN KEY → areas.id | Area reference |
| delivery_boy_id | bigint | FOREIGN KEY → delivery_boys.id | Delivery boy reference |
| created_at | timestamp | | Creation timestamp |
| updated_at | timestamp | | Update timestamp |
| UNIQUE(area_id, delivery_boy_id) | | | Ensures unique pairing |

## Entity Relationship Diagram

```
┌─────────────┐
│   Papers    │
│─────────────│
│ id          │
│ name        │◄─────┐
│ price       │      │
│ type        │      │
│ is_active   │      │
└─────────────┘      │
                     │
┌─────────────┐      │
│Subscriptions│      │
│─────────────│      │
│ id          │      │
│ customer_id │──┐   │
│ paper_id    │──┼───┘
│ start_date  │  │
│ end_date    │  │
│ is_active   │  │
└─────────────┘  │
                 │
┌─────────────┐  │   ┌─────────────┐
│  Customers  │◄─┘   │    Bills    │
│─────────────│      │─────────────│
│ id          │      │ id          │
│ name        │      │ customer_id │──┐
│ phone       │      │ bill_number │  │
│ email       │      │ bill_date   │  │
│ address     │      │ period_start│  │
│ area_id     │──┐   │ period_end  │  │
│ delivery_   │  │   │ total_days  │  │
│   boy_id    │──┼───┤ total_amount│  │
│ is_active   │  │   │ paid_amount │  │
└─────────────┘  │   │ due_amount  │  │
                 │   │ status      │  │
                 │   └─────────────┘  │
                 │                    │
                 │   ┌─────────────┐  │
                 │   │ Bill Items  │  │
                 │   │─────────────│  │
                 │   │ id          │  │
                 │   │ bill_id     │──┘
                 │   │ paper_id    │──┐
                 │   │ days        │  │
                 │   │ rate        │  │
                 │   │ amount      │  │
                 │   └─────────────┘  │
                 │                    │
                 │   ┌─────────────┐  │
                 └──►│  Payments   │  │
                     │─────────────│  │
                     │ id          │  │
                     │ customer_id │──┘
                     │ bill_id     │──┐
                     │ payment_    │  │
                     │   number    │  │
                     │ payment_date│  │
                     │ amount      │  │
                     │ payment_    │  │
                     │   method    │  │
                     └─────────────┘  │
                                      │
┌─────────────┐      ┌─────────────┐ │
│    Areas    │      │Delivery Boys│ │
│─────────────│      │─────────────│ │
│ id          │      │ id          │ │
│ name        │      │ name        │ │
│ code        │      │ phone       │ │
│ description │      │ email       │ │
│ is_active   │      │ address     │ │
└─────────────┘      │ is_active   │ │
       │             └─────────────┘ │
       │                    │        │
       │                    │        │
       └────────────────────┼────────┘
                            │
                    ┌───────┴───────┐
                    │area_delivery_│
                    │    boy        │
                    │───────────────│
                    │ area_id       │
                    │ delivery_     │
                    │   boy_id      │
                    └───────────────┘
```

## API Endpoints

### Base URL
All API endpoints are prefixed with `/api`

### Papers

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/papers` | List all papers | - |
| POST | `/papers` | Create paper | `{name, price, type, is_active}` |
| GET | `/papers/{id}` | Get paper | - |
| PUT | `/papers/{id}` | Update paper | `{name?, price?, type?, is_active?}` |
| DELETE | `/papers/{id}` | Delete paper | - |

### Areas

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/areas` | List all areas | - |
| POST | `/areas` | Create area | `{name, code, description?, is_active?}` |
| GET | `/areas/{id}` | Get area | - |
| PUT | `/areas/{id}` | Update area | `{name?, code?, description?, is_active?}` |
| DELETE | `/areas/{id}` | Delete area | - |
| POST | `/areas/{id}/assign-delivery-boy` | Assign delivery boy | `{delivery_boy_id}` |

### Delivery Boys

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/delivery-boys` | List all delivery boys | - |
| POST | `/delivery-boys` | Create delivery boy | `{name, phone, email?, address?, is_active?}` |
| GET | `/delivery-boys/{id}` | Get delivery boy | - |
| PUT | `/delivery-boys/{id}` | Update delivery boy | `{name?, phone?, email?, address?, is_active?}` |
| DELETE | `/delivery-boys/{id}` | Delete delivery boy | - |

### Customers

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/customers` | List all customers | - |
| POST | `/customers` | Create customer | `{name, phone, email?, address, area_id, delivery_boy_id?, is_active?}` |
| GET | `/customers/{id}` | Get customer | - |
| PUT | `/customers/{id}` | Update customer | `{name?, phone?, email?, address?, area_id?, delivery_boy_id?, is_active?}` |
| DELETE | `/customers/{id}` | Delete customer | - |

### Subscriptions

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/subscriptions` | List all subscriptions | - |
| POST | `/subscriptions` | Create subscription | `{customer_id, paper_id, start_date, end_date?, is_active?}` |
| GET | `/subscriptions/{id}` | Get subscription | - |
| PUT | `/subscriptions/{id}` | Update subscription | `{customer_id?, paper_id?, start_date?, end_date?, is_active?}` |
| DELETE | `/subscriptions/{id}` | Delete subscription | - |

### Bills

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/bills` | List bills | Query: `?customer_id={id}&status={status}` |
| POST | `/bills` | Generate bill | `{customer_id, period_start, period_end, notes?}` |
| GET | `/bills/{id}` | Get bill | - |
| PUT | `/bills/{id}` | Update bill | `{notes?}` |
| DELETE | `/bills/{id}` | Delete bill | - |
| POST | `/bills/generate-monthly` | Generate monthly bills | `{year, month}` |

### Payments

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/payments` | List payments | Query: `?customer_id={id}&bill_id={id}` |
| POST | `/payments` | Create payment | `{customer_id, bill_id?, payment_date, amount, payment_method, notes?}` |
| GET | `/payments/{id}` | Get payment | - |
| PUT | `/payments/{id}` | Update payment | `{payment_date?, amount?, payment_method?, notes?}` |
| DELETE | `/payments/{id}` | Delete payment | - |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard statistics |

### Reports

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/reports/customer` | Customer report | `customer_id, year?, month?` |
| GET | `/reports/area` | Area report | `area_id, year?, month?` |
| GET | `/reports/delivery-boy` | Delivery boy report | `delivery_boy_id, year?, month?` |

## Billing Logic

### Formula

For each active subscription of a customer during the billing period:

1. **Calculate Effective Days:**
   ```
   Effective Start = max(subscription.start_date, period_start)
   Effective End = min(subscription.end_date OR period_end, period_end)
   Days = (Effective End - Effective Start) + 1
   ```

2. **Calculate Amount:**
   - **Daily Papers:** `Amount = Days × Paper.price`
   - **Weekly Papers:** `Amount = ceil(Days / 7) × Paper.price`

3. **Total Bill:**
   ```
   Total Amount = Sum of all subscription amounts
   Due Amount = Total Amount - Paid Amount
   ```

### Example Calculation

**Customer:** John Doe
**Billing Period:** January 1-31, 2024 (31 days)

**Active Subscriptions:**
1. The Times (Daily, ₹5/day) - Started: Dec 15, 2023 (ongoing)
2. Weekly Magazine (Weekly, ₹25/week) - Started: Jan 10, 2024 (ongoing)

**Calculation:**

1. **The Times:**
   - Effective Start: Jan 1, 2024
   - Effective End: Jan 31, 2024
   - Days: 31
   - Amount: 31 × ₹5 = ₹155

2. **Weekly Magazine:**
   - Effective Start: Jan 10, 2024
   - Effective End: Jan 31, 2024
   - Days: 22
   - Weeks: ceil(22/7) = 4 weeks
   - Amount: 4 × ₹25 = ₹100

**Total Bill:** ₹155 + ₹100 = ₹255

## Workflow

### 1. Initial Setup
1. Create Papers (with name, price, type)
2. Create Areas (with name, code)
3. Create Delivery Boys (with name, phone)
4. Assign Delivery Boys to Areas

### 2. Customer Onboarding
1. Create Customer (assign to Area and Delivery Boy)
2. Create Subscriptions (assign Papers to Customer with start date)

### 3. Monthly Billing Process
1. **Option A - Manual:** Generate bill for specific customer
   - Select customer
   - Set period (start and end dates)
   - System calculates based on active subscriptions

2. **Option B - Bulk:** Generate monthly bills for all customers
   - Select year and month
   - System generates bills for all active customers

### 4. Payment Processing
1. Record Payment
   - Select customer
   - Optionally link to specific bill
   - Enter amount and payment method
   - System updates bill status automatically

2. Bill Status Updates:
   - **Pending:** No payments made
   - **Partial:** Some payment made (paid_amount > 0, due_amount > 0)
   - **Paid:** Fully paid (due_amount = 0)

### 5. Reporting
1. Select report type (Customer/Area/Delivery Boy)
2. Select entity
3. Filter by year and optionally month
4. View summary and detailed bills/payments

## Example Data

The database seeder creates:

**Papers:**
- The Times (Daily, ₹5.00)
- Daily News (Daily, ₹4.50)
- Morning Herald (Daily, ₹6.00)
- Weekly Magazine (Weekly, ₹25.00)

**Areas:**
- Downtown (DT001)
- Uptown (UT001)
- Suburbs (SB001)

**Delivery Boys:**
- John Doe (1234567890)
- Jane Smith (0987654321)

**Customers:**
- Alice Johnson (Downtown, John Doe)
  - Subscribed to: The Times, Daily News
- Bob Williams (Uptown, Jane Smith)
  - Subscribed to: The Times, Daily News

## Frontend Structure

```
resources/js/
├── app.jsx              # Entry point
├── App.jsx              # Main app component with routes
├── index.css            # Global styles
├── components/
│   ├── Layout.jsx       # Main layout with sidebar
│   ├── CustomerModal.jsx
│   ├── PaperModal.jsx
│   ├── AreaModal.jsx
│   ├── DeliveryBoyModal.jsx
│   ├── BillModal.jsx
│   └── PaymentModal.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Customers.jsx
│   ├── Papers.jsx
│   ├── Areas.jsx
│   ├── DeliveryBoys.jsx
│   ├── Bills.jsx
│   ├── Payments.jsx
│   └── Reports.jsx
└── utils/
    └── api.js           # Axios instance
```

## Production Deployment

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

3. Set environment:
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Configure database connection

4. Run migrations:
   ```bash
   php artisan migrate --force
   ```

