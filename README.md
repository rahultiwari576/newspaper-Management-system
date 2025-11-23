# Newspaper Management System

A complete newspaper management system built with **Node.js/Express** (backend) and **React with Vite.js** (frontend), using **SQLite** as the database.

## Features

- ✅ **Customer Management** - Add, edit, delete customers
- ✅ **Paper Management** - Manage newspapers (Daily/Weekly) with pricing
- ✅ **Area/Route Management** - Organize customers by areas
- ✅ **Delivery Boy Management** - Assign delivery boys to areas
- ✅ **Subscription Management** - Assign papers to customers
- ✅ **Billing System** - Auto-calculate monthly bills based on paper prices and days
- ✅ **Payment Tracking** - Record payments and update bill status
- ✅ **Reporting** - Generate reports per customer, area, and delivery boy
- ✅ **Dashboard** - Overview with key statistics

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Vite.js
- **Database**: SQLite (using sql.js - pure JavaScript, no native compilation)
- **API**: RESTful API

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run migrations:**
   ```bash
   npm run migrate
   ```

3. **Seed database (optional):**
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode (Recommended)

Run both server and client together:
```bash
npm run dev
```

This will start:
- **Backend server** on `http://localhost:3000`
- **Vite dev server** on `http://localhost:5173`

Then open your browser to: **http://localhost:5173**

### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

   Then open: **http://localhost:3000**

## Project Structure

```
├── server/
│   ├── index.js              # Express server
│   ├── routes/               # API routes
│   │   ├── api.js
│   │   ├── papers.js
│   │   ├── areas.js
│   │   ├── customers.js
│   │   ├── bills.js
│   │   ├── payments.js
│   │   └── ...
│   └── database/
│       ├── db.js             # Database connection
│       ├── migrate.js        # Database migrations
│       └── seed.js           # Database seeding
├── resources/js/             # React frontend
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Main app component
│   ├── components/           # React components
│   ├── pages/                # Page components
│   └── utils/
│       └── api.js            # API client
├── database/
│   └── database.sqlite       # SQLite database file
└── package.json
```

## API Endpoints

All API endpoints are prefixed with `/api`:

- `GET /api/papers` - List all papers
- `POST /api/papers` - Create paper
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/bills` - List bills
- `POST /api/bills` - Generate bill
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/reports/customer` - Customer report
- And more...

## Billing Formula

**For Daily Papers:**
```
Amount = Days × Paper Price
```

**For Weekly Papers:**
```
Amount = ceil(Days / 7) × Paper Price
```

**Total Bill:**
```
Total = Sum of all subscription amounts
Due = Total - Paid
```

## Scripts

- `npm run dev` - Start both server and client in development
- `npm run server` - Start only the backend server
- `npm run client` - Start only the Vite dev server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run build` - Build frontend for production
- `npm start` - Start production server

## Database

The database file is located at: `database/database.sqlite`

It's created automatically when you run migrations. No additional setup needed!

## Troubleshooting

**Port already in use:**
- Backend uses port 3000
- Frontend uses port 5173
- Change ports in `server/index.js` and `vite.config.js` if needed

**Database errors:**
- Make sure migrations ran: `npm run migrate`
- Check that `database/database.sqlite` exists

**API connection errors:**
- Ensure backend server is running on port 3000
- Check `resources/js/utils/api.js` has correct baseURL

## License

MIT
