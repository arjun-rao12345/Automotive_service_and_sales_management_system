# 🚗 AUTOMOTIVE SERVICE & SALES MANAGEMENT SYSTEM
## Complete Setup & Troubleshooting Guide

---

## ✅ WHAT WAS THE PROBLEM?

The application wasn't working because **the database tables didn't exist**. The `schema.sql` file needed to be imported into MySQL to create all required tables.

### Root Cause
- Database `automotive_service_db` was created ✓
- But tables were NOT imported ✗
- Frontend and Backend were trying to query non-existent tables ✗

### Solution Applied
1. Imported `schema.sql` into the database
2. All 15 tables now created successfully
3. Backend and Frontend now communicating correctly

---

## 🎯 QUICK START (For Future Runs)

### **FASTEST WAY - One Click (Windows)**

1. **First time only** - Set up database:
   ```cmd
   double-click setup-database.bat
   ```

2. **Every time you run** - Start the application:
   ```cmd
   double-click start.bat
   ```

3. **Open browser:**
   ```
   http://localhost:3000
   ```

That's it! ✅

---

## 📋 STEP-BY-STEP SETUP (First Time)

### **Step 1: Prerequisites**

Make sure you have installed:
- ✅ Node.js (v14+) - [Download](https://nodejs.org/)
- ✅ MySQL (v5.7+) - [Download](https://www.mysql.com/downloads/mysql/)

Verify installation:
```cmd
node --version
npm --version
mysql --version
```

---

### **Step 2: Create Database**

```cmd
mysql -u root -p
```

Enter your MySQL root password, then run:

```sql
CREATE DATABASE automotive_service_db;
EXIT;
```

---

### **Step 3: Import Database Schema** ⚠️ IMPORTANT

This creates all the required tables. Run from project root folder:

```cmd
mysql -u root -p automotive_service_db < schema.sql
```

**Or use the batch file (Windows):**
```cmd
double-click setup-database.bat
```

**Verify it worked:**
```cmd
mysql -u root -p -e "USE automotive_service_db; SHOW TABLES;"
```

You should see 15 tables:
```
customer
vehicle
vehicle_model
service_request
service_record
employee
technician
parts
supplier
inventory
invoice
payment
feedback
insurance
warranty
```

If you DON'T see these tables, the schema wasn't imported. Run the import command again.

---

### **Step 4: Configure Backend**

Edit `backend/.env` file with your MySQL credentials:

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

**Important:** Replace `your_actual_password` with your actual MySQL root password.

---

### **Step 5: Install Dependencies**

```cmd
cd backend
npm install
cd ..
```

---

## 🚀 RUNNING THE APPLICATION

### **Option A: One-Click Startup (Recommended)**

```cmd
double-click start.bat
```

Then open **http://localhost:3000** in your browser.

---

### **Option B: Manual Startup (Two Terminals)**

**Terminal 1 - Backend:**
```cmd
cd backend
npm start
```

Wait for:
```
✅ Database connection established successfully
🚀 Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
npx serve -p 3000
```

Wait for:
```
Serving!
- Local: http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

---

### **Option C: Development Mode (Auto-Reload on File Changes)**

**Terminal 1 - Backend with auto-reload:**
```cmd
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
npx serve -p 3000
```

---

## 🔍 VERIFY EVERYTHING IS WORKING

### **Test Backend API**

Open this in browser:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-11-15T...",
  "environment": "development"
}
```

### **Test Frontend Dashboard**

Open this in browser:
```
http://localhost:3000
```

You should see:
- Navigation menu
- Dashboard with statistics
- Ability to navigate to Customers, Vehicles, Services, etc.

### **Test Adding Data**

1. Go to http://localhost:3000/customers.html
2. Click "Add Customer" button
3. Fill in form and submit
4. Data should appear in table

If this works, everything is set up correctly! ✅

---

## ❌ TROUBLESHOOTING

### **Problem: "Cannot GET /" on localhost:3000**

**Cause:** Frontend server not running

**Solution:**
```cmd
cd frontend
npx serve -p 3000
```

---

### **Problem: API calls return 404 or fail**

**Cause:** Backend server not running

**Solution:**
```cmd
cd backend
npm start
```

Check backend terminal shows:
```
✅ Database connection established successfully
```

---

### **Problem: "Database connection failed"**

**Cause:** MySQL not running or credentials wrong

**Solutions:**

1. **Start MySQL:**
   - Windows: Search for "Services" → find MySQL → click "Start"
   - Or: `mysql -u root -p` (should prompt for password)

2. **Check credentials in `backend/.env`:**
   - DB_HOST should be `localhost`
   - DB_USER should match your MySQL user (usually `root`)
   - DB_PASSWORD should match your password
   - DB_NAME should be `automotive_service_db`

3. **Test MySQL connection:**
   ```cmd
   mysql -h localhost -u root -p automotive_service_db -e "SELECT 1;"
   ```

---

### **Problem: "No tables found" or "Unknown table"**

**Cause:** Database schema not imported

**Solution:**

1. **Import schema:**
   ```cmd
   mysql -u root -p automotive_service_db < schema.sql
   ```

2. **Verify tables exist:**
   ```cmd
   mysql -u root -p -e "USE automotive_service_db; SHOW TABLES;"
   ```

3. **If still no tables:** 
   - Delete the database: `DROP DATABASE automotive_service_db;`
   - Recreate it: `CREATE DATABASE automotive_service_db;`
   - Re-import: `mysql -u root -p automotive_service_db < schema.sql`

---

### **Problem: Port 3000 or 5000 already in use**

**Cause:** Another application using the port

**Solution:**

Find process using port:
```cmd
netstat -ano | findstr ":5000"
```

Or change backend port in `backend/.env`:
```env
PORT=5001
```

Then update frontend URL in `frontend/js/api.js`:
```javascript
const API_BASE = 'http://localhost:5001/api';
```

---

### **Problem: Adding/updating data doesn't work**

**Causes & Solutions:**

1. **Check browser console (F12 → Console tab) for errors**
   - Look for red errors
   - Note the error message

2. **Check backend terminal for errors**
   - Look for error logs
   - Backend prints all request logs

3. **Verify data submission:**
   - Open DevTools (F12)
   - Go to Network tab
   - Submit a form
   - Check if API request succeeded (green 200/201 status)
   - Check response body for errors

4. **Common form errors:**
   - Missing required fields
   - Invalid email format
   - Duplicate phone/email
   - Invalid date format

---

### **Problem: Images/CSS not loading**

**Cause:** Frontend server not running properly

**Solution:**
```cmd
cd frontend
npx serve -p 3000 --cors
```

---

## 📊 PROJECT STRUCTURE

```
project-root/
├── backend/                    # Node.js Express API
│   ├── config/
│   │   ├── database.js        # MySQL connection
│   │   └── config.js          # App settings
│   ├── controllers/            # Route handlers
│   ├── services/               # Business logic
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Custom middleware
│   ├── utils/
│   ├── app.js                  # Express setup
│   ├── server.js               # Entry point
│   ├── package.json            # Dependencies
│   └── .env                    # Configuration
├── frontend/                   # HTML/CSS/JavaScript
│   ├── index.html             # Home
│   ├── dashboard.html         # Dashboard
│   ├── customers.html         # Customers
│   ├── vehicles.html          # Vehicles
│   ├── services.html          # Services
│   ├── employees.html         # Employees
│   ├── inventory.html         # Inventory
│   ├── invoices.html          # Invoices
│   ├── feedback.html          # Feedback
│   ├── insurance.html         # Insurance
│   ├── css/
│   │   └── style.css          # Styles
│   └── js/
│       └── api.js             # API client
├── schema.sql                  # Database schema
├── README.md                   # Main documentation
├── start.bat                   # One-click startup
├── setup-database.bat          # Database setup
└── SETUP_GUIDE.md             # This file
```

---

## 🔗 API ENDPOINTS

All endpoints are prefixed with: `http://localhost:5000/api`

### **Customers**
- `GET /customers` - List all customers
- `POST /customers` - Add new customer
- `GET /customers/:id` - Get customer details
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers/search?q=...` - Search customers

### **Vehicles**
- `GET /vehicles` - List all vehicles
- `POST /vehicles` - Add vehicle
- `GET /vehicles/:id` - Get vehicle details
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle
- `GET /vehicles/models/all` - Get vehicle models
- `POST /vehicles/models` - Add vehicle model

### **Services**
- `GET /services` - List service requests
- `POST /services` - Create service request
- `GET /services/:id` - Get service details
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service
- `POST /services/records` - Create service record
- `PUT /services/records/:id` - Update service record

### **Other Endpoints**
- **Employees:** `/employees`, `/employees/technicians`
- **Inventory:** `/inventory`, `/inventory/parts`, `/inventory/suppliers`
- **Invoices:** `/invoices`, `/invoices/payments`
- **Feedback:** `/feedback`
- **Insurance:** `/insurance`
- **Dashboard:** `/dashboard/stats`, `/dashboard/activity`, `/dashboard/charts/*`

---

## 💡 DEVELOPMENT TIPS

### **Enable Request Logging**
Backend logs all requests in development mode. Check backend terminal.

### **Clear Browser Cache**
```
Ctrl + Shift + Delete
```
Then clear all cached data if pages don't update.

### **Debug API Calls**
Open DevTools: F12 → Network tab
- Make a request/submit a form
- Click on the API request
- Check Headers, Preview, Response tabs

### **Check Backend Logs**
Everything is logged in the backend terminal:
```
[timestamp] - METHOD /api/endpoint
```

### **Database Queries**
Connect to MySQL to debug:
```cmd
mysql -u root -p automotive_service_db
SELECT * FROM customer;
EXIT;
```

---

## 📞 QUICK REFERENCE

### Essential Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start backend |
| `npm run dev` | Start backend with auto-reload |
| `npx serve -p 3000` | Start frontend |
| `mysql -u root -p` | Connect to MySQL |
| `SHOW DATABASES;` | List databases |
| `USE automotive_service_db;` | Select database |
| `SHOW TABLES;` | List tables |
| `DESCRIBE customer;` | Show table structure |

### Batch Files

| File | Purpose |
|------|---------|
| `start.bat` | One-click app startup |
| `setup-database.bat` | Import database schema |

---

## ✨ YOU'RE ALL SET!

Your Automotive Service & Sales Management System is now ready to use!

- ✅ Database set up with all tables
- ✅ Backend API running
- ✅ Frontend web interface ready
- ✅ Can add/edit/delete data
- ✅ Dashboard showing statistics

**Next time:**
Just run `start.bat` and everything starts automatically! 🎉

---

## 📝 NOTES

- Keep both backend and frontend servers running
- Close them with Ctrl+C in terminal
- Backend on port 5000, Frontend on port 3000
- MySQL must be running for backend to work
- All data is persisted in MySQL database
- No login/authentication currently (add if needed)

---

**Happy coding! If you need help, check this guide first.** 🚀
