# AI Pipeline (placeholder)

This document will describe the AI workflow for request creation:
- Ingest: text, images, and short videos
- Preprocessing: image resizing, video thumbnails, text cleaning
- Analysis: run classification to detect problem category, extract entities
- Draft generation: generate suggested title and description using OpenAI or similar
- Clarification: ask user follow-up questions for missing details
- Finalize: present final draft to user for posting

Implement as a backend service `services/aiService.js` that calls external models or local models.
