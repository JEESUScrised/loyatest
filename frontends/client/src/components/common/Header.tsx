import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBackClick 
}) => {
  return (
    <header className="header">
      <div className="header-content">
        {showBackButton && (
          <button 
            className="back-button"
            onClick={onBackClick}
            aria-label="Назад"
          >
            ←
          </button>
        )}
        <div className="header-text">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default Header;
