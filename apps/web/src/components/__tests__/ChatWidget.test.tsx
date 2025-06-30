import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ChatWidget } from '../chat/ChatWidget';

// Mock dependencies  
vi.mock('../../store/appStore', () => ({
  useAppStore: () => ({
    isChatOpen: false,
    toggleChat: vi.fn(),
  }),
}));

vi.mock('../../services/bandruptionApi', () => ({
  default: {
    chatWithAxel: vi.fn().mockResolvedValue('Test response'),
  },
  bandruptionApi: {
    chatWithAxel: vi.fn().mockResolvedValue('Test response'),
  },
}));

describe('ChatWidget', () => {
  it('renders chat button when chat is closed', () => {
    render(<ChatWidget />);
    
    const chatButton = screen.getByRole('button');
    expect(chatButton).toBeInTheDocument();
  });
});