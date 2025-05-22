import * as tf from '@tensorflow/tfjs';
import { processImage } from './aiUtils';

class AIService {
  private models: { [key: string]: tf.GraphModel } = {};

  async loadModel(modelUrl: string, modelName: string): Promise<void> {
    if (this.models[modelName]) {
      console.log(`Model ${modelName} already loaded.`);
      return;
    }
    try {
      console.log(`Loading model ${modelName} from ${modelUrl}`);
      this.models[modelName] = await tf.loadGraphModel(modelUrl);
      console.log(`Model ${modelName} loaded successfully.`);
    } catch (error) {
      console.error(`Failed to load AI model ${modelName} from ${modelUrl}:`, error);
      throw new Error(`Model loading failed for ${modelName}`);
    }
  }

  async predict(inputCanvas: HTMLCanvasElement, modelName: string): Promise<any> {
    const model = this.models[modelName];
    if (!model) {
      console.error(`Model ${modelName} not found in loaded models.`);
      throw new Error(`AI Model ${modelName} not loaded`);
    }
    try {
      console.log(`Performing prediction with model ${modelName}`);
      const inputTensor = processImage(inputCanvas);
      const output = await model.predict(inputTensor) as tf.Tensor;
      return output.dataSync();
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Prediction failed');
    }
  }

  async performNLPTask(text: string): Promise<any> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_AI_BACKEND}/v1/ai/nlp/extract-entities`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 429) {
          throw new Error(
            "Too many requests. Please try again later. (Rate limit exceeded)",
          );
        }
        throw new Error(
          errorData?.message ||
            `NLP task failed with status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("NLP Task Error:", error);
      throw new Error(error.message || "Failed to perform NLP task due to a network or unexpected error.");
    }
  }

  async performImageRecognition(image: HTMLImageElement): Promise<any> {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      ctx.drawImage(image, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/jpeg"); // Or 'image/png'

      const response = await fetch(
        `${import.meta.env.VITE_APP_AI_BACKEND}/v1/ai/image/detect-objects`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageDataUrl }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 429) {
          throw new Error(
            "Too many requests. Please try again later. (Rate limit exceeded)",
          );
        }
        throw new Error(
          errorData?.message ||
            `Image recognition failed with status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("Image Recognition Error:", error);
      throw new Error(error.message || "Failed to perform image recognition due to an unexpected error.");
    }
  }
}

export default new AIService();
