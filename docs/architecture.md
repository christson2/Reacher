# Architecture (summary)

FreeMart architecture (MVP):

- Frontend: static HTML/CSS/JS served by the backend. Later can be replaced by SPA (React).
- Backend: Node.js + Express API, Sequelize ORM, MySQL (with spatial extensions recommended later).
- Media: local uploads for dev, S3-compatible storage for production.
- Background workers: Redis + BullMQ for video processing and notifications.
- AI: External AI provider (OpenAI or similar) for request analysis; the backend provides an `aiService` to orchestrate.
- USSD: Provider webhook integration (e.g., Africa's Talking / Twilio) to support non-smartphone flows.

This doc is a brief summary; expand with diagrams and infra notes.
