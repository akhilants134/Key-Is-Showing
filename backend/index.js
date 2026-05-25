import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { summarizeNotes } from './services/aiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend from Vite's build folder
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/summarize — receives notes from frontend, returns AI summary.
// This file contains zero API keys and zero direct OpenAI references.
app.post('/api/summarize', async (req, res) => {
  const { notes } = req.body;

  if (!notes || !notes.trim()) {
    return res.status(400).json({ success: false, error: 'Notes are required.' });
  }

  try {
    const summary = await summarizeNotes(notes);
    return res.json({ success: true, data: { summary } });
  } catch (err) {
    console.error('Summarise error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
