# FreeMart RESTful API Documentation

## Overview

This document provides comprehensive documentation for the FreeMart platform RESTful APIs, covering:
- **Users Management** (Authentication, Profile CRUD)
- **Appointments** (Scheduling, Management)
- **Feedback & Reviews** (Ratings, Comments)

---

## Base URL

```
http://localhost:4000/api
```

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Obtain JWT Token

**POST** `/auth/signup` - Register new user
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "password": "SecurePass123!",
    "address": "123 Main St",
    "latitude": 6.5244,
    "longitude": 3.3792
  }'
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "phone": "+1234567890",
    "account_type": "consumer",
    "address": "123 Main St",
    "latitude": 6.5244,
    "longitude": 3.3792
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## API ENDPOINTS

### 1. USERS

#### 1.1 Authentication

**POST** `/auth/signup` - Register new user
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phone": "+254712345678",
    "password": "SecurePassword",
    "account_type": "provider",
    "address": "456 Oak Ave"
  }'
```

**POST** `/auth/login` - Login user
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "password": "SecurePassword"
  }'
```

Response:
```json
{
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "phone": "+254712345678",
    "account_type": "provider"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 1.2 User Management

**GET** `/users` - List all users
```bash
curl -X GET http://localhost:4000/api/users
```

**GET** `/users/:id` - Get user by ID
```bash
curl -X GET http://localhost:4000/api/users/1
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "phone": "+1234567890",
    "account_type": "consumer",
    "address": "123 Main St",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "created_at": "2025-11-16T10:30:00Z",
    "updated_at": "2025-11-16T10:30:00Z"
  }
}
```

**PUT** `/users/:id` - Update user (authentication required)
```bash
curl -X PUT http://localhost:4000/api/users/1 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "address": "789 New Road",
    "latitude": 6.5300,
    "longitude": 3.3800
  }'
```

**DELETE** `/users/:id` - Soft delete user (authentication required)
```bash
curl -X DELETE http://localhost:4000/api/users/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### 2. APPOINTMENTS

Appointments connect consumers with service providers for scheduled services.

#### 2.1 Create Appointment

**POST** `/appointments` - Create new appointment (authentication required)

```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": 1,
    "provider_id": 2,
    "scheduled_time": "2025-11-20T14:00:00Z",
    "duration_minutes": 60,
    "location": "123 Main St, Lagos",
    "notes": "Please bring all necessary tools"
  }'
```

Response:
```json
{
  "appointment": {
    "id": 1,
    "service_id": 1,
    "request_id": null,
    "consumer_id": 1,
    "provider_id": 2,
    "scheduled_time": "2025-11-20T14:00:00Z",
    "duration_minutes": 60,
    "status": "pending",
    "location": "123 Main St, Lagos",
    "notes": "Please bring all necessary tools",
    "created_at": "2025-11-16T10:35:00Z",
    "updated_at": "2025-11-16T10:35:00Z"
  }
}
```

#### 2.2 Get Appointment

**GET** `/appointments/:id` - Get appointment details
```bash
curl -X GET http://localhost:4000/api/appointments/1
```

#### 2.3 Update Appointment

**PUT** `/appointments/:id` - Update appointment (authentication required)

```bash
curl -X PUT http://localhost:4000/api/appointments/1 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_time": "2025-11-20T15:00:00Z",
    "notes": "Updated notes",
    "location": "456 Oak Ave, Lagos"
  }'
```

#### 2.4 Delete/Cancel Appointment

**DELETE** `/appointments/:id` - Cancel appointment (authentication required)

```bash
curl -X DELETE http://localhost:4000/api/appointments/1 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Schedule conflict"
  }'
```

#### 2.5 Appointment Status Management

**PATCH** `/appointments/:id/confirm` - Provider confirms appointment
```bash
curl -X PATCH http://localhost:4000/api/appointments/1/confirm \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Status changes from `pending` to `confirmed`

**PATCH** `/appointments/:id/complete` - Mark appointment as completed
```bash
curl -X PATCH http://localhost:4000/api/appointments/1/complete \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Status changes from any active status to `completed`

#### 2.6 List Appointments

**GET** `/appointments/consumer/:consumer_id` - Get appointments for a consumer
```bash
curl -X GET "http://localhost:4000/api/appointments/consumer/1?status=pending"
```

Query parameters:
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled, no_show)

**GET** `/appointments/provider/:provider_id` - Get appointments for a provider
```bash
curl -X GET "http://localhost:4000/api/appointments/provider/2?status=confirmed"
```

**GET** `/appointments/me/upcoming` - Get upcoming appointments for authenticated user (authentication required)
```bash
curl -X GET http://localhost:4000/api/appointments/me/upcoming \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Response:
```json
{
  "appointments": [
    {
      "id": 1,
      "consumer_id": 1,
      "provider_id": 2,
      "scheduled_time": "2025-11-20T14:00:00Z",
      "status": "confirmed",
      "location": "123 Main St, Lagos"
    }
  ]
}
```

**GET** `/appointments/me/past` - Get past appointments for authenticated user (authentication required)
```bash
curl -X GET http://localhost:4000/api/appointments/me/past \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### 3. FEEDBACK & REVIEWS

#### 3.1 Create Review/Feedback

**POST** `/reviews` - Submit a review (authentication required)

```bash
curl -X POST http://localhost:4000/api/reviews \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": 2,
    "appointment_id": 1,
    "rating": 5,
    "comment": "Excellent service! Very professional and on time.",
    "review_type": "appointment"
  }'
```

Required fields:
- `target_user_id` - ID of the user being reviewed
- `rating` - 1-5 star rating (required)
- `comment` - Feedback text (optional)
- `appointment_id` - Link to specific appointment (optional but recommended)
- `review_type` - Type of review: `service`, `appointment`, `product`, `general`

Response:
```json
{
  "review": {
    "id": 1,
    "reviewer_id": 1,
    "target_user_id": 2,
    "appointment_id": 1,
    "rating": 5,
    "comment": "Excellent service! Very professional and on time.",
    "review_type": "appointment",
    "created_at": "2025-11-16T11:00:00Z",
    "updated_at": "2025-11-16T11:00:00Z"
  }
}
```

#### 3.2 Get Review

**GET** `/reviews/:id` - Get review details
```bash
curl -X GET http://localhost:4000/api/reviews/1
```

#### 3.3 Update Review

**PUT** `/reviews/:id` - Update review (authentication required, only reviewer can update)

```bash
curl -X PUT http://localhost:4000/api/reviews/1 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Good service, very professional."
  }'
```

#### 3.4 Delete Review

**DELETE** `/reviews/:id` - Delete review (authentication required, only reviewer can delete)

```bash
curl -X DELETE http://localhost:4000/api/reviews/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 3.5 Get Reviews for User

**GET** `/reviews/user/:user_id` - Get all reviews for a user

```bash
curl -X GET http://localhost:4000/api/reviews/user/2
```

Response:
```json
{
  "reviews": [
    {
      "id": 1,
      "reviewer_id": 1,
      "target_user_id": 2,
      "rating": 5,
      "comment": "Excellent service",
      "review_type": "appointment"
    }
  ]
}
```

#### 3.6 Get User Rating

**GET** `/reviews/rating/:user_id` - Get average rating and statistics for a user

```bash
curl -X GET http://localhost:4000/api/reviews/rating/2
```

Response:
```json
{
  "user_id": 2,
  "average_rating": 4.5,
  "review_count": 10,
  "reviews": [...]
}
```

#### 3.7 Get Reviews for Appointment

**GET** `/reviews/appointment/:appointment_id` - Get all feedback for specific appointment

```bash
curl -X GET http://localhost:4000/api/reviews/appointment/1
```

#### 3.8 Get Reviews by Type

**GET** `/reviews/type/:type` - Filter reviews by type

Types: `service`, `appointment`, `product`, `general`

```bash
curl -X GET http://localhost:4000/api/reviews/type/appointment
```

---

## Appointment Status Flow

```
┌─────────┐
│ Pending │ (Initial state when appointment created)
└────┬────┘
     │
     ├─────────────────────┐
     │                     │
     v                     v
┌─────────────┐       ┌──────────┐
│ Confirmed   │       │ Cancelled│ (Consumer/Provider cancels)
└────┬────────┘       └──────────┘
     │
     v
┌────────────┐
│ Completed  │ (Marked when appointment is done)
└────────────┘
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (authentication required or failed)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., phone already registered)
- `500` - Internal Server Error

Example:
```json
{
  "error": "Rating must be between 1 and 5"
}
```

---

## Rate Limiting & Pagination

(To be implemented in production)

- Rate limiting: 100 requests per minute per IP
- Pagination: Add `limit` and `offset` query parameters for list endpoints

---

## Authentication Flow Example

```bash
# 1. Signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Provider",
    "phone": "+254700000000",
    "password": "SecurePass123",
    "account_type": "provider"
  }' > auth_response.json

# Extract token from response
TOKEN=$(jq -r '.token' auth_response.json)

# 2. Create appointment
curl -X POST http://localhost:4000/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": 1,
    "provider_id": 2,
    "scheduled_time": "2025-11-25T10:00:00Z",
    "location": "Client location"
  }'

# 3. Get upcoming appointments
curl -X GET http://localhost:4000/api/appointments/me/upcoming \
  -H "Authorization: Bearer $TOKEN"

# 4. Complete appointment
curl -X PATCH http://localhost:4000/api/appointments/1/complete \
  -H "Authorization: Bearer $TOKEN"

# 5. Submit feedback
curl -X POST http://localhost:4000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": 2,
    "appointment_id": 1,
    "rating": 5,
    "comment": "Great service!"
  }'
```

---

## Summary

| Resource | Method | Endpoint | Auth | Description |
|----------|--------|----------|------|-------------|
| **Users** | POST | `/auth/signup` | No | Register new user |
| | POST | `/auth/login` | No | Login & get JWT |
| | GET | `/users` | No | List all users |
| | GET | `/users/:id` | No | Get user details |
| | PUT | `/users/:id` | Yes | Update user |
| | DELETE | `/users/:id` | Yes | Soft delete user |
| **Appointments** | POST | `/appointments` | Yes | Create appointment |
| | GET | `/appointments/:id` | No | Get appointment |
| | PUT | `/appointments/:id` | Yes | Update appointment |
| | DELETE | `/appointments/:id` | Yes | Cancel appointment |
| | GET | `/appointments/me/upcoming` | Yes | Get upcoming appointments |
| | GET | `/appointments/me/past` | Yes | Get past appointments |
| | PATCH | `/appointments/:id/confirm` | Yes | Confirm appointment |
| | PATCH | `/appointments/:id/complete` | Yes | Complete appointment |
| **Reviews** | POST | `/reviews` | Yes | Submit review |
| | GET | `/reviews/:id` | No | Get review |
| | PUT | `/reviews/:id` | Yes | Update review |
| | DELETE | `/reviews/:id` | Yes | Delete review |
| | GET | `/reviews/user/:user_id` | No | Get user reviews |
| | GET | `/reviews/rating/:user_id` | No | Get user rating |
| | GET | `/reviews/appointment/:id` | No | Get appointment reviews |
| | GET | `/reviews/type/:type` | No | Filter by review type |

---

## Testing with Postman

1. Import collection: Use the provided Postman collection JSON
2. Set environment variables: `BASE_URL=http://localhost:4000/api`, `TOKEN=<jwt_token>`
3. Run requests in sequence to test workflows
4. Verify responses and status codes

---

## Support & Troubleshooting

- **JWT expired**: Re-login to get new token
- **Phone already registered**: Use different phone number for signup
- **Appointment in past**: Ensure scheduled_time is in future
- **Permission denied**: Ensure you're using correct user ID and token
- **Database connection failed**: Check MySQL is running and credentials in .env are correct

