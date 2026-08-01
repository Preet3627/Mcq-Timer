import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '15mb' }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI OCR Answer Key Parser using Gemini
  app.post('/api/parse-answer-key-image', async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: 'Missing image data' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY environment variable is missing on server.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: mimeType || 'image/png'
              }
            },
            {
              text: 'Extract the answer key from this image for a competitive test (JEE/NEET). Identify every question number and its corresponding option choice (such as A, B, C, D, or numerical value like 4, 12.5). Return a JSON array where each object has "q" (integer question number starting from 1) and "ans" (uppercase string option or numerical string).'
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                q: { type: Type.INTEGER, description: 'Question number' },
                ans: { type: Type.STRING, description: 'Answer option (e.g. A, B, C, D or number)' }
              },
              required: ['q', 'ans']
            }
          }
        }
      });

      const jsonText = response.text ? response.text.trim() : '[]';
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, answers: parsedData });
    } catch (err: any) {
      console.error('Error parsing answer key image:', err);
      return res.status(500).json({
        error: err.message || 'Failed to extract answer key using Gemini AI'
      });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JEE/NEET MCQ Timer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
