import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService } from '../server/services/geminiService';
import { Mode } from '../src/lib/types';

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => {
  const mockGenerateContent = vi.fn();
  const mockEmbedContent = vi.fn();

  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
        embedContent: mockEmbedContent,
      };
    },
    // Expose mocks for asserting
    __mockGenerateContent: mockGenerateContent,
    __mockEmbedContent: mockEmbedContent
  };
});

describe('GeminiService', () => {
  let mockGenerateContent: any;
  let mockEmbedContent: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mockModule = await import('@google/genai');
    mockGenerateContent = (mockModule as any).__mockGenerateContent;
    mockEmbedContent = (mockModule as any).__mockEmbedContent;
  });

  it('should analyze idea correctly', async () => {
    const mockResponseText = JSON.stringify({ 
      refinedIdea: { oneLiner: 'Test', problem: 'Test', targetUser: 'Test' },
      feedback: ['Good'],
      recommendedModes: ['spec']
    });
    
    mockGenerateContent.mockResolvedValue({
      text: mockResponseText,
    });

    const result = await geminiService.analyzeIdea('Build a chat app', 'ideation' as Mode);
    
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.mode).toBe('ideation');
    expect(result.refinedIdea?.oneLiner).toBe('Test');
  });

  it('should chat with idea correctly', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'Mocked chat response',
    });

    const messages = [{ role: 'user' as const, content: 'Hello' }];
    const result = await geminiService.chatWithIdea(messages, 'Test Idea', 'spec');
    
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result).toBe('Mocked chat response');
  });

  it('should generate spec correctly', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'Mocked spec response',
    });

    const messages = [{ role: 'user' as const, content: 'Generate spec' }];
    const result = await geminiService.generateSpec(messages, 'Tech Spec', 'Test Context');
    
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result).toBe('Mocked spec response');
  });

  it('should simplify project description', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'Mocked simplified description',
    });

    const mockFeedback = {
      refinedIdea: { oneLiner: 'Test', problem: 'Test', targetUser: 'Test' }
    };
    
    const result = await geminiService.simplifyProjectDescription('Test Idea', mockFeedback as any, []);
    
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result).toBe('Mocked simplified description');
  });

  it('should generate embeddings correctly', async () => {
    mockEmbedContent.mockResolvedValue({
      embeddings: [{ values: [0.1, 0.2, 0.3] }]
    });

    const result = await geminiService.getEmbedding('Test text');
    
    expect(mockEmbedContent).toHaveBeenCalledTimes(1);
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });
});
