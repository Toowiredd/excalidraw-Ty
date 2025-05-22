import React, { useRef, useState } from 'react';
import AIService from '../services/aiService';

const AIIntegration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(''); // Initialize to empty string

  const handlePrediction = async () => {
    try {
      if (!canvasRef.current) throw new Error("Canvas not found");
      if (!selectedModel) { // selectedModel will now be the URL
        setResult("Error: No model selected or model URL is invalid.");
        return;
      }
      // Use the selectedModel URL directly, and use it as the modelName key too for simplicity here
      await AIService.loadModel(selectedModel, selectedModel);
      const prediction = await AIService.predict(canvasRef.current, selectedModel); // Pass selectedModel as modelName
      setResult(JSON.stringify(prediction));
    } catch (error: any) {
      console.error("AI Integration Error:", error);
      setResult(`Error: ${error.message || "Prediction failed"}`);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500} />
      <div>
        <label htmlFor="modelSelect">Select AI Model:</label>
        <select
          id="modelSelect"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="">Select a Model</option>
          <option value="https://example.com/models/defaultModel/model.json">Default Model (Placeholder URL)</option>
          <option value="https://example.com/models/model1/model.json">Model 1 (Placeholder URL)</option>
          <option value="https://example.com/models/model2/model.json">Model 2 (Placeholder URL)</option>
        </select>
      </div>
      <button onClick={handlePrediction}>Run AI</button>
      {result && <div>Prediction: {result}</div>}
    </div>
  );
};

export default AIIntegration;
