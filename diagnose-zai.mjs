// THROWAWAY DIAGNOSTIC SCRIPT — delete after diagnosis.
// Replicates the Z.AI call from src/app/actions/generate-palette.ts but prints
// the FULL response/error instead of swallowing it. Use to debug key/endpoint/
// auth issues on first run after the provider swap.

import { readFileSync } from "node:fs";

const ZAI_MODEL = "glm-4.7-flash";
const ZAI_CHAT_ENDPOINT = "https://api.z.ai/api/paas/v4/chat/completions";

// Load key from .env.local
const envContent = readFileSync(".env.local", "utf-8");
const match = envContent.match(/ZAI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : null;

console.log("[DEBUG] Key present:", apiKey ? `yes (${apiKey.length} chars)` : "NO");
if (!apiKey) {
  console.error("[DEBUG] No ZAI_API_KEY found in .env.local");
  process.exit(1);
}

const body = {
  model: ZAI_MODEL,
  messages: [
    {
      role: "system",
      content:
        'Return ONLY a JSON object with keys primary, secondary, accent, background, surface, each a hex color like "#FF5733".',
    },
    { role: "user", content: 'Mood: "warm sunset"' },
  ],
  temperature: 0.7,
  max_tokens: 256,
  // glm-4.7-flash reasons by default; disable it (matches production).
  thinking: { type: "disabled" },
};

console.log(`\n[DEBUG] Calling Z.AI (model: ${ZAI_MODEL})...`);

try {
  const res = await fetch(ZAI_CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  console.log("[DEBUG] HTTP status:", res.status, res.statusText);
  const text = await res.text();

  if (!res.ok) {
    console.error("[DEBUG] === NON-OK RESPONSE BODY ===");
    console.error(text);
    process.exit(2);
  }

  console.log("[DEBUG] SUCCESS — response text:");
  console.log(text);
} catch (err) {
  console.error("\n[DEBUG] === ERROR CAUGHT ===");
  console.error("Name:   ", err?.name);
  console.error("Message:", err?.message);
  if (err?.cause) console.error("Cause:  ", err.cause);
  process.exit(3);
}
