import fetch from 'node-fetch';
import Settings from '../models/Settings.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function getGeminiApiKey() {
  // Always fetch the latest Gemini API key from settings
  const settings = await Settings.findOne();
  return settings?.integrations?.geminiApiKey || process.env.GEMINI_API_KEY;
}

async function callGemini(messages) {
  const GEMINI_API_KEY = await getGeminiApiKey();
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: messages })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
}

class GeminiService {
  async chatWithAI(message, context = '') {
    const messages = [
      { role: 'user', parts: [{ text: `Context: ${context}\n${message}` }] }
    ];
    return await callGemini(messages);
  }

  async generateTaskFeedback(task, submission) {
    const prompt = `Evaluate this student submission for the task: "${task.title}"
Task Requirements: ${task.requirements?.join('\n') || 'No specific requirements listed'}
Student Submission: ${submission}
Please provide:
1. Overall assessment (score out of 100)
2. What was done well
3. Areas for improvement
4. Specific suggestions for next steps
Be constructive and encouraging while being honest about areas that need work.`;
    const messages = [
      { role: 'user', parts: [{ text: prompt }] }
    ];
    return await callGemini(messages);
  }

  async generateResumeContent(userData) {
    const prompt = `Generate professional resume content for:
Name: ${userData.name}
Career Track: ${userData.careerTrack}
Education: ${userData.education?.degree} from ${userData.education?.school}
Completed Projects: ${(userData.completedProjects || []).map(p => `- ${p.title}: ${p.description}`).join('\n') || 'No projects listed'}
Skills: ${Object.entries(userData.skills || {}).map(([category, skills]) => `${category}: ${Array.isArray(skills) ? skills.join(', ') : skills}`).join('\n')}
Please generate:
1. A compelling professional summary (2-3 sentences)
2. Enhanced project descriptions that highlight achievements
3. Skills organized by relevance to their career track
4. Any additional sections that would strengthen their resume
Make it ATS-friendly and highlight quantifiable achievements where possible.`;
    const messages = [
      { role: 'user', parts: [{ text: prompt }] }
    ];
    return await callGemini(messages);
  }
}

export default new GeminiService(); 