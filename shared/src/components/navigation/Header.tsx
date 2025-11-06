import React from 'react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  variant?: 'default' | 'transparent' | 'gradient';
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  actions,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'header-default',
    transparent: 'header-transparent',
    gradient: 'header-gradient'
  };

  const classes = [
    'header',
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <header className={classes}>
      <div className="header-content">
        {onBack && (
          <button
            className="back-button"
            onClick={onBack}
            aria-label="Назад"
          >
            ←
          </button>
        )}
        <div className="header-text">
          <h1 className="header-title">{title}</h1>
          {subtitle && (
            <p className="header-subtitle">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="header-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};
