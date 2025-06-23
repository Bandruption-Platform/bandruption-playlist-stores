import { Album } from '../types';
import { mockAlbums } from '../data/mockData';

export interface AIResponse {
  message: string;
  recommendations?: Album[];
}

export const generateAIResponse = async (userMessage: string): Promise<AIResponse> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const lowerMessage = userMessage.toLowerCase();

  // Generate contextual responses based on keywords
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    const recommendations = getRandomAlbums(3);
    return {
      message: "Based on your taste, I think you'd love these albums! Each one offers something unique and they pair beautifully together in a playlist.",
      recommendations
    };
  }

  if (lowerMessage.includes('rock') || lowerMessage.includes('guitar')) {
    const rockAlbums = mockAlbums.filter(album => 
      album.genre.toLowerCase().includes('rock')
    ).slice(0, 2);
    
    return {
      message: "Rock is such a diverse genre! From classic stadium anthems to progressive experimentation, there's always something new to discover.",
      recommendations: rockAlbums
    };
  }

  if (lowerMessage.includes('jazz') || lowerMessage.includes('blues')) {
    return {
      message: "Jazz is the language of musical freedom! The improvisation and complexity create such rich listening experiences. Have you explored any fusion or bebop lately?",
      recommendations: mockAlbums.filter(album => album.genre === 'Jazz')
    };
  }

  if (lowerMessage.includes('electronic') || lowerMessage.includes('edm') || lowerMessage.includes('dance')) {
    return {
      message: "Electronic music keeps evolving! From ambient soundscapes to dance floor bangers, it's amazing how producers keep pushing boundaries.",
      recommendations: mockAlbums.filter(album => album.genre === 'Electronic')
    };
  }

  if (lowerMessage.includes('playlist') || lowerMessage.includes('mix')) {
    return {
      message: "Creating the perfect playlist is an art form! Think about the emotional journey - start strong, build tension, maybe add a surprising bridge, then bring it home. What vibe are you going for?"
    };
  }

  if (lowerMessage.includes('discover') || lowerMessage.includes('new music')) {
    const randomAlbums = getRandomAlbums(4);
    return {
      message: "Discovery is the best part of being a music fan! Here are some albums spanning different eras and styles - perfect for expanding your horizons.",
      recommendations: randomAlbums
    };
  }

  if (lowerMessage.includes('mood') || lowerMessage.includes('feeling')) {
    return {
      message: "Music and mood are so connected! Whether you want to match your current energy or shift it completely, the right album can be transformative. What's your current vibe?"
    };
  }

  // Default responses
  const responses = [
    "That's interesting! Music has this amazing ability to connect us across time and space. What draws you to that particular sound?",
    "I love talking about music! There's always another layer to discover, whether it's the production techniques, the cultural context, or just how it makes you feel.",
    "Every album tells a story, not just through lyrics but through the sonic choices. Have you noticed how certain production styles can instantly transport you to a specific era?",
    "The beauty of music curation is finding those unexpected connections between seemingly different artists. Sometimes the best playlists are the ones that surprise you!",
    "Music discovery never ends! Even classics you've heard a hundred times can reveal new details when you're in the right mindset or using different listening equipment."
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Sometimes include recommendations with default responses
  if (Math.random() > 0.6) {
    return {
      message: randomResponse,
      recommendations: getRandomAlbums(2)
    };
  }

  return { message: randomResponse };
};

const getRandomAlbums = (count: number): Album[] => {
  const shuffled = [...mockAlbums].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// AI Art Generation Service
export const generateAIArt = async (
  sourceImageUrl: string, 
  style: string, 
  prompt: string
): Promise<string> => {
  // Simulate AI art generation time
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
  
  // Return a mock generated image URL
  const artStyles = [
    'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];
  
  return artStyles[Math.floor(Math.random() * artStyles.length)];
};