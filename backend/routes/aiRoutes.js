import express from 'express';
import geminiService from '../services/geminiService.js';
import { chatWithAI } from '../controllers/gptController.js';

const router = express.Router();

router.post('/chat', chatWithAI);

// Health check for AI module
router.get('/health', async (req, res) => {
  try {
    await geminiService.chatWithAI('ping', 'healthcheck');
    res.status(200).json({ success: true, message: 'AI module is healthy (Gemini connected)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI module health check failed', error: error.message });
  }
});

export default router; 