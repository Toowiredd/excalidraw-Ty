import React from 'react';

interface TTDDialogTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TTDDialogTab: React.FC<TTDDialogTabProps> = ({ label, isActive, onClick }) => {
  return (
    <div
      className={`ttd-dialog-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default TTDDialogTab;
