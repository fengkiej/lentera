import express from "express";
import { OpenAI } from "openai";

const router = express.Router();

// Inisialisasi OpenAI SDK dengan konfigurasi Ollama dari environment variables
const openai = new OpenAI({
  baseURL: `${process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434"}/v1`,
  apiKey: process.env.OLLAMA_API_KEY || "ollama",
});

router.post("/generate-text", async (req, res) => {
  const { prompt, model = process.env.OLLAMA_MODEL || "llama3.2" } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    res.json({ generatedText: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Error generating text with Ollama:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

export default router;
