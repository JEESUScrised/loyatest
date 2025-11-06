import React from 'react';
import { AuthUser } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBackClick,
  user,
  onLogout
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
        {user && onLogout && (
          <div className="header-actions">
            <span className="user-info">{user.first_name || user.username}</span>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onLogout}
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
