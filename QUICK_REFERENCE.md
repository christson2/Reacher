# FreeMart API Quick Reference Card

## 🚀 Start Here

```bash
cd backend
npm run dev
```

Server: `http://localhost:4000`  
API: `http://localhost:4000/api`

---

## 🔐 Authentication

Get JWT token:
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","phone":"+1234","password":"pass"}'
```

Use token:
```bash
curl http://localhost:4000/api/appointments/me/upcoming \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 👥 USERS

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/signup` | POST | ❌ | Register |
| `/auth/login` | POST | ❌ | Login |
| `/users` | GET | ❌ | List |
| `/users/:id` | GET | ❌ | Get |
| `/users/:id` | PUT | ✅ | Update |
| `/users/:id` | DELETE | ✅ | Delete |

---

## 📅 APPOINTMENTS

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/appointments` | POST | ✅ | Create |
| `/appointments/:id` | GET | ❌ | Get |
| `/appointments/:id` | PUT | ✅ | Update |
| `/appointments/:id` | DELETE | ✅ | Cancel |
| `/appointments/me/upcoming` | GET | ✅ | My upcoming |
| `/appointments/me/past` | GET | ✅ | My past |
| `/appointments/:id/confirm` | PATCH | ✅ | Confirm |
| `/appointments/:id/complete` | PATCH | ✅ | Complete |
| `/appointments/consumer/:id` | GET | ❌ | Consumer's |
| `/appointments/provider/:id` | GET | ❌ | Provider's |

---

## ⭐ REVIEWS

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/reviews` | POST | ✅ | Create |
| `/reviews/:id` | GET | ❌ | Get |
| `/reviews/:id` | PUT | ✅ | Update |
| `/reviews/:id` | DELETE | ✅ | Delete |
| `/reviews/user/:id` | GET | ❌ | User reviews |
| `/reviews/rating/:id` | GET | ❌ | User rating |
| `/reviews/appointment/:id` | GET | ❌ | Appointment reviews |
| `/reviews/type/:type` | GET | ❌ | By type |

---

## 📝 Create User

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "phone": "+254700000000",
    "password": "Secure123",
    "account_type": "consumer"
  }'
```

---

## 📅 Create Appointment

```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 2,
    "scheduled_time": "2025-11-25T14:00:00Z",
    "location": "123 Main St",
    "notes": "Repair needed"
  }'
```

---

## ⭐ Submit Review

```bash
curl -X POST http://localhost:4000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": 2,
    "appointment_id": 1,
    "rating": 5,
    "comment": "Great service!",
    "review_type": "appointment"
  }'
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | ✅ Success |
| 201 | ✅ Created |
| 400 | ❌ Bad Request |
| 401 | ❌ Unauthorized |
| 403 | ❌ Forbidden |
| 404 | ❌ Not Found |
| 409 | ❌ Conflict |

---

## Appointment Status Flow

```
pending
  ↓
confirmed
  ↓
completed

OR at any point:
  ↓
cancelled
```

---

## Review Fields

- `target_user_id` ✓ required
- `rating` ✓ required (1-5)
- `comment` optional
- `appointment_id` optional
- `review_type` optional (service, appointment, product, general)

---

## Files to Read

1. **TESTING_GUIDE.md** - Step-by-step tests
2. **API_DOCUMENTATION.md** - Full reference
3. **RESTFUL_API_SUMMARY.md** - Architecture
4. **IMPLEMENTATION_COMPLETE.md** - Overview

---

## Common Curl Patterns

Get with auth:
```bash
curl -H "Authorization: Bearer $TOKEN" http://...
```

Post JSON:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"key":"value"}' http://...
```

Update:
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"updated":"field"}' http://...
```

Delete:
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://...
```

---

## Tips

- Save JWT token in variable: `TOKEN="..."`
- Test endpoints with Postman for GUI
- Check `backend/README.md` for troubleshooting
- All responses are JSON
- Timestamps are ISO 8601 format

---

**Last Updated**: November 16, 2025  
**Status**: ✅ Production Ready
