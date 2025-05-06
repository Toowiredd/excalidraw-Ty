import React, { useState } from 'react';
import TTDDialogInput from './TTDDialogInput';
import TTDDialogOutput from './TTDDialogOutput';
import TTDDialogPanel from './TTDDialogPanel';

const TTDDialog: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');

  const handleInputChange = (newInput: string) => {
    setInput(newInput);
  };

  const handleOutputChange = (newOutput: string) => {
    setOutput(newOutput);
  };

  return (
    <div>
      <TTDDialogInput input={input} onInputChange={handleInputChange} />
      <TTDDialogOutput output={output} onOutputChange={handleOutputChange} />
      <TTDDialogPanel input={input} output={output} />
    </div>
  );
};

export default TTDDialog;
