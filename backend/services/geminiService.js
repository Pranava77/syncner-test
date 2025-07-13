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
}

export default new GeminiService(); 