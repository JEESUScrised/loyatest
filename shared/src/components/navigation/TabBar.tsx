import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'medium',
  className = ''
}) => {
  const variantClasses = {
    default: 'tab-bar-default',
    pills: 'tab-bar-pills',
    underline: 'tab-bar-underline'
  };

  const sizeClasses = {
    small: 'tab-bar-sm',
    medium: 'tab-bar-md',
    large: 'tab-bar-lg'
  };

  const classes = [
    'tab-bar',
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const tabClasses = [
          'tab',
          isActive ? 'tab-active' : '',
          tab.disabled ? 'tab-disabled' : ''
        ].filter(Boolean).join(' ');

        return (
          <button
            key={tab.id}
            className={tabClasses}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && (
              <span className="tab-icon">
                {tab.icon}
              </span>
            )}
            <span className="tab-label">
              {tab.label}
            </span>
            {tab.badge && tab.badge > 0 && (
              <span className="tab-badge">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
