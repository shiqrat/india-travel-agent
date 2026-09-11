const express = require("express");
const cors = require("cors");
const axios = require("axios");
const config = require("./config");

const app = express();
app.use(cors());
app.use(express.json());

// ─── IBM IAM Token Cache ──────────────────────────────────────────────────────
let iamTokenCache = { token: null, expiresAt: 0 };

async function getIAMToken() {
  const now = Date.now();
  if (iamTokenCache.token && now < iamTokenCache.expiresAt) {
    return iamTokenCache.token;
  }

  const response = await axios.post(
    "https://iam.cloud.ibm.com/identity/token",
    new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: config.WATSONX_API_KEY,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const { access_token, expires_in } = response.data;
  iamTokenCache = {
    token: access_token,
    expiresAt: now + (expires_in - 60) * 1000, // refresh 60s early
  };
  return access_token;
}

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert India Travel Agent with deep knowledge of all destinations across India.
Your role is to help travelers plan the perfect trip within India.

You provide:
- Detailed travel itineraries for Indian destinations (Rajasthan, Kerala, Goa, Himachal Pradesh, Uttarakhand, Tamil Nadu, Karnataka, Maharashtra, Gujarat, Odisha, Northeast India, Ladakh, Andaman & Nicobar Islands, and more)
- Best time to visit each destination
- Must-see attractions, hidden gems, and local experiences
- Accommodation recommendations (budget, mid-range, luxury)
- Transportation options (trains, flights, buses, road trips)
- Local cuisine highlights and food tips
- Estimated budgets (budget traveler, mid-range, luxury)
- Cultural tips, safety advice, and packing suggestions
- Visa and travel documentation advice for foreign tourists

Always respond in a helpful, warm, and enthusiastic tone. Format responses clearly with headings, bullet points, and emojis where appropriate. Keep answers focused on India travel only. If asked about destinations outside India, politely redirect to Indian travel.`;

// ─── Chat Endpoint ────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const token = await getIAMToken();

    // Build prompt from conversation history
    const conversationText = messages
      .map((m) => {
        if (m.role === "user") return `User: ${m.content}`;
        if (m.role === "assistant") return `Assistant: ${m.content}`;
        return "";
      })
      .filter(Boolean)
      .join("\n");

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${conversationText}\nAssistant:`;

    const watsonxResponse = await axios.post(
      `${config.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: config.WATSONX_MODEL_ID,
        project_id: config.WATSONX_PROJECT_ID,
        input: fullPrompt,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 1024,
          min_new_tokens: 10,
          stop_sequences: ["User:"],
          repetition_penalty: 1.1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generated = watsonxResponse.data.results[0].generated_text.trim();
    res.json({ reply: generated });
  } catch (err) {
    console.error("watsonx error:", err?.response?.data || err.message);
    res.status(500).json({
      error: "Failed to get response from AI",
      details: err?.response?.data || err.message,
    });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "India Travel Agent API" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(config.PORT, () => {
  console.log(`🚀 Travel Agent backend running at http://localhost:${config.PORT}`);
});
