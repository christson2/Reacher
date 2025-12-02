# Reacher API - Quick Testing Guide

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:4000
✅ Database connected
```

### 2. Test Health Check

```bash
curl http://localhost:4000/api/ping
```

Response: `{ "ok": true }`

---

## 📋 Testing Workflow (Step by Step)

### Step 1: Register User (Consumer)

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "phone": "+254712345678",
    "password": "SecurePassword123",
    "account_type": "consumer",
    "address": "123 Main Street, Nairobi"
  }'
```

**Save the returned `token`** - you'll need it for authenticated endpoints.

Example response:
```json
{
  "user": {
    "id": 1,
    "name": "Alice Johnson",
    "phone": "+254712345678",
    "account_type": "consumer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Store token in terminal variable:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: Register Another User (Provider)

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "phone": "+254700987654",
    "password": "ProviderPass123",
    "account_type": "provider",
    "address": "456 Oak Avenue, Nairobi"
  }'
```

Save the response - note the **provider_id** (should be 2)

### Step 3: Create Appointment

```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 2,
    "service_id": 1,
    "scheduled_time": "2025-11-25T14:00:00Z",
    "duration_minutes": 90,
    "location": "Consumer office",
    "notes": "Need urgent plumbing repair"
  }'
```

Save the returned **appointment_id** (should be 1)

### Step 4: Get Upcoming Appointments

```bash
curl -X GET http://localhost:4000/api/appointments/me/upcoming \
  -H "Authorization: Bearer $TOKEN"
```

Should return the appointment created in Step 3

### Step 5: Confirm Appointment (Provider Action)

```bash
PROVIDER_TOKEN="<provider_jwt_token_from_step_2>"

curl -X PATCH http://localhost:4000/api/appointments/1/confirm \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

Status changes from `pending` to `confirmed`

### Step 6: Mark Appointment Completed

```bash
curl -X PATCH http://localhost:4000/api/appointments/1/complete \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

Status changes to `completed`

### Step 7: Submit Review/Feedback

```bash
curl -X POST http://localhost:4000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": 2,
    "appointment_id": 1,
    "rating": 5,
    "comment": "Excellent service! Very professional and timely.",
    "review_type": "appointment"
  }'
```

### Step 8: Get Provider's Average Rating

```bash
curl http://localhost:4000/api/reviews/rating/2
```

Response:
```json
{
  "user_id": 2,
  "average_rating": 5.0,
  "review_count": 1,
  "reviews": [...]
}
```

---

## 🧪 Testing All User Endpoints

### List All Users
```bash
curl http://localhost:4000/api/users
```

### Get Specific User
```bash
curl http://localhost:4000/api/users/1
```

### Update User Profile
```bash
curl -X PUT http://localhost:4000/api/users/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Updated",
    "address": "789 New Street, Nairobi",
    "latitude": 6.5244,
    "longitude": 3.3792
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:4000/api/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Testing All Appointment Endpoints

### List Consumer's Appointments
```bash
curl "http://localhost:4000/api/appointments/consumer/1?status=pending"
```

### List Provider's Appointments
```bash
curl "http://localhost:4000/api/appointments/provider/2?status=confirmed"
```

### Get Specific Appointment
```bash
curl http://localhost:4000/api/appointments/1
```

### Update Appointment
```bash
curl -X PUT http://localhost:4000/api/appointments/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_time": "2025-11-26T10:00:00Z",
    "notes": "Rescheduled - confirmed for tomorrow"
  }'
```

### Cancel Appointment
```bash
curl -X DELETE http://localhost:4000/api/appointments/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Client emergency"
  }'
```

---

## 🧪 Testing All Review Endpoints

### Get Specific Review
```bash
curl http://localhost:4000/api/reviews/1
```

### Get All Reviews for User
```bash
curl http://localhost:4000/api/reviews/user/2
```

### Get User's Average Rating
```bash
curl http://localhost:4000/api/reviews/rating/2
```

### Get Reviews for Appointment
```bash
curl http://localhost:4000/api/reviews/appointment/1
```

### Get Reviews by Type
```bash
curl http://localhost:4000/api/reviews/type/appointment
```

### Update Review
```bash
curl -X PUT http://localhost:4000/api/reviews/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Very good service"
  }'
```

### Delete Review
```bash
curl -X DELETE http://localhost:4000/api/reviews/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Complete Test Sequence (Copy & Paste All)

```bash
#!/bin/bash

BASE_URL="http://localhost:4000/api"

# 1. Signup Consumer
echo "1. Signing up consumer..."
CONSUMER=$(curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Test",
    "phone": "+254700111111",
    "password": "TestPass123",
    "account_type": "consumer"
  }')
CONSUMER_TOKEN=$(echo $CONSUMER | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Consumer Token: $CONSUMER_TOKEN"

# 2. Signup Provider
echo "2. Signing up provider..."
PROVIDER=$(curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Provider",
    "phone": "+254700222222",
    "password": "TestPass123",
    "account_type": "provider"
  }')
PROVIDER_ID=$(echo $PROVIDER | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
PROVIDER_TOKEN=$(echo $PROVIDER | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Provider ID: $PROVIDER_ID, Token: $PROVIDER_TOKEN"

# 3. Create Appointment
echo "3. Creating appointment..."
APPOINTMENT=$(curl -s -X POST $BASE_URL/appointments \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": '$PROVIDER_ID',
    "service_id": 1,
    "scheduled_time": "2025-11-25T14:00:00Z",
    "duration_minutes": 60,
    "location": "Test location",
    "notes": "Test appointment"
  }')
APPOINTMENT_ID=$(echo $APPOINTMENT | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Appointment ID: $APPOINTMENT_ID"

# 4. Confirm Appointment
echo "4. Confirming appointment..."
curl -s -X PATCH $BASE_URL/appointments/$APPOINTMENT_ID/confirm \
  -H "Authorization: Bearer $PROVIDER_TOKEN"

# 5. Complete Appointment
echo "5. Completing appointment..."
curl -s -X PATCH $BASE_URL/appointments/$APPOINTMENT_ID/complete \
  -H "Authorization: Bearer $PROVIDER_TOKEN"

# 6. Submit Review
echo "6. Submitting review..."
REVIEW=$(curl -s -X POST $BASE_URL/reviews \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": '$PROVIDER_ID',
    "appointment_id": '$APPOINTMENT_ID',
    "rating": 5,
    "comment": "Excellent service!",
    "review_type": "appointment"
  }')
REVIEW_ID=$(echo $REVIEW | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Review ID: $REVIEW_ID"

# 7. Get Provider Rating
echo "7. Getting provider rating..."
curl -s -X GET $BASE_URL/reviews/rating/$PROVIDER_ID | jq .

echo "All tests completed!"
```

---

## ✅ Verification Checklist

- [ ] Health check returns `{ "ok": true }`
- [ ] User signup returns JWT token
- [ ] User login returns JWT token
- [ ] Can get user details without auth
- [ ] Can update only own user profile (auth required)
- [ ] Can create appointment with auth
- [ ] Appointment appears in consumer's upcoming list
- [ ] Provider can confirm appointment
- [ ] Can mark appointment as completed
- [ ] Can submit review/feedback for completed appointment
- [ ] Provider's average rating reflects new review
- [ ] Can get reviews by type (appointment)
- [ ] Cannot update/delete others' reviews
- [ ] Cannot create future appointments in past

---

## 🐛 Troubleshooting

### Error: "Could not connect to database"
- Ensure MySQL is running
- Check `.env` file has correct DB credentials
- Run: `docker-compose up` if using Docker

### Error: "JWT token expired"
- Get new token by logging in again
- Update `$TOKEN` variable with new token

### Error: "Forbidden"
- Ensure you're using correct token for the user
- Consumer and Provider need separate tokens

### Error: "Appointment time must be in the future"
- Use a future datetime in ISO format
- Example: `2025-12-25T10:00:00Z`

### Error: "Rating must be between 1 and 5"
- Only submit ratings 1, 2, 3, 4, or 5
- Ratings are required fields

---

## 📚 Additional Resources

- Full API Docs: `docs/API_DOCUMENTATION.md`
- Implementation Summary: `RESTFUL_API_SUMMARY.md`
- Backend README: `backend/README.md`

---

**Status**: ✅ Ready for testing!

Start server: `npm run dev`  
Run tests: `npm test`  
Check logs: See terminal output for errors
