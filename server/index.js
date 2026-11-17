import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Backend engine is online!' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { language, code, problemStatement, compileError, messageHistory } = req.body;

    const systemInstructionText = `
      You are Sage, an elite, deeply encouraging Socratic coding tutor.
      Your mission is to help the student find bugs and understand concepts on their own.

      CRITICAL GUIDELINES:
      - NEVER give the direct solution or complete fixed code blocks immediately.
      - Guide them step-by-step by asking targeted questions about their logic.
      - Validate their effort and point out what they did correctly first.
      - Only discuss details listed in the context below. Never invent or assume a problem, code, or error.
      - If the code is empty, ask what they're working on and to paste their code. Reply briefly to greetings.
      - Keep replies short: 2-4 sentences, ask one question at a time.
      - Use Markdown only when it helps: **bold** for key terms, code blocks for code.

      CURRENT WORKSPACE SANDBOX CONTEXT:
      - Language: ${language || 'not selected'}
      - Student's Current Code:
      ${code && code.trim() ? `\`\`\`${language}\n${code}\n\`\`\`` : '(none pasted yet)'}
      - Explained Problem: ${problemStatement && problemStatement.trim() ? `"${problemStatement}"` : '(none given)'}
      - Terminal/Console Error Dump: ${compileError && compileError.trim() ? `"${compileError}"` : '(none)'}
    `;

    let formattedContents = [];

    if (messageHistory && messageHistory.length > 0) {
      formattedContents = messageHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));
    } else {
      formattedContents = [{ role: 'user', parts: [{ text: 'Hello' }] }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: { systemInstruction: systemInstructionText },
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Gemini API Pipeline Error:', error);
    res.status(500).json({ error: 'Failed to compile AI assistant context response.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running live on port ${PORT}`);
});