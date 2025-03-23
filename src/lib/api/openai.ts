/**
 * OpenAI API client for generating t-shirt designs using DALL-E 3
 */
import OpenAI from 'openai';

// Fallback mock designs in case OpenAI API is not configured
const MOCK_DESIGNS = [
  'https://placehold.co/600x600/3d4b94/ffffff?text=AI+Generated+Design',
  'https://placehold.co/600x600/9c27b0/ffffff?text=AI+Generated+Design',
  'https://placehold.co/600x600/f44336/ffffff?text=AI+Generated+Design',
  'https://placehold.co/600x600/4caf50/ffffff?text=AI+Generated+Design',
  'https://placehold.co/600x600/ff9800/ffffff?text=AI+Generated+Design',
];

interface DesignOptions {
  subject: string;
  style: string;
  colorScheme: string;
  elements: string;
  background: string;
}

// Default values for design options
const DEFAULT_OPTIONS: DesignOptions = {
  subject: 'abstract geometric pattern',
  style: 'minimalist',
  colorScheme: 'monochromatic black and white',
  elements: 'shapes and lines',
  background: 'transparent',
};

/**
 * Generate a design based on the provided options
 */
export async function generateDesign(
  prompt: string,
  options?: Partial<DesignOptions>
): Promise<string> {
  // Merge provided options with defaults
  const designOptions: DesignOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  
  // Check if OpenAI API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API key not found. Using mock design.');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const randomIndex = Math.floor(Math.random() * MOCK_DESIGNS.length);
    return MOCK_DESIGNS[randomIndex];
  }
  
  try {
    // Create full prompt using template
    const fullPrompt = prompt || formatDesignPrompt(designOptions);
    
    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });
    
    // Call DALL-E 3 API
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });
    
    // Return generated image URL
    return response.data[0].url as string;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Fallback to mock design
    const randomIndex = Math.floor(Math.random() * MOCK_DESIGNS.length);
    return MOCK_DESIGNS[randomIndex];
  }
}

/**
 * Format design prompt using template and options
 */
export function formatDesignPrompt(options: DesignOptions): string {
  return `Create a high-contrast, visually striking design for a t-shirt featuring ${options.subject}. 
The design should have ${options.style} style with ${options.colorScheme} colors. 
Include ${options.elements} arranged in a balanced composition that will look good when centered on a t-shirt. 
The background should be ${options.background} and the design should have clean edges suitable for printing. 
Avoid overly complex details that might be lost when printed.`;
}

/**
 * Save a design to the user's collection
 */
export async function saveDesign(designData: { 
  imageUrl: string; 
  prompt: string;
  color: string;
}): Promise<{ id: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, you would save to a database
  return {
    id: `design_${Date.now()}`
  };
}