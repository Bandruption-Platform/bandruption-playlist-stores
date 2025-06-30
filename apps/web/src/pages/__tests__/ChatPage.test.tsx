import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ChatPage } from '../ChatPage';

// Mock the Bandruption API
vi.mock('../../services/bandruptionApi', () => ({
  default: {
    chatWithAxel: vi.fn().mockResolvedValue('Test response'),
  },
  bandruptionApi: {
    chatWithAxel: vi.fn().mockResolvedValue('Test response'),
  },
}));

describe('ChatPage', () => {
  it('renders page header and title', () => {
    render(<ChatPage />);
    
    expect(screen.getByRole('heading', { name: 'Bandruption AI' })).toBeInTheDocument();
    expect(screen.getByText('Your music discovery & creativity assistant')).toBeInTheDocument();
  });

  it('displays initial welcome message', () => {
    render(<ChatPage />);
    
    expect(screen.getByText(/Hey there! I'm Bandruption AI/)).toBeInTheDocument();
  });
});