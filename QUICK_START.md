# ⚡ QUICK COMMAND REFERENCE

## 🚀 RUN THE APP (Fastest Way)

```cmd
double-click start.bat
```

Done! Browser opens automatically. ✅

---

## 🛠️ MANUAL COMMANDS

### Backend
```cmd
cd backend
npm install    # First time only
npm start      # Start server
npm run dev    # Development mode with auto-reload
```

### Frontend
```cmd
cd frontend
npx serve -p 3000
```

### Database
```cmd
# Connect to MySQL
mysql -u root -p

# Import schema
mysql -u root -p automotive_service_db < schema.sql

# Check tables
mysql -u root -p -e "USE automotive_service_db; SHOW TABLES;"
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend config (DB credentials) |
| `frontend/js/api.js` | API base URL |
| `schema.sql` | Database tables |
| `start.bat` | One-click startup |
| `setup-database.bat` | Database setup |

---

## ✔️ CHECKLIST BEFORE RUNNING

- [ ] MySQL is running
- [ ] Database `automotive_service_db` exists
- [ ] `schema.sql` has been imported (15 tables created)
- [ ] `backend/.env` has correct DB password
- [ ] Ports 5000 and 3000 are free
- [ ] Node.js is installed

---

## 🔧 IF SOMETHING BREAKS

1. **Check what's running:**
   ```cmd
   netstat -ano | findstr ":5000"
   netstat -ano | findstr ":3000"
   ```

2. **Kill a process:**
   ```cmd
   taskkill /PID 12345 /F
   ```

3. **Check MySQL:**
   ```cmd
   mysql -u root -p -e "SELECT 1;"
   ```

4. **Check tables exist:**
   ```cmd
   mysql -u root -p -e "USE automotive_service_db; SHOW TABLES;"
   ```

5. **Restart everything:**
   - Close all terminals
   - Run `start.bat` again

---

## 📖 FULL DOCUMENTATION

See `SETUP_GUIDE.md` for complete troubleshooting.
