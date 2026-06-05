# ADR 0001: Gemini API for AI Mood Generation

## Status

Accepted

## Context

Palette creation includes an "AI mood generation" feature: users describe a mood in natural language (e.g., "warm sunset," "cyberpunk Tokyo") and receive a complete 5-color palette. This requires translating free-text creative intent into specific color values.

## Decision

Use Google Gemini API via a Next.js server action. The API key is stored in `.env.local` and never exposed to the client.

## Rationale

- Gemini's free tier is generous enough for MVP usage
- Server action provides a clean API gateway without a separate backend
- Key protection comes for free with Next.js server-only environment variables
- AI generation can serve as a future premium gate (rate limiting, usage tiers)

## Consequences

- Application requires a `GEMINI_API_KEY` environment variable to run AI features
- AI features will silently degrade if the key is missing (graceful fallback, not a crash)
- Future rate limiting or auth can be added to the server action without client changes
- Tied to Google's Gemini API; switching providers requires updating the server action prompt/format only
