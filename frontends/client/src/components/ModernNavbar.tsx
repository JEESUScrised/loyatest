import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ModernNavbarProps {
  className?: string;
}

const ModernNavbar: React.FC<ModernNavbarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Главная',
      icon: 'H',
      path: '/',
      active: location.pathname === '/' || location.pathname === '/home'
    },
    {
      id: 'places',
      label: 'Места',
      icon: 'P',
      path: '/places',
      active: location.pathname === '/places'
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: 'L',
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className={`modern-navbar ${className}`}>
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${item.active ? 'active' : ''}`}
          onClick={() => handleNavClick(item.path)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleNavClick(item.path);
            }
          }}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </nav>
  );
};

export default ModernNavbar;
