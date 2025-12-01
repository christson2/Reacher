# FreeMart Quick Reference Card

## 🚀 Start the Application

```bash
# Terminal 1: Start Backend
cd backend
npm start
# Listens on http://localhost:4000

# Terminal 2: (Optional) - Check Status
curl http://localhost:4000/api/ping
# Response: {"ok": true, "time": ...}
```

## 📱 Access Points

| Page | URL | Purpose |
|------|-----|---------|
| Login | http://localhost:4000/pages/login.html | User authentication |
| Signup | http://localhost:4000/pages/signup.html | New user registration |
| Profile Selector | http://localhost:4000/pages/profile-selector.html | Select role (Consumer/Seller/Provider) |
| API Tests | http://localhost:4000/test-api.html | Test all API endpoints |

## 👤 Test Accounts

```
Account 1 - Consumer
  Phone: +254712345001
  Password: password
  Role: Consumer

Account 2 - Seller
  Phone: +254712345002
  Password: password
  Role: Seller (primary)

Account 3 - Provider
  Phone: +254712345003
  Password: password
  Role: Service Provider (primary)
```

## 🔑 Key Endpoints

### Auth
```
POST /api/auth/login
POST /api/auth/signup
```

### Profiles (Protected)
```
GET /api/profiles/me/current          # Current profile
GET /api/profiles/me/all              # All user profiles
POST /api/profiles/switch-mode        # Switch role
GET /api/profiles/me/completion-status
GET /api/profiles/nearby              # Nearby users
```

### Products
```
GET /api/products                     # All products
GET /api/products/seller/:id          # By seller
```

### Services
```
GET /api/services                     # All services
GET /api/services/provider/:id        # By provider
```

### Reviews
```
GET /api/reviews                      # All reviews
GET /api/reviews/:user_id             # For specific user
```

## 📊 Database

```bash
# View SQLite database
cd backend
sqlite3 freemart.db

# Common queries
sqlite> SELECT * FROM users;
sqlite> SELECT * FROM products;
sqlite> SELECT * FROM services;
sqlite> SELECT * FROM profiles;
sqlite> .quit
```

## 🧪 Test Workflows

### Workflow 1: Complete User Journey
1. Open: http://localhost:4000/pages/login.html
2. Login with: +254712345001 / password
3. Redirect to profile selector
4. Click "Select Consumer"
5. Redirect to consumer dashboard

### Workflow 2: API Testing
1. Open: http://localhost:4000/test-api.html
2. Click "Run All Tests"
3. View results (17/17 should pass)
4. Check console for detailed logs

### Workflow 3: Manual API Testing
```bash
# Get all products
curl http://localhost:4000/api/products

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254712345001","password":"password"}'

# Get current profile (requires token from login)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/profiles/me/current
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/src/app.js` | Express app setup |
| `backend/src/models/index.js` | Sequelize models |
| `backend/src/controllers/` | Business logic |
| `backend/src/routes/` | API routes |
| `backend/migrations/` | Database schema |
| `backend/seeders/` | Test data |
| `frontend/pages/` | HTML pages |
| `frontend/assets/css/styles.css` | Global styling |
| `.env` | Environment config |
| `freemart.db` | SQLite database |

## 🔧 Common Tasks

### Restart Backend
```bash
# Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Start again
npm start
```

### Reset Database
```bash
npx sequelize db:migrate:undo:all
npx sequelize db:migrate
npx sequelize db:seed:all
```

### View Server Logs
```bash
# Check terminal where `npm start` is running
# Look for:
# - Database connection status
# - Port listening confirmation
# - Migration messages
```

### Check Database Schema
```bash
sqlite3 backend/freemart.db ".schema"
sqlite3 backend/freemart.db ".tables"
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Port 4000 already in use" | Kill process: `taskkill /PID <PID> /F` |
| "Database connection failed" | Check `.env` DB_TYPE=sqlite |
| "Module not found" | Run: `npm install` in backend/ |
| "Token invalid" | Re-login, tokens expire after 7 days |
| "Profile not found" | Create profile with initialize endpoint |

## 📊 Test Results

```
TOTAL TESTS: 17
PASSED: 17 ✅
FAILED: 0
PASS RATE: 100%

Categories:
- Authentication: 3/3 ✅
- Profiles: 4/4 ✅
- Products: 2/2 ✅
- Services: 2/2 ✅
- Reviews: 2/2 ✅
- Error Handling: 3/3 ✅
- Data Validation: 3/3 ✅
```

## 📚 Documentation

- **API-TESTING-GUIDE.md** - Full API documentation
- **TEST-RESULTS.md** - Detailed test results
- **INTEGRATION-SUMMARY.md** - Project overview
- **README.md** - Project setup (if present)

## 🎯 Next Steps

1. ✅ Backend APIs working
2. ✅ Frontend pages created
3. ✅ Authentication integrated
4. ⏳ Dashboard UI refinement
5. ⏳ Real-time features
6. ⏳ Production deployment

## 💡 Tips

- Use browser DevTools Network tab to inspect API calls
- Check localStorage for JWT token: `localStorage.getItem('jwt_token')`
- All seeded products have seller_id: 2
- All seeded services have provider_id: 3
- Geospatial search centered around Nairobi coordinates
- JWT tokens in localStorage last 7 days

---

**Quick Status Check**
```bash
# Everything running?
curl -I http://localhost:4000/pages/login.html
# Should see: HTTP/1.1 200 OK

curl http://localhost:4000/api/products
# Should see: JSON with products array

# Database OK?
sqlite3 backend/freemart.db "SELECT COUNT(*) FROM products;"
# Should show: 3
```

---

**For More Details**: See documentation files in project root
