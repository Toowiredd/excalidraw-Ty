// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AIService from '../services/aiService'; // Default instance

// Mock import.meta.env for testing environment
vi.stubGlobal('import', {
  meta: {
    env: { VITE_APP_AI_BACKEND: 'https://test-ai-backend.com' },
  },
});

// Mock global fetch
global.fetch = vi.fn();

describe('AIService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('performNLPTask', () => {
    const testText = "This is a test sentence.";
    const expectedNlpUrl = "https://test-ai-backend.com/v1/ai/nlp/extract-entities";

    it('should perform NLP task successfully', async () => {
      const mockResponse = { entities: ["test entity"] };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await AIService.performNLPTask(testText);

      expect(fetch).toHaveBeenCalledWith(expectedNlpUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: testText }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle rate limit error (429) for NLP task', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: "Rate limited" }),
      });

      await expect(AIService.performNLPTask(testText))
        .rejects
        .toThrowError("Too many requests. Please try again later. (Rate limit exceeded)");
    });

    it('should handle other HTTP errors (e.g., 500) for NLP task', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal Server Error" }),
      });

      await expect(AIService.performNLPTask(testText))
        .rejects
        .toThrowError("Internal Server Error");
    });
    
    it('should handle other HTTP errors (e.g., 500) for NLP task with non-json response', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => null, // Simulate non-JSON error response
      });

      await expect(AIService.performNLPTask(testText))
        .rejects
        .toThrowError('NLP task failed with status: 500');
    });

    it('should handle network errors for NLP task', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network failure"));

      await expect(AIService.performNLPTask(testText))
        .rejects
        .toThrowError("Network failure");
    });
  });

  describe('performImageRecognition', () => {
    const expectedImageUrl = "https://test-ai-backend.com/v1/ai/image/detect-objects";
    let mockImage: HTMLImageElement;
    let mockToDataURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Mock HTMLImageElement and Canvas for each test in this suite
      mockImage = {
        naturalWidth: 100,
        naturalHeight: 100,
        src: "test.jpg",
      } as HTMLImageElement;

      mockToDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,test');
      
      // Ensure getContext returns a mock with drawImage
      const mockCtx = { drawImage: vi.fn() };
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx as any);
      HTMLCanvasElement.prototype.toDataURL = mockToDataURL;
    });

    it('should perform image recognition successfully', async () => {
      const mockResponse = { objects: [{ label: "cat", box: [0,0,10,10] }] };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await AIService.performImageRecognition(mockImage);

      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
      expect(mockToDataURL).toHaveBeenCalledWith('image/jpeg');
      expect(fetch).toHaveBeenCalledWith(expectedImageUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataUrl: 'data:image/jpeg;base64,test' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle rate limit error (429) for image recognition', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: "Rate limited" }),
      });

      await expect(AIService.performImageRecognition(mockImage))
        .rejects
        .toThrowError("Too many requests. Please try again later. (Rate limit exceeded)");
    });

    it('should handle other HTTP errors (e.g., 500) for image recognition', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal Server Error" }),
      });

      await expect(AIService.performImageRecognition(mockImage))
        .rejects
        .toThrowError("Internal Server Error");
    });
    
    it('should handle other HTTP errors (e.g., 500) for image recognition with non-json response', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => null, // Simulate non-JSON error response
      });

      await expect(AIService.performImageRecognition(mockImage))
        .rejects
        .toThrowError('Image recognition failed with status: 500');
    });

    it('should handle network errors for image recognition', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network problem"));

      await expect(AIService.performImageRecognition(mockImage))
        .rejects
        .toThrowError("Network problem");
    });

    it('should handle image processing error when getContext returns null', async () => {
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      await expect(AIService.performImageRecognition(mockImage))
        .rejects
        .toThrowError("Failed to get canvas context");
    });
  });

  afterEach(() => {
    // Restore any global mocks if necessary, though vi.clearAllMocks handles most Vitest mocks
    // If we were directly modifying global.fetch without vi.fn(), we'd restore it here.
  });
});
