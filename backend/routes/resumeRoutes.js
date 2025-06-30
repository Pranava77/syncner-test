import express from 'express';
import { getResume, upsertResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Resume templates data
const resumeTemplatesData = [
  {
    careerTrack: 'fullstack',
    sections: ['personalInfo', 'summary', 'skills', 'projects', 'certifications', 'education'],
    template: 'professional'
  },
  {
    careerTrack: 'ai-ml',
    sections: ['personalInfo', 'summary', 'skills', 'projects', 'certifications', 'education'],
    template: 'professional'
  },
  {
    careerTrack: 'ui-ux',
    sections: ['personalInfo', 'summary', 'skills', 'projects', 'certifications', 'education'],
    template: 'creative'
  },
  {
    careerTrack: 'data-science',
    sections: ['personalInfo', 'summary', 'skills', 'projects', 'certifications', 'education'],
    template: 'professional'
  }
];

// Get the authenticated user's resume
router.get('/', protect, getResume);

// Create or update the authenticated user's resume
router.post('/', protect, upsertResume);

// Get resume template for a given career track
router.get('/templates', (req, res) => {
  const { track } = req.query;
  const template = resumeTemplatesData.find(t => t.careerTrack === track);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  res.json({ success: true, data: template });
});

export default router; 