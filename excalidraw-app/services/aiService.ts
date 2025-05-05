import * as tf from '@tensorflow/tfjs';
import { processImage } from './aiUtils';

class AIService {
  private model: tf.GraphModel | null = null;

  async loadModel(modelUrl: string): Promise<void> {
    if (this.model) return; // Already loaded
    try {
      this.model = await tf.loadGraphModel(modelUrl);
    } catch (error) {
      console.error('Failed to load AI model:', error);
      throw new Error('Model loading failed');
    }
  }

  async predict(inputCanvas: HTMLCanvasElement): Promise<any> {
    if (!this.model) throw new Error('AI Model not loaded');
    try {
      const inputTensor = processImage(inputCanvas);
      const output = await this.model.predict(inputTensor) as tf.Tensor;
      return output.dataSync();
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Prediction failed');
    }
  }
}

export default new AIService();
