import geminiService from '../services/geminiService.js';

// POST /api/ai/chat
export const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await geminiService.chatWithAI(message, context);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 