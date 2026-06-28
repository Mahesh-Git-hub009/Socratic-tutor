import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environmental keys
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({
  origin: [
    /https:\/\/socratic-tutor-.*\.vercel\.app$/, // Allows ALL your present and future Vercel deployment URLs automatically
    'http://localhost:5173'                      // For local testing
  ],
  credentials: true
}));

app.use(express.json());

// Initialize the Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Test Connection Route
app.get('/api/health', (req, res) => {
  res.json({ status: "active", message: "Backend engine is online!" });
});

// Main AI Processing Chat Route
app.post('/api/chat', async (req, res) => {
  try {
    const { language, code, problemStatement, compileError, messageHistory } = req.body;

    // Craft a highly structured Socratic system instruction block
    const systemInstructionText = `
      You are Sage, an elite, deeply encouraging Socratic coding tutor. 
      Your mission is to help the student find bugs and understand concepts on their own.
      
      CRITICAL GUIDELINES:
      - NEVER give the direct solution or complete fixed code blocks immediately.
      - Guide them step-by-step by asking targeted questions about their logic.
      - Validate their effort and point out what they did correctly first.
      
      CURRENT WORKSPACE SANDBOX CONTEXT:
      - Language: ${language}
      - Student's Current Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      - Explained Problem: "${problemStatement}"
      - Terminal/Console Error Dump: "${compileError}"
    `;

    // Map your message history to the clean, standardized structural array format
    let formattedContents = [];

    if (messageHistory && messageHistory.length > 0) {
      formattedContents = messageHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
    } else {
      // Fallback if conversation stream starting payload arrives empty
      formattedContents = [{ role: 'user', parts: [{ text: 'Hello Pudding!' }] }];
    }

    // Call the high-performance Gemini Flash model with correctly nested configurations
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstructionText
      }
    });

    // Return the response structure back to the React UI
    res.json({ reply: response.text });

  } catch (error) {
    console.error("🚨 Gemini API Pipeline Error:", error);
    res.status(500).json({ error: "Failed to compile AI assistant context response." });
  }
});

// Start listening for requests
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running live on port ${PORT}`);
});