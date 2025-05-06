import React from 'react';

interface TTDDialogOutputProps {
  output: string;
  onOutputChange: (newOutput: string) => void;
}

const TTDDialogOutput: React.FC<TTDDialogOutputProps> = ({ output, onOutputChange }) => {
  return (
    <div>
      <label htmlFor="outputField">Output:</label>
      <textarea
        id="outputField"
        value={output}
        onChange={(e) => onOutputChange(e.target.value)}
      />
    </div>
  );
};

export default TTDDialogOutput;
