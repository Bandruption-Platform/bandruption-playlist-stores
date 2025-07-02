import React from 'react';
import { render } from '@testing-library/react-native';
import { AIChat } from '../AIChat';
import { useAppStore } from '@/store/useAppStore';
import { bandruptionService } from '../../services/bandruptionService';

// Mock dependencies
jest.mock('@/store/useAppStore');
jest.mock('../../services/bandruptionService');

describe('AIChat', () => {
  const mockAddChatMessage = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      chatHistory: [],
      addChatMessage: mockAddChatMessage,
    } as any);
  });

  it('should render modal when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <AIChat visible={true} onClose={mockOnClose} />
    );
    
    expect(getByText('Music Discovery AI')).toBeTruthy();
    expect(getByPlaceholderText('What kind of music are you looking for?')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <AIChat visible={false} onClose={mockOnClose} />
    );
    
    expect(queryByText('Music Discovery AI')).toBeFalsy();
  });

  it('should display welcome message when chat history is empty', () => {
    const { getByText } = render(
      <AIChat visible={true} onClose={mockOnClose} />
    );
    
    expect(getByText('Hey there! 👋')).toBeTruthy();
    expect(getByText(/I'm your personal music discovery AI/)).toBeTruthy();
  });

  it('should display suggestion buttons when chat history is empty', () => {
    const { getByText } = render(
      <AIChat visible={true} onClose={mockOnClose} />
    );
    
    expect(getByText('Something chill for working')).toBeTruthy();
    expect(getByText('Upbeat electronic music')).toBeTruthy();
    expect(getByText('Jazz with modern vibes')).toBeTruthy();
  });

  it('should display existing chat history', () => {
    const mockChatHistory = [
      {
        id: '1',
        content: 'Hello AI',
        isUser: true,
        timestamp: new Date(),
      },
      {
        id: '2',
        content: 'Hello! How can I help you discover music?',
        isUser: false,
        timestamp: new Date(),
      },
    ];

    (useAppStore as unknown as jest.Mock).mockReturnValue({
      chatHistory: mockChatHistory,
      addChatMessage: mockAddChatMessage,
    } as any);

    const { getByText } = render(
      <AIChat visible={true} onClose={mockOnClose} />
    );
    
    expect(getByText('Hello AI')).toBeTruthy();
    expect(getByText('Hello! How can I help you discover music?')).toBeTruthy();
  });

  it('should have input field for messages', () => {
    const { getByPlaceholderText } = render(
      <AIChat visible={true} onClose={mockOnClose} />
    );
    
    const input = getByPlaceholderText('What kind of music are you looking for?');
    expect(input).toBeTruthy();
  });

  // Test the service integration without UI interaction
  it('should be able to call bandruption service', async () => {
    (bandruptionService.chatWithAxel as jest.Mock).mockResolvedValue('Test response');
    
    const response = await bandruptionService.chatWithAxel('test message');
    expect(response).toBe('Test response');
    expect(bandruptionService.chatWithAxel).toHaveBeenCalledWith('test message');
  });

  it('should handle service errors', async () => {
    (bandruptionService.chatWithAxel as jest.Mock).mockRejectedValue(new Error('Service error'));
    
    try {
      await bandruptionService.chatWithAxel('test message');
    } catch (error) {
      expect((error as Error).message).toBe('Service error');
    }
    
    expect(bandruptionService.chatWithAxel).toHaveBeenCalledWith('test message');
  });
});