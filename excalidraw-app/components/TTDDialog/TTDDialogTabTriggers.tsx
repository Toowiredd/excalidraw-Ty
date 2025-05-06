import React, { useState } from 'react';
import TTDDialogTabTrigger from './TTDDialogTabTrigger';

interface TTDDialogTabTriggersProps {
  triggers: string[];
  onTriggerSelect: (selectedTrigger: string) => void;
}

const TTDDialogTabTriggers: React.FC<TTDDialogTabTriggersProps> = ({ triggers, onTriggerSelect }) => {
  const [activeTrigger, setActiveTrigger] = useState<string>(triggers[0]);

  const handleTriggerClick = (trigger: string) => {
    setActiveTrigger(trigger);
    onTriggerSelect(trigger);
  };

  return (
    <div className="ttd-dialog-tab-triggers">
      {triggers.map((trigger) => (
        <TTDDialogTabTrigger
          key={trigger}
          label={trigger}
          isActive={trigger === activeTrigger}
          onClick={() => handleTriggerClick(trigger)}
        />
      ))}
    </div>
  );
};

export default TTDDialogTabTriggers;
