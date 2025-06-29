import OpenAI from 'openai';

class GPTService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured');
      this.openai = null;
      return;
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generatePersonalizedContent(userProfile, topic) {
    if (!this.openai) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const prompt = `
        Create personalized learning content for a student with the following profile:
        - Career Track: ${userProfile.careerTrack || 'General'}
        - Current Level: ${userProfile.level || 'Beginner'}
        - Interests: ${userProfile.interests?.join(', ') || 'General'}
        
        Topic: ${topic}
        
        Please provide:
        1. A brief explanation suitable for their level
        2. 3 practical examples
        3. Next steps for learning
        
        Keep it engaging and relevant to their career track.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator specializing in technology and career development."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('GPT Service error:', error);
      throw new Error('Failed to generate personalized content');
    }
  }

  async generateTaskFeedback(task, submission) {
    if (!this.openai) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const prompt = `
        Evaluate this student submission for the task: "${task.title}"
        
        Task Requirements:
        ${task.requirements?.join('\n') || 'No specific requirements listed'}
        
        Student Submission:
        ${submission}
        
        Please provide:
        1. Overall assessment (score out of 100)
        2. What was done well
        3. Areas for improvement
        4. Specific suggestions for next steps
        
        Be constructive and encouraging while being honest about areas that need work.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an experienced software development mentor providing constructive feedback to students."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.6
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('GPT Service error:', error);
      throw new Error('Failed to generate task feedback');
    }
  }

  async generateResumeContent(userData) {
    if (!this.openai) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const prompt = `
        Generate professional resume content for:
        
        Name: ${userData.name}
        Career Track: ${userData.careerTrack}
        Education: ${userData.education?.degree} from ${userData.education?.school}
        
        Completed Projects:
        ${userData.completedProjects?.map(p => `- ${p.title}: ${p.description}`).join('\n') || 'No projects listed'}
        
        Skills:
        ${Object.entries(userData.skills || {}).map(([category, skills]) => 
          `${category}: ${Array.isArray(skills) ? skills.join(', ') : skills}`
        ).join('\n')}
        
        Please generate:
        1. A compelling professional summary (2-3 sentences)
        2. Enhanced project descriptions that highlight achievements
        3. Skills organized by relevance to their career track
        4. Any additional sections that would strengthen their resume
        
        Make it ATS-friendly and highlight quantifiable achievements where possible.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional resume writer with expertise in technology careers."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('GPT Service error:', error);
      throw new Error('Failed to generate resume content');
    }
  }

  async chatWithAI(message, context = '') {
    if (!this.openai) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const systemPrompt = `
        You are an AI career mentor helping college students with their professional development. 
        You are knowledgeable, encouraging, and provide practical advice.
        
        ${context ? `Context about the student: ${context}` : ''}
        
        Please provide helpful, encouraging, and actionable advice. Keep responses concise but comprehensive.
        Focus on practical steps they can take to improve their skills and career prospects.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 600,
        temperature: 0.8
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('GPT Service error:', error);
      throw new Error('Failed to process chat message');
    }
  }
}

export default new GPTService();