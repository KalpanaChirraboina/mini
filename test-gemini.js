// ✅ Load .env first!
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Get your Gemini key from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("🔑 Loaded GEMINI_API_KEY:", GEMINI_API_KEY ? "Yes" : "No");

// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function run() {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = "Tell me about Rabindranath Tagore.";

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("✅ Gemini API response:");
    console.log(text);

  } catch (err) {
    // The SDK formats errors nicely
    console.error("❌ Gemini test failed:", err);
  }
}

run();