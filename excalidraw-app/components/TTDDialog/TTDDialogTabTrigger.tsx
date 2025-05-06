import React from 'react';

interface TTDDialogTabTriggerProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TTDDialogTabTrigger: React.FC<TTDDialogTabTriggerProps> = ({ label, isActive, onClick }) => {
  return (
    <div
      className={`ttd-dialog-tab-trigger ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default TTDDialogTabTrigger;
