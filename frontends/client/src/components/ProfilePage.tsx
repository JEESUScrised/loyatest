import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import ModernNavbar from './ModernNavbar';
import { ErrorBoundary } from './common/ErrorBoundary';
import ReferralModal from './ReferralModal';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, hapticFeedback } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: 'Всего баллов',
      value: user?.points || 0,
      icon: '⭐',
      color: 'var(--accent-primary)'
    },
    {
      label: 'Использовано кодов',
      value: user?.codesUsed || 0,
      icon: '🎫',
      color: 'var(--success)'
    },
    {
      label: 'Посещений',
      value: user?.visits || 0,
      icon: '🏪',
      color: 'var(--info)'
    }
  ];

  return (
    <ErrorBoundary>
      <div className="container page-container" style={{ height: '100%', padding: '0 16px' }}>
        {/* Аватар и общие баллы */}
        <div className="modern-card fade-in scale-in" style={{ marginBottom: '24px', textAlign: 'center', animationDelay: '0.1s' }}>
          <div 
            className="avatar-animated"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 20px',
              boxShadow: 'var(--shadow-glow)',
              cursor: 'pointer',
              fontWeight: '700',
              color: 'var(--bg-primary)'
            }}
          >
            L
          </div>
          
          <div 
            className="liquid-glass-hover scale-in"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-lg)',
              animationDelay: '0.2s',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)'
            }}
          >
            <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '18px' }}>
              Общие баллы
            </h2>
            <div 
              className="pulse"
              style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: 'var(--accent-primary)',
                marginBottom: '4px',
                textShadow: '0 0 20px rgba(100, 216, 203, 0.5)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              0
            </div>
            <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Доступно для использования
            </p>
          </div>
        </div>

        {/* Разделитель */}
        <div style={{ 
          height: '1px', 
          background: 'var(--glass-border)', 
          margin: '0 0 24px 0' 
        }}></div>

        {/* Меню навигации */}
        <div className="modern-card fade-in slide-up" style={{ animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="modern-list-item liquid-glass-hover scale-in"
              style={{ 
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                textAlign: 'left',
                width: '100%',
                boxShadow: 'var(--shadow-md)',
                animationDelay: '0.4s'
              }}
              onClick={() => {
                hapticFeedback.selection();
                setIsReferralModalOpen(true);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  className="bounce"
                  style={{ 
                    fontSize: '20px',
                    animation: 'bounce 2s ease-in-out infinite',
                    animationDelay: '0.1s',
                    fontWeight: '700',
                    color: 'var(--accent-primary)'
                  }}
                >R</div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  Реферальная программа
                </span>
              </div>
            </button>

            <button 
              className="modern-list-item liquid-glass-hover scale-in"
              style={{ 
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                textAlign: 'left',
                width: '100%',
                boxShadow: 'var(--shadow-md)',
                animationDelay: '0.5s'
              }}
              onClick={() => {/* Логика поддержки */}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  className="pulse"
                  style={{ 
                    fontSize: '20px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: '0.2s',
                    fontWeight: '700',
                    color: 'var(--accent-secondary)'
                  }}
                >S</div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  Поддержка
                </span>
              </div>
            </button>

            <button 
              className="modern-list-item liquid-glass-hover scale-in"
              style={{ 
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                textAlign: 'left',
                width: '100%',
                boxShadow: 'var(--shadow-md)',
                animationDelay: '0.6s'
              }}
              onClick={() => {/* Логика о программе */}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  className="glow"
                  style={{ 
                    fontSize: '20px',
                    animation: 'glow 3s ease-in-out infinite',
                    animationDelay: '0.3s',
                    fontWeight: '700',
                    color: 'var(--text-primary)'
                  }}
                >I</div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  О программе лояльности
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Кнопка выхода */}
        <div className="modern-card fade-in" style={{ animationDelay: '0.6s', textAlign: 'center', marginTop: '32px' }}>
          <button 
            className="modern-btn"
            onClick={handleLogout}
            disabled={isLoading}
            style={{ 
              background: 'var(--error)',
              color: 'white',
              width: '100%',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Выход...' : '🚪 Выйти из аккаунта'}
          </button>
        </div>

        <ModernNavbar />

        {/* Модальное окно реферальной программы */}
        {user?.referralCode && (
          <ReferralModal
            isOpen={isReferralModalOpen}
            onClose={() => setIsReferralModalOpen(false)}
            referralCode={user.referralCode}
            referralLink={`${window.location.origin}?ref=${user.referralCode}`}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePage;
