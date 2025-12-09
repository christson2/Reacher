# Reacher MVP - Quick Start Guide

## 🚀 Start in 5 Minutes

### Local Development Setup

#### 1. Clone & Install
```bash
git clone https://github.com/christson2/Reacher-MVP.git
cd Reacher-MVP
npm install
```

#### 2. Start Backend Services
```bash
# Terminal 1 - Auth Service (5001)
cd backend/auth-service && npm start

# Terminal 2 - User Service (5002)
cd backend/user-service && npm start

# Terminal 3 - Product Service (5003)
cd backend/product-service && npm start

# Terminal 4 - Provider Service (5004)
cd backend/provider-service && npm start

# Terminal 5 - Trust Service (5005)
cd backend/trust-service && npm start

# Terminal 6 - Message Service (5006)
cd backend/message-service && npm start

# Terminal 7 - Notification Service (5007)
cd backend/notification-service && npm start

# Terminal 8 - Gateway (5000)
cd gateway && npm start
```

#### 3. Start Frontend
```bash
# Terminal 9 - Next.js Frontend (3000)
cd frontend && npm run dev
```

#### 4. Test Services
```bash
# Health check
curl http://localhost:5001/health
curl http://localhost:5002/health
curl http://localhost:5003/health

# Signup test
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

#### 5. Access Application
- **Frontend**: http://localhost:3000
- **Auth**: http://localhost:5001/health
- **Gateway**: http://localhost:5000/health

---

## 📱 Frontend Pages

- **Signup**: http://localhost:3000/auth/signup
- **Login**: http://localhost:3000/auth/login
- **Products**: http://localhost:3000/products
- **Create Product**: http://localhost:3000/products/create

---

## 🗄️ Database

### SQLite (Local Development)
```bash
# Access database
sqlite3 backend/db/reacher.sqlite

# View tables
.tables

# Query users
SELECT * FROM users;
```

### PostgreSQL (Supabase Production)
See `docs/SUPABASE_SETUP.md` for setup instructions

---

## 🔑 Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update with your values:
```bash
# For local SQLite development, minimal config:
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

---

## 📊 API Endpoints

### Authentication (5001)
```bash
POST   /auth/signup         # Register user
POST   /auth/login          # Login user
POST   /auth/verify         # Verify token
GET    /health              # Health check
```

### Users (5002)
```bash
GET    /users               # List users
GET    /users/:id           # Get user
POST   /users               # Create profile
PUT    /users/:id           # Update profile
DELETE /users/:id           # Delete account
```

### Products (5003)
```bash
GET    /products            # List/search products
GET    /products/:id        # Get product detail
POST   /products            # Create product
PUT    /products/:id        # Update product
DELETE /products/:id        # Delete product
```

### Providers (5004)
```bash
GET    /providers           # List providers
GET    /providers/:id       # Get provider
POST   /providers           # Create provider
PUT    /providers/:id       # Update provider
DELETE /providers/:id       # Delete provider
```

### Trust (5005)
```bash
GET    /trust/:user_id      # Get trust score
POST   /trust/:user_id      # Create review
PUT    /trust/review/:id    # Update review
DELETE /trust/review/:id    # Delete review
```

### Messages (5006)
```bash
GET    /messages            # List conversations
GET    /messages/:user_id   # Get thread
POST   /messages            # Send message
DELETE /messages/:id        # Delete message
```

### Notifications (5007)
```bash
GET    /notifications       # List notifications
POST   /notifications       # Create notification
PUT    /notifications/:id   # Mark as read
DELETE /notifications/:id   # Delete notification
```

---

## 🧪 Test Sample Flow

### 1. Sign Up
```bash
curl -X POST http://localhost:5001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "Test123!@#",
    "name": "John Seller"
  }'
# Response: { user_id, email, token }
```

### 2. Create Product
```bash
TOKEN="your_token_here"

curl -X POST http://localhost:5003/products \
  -H "Content-Type: application/json" \
  -H "x-user-id: your_user_id" \
  -H "x-user-email: seller@example.com" \
  -d '{
    "title": "iPhone 13",
    "description": "Mint condition",
    "price": 500,
    "category": "electronics"
  }'
```

### 3. Search Products
```bash
curl "http://localhost:5003/products?category=electronics&limit=10"
```

### 4. Create Review
```bash
curl -X POST http://localhost:5005/trust/user_id_being_reviewed \
  -H "Content-Type: application/json" \
  -H "x-user-id: reviewer_user_id" \
  -d '{
    "rating": 5,
    "comment": "Great seller!"
  }'
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on specific port
lsof -i :5001
kill -9 <PID>

# Or change port
export PORT=5008 && npm start
```

### Database Connection Error
```bash
# Check SQLite file exists
ls -la backend/db/reacher.sqlite

# Or create manually
mkdir -p backend/db
touch backend/db/reacher.sqlite
```

### JWT Errors
```bash
# Generate new JWT secret
openssl rand -base64 32

# Update .env
JWT_SECRET=your_new_secret
```

### CORS Errors
- Check Gateway is running (port 5000)
- Verify `Access-Control-Allow-Origin` headers
- Ensure frontend calls through Gateway

---

## 📚 Documentation

- **Setup**: See `docs/SUPABASE_SETUP.md`
- **Migration**: See `docs/MIGRATION_GUIDE.md`
- **Architecture**: See `docs/architecture.md`
- **Completion**: See `PROJECT_COMPLETION_SUMMARY.md`

---

## 🚀 Deploy to Production

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend:**
```bash
npm install -g vercel
vercel --prod
```

**Backend Services:**
- Create Railway project
- Connect GitHub repo
- Set environment variables
- Deploy

### Option 2: Supabase + Docker

1. Setup Supabase (see `docs/SUPABASE_SETUP.md`)
2. Containerize services (Docker)
3. Deploy to Cloud Run, ECS, or Kubernetes

### Option 3: Self-hosted Docker Compose

```bash
docker-compose up -d
```

---

## 📞 Support

- GitHub Issues: https://github.com/christson2/Reacher-MVP/issues
- Documentation: `/docs` folder
- Examples: `/backend` services have inline comments

---

## ✅ Checklist

- [ ] Services started (all 7 running)
- [ ] Frontend accessible at :3000
- [ ] Can signup and login
- [ ] Can create products
- [ ] Database working (check with sqlite3)
- [ ] API Gateway routing requests
- [ ] No errors in console

---

## 🎉 You're Ready!

The Reacher MVP is fully functional. Start building features on top of this foundation!

**Next Steps:**
1. Customize frontend UI
2. Add business logic
3. Implement payments (Stripe)
4. Setup real-time features (WebSockets)
5. Deploy to production

---

**Happy Coding! 🚀**
