// THROWAWAY DIAGNOSTIC SCRIPT — delete after diagnosis
// Replicates the exact Gemini call from src/app/actions/generate-palette.ts
// but prints the FULL error instead of swallowing it.

import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "node:fs";

// Load key from .env.local
const envContent = readFileSync(".env.local", "utf-8");
const match = envContent.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : null;

console.log("[DEBUG] Key present:", apiKey ? `yes (${apiKey.length} chars)` : "NO");
if (apiKey) {
  console.log("[DEBUG] Key prefix:", apiKey.slice(0, 10) + "...");
  console.log("[DEBUG] Key starts with 'AIza':", apiKey.startsWith("AIza"));
}
if (!apiKey) {
  console.error("[DEBUG] No API key found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

console.log("\n[DEBUG] Calling Gemini API (model: gemini-2.0-flash)...");

try {
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: 'Return ONLY a JSON object with keys primary, secondary, accent, background, surface, each a hex color like "#FF5733". Mood: "warm sunset"' }],
      },
    ],
  });

  console.log("[DEBUG] SUCCESS — response text:");
  console.log(result.response.text());
} catch (err) {
  console.error("\n[DEBUG] === ERROR CAUGHT ===");
  console.error("Name:   ", err?.name);
  console.error("Message:", err?.message);
  if (err?.status) console.error("Status: ", err.status);
  if (typeof err?.toString === "function") console.error("String: ", err.toString());
  // Dump all non-standard enumerable props
  const extra = { ...err };
  if (Object.keys(extra).length) console.error("Props:  ", JSON.stringify(extra, null, 2));
  process.exit(2);
}
