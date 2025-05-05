import React, { useRef, useState } from 'react';
import AIService from '../services/aiService';

const AIIntegration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string | null>(null);

  const handlePrediction = async () => {
    try {
      if (!canvasRef.current) throw new Error('Canvas not found');
      await AIService.loadModel('/path/to/model.json'); // Update model path
      const prediction = await AIService.predict(canvasRef.current);
      setResult(JSON.stringify(prediction));
    } catch (error) {
      console.error('AI Integration Error:', error);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500} />
      <button onClick={handlePrediction}>Run AI</button>
      {result && <div>Prediction: {result}</div>}
    </div>
  );
};

export default AIIntegration;
