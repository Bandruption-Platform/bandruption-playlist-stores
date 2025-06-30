import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ChatPage } from '../ChatPage';
import { bandruptionApi } from '../../services/bandruptionApi';

// Mock the Bandruption API
vi.mock('../../services/bandruptionApi', () => ({
  default: {
    chatWithAxel: vi.fn().mockResolvedValue('Test response'),
  },
  bandruptionApi: {
    chatWithAxel: vi.fn().mockResolvedValue('Test response'),
  },
}));

const mockBandruptionApi = vi.mocked(bandruptionApi);

describe('ChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header and title', () => {
    render(<ChatPage />);
    
    expect(screen.getByRole('heading', { name: 'Bandruption AI' })).toBeInTheDocument();
    expect(screen.getByText('Your music discovery & creativity assistant')).toBeInTheDocument();
  });

  it('displays initial welcome message', () => {
    render(<ChatPage />);
    
    expect(screen.getByText(/Hey there! I'm Bandruption AI/)).toBeInTheDocument();
  });

  it('sends message content correctly to API - old bug would send inputValue instead', async () => {
    render(<ChatPage />);
    
    const input = screen.getByPlaceholderText(/Ask about music discovery, NFT art creation, or playlist ideas/);
    
    // Type a message
    fireEvent.change(input, { target: { value: 'What are some good rock bands?' } });
    
    // Simulate Enter keypress to send message (same as clicking send button)
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Wait for the API call
    await waitFor(() => {
      expect(mockBandruptionApi.chatWithAxel).toHaveBeenCalledWith('What are some good rock bands?');
    });
    
    // The old bug would have caused this test to fail because it would send
    // the inputValue (which gets cleared before the API call) instead of newMessage.content
    expect(mockBandruptionApi.chatWithAxel).toHaveBeenCalledTimes(1);
  });

  it('clears input after sending message', async () => {
    render(<ChatPage />);
    
    const input = screen.getByPlaceholderText(/Ask about music discovery, NFT art creation, or playlist ideas/) as HTMLTextAreaElement;
    
    // Type a message
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(input.value).toBe('Test message');
    
    // Simulate Enter keypress to send message (same as clicking send button)
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Input should be cleared immediately (this validates the fix timing)
    expect(input.value).toBe('');
    
    // And the API should still receive the original message content
    await waitFor(() => {
      expect(mockBandruptionApi.chatWithAxel).toHaveBeenCalledWith('Test message');
    });
  });
});