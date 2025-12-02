# Reacher

FreeMart is a **local-first marketplace platform** connecting consumers with nearby product sellers and service providers. Users can search for products/services by location, post AI-assisted requests, receive bids, and manage transactions—all with a single unified account that supports three switchable modes (Consumer, Seller, Service Provider).

## Features

✅ **Unified Account System** — One login, three modes (Consumer, Seller, Provider)  
✅ **GPS-Based Search** — Find nearby sellers and service providers using location  
✅ **AI-Assisted Requests** — Users describe their need; AI suggests title, category, and description  
✅ **Bidding System** — Sellers/providers submit competitive bids on consumer requests  
✅ **Video Content** — Sellers/providers can upload short promotional videos  
✅ **Reviews & Ratings** — Build trust through community feedback  
✅ **USSD Support** — Non-smartphone users can access via USSD menu  

## Project Structure

```
freemart/
├── frontend/              # Static HTML/CSS/JS pages & assets
├── backend/               # Node.js/Express REST API
├── db/                    # Database schema & ERD
├── docs/                  # Architecture & API documentation
├── scripts/               # Setup & deployment scripts
├── docker-compose.yml     # MySQL + Adminer + Backend containers
└── README.md              # This file
```

## Quick Start

### Prerequisites
- Node.js v16+
- MySQL 8.0+
- Docker & Docker Compose (optional, for containerized DB)

### Setup

1. **Run the setup script** (from repo root):
```powershell
.\scripts\setup.ps1
```

Or **manually**:

2. **Install backend dependencies**:
```bash
cd backend
npm install
```

3. **Create `.env` file**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

4. **Start MySQL** (requires Docker):
```bash
docker-compose up -d
```

5. **Run migrations and seed data**:
```bash
cd backend
npm run migrate
npm run seed
```

6. **Start the server**:
```bash
npm run dev    # Development with auto-reload
```

Server runs at **http://localhost:4000**

## API Overview

All endpoints are under `/api/`. Protected endpoints require `Authorization: Bearer <JWT_TOKEN>` header.

| Resource | Methods | Auth |
|----------|---------|------|
| `/auth/signup`, `/auth/login` | POST | No |
| `/users`, `/profiles` | GET, POST, PUT, DELETE | Varies |
| `/products` | GET (search), POST, PUT, DELETE | Varies |
| `/services` | GET (nearby), POST, PUT, DELETE | Varies |
| `/requests` | GET (nearby), POST, PUT, DELETE | Varies |
| `/bids` | GET, POST, PUT, DELETE | Varies |
| `/videos` | GET, POST, PUT, DELETE | Varies |
| `/reviews` | GET, POST, PUT, DELETE | Varies |

See **`backend/README.md`** for detailed API docs and examples.

## Technology Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js, Sequelize ORM |
| Database | MySQL 8.0 |
| Auth | JWT (JSON Web Tokens) |
| File Upload | Multer (local storage, S3-ready) |
| Testing | Jest, Supertest |
| Containerization | Docker & Docker Compose |

## Database Schema

Key tables: `users`, `profiles`, `products`, `services`, `requests`, `bids`, `videos`, `reviews`.  
See `db/schema.sql` and migrations in `backend/migrations/` for full details.

## Development

### Running Tests
```bash
cd backend
npm test
```

### Running Migrations
```bash
cd backend
npm run migrate      # Run all pending migrations
npm run seed         # Seed initial data
```

### Linting
```bash
cd backend
npm run lint
```

## Deployment

### Using Docker Compose
```bash
docker-compose up --build -d
```

### Environment Variables (Production)
Set these before deploying:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (use a strong, random value)
- `NODE_ENV=production`
- `MEDIA_STORAGE=s3` (if using AWS S3)

## Documentation

- **`backend/README.md`** — Backend setup, API endpoints, authentication
- **`docs/architecture.md`** — System architecture diagram and component overview
- **`docs/openapi.yaml`** — OpenAPI 3.0 specification (API schema)
- **`docs/ai_pipeline.md`** — AI request analysis workflow
- **`docs/ussd_flow.md`** — USSD menu flow for non-smartphone users

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `npm test`
4. Commit: `git commit -am "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

## License

MIT

## Support

For issues, questions, or feedback, please open an issue on GitHub or contact the development team.

---

**Status**: MVP in development (Scaffolded Nov 2025)

