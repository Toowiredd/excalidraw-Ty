import React, { useState } from 'react';

interface TTDDialogInputProps {
  input: string;
  onInputChange: (newInput: string) => void;
}

const TTDDialogInput: React.FC<TTDDialogInputProps> = ({ input, onInputChange }) => {
  const [aiTool, setAiTool] = useState<string>('nlp');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(event.target.value);
  };

  const handleAiToolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAiTool(event.target.value);
  };

  return (
    <div>
      <label htmlFor="aiToolSelect">Select AI Tool:</label>
      <select id="aiToolSelect" value={aiTool} onChange={handleAiToolChange}>
        <option value="nlp">NLP Task</option>
        <option value="imageRecognition">Image Recognition</option>
      </select>
      <label htmlFor="inputField">Input:</label>
      <input
        type="text"
        id="inputField"
        value={input}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default TTDDialogInput;
