import React, { useState } from 'react';
import TTDDialogTab from './TTDDialogTab';

interface TTDDialogTabsProps {
  tabs: string[];
  onTabSelect: (selectedTab: string) => void;
}

const TTDDialogTabs: React.FC<TTDDialogTabsProps> = ({ tabs, onTabSelect }) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabSelect(tab);
  };

  return (
    <div className="ttd-dialog-tabs">
      {tabs.map((tab) => (
        <TTDDialogTab
          key={tab}
          label={tab}
          isActive={tab === activeTab}
          onClick={() => handleTabClick(tab)}
        />
      ))}
    </div>
  );
};

export default TTDDialogTabs;
