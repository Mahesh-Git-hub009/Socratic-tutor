import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-2.5-flash'];

async function generateWithFallback(contents, systemInstruction) {
  let lastError;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction },
      });
      if (response.text) return response.text;
    } catch (error) {
      lastError = error;
      console.error(`Gemini error (${model}):`, error?.status);
    }
  }
  throw lastError || new Error('No response from Gemini');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Backend engine is online!' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { language, code, problemStatement, compileError, messageHistory } = req.body;

    const systemInstructionText = `
      You are Sage, an encouraging Socratic coding tutor.
      Your mission is to help the student find bugs and understand concepts on their own.

      CRITICAL GUIDELINES:
      - NEVER give the direct solution or complete fixed code blocks immediately.
      - Guide them step-by-step by asking targeted questions about their logic.
      - Validate their effort and point out what they did correctly first.
      - Only discuss details listed in the context below. Never invent or assume a problem, code, or error.
      - If the code is empty, ask what they're working on and to paste their code. Reply briefly to greetings.
      - Help with any programming language. The selected language is only a default.
      - Keep replies short: 2-4 sentences, ask one question at a time.
      - Use Markdown only when it helps: **bold** for key terms, code blocks for code.

      CURRENT WORKSPACE CONTEXT:
      - Language: ${language || 'not selected'}
      - Student's Current Code:
      ${code && code.trim() ? `\`\`\`${language}\n${code}\n\`\`\`` : '(none pasted yet)'}
      - Explained Problem: ${problemStatement && problemStatement.trim() ? `"${problemStatement}"` : '(none given)'}
      - Terminal/Console Error: ${compileError && compileError.trim() ? `"${compileError}"` : '(none)'}
    `;

    const formattedContents =
      messageHistory && messageHistory.length > 0
        ? messageHistory.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          }))
        : [{ role: 'user', parts: [{ text: 'Hello' }] }];

    const reply = await generateWithFallback(formattedContents, systemInstructionText);
    res.json({ reply });
  } catch (error) {
    const quota = error?.status === 429;
    console.error('Gemini API error:', error?.status || error?.message);
    res.status(quota ? 429 : 500).json({ error: quota ? 'quota' : 'failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});