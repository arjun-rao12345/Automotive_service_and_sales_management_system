# Automotive Service & Sales Management System

A full-stack web application for managing automotive service and sales operations with a Node.js/Express backend and HTML/CSS/JavaScript frontend.

## 🚀 QUICK START

**Fastest way to run (Windows):**
```cmd
double-click start.bat
```

Then open: **http://localhost:3000**

For complete documentation, see:
- **Quick Start Guide:** `QUICK_START.md`
- **Full Setup Guide:** `SETUP_GUIDE.md`
- **Troubleshooting:** `SETUP_GUIDE.md#troubleshooting`

---

### 1. Set up the Database

Start MySQL and create the database:

```cmd
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE automotive_service_db;
EXIT;
```

### 2. Import Database Schema

**IMPORTANT:** The database tables must be created before running the application. Import the schema file:

```cmd
cd project-root
mysql -u root -p automotive_service_db < schema.sql
```

**Or use the setup script:**

Double-click `setup-database.bat` in the project root folder (Windows only).

**Verify tables were created:**

```cmd
mysql -u root -p -e "USE automotive_service_db; SHOW TABLES;"
```

You should see 15 tables:
- customer
- vehicle
- vehicle_model
- service_request
- service_record
- employee
- technician
- parts
- supplier
- inventory
- invoice
- payment
- feedback
- insurance
- warranty

### 3. Configure Backend Environment

Edit `backend/.env` and update with your actual MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=automotive_service_db
DB_PORT=3306
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Install Backend Dependencies

```cmd
cd backend
npm install
cd ..
```

## Running the Application

You need to run **two servers** simultaneously:

### Option 1: Manual (Two Terminal Windows)

**Terminal 1 - Start Backend Server:**

```cmd
cd backend
npm start
```

You should see:
```
✅ Database connection established successfully
🚀 Server running on http://localhost:5000 (development)
```

**Terminal 2 - Start Frontend Server:**

```cmd
cd frontend
npx serve -p 3000
```

You should see:
```
Serving!
- Local:    http://localhost:3000
- Network:  http://10.54.77.157:3000
```

### Option 2: Quick Start Batch Script (Windows)

Save this as `start.bat` in your project root and double-click it:

```batch
@echo off
title Automotive Service Management System

REM Start backend in a new window
start cmd /k "cd /d %~dp0\backend && npm start"

REM Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak

REM Start frontend in a new window
start cmd /k "cd /d %~dp0\frontend && npx serve -p 3000"

REM Open browser
timeout /t 3 /nobreak
start http://localhost:3000

echo.
echo ✅ Both servers started!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
```

### Option 3: Development Mode with Auto-Reload

To enable automatic restart on file changes, use `npm run dev` instead of `npm start` in the backend terminal:

```cmd
cd backend
npm run dev
```

## Accessing the Application

Once both servers are running, open your browser and navigate to:

```
http://localhost:3000
```

You'll see the main dashboard with navigation to:
- **Dashboard** - Overview and statistics
- **Customers** - Manage customer information
- **Vehicles** - Track vehicle inventory
- **Services** - Manage service requests
- **Employees** - Employee management
- **Inventory** - Parts and inventory tracking
- **Invoices** - Billing and payments
- **Insurance** - Vehicle insurance records
- **Feedback** - Customer feedback

## Project Structure

```
project-root/
├── backend/
│   ├── config/
│   │   ├── database.js       # MySQL connection
│   │   └── config.js         # App configuration
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   ├── routes/               # API endpoints
│   ├── middleware/           # Custom middleware
│   ├── utils/                # Helper functions
│   ├── app.js                # Express app setup
│   ├── server.js             # Server entry point
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables (CREATE THIS)
├── frontend/
│   ├── index.html            # Home page
│   ├── dashboard.html        # Dashboard
│   ├── customers.html        # Customers page
│   ├── vehicles.html         # Vehicles page
│   ├── services.html         # Services page
│   ├── employees.html        # Employees page
│   ├── inventory.html        # Inventory page
│   ├── invoices.html         # Invoices page
│   ├── feedback.html         # Feedback page
│   ├── insurance.html        # Insurance page
│   ├── css/
│   │   └── style.css         # Global styles
│   └── js/
│       └── api.js            # API client utilities
├── schema.sql                # Database schema
├── start.bat                 # Quick start script (Windows)
└── README.md                 # This file
```

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Available Routes

- **Customers**: `/api/customers`
- **Vehicles**: `/api/vehicles`
- **Services**: `/api/services`
- **Employees**: `/api/employees`
- **Inventory**: `/api/inventory`
- **Invoices**: `/api/invoices`
- **Feedback**: `/api/feedback`
- **Insurance**: `/api/insurance`
- **Dashboard**: `/api/dashboard`

## Troubleshooting

### Frontend won't load

1. Verify frontend server is running on `http://localhost:3000`
2. Check that `frontend/js/api.js` has `API_BASE = 'http://localhost:5000/api'`
3. Open browser DevTools (F12) → Console to check for errors

### Backend won't start

1. Verify MySQL is running:
   ```cmd
   mysql -u root -p -e "SELECT 1;"
   ```
2. Check `.env` file has correct credentials
3. Verify database exists:
   ```cmd
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### API calls failing

1. Check backend logs in the backend terminal
2. Verify both servers are running on correct ports (5000 backend, 3000 frontend)
3. Check browser DevTools Network tab to see API request status

### Port already in use

If port 3000 or 5000 is already in use, change the port in:
- Backend: Edit `backend/.env` and set `PORT=5001`
- Frontend: Change `npx serve -p 5001` to a different port
- Then update `frontend/js/api.js` with the new backend URL

## Stopping the Application

- Close the backend terminal window (or press Ctrl+C)
- Close the frontend terminal window (or press Ctrl+C)

## Development Tips

- Use `npm run dev` in backend for auto-reload on file changes
- Clear browser cache (Ctrl+Shift+Delete) if pages don't update
- Check browser console (F12) for client-side errors
- Check backend terminal for server-side errors

## Technologies Used

- **Backend**: Node.js, Express.js, MySQL2
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: MySQL
- **DevTools**: Nodemon, dotenv, cors, express-validator

---

**Happy coding! 🚀**
