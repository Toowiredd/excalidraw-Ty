import React from 'react';
import TTDDialogInput from './TTDDialogInput';
import TTDDialogOutput from './TTDDialogOutput';
import TTDDialogPanel from './TTDDialogPanel';

interface TTDDialogPanelsProps {
  input: string;
  output: string;
  onInputChange: (newInput: string) => void;
  onOutputChange: (newOutput: string) => void;
}

const TTDDialogPanels: React.FC<TTDDialogPanelsProps> = ({
  input,
  output,
  onInputChange,
  onOutputChange,
}) => {
  return (
    <div>
      <TTDDialogInput input={input} onInputChange={onInputChange} />
      <TTDDialogOutput output={output} onOutputChange={onOutputChange} />
      <TTDDialogPanel input={input} output={output} />
    </div>
  );
};

export default TTDDialogPanels;
