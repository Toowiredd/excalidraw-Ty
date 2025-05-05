import * as tf from '@tensorflow/tfjs';

export function processImage(canvas: HTMLCanvasElement): tf.Tensor {
  const tensor = tf.browser.fromPixels(canvas)
    .resizeNearestNeighbor([256, 256])
    .toFloat()
    .expandDims();
  return tensor.div(255.0); // Normalize pixel values
}

export async function createModel() {
  // Optional: Custom model creation logic
  // Add logic if needed for dynamic model creation
}
