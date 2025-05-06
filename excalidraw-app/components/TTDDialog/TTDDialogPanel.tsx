import React from 'react';

interface TTDDialogPanelProps {
  input: string;
  output: string;
}

const TTDDialogPanel: React.FC<TTDDialogPanelProps> = ({ input, output }) => {
  return (
    <div>
      <h3>AI Tools Panel</h3>
      <div>
        <label htmlFor="inputDisplay">Input:</label>
        <p id="inputDisplay">{input}</p>
      </div>
      <div>
        <label htmlFor="outputDisplay">Output:</label>
        <p id="outputDisplay">{output}</p>
      </div>
    </div>
  );
};

export default TTDDialogPanel;
