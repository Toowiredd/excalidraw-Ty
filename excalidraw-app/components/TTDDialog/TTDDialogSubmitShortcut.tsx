import React from 'react';

interface TTDDialogSubmitShortcutProps {
  onSubmit: () => void;
}

const TTDDialogSubmitShortcut: React.FC<TTDDialogSubmitShortcutProps> = ({ onSubmit }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      onSubmit();
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      Press Ctrl+Enter or Cmd+Enter to submit
    </div>
  );
};

export default TTDDialogSubmitShortcut;
