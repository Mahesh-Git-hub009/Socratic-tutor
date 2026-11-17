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

const GROQ_MODELS = ['openai/gpt-oss-120b', 'llama-3.1-8b-instant'];
const GEMINI_MODELS = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-2.5-flash'];

async function generateWithGroq(messages, systemInstruction) {
  if (!process.env.GROQ_API_KEY) throw new Error('No GROQ_API_KEY');
  let lastError;
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemInstruction }, ...messages],
          max_tokens: 1500,
        }),
      });
      if (!res.ok) {
        const err = new Error(`Groq ${model} ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (error) {
      lastError = error;
      console.error('Groq error:', error?.message);
    }
  }
  throw lastError || new Error('No Groq response');
}

async function generateWithGemini(contents, systemInstruction) {
  let lastError;
  for (const model of GEMINI_MODELS) {
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

    const history = Array.isArray(messageHistory) ? messageHistory : [];

    const groqMessages = history.slice(-10).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
    if (groqMessages.length === 0) groqMessages.push({ role: 'user', content: 'Hello' });

    const geminiContents =
      history.length > 0
        ? history.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          }))
        : [{ role: 'user', parts: [{ text: 'Hello' }] }];

    let reply;
    try {
      reply = await generateWithGroq(groqMessages, systemInstructionText);
    } catch (groqError) {
      console.error('Groq failed, trying Gemini:', groqError?.message);
      reply = await generateWithGemini(geminiContents, systemInstructionText);
    }

    res.json({ reply });
  } catch (error) {
    const quota = error?.status === 429;
    console.error('All providers failed:', error?.status || error?.message);
    res.status(quota ? 429 : 500).json({ error: quota ? 'quota' : 'failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});