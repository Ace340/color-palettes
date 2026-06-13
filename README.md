# 🎨 Color Palettes

A modern color palette generator for designers and developers. Create beautiful, accessible palettes using color harmonies, AI mood generation, and image extraction — all in your browser.

## Features

- **Harmony Generation** — Generate 5-color palettes from a base color using 6 harmony modes (complementary, analogous, triadic, split-complementary, tetradic, monochromatic)
- **AI Mood Generation** — Describe a mood like "warm sunset" or "cyberpunk Tokyo" and get a palette powered by Gemini AI
- **Image Extraction** — Upload any image and extract its dominant colors into a palette
- **Live Preview** — See your palette applied to real UI components in real-time
- **Accessibility Checking** — WCAG contrast ratio indicators on key color pairings
- **Export** — Copy as CSS Variables, Tailwind Config, JSON, or share via URL
- **Persistent** — Saves up to 20 palettes in localStorage

## Tech Stack

- **Next.js 15** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Shadcn/ui** + **radix-ui**
- **chroma-js** — Color math & harmony algorithms
- **react-colorful** — Color picker
- **colorthief** — Image color extraction
- **Gemini API** — AI palette generation
- **Vitest** — Testing

## Getting Started
bash
git clone https://github.com/Ace340/color-palettes.git
cd color-palettes
npm install
npm run dev