// Utility for generating placeholder images for portfolio projects
export const getPlaceholderImage = (width: number, height: number, text?: string): string => {
  const baseUrl = 'https://via.placeholder.com';
  const size = `${width}x${height}`;
  const bgColor = 'f0f0f0';
  const textColor = '666666';
  const displayText = text || `${width}x${height}`;
  
  return `${baseUrl}/${size}/${bgColor}/${textColor}?text=${encodeURIComponent(displayText)}`;
};

// Alternative placeholder service using Picsum for more realistic images
export const getRandomImage = (width: number, height: number, seed?: number): string => {
  const baseUrl = 'https://picsum.photos';
  const size = `${width}/${height}`;
  const seedParam = seed ? `?random=${seed}` : '';
  
  return `${baseUrl}/${size}${seedParam}`;
};

// Project-specific placeholder images
export const getProjectImage = (projectId: string, width: number = 400, height: number = 300): string => {
  // Use consistent seeds for the same project ID to get the same image
  const seed = projectId.charCodeAt(0) + projectId.charCodeAt(1);
  return getRandomImage(width, height, seed);
};
