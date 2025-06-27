import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. First-time user visit, no message from user, assistant introduces itself
app.get("/api/chatbot", async (req, res) => {
  const introPrompt = `You are a helpful and knowledgeable travel assistant. You introduce yourself politely and explain how you can help with personalized trip suggestions based on budget, location, interests, and travel style.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: introPrompt,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Error fetching response from Gemini" });
  }
});

app.post("/api/chatbot", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Base system prompt to guide the assistant
  let prompt = `You are a helpful and knowledgeable travel assistant. Your response should be helpful, informative, and easy to understand. Only provide information related to traveling.\n\n`;

  // If history exists, add it to prompt
  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history) {
      prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    }
  }

  // Add current user message
  prompt += `User: ${message}\nAssistant:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Error fetching response from Gemini" });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gemini AI Trip Suggester server running at http://localhost:${PORT}`);
});
