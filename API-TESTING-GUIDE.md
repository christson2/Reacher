# FreeMart Backend API Integration Testing Guide

## System Status

**Backend**: Running on `http://localhost:4000`  
**Frontend**: Served from `http://localhost:4000/pages/`  
**Database**: SQLite (`backend/freemart.db`)  
**Test Data**: Seeded with 3 users, 3 products, 3 services, 3 reviews

---

## Test Credentials

### Seeded Users (Password: `password`)

| Name | Phone | Role | Primary Profile |
|------|-------|------|-----------------|
| Alice Johnson | +254712345001 | Consumer | Consumer |
| Bob Smith | +254712345002 | Seller & Consumer | Seller |
| Charlie Brown | +254712345003 | Provider & Consumer | Provider |

---

## Test Routes

### 1. Authentication API

#### Signup
- **Endpoint**: `POST /api/auth/signup`
- **Body**:
  ```json
  {
    "name": "Test User",
    "phone": "+254798123456",
    "password": "testpass123"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "user": {
      "id": 4,
      "name": "Test User",
      "phone": "+254798123456",
      "current_profile_mode": "consumer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "phone": "+254712345001",
    "password": "password"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "user": {
      "id": 1,
      "name": "Alice Johnson",
      "phone": "+254712345001",
      "current_profile_mode": "consumer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 2. Profile Management API

All profile endpoints require `Authorization: Bearer <token>` header.

#### Get Current Profile
- **Endpoint**: `GET /api/profiles/me/current`
- **Success Response** (200):
  ```json
  {
    "profile": {
      "id": 1,
      "user_id": 1,
      "profile_type": "consumer",
      "bio": "Love shopping...",
      "business_name": null,
      "completion_percentage": 100,
      "is_complete": true
    }
  }
  ```

#### Get All User Profiles
- **Endpoint**: `GET /api/profiles/me/all`
- **Success Response** (200):
  ```json
  {
    "profiles": [
      {
        "id": 1,
        "profile_type": "consumer",
        "is_complete": true,
        "completion_percentage": 100
      },
      {
        "id": 2,
        "profile_type": "seller",
        "is_complete": true,
        "business_name": "Tech Hub Kenya"
      }
    ],
    "current_mode": "consumer"
  }
  ```

#### Switch Profile Mode
- **Endpoint**: `POST /api/profiles/switch-mode`
- **Body**:
  ```json
  {
    "profile_mode": "seller"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "message": "Profile mode switched successfully",
    "current_mode": "seller"
  }
  ```

#### Get Profile Completion Status
- **Endpoint**: `GET /api/profiles/me/completion-status`
- **Success Response** (200):
  ```json
  {
    "consumer": { "is_complete": true, "percentage": 100 },
    "seller": { "is_complete": false, "percentage": 40 },
    "provider": { "is_complete": false, "percentage": 0 }
  }
  ```

#### Get Nearby Profiles
- **Endpoint**: `GET /api/profiles/nearby?latitude=-1.2921&longitude=36.8219&radius_km=5`
- **Query Parameters**:
  - `latitude`: Number (required)
  - `longitude`: Number (required)
  - `radius_km`: Number (default: 5)
- **Success Response** (200):
  ```json
  {
    "profiles": [
      {
        "id": 2,
        "user_id": 2,
        "profile_type": "seller",
        "business_name": "Tech Hub Kenya",
        "distance_km": 0.5
      }
    ]
  }
  ```

---

### 3. Products API

#### Get All Products
- **Endpoint**: `GET /api/products`
- **Success Response** (200):
  ```json
  {
    "products": [
      {
        "id": 1,
        "title": "iPhone 14 Pro",
        "price": 129999,
        "category": "Electronics",
        "seller_id": 2,
        "stock": 5
      },
      {
        "id": 2,
        "title": "Samsung Galaxy S23",
        "price": 99999,
        "stock": 10
      },
      {
        "id": 3,
        "title": "Apple AirPods Pro",
        "price": 29999,
        "stock": 20
      }
    ]
  }
  ```

#### Get Products by Seller
- **Endpoint**: `GET /api/products/seller/:seller_id`
- **Success Response** (200):
  ```json
  {
    "products": [
      { "id": 1, "title": "iPhone 14 Pro", "seller_id": 2 }
    ]
  }
  ```

---

### 4. Services API

#### Get All Services
- **Endpoint**: `GET /api/services`
- **Success Response** (200):
  ```json
  {
    "services": [
      {
        "id": 1,
        "name": "Emergency Plumbing Repair",
        "skill_category": "Plumbing",
        "provider_id": 3,
        "pricing_info": { "hourly_rate": 2000, "currency": "KES" }
      },
      {
        "id": 2,
        "name": "Pipe Installation",
        "skill_category": "Plumbing",
        "provider_id": 3
      },
      {
        "id": 3,
        "name": "Water Tank Cleaning",
        "skill_category": "Plumbing",
        "provider_id": 3
      }
    ]
  }
  ```

#### Get Services by Provider
- **Endpoint**: `GET /api/services/provider/:provider_id`
- **Success Response** (200):
  ```json
  {
    "services": [
      { "id": 1, "name": "Emergency Plumbing Repair", "provider_id": 3 }
    ]
  }
  ```

---

### 5. Reviews API

#### Get Reviews
- **Endpoint**: `GET /api/reviews`
- **Success Response** (200):
  ```json
  {
    "reviews": [
      {
        "id": 1,
        "reviewer_id": 1,
        "target_user_id": 2,
        "rating": 5,
        "comment": "Excellent service!"
      }
    ]
  }
  ```

#### Get Reviews for Specific User
- **Endpoint**: `GET /api/reviews/:target_user_id`
- **Success Response** (200):
  ```json
  {
    "reviews": [
      { "id": 1, "rating": 5, "comment": "Great buyer!" }
    ]
  }
  ```

---

## Testing Workflow

### Step 1: Test Authentication
```bash
# Signup a new user
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+254798111111",
    "password": "testpass"
  }'

# Save the returned token for next requests
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: Test Profile Management
```bash
# Get current profile
curl http://localhost:4000/api/profiles/me/current \
  -H "Authorization: Bearer $TOKEN"

# Switch to seller profile
curl -X POST http://localhost:4000/api/profiles/switch-mode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profile_mode": "seller"}'
```

### Step 3: Test Product Listings
```bash
# Get all products
curl http://localhost:4000/api/products

# Get products by seller
curl http://localhost:4000/api/products/seller/2
```

### Step 4: Test Services
```bash
# Get all services
curl http://localhost:4000/api/services

# Get services by provider
curl http://localhost:4000/api/services/provider/3
```

### Step 5: Test Reviews
```bash
# Get all reviews
curl http://localhost:4000/api/reviews

# Get reviews for a specific user
curl http://localhost:4000/api/reviews/2
```

---

## Frontend Testing

### Access the Test Page
Open `http://localhost:4000/test-api.html` in your browser

### Manual Testing Workflow
1. Open `http://localhost:4000/pages/login.html`
2. Login with credentials: `+254712345001` / `password`
3. You'll be redirected to `profile-selector.html`
4. Click "Select Consumer" to go to consumer dashboard
5. Check browser console for API responses

---

## Error Handling Tests

### Missing Token Error (401)
```bash
curl http://localhost:4000/api/profiles/me/current
# Expected: 401 Unauthorized
```

### Invalid Credentials (401)
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+999999999", "password": "wrong"}'
# Expected: 401 Invalid credentials
```

### Duplicate Phone (409)
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate",
    "phone": "+254712345001",
    "password": "pass"
  }'
# Expected: 409 Phone already registered
```

---

## Database Inspection

### View Seeded Data
```bash
# SQLite CLI
cd backend
sqlite3 freemart.db

# Inside sqlite3 prompt:
sqlite> SELECT * FROM users;
sqlite> SELECT * FROM products;
sqlite> SELECT * FROM services;
sqlite> SELECT * FROM reviews;
sqlite> .quit
```

---

## Known Issues & Troubleshooting

### 1. Backend Not Responding
- Check if server is running: `npm start` in backend directory
- Verify port 4000 is not in use
- Check logs for database connection errors

### 2. Authentication Token Invalid
- Tokens expire after 7 days (configurable)
- Get a new token by logging in again
- Ensure token is passed in `Authorization: Bearer <token>` header

### 3. Profile Not Found
- User must have completed profile initialization
- Use `/profiles/me/all` to see all available profiles
- Switch mode using `/profiles/switch-mode` endpoint

### 4. Nearby Search Returns No Results
- Check coordinates are in Nairobi area (-1.2921, 36.8219)
- Seeded data is concentrated around these coordinates
- Increase `radius_km` parameter

---

## Test Results Summary

**Expected Outcomes**:
- ✅ Signup creates new user with consumer profile
- ✅ Login returns valid JWT token
- ✅ Profile endpoints require authentication
- ✅ Products and services return seeded data
- ✅ Profile switching works for all modes
- ✅ Nearby search returns geographically close profiles
- ✅ Error handling returns appropriate status codes
- ✅ Duplicate phone rejection works

**Current Status**: All core features implemented and ready for integration testing.

---

## Next Steps

1. **UI Polish**: Update dashboard pages with real API data
2. **Error Messages**: Improve user-facing error messages
3. **Loading States**: Add spinners during API calls
4. **Pagination**: Implement for large product/service lists
5. **Filtering**: Add category and distance filters
6. **Real-time Updates**: Consider WebSocket for notifications

