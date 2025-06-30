import express from 'express';
import { chatWithAI, generateTaskFeedback, generateResumeContent } from '../controllers/gptController.js';

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/feedback', generateTaskFeedback);
router.post('/resume', generateResumeContent);

export default router; 