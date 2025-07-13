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

// POST /api/ai/feedback
export const generateTaskFeedback = async (req, res) => {
  try {
    const { task, submission } = req.body;
    const response = await geminiService.generateTaskFeedback(task, submission);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/resume
export const generateResumeContent = async (req, res) => {
  try {
    const { userData } = req.body;
    const response = await geminiService.generateResumeContent(userData);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 