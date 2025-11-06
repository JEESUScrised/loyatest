import React from 'react';

interface MobileTabBarProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onTabClick }) => {
  const tabs = [
    { id: 'Главная', label: 'Главная' }
  ];

  return (
    <div className="tabbar mobile-tabbar" style={{padding: '8px', marginTop: 'auto'}}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => onTabClick(tab.id)}
          aria-label={tab.label}
          style={{fontSize: '14px', padding: '8px 16px'}}
        >
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MobileTabBar;
