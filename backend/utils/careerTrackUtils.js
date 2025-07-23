import { CAREER_TRACKS } from './constants.js';

/**
 * Normalizes career track values to handle legacy formats (without hyphens)
 * @param {string} track - The career track value to normalize
 * @returns {string} - The normalized career track value
 */
export const normalizeCareerTrack = (track) => {
  if (!track) return track;
  
  // Handle legacy career track values (without hyphens)
  const careerTrackMapping = {
    'fullstack': 'full-stack',
    'aiml': 'ai-ml',
    'uiux': 'ui-ux',
    'datascience': 'data-science'
  };
  
  return careerTrackMapping[track] || track;
};

/**
 * Validates if a career track value is valid
 * @param {string} track - The career track value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidCareerTrack = (track) => {
  if (!track) return false;
  const normalizedTrack = normalizeCareerTrack(track);
  return Object.values(CAREER_TRACKS).includes(normalizedTrack);
};

/**
 * Gets the list of valid career track values
 * @returns {string[]} - Array of valid career track values
 */
export const getValidCareerTracks = () => {
  return Object.values(CAREER_TRACKS);
};

/**
 * Gets the error message for invalid career tracks
 * @returns {string} - Error message with valid options
 */
export const getCareerTrackErrorMessage = () => {
  const validTracks = getValidCareerTracks().join(', ');
  return `Invalid career track. Must be one of: ${validTracks}`;
}; 