import * as tf from '@tensorflow/tfjs';
import { processImage } from './aiUtils';

class AIService {
  private models: { [key: string]: tf.GraphModel } = {};

  async loadModel(modelUrl: string, modelName: string): Promise<void> {
    try {
      if (!this.models[modelName]) {
        const model = await tf.loadGraphModel(modelUrl);
        this.models[modelName] = model;
      }
    } catch (error) {
      console.error(`Failed to load model ${modelName} from ${modelUrl}:`, error);
      throw new Error(`Failed to load model: ${error.message}`);
    }
  }

  async predict(canvas: HTMLCanvasElement, modelName: string): Promise<any> {
    try {
      const model = this.models[modelName];
      if (!model) {
        throw new Error(`Model ${modelName} is not loaded.`);
      }
      const processedImage = processImage(canvas);
      const predictions = await model.executeAsync(processedImage) as tf.Tensor[];
      return predictions.map(prediction => prediction.arraySync());
    } catch (error) {
      console.error(`Prediction failed for model ${modelName}:`, error);
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  async performNLPTask(text: string): Promise<any> {
    const nlpUrl = `${import.meta.env.VITE_APP_AI_BACKEND}/v1/ai/nlp/extract-entities`;
    try {
      const response = await fetch(nlpUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please try again later. (Rate limit exceeded)");
        }
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || `NLP task failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("NLP task failed:", error);
      throw new Error(error.message || "NLP task failed");
    }
  }

  async performImageRecognition(image: HTMLImageElement): Promise<any> {
    const imageUrl = `${import.meta.env.VITE_APP_AI_BACKEND}/v1/ai/image/detect-objects`;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg');

      const response = await fetch(imageUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataUrl }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please try again later. (Rate limit exceeded)");
        }
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || `Image recognition failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Image recognition failed:", error);
      throw new Error(error.message || "Image recognition failed");
    }
  }
}

export default new AIService();
