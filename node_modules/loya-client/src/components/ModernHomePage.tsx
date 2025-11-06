import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ModernNavbar from './ModernNavbar';
import { ErrorBoundary } from './common/ErrorBoundary';
import QRScannerModal from './QRScannerModal';

const ModernHomePage: React.FC = () => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    user, 
    isLoading, 
    error, 
    useCode, 
    clearError,
    isAuthenticated,
    hapticFeedback,
    refetch
  } = useApp();

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      setIsSubmitting(true);
      try {
        clearError();
        const response = await useCode(code.toUpperCase());
        if (response) {
          // Показываем успешное сообщение с анимацией
          alert(`🎉 Код успешно использован! Получено ${response.pointsEarned} баллов`);
          setCode('');
        }
      } catch (error) {
        console.error('Ошибка использования кода:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleScanQR = async () => {
    try {
      clearError();
      hapticFeedback.selection();
      
      // Проверяем поддержку камеры
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        hapticFeedback.notification('error');
        alert('Ваше устройство не поддерживает сканирование QR-кодов. Используйте камеру с поддержкой QR-сканирования.');
        return;
      }

      // Открываем модальное окно сканера
      setIsQRScannerOpen(true);
    } catch (error) {
      console.error('Ошибка сканирования QR:', error);
      hapticFeedback.notification('error');
      alert('Не удалось запустить сканер QR-кода. Проверьте разрешения камеры.');
    }
  };

  const handleQRScan = async (scannedCode: string) => {
    try {
      clearError();
      setIsSubmitting(true);
      
      // Проверяем, является ли это QR-кодом транзакции (transactionId)
      // Если код не содержит двоеточий и длиннее 6 символов, это transactionId
      let transactionId = scannedCode.trim();
      
      // Если код содержит двоеточия, пытаемся извлечь transactionId
      if (transactionId.includes(':')) {
        const parts = transactionId.split(':');
        // Последняя часть может быть transactionId
        transactionId = parts[parts.length - 1];
      }
      
      // Отправляем запрос на сканирование QR-кода
      const { apiClient } = await import('../services/apiClient');
      const response = await apiClient.post('/user/scan-qr', {
        transactionId: transactionId
      });
      
      if (response.success && response.data) {
        hapticFeedback.notification('success');
        const message = response.data.isDoublePoints 
          ? `🎉✨ Код успешно использован! Получено ${response.data.pointsEarned} баллов (удвоенные баллы!)`
          : `🎉 Код успешно использован! Получено ${response.data.pointsEarned} баллов`;
        alert(message);
        // Обновляем данные пользователя
        await refetch();
      } else {
        throw new Error(response.message || 'Ошибка обработки QR-кода');
      }
    } catch (error: any) {
      console.error('Ошибка использования QR-кода:', error);
      hapticFeedback.notification('error');
      alert(error.message || 'Ошибка обработки QR-кода');
    } finally {
      setIsSubmitting(false);
    }
  };


  const recentActivity = [
    {
      id: 1,
      action: 'Получено баллов',
      amount: '+50',
      venue: 'Пиццерия «Мама Мия»',
      time: '2 часа назад',
      icon: '⭐'
    },
    {
      id: 2,
      action: 'Использован код',
      amount: 'ABC123',
      venue: 'Кофейня «Бодрость»',
      time: '1 день назад',
      icon: '🎫'
    },
    {
      id: 3,
      action: 'Получено баллов',
      amount: '+30',
      venue: 'Бургерная «Вкусно»',
      time: '3 дня назад',
      icon: '⭐'
    },
    {
      id: 4,
      action: 'Получено баллов',
      amount: '+25',
      venue: 'Суши-бар «Сакура»',
      time: '4 дня назад',
      icon: '⭐'
    },
    {
      id: 5,
      action: 'Использован код',
      amount: 'XYZ789',
      venue: 'Стейк-хаус «Мясо»',
      time: '5 дней назад',
      icon: '🎫'
    },
    {
      id: 6,
      action: 'Получено баллов',
      amount: '+40',
      venue: 'Пекарня «Свежий хлеб»',
      time: '1 неделя назад',
      icon: '⭐'
    },
    {
      id: 7,
      action: 'Использован код',
      amount: 'DEF456',
      venue: 'Ресторан «Италия»',
      time: '1 неделя назад',
      icon: '🎫'
    },
    {
      id: 8,
      action: 'Получено баллов',
      amount: '+15',
      venue: 'Кафе «Уют»',
      time: '2 недели назад',
      icon: '⭐'
    }
  ];

  if (isLoading) {
    return (
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="modern-card fade-in" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-shimmer" style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            margin: '0 auto 20px',
            background: 'var(--accent-gradient)'
          }}></div>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Загрузка...</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0' }}>Подготавливаем ваш профиль</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container page-container" style={{ height: '100%', padding: '0 16px' }}>
        {/* Приветствие */}
        <div className="modern-card fade-in" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div 
              className="avatar-gentle"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: 'var(--shadow-glow)',
                cursor: 'pointer',
                fontWeight: '700',
                color: 'var(--bg-primary)'
              }}
            >
              L
            </div>
            <div>
              <h1 style={{ 
                margin: '0 0 4px 0', 
                color: 'var(--text-primary)',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                Привет, {user?.firstName || 'Пользователь'}!
              </h1>
              <p style={{ 
                margin: '0', 
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                Добро пожаловать в Loya
              </p>
            </div>
          </div>

          {/* Баланс баллов */}
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'var(--accent-gradient)'
            }}></div>
            
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              color: 'var(--accent-primary)',
              marginBottom: '8px'
            }}>
              {user?.points || 0}
            </div>
            <div style={{ 
              color: 'var(--text-secondary)',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              баллов на счету
            </div>
          </div>
        </div>

        {/* Сканирование QR */}
        <div className="modern-card fade-in" style={{ marginBottom: '24px', animationDelay: '0.1s' }}>
          <div className="qr-scan-button-wrapper">
            <button
              onClick={handleScanQR}
              className="qr-scan-button"
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--glass-bg)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all var(--transition-normal)',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {/* Внешняя L-образная рамка - верхний левый угол */}
                  <path
                    d="M3 3H8V8H3V3Z"
                    fill="currentColor"
                    rx="2"
                  />
                  {/* Внешняя L-образная рамка - верхний правый угол */}
                  <path
                    d="M16 3H21V8H16V3Z"
                    fill="currentColor"
                    rx="2"
                  />
                  {/* Внешняя L-образная рамка - нижний левый угол */}
                  <path
                    d="M3 16H8V21H3V16Z"
                    fill="currentColor"
                    rx="2"
                  />
                  {/* Внешняя L-образная рамка - нижний правый угол */}
                  <path
                    d="M16 16H21V21H16V16Z"
                    fill="currentColor"
                    rx="2"
                  />
                  
                  {/* Большой квадрат в верхнем левом углу (finder pattern) */}
                  <rect
                    x="4.5"
                    y="4.5"
                    width="5"
                    height="5"
                    rx="1.2"
                    fill="currentColor"
                  />
                  {/* Белый квадрат внутри */}
                  <rect
                    x="6"
                    y="6"
                    width="2"
                    height="2"
                    rx="0.5"
                    fill="var(--bg-primary)"
                  />
                  
                  {/* Большой квадрат в верхнем правом углу (finder pattern) */}
                  <rect
                    x="14.5"
                    y="4.5"
                    width="5"
                    height="5"
                    rx="1.2"
                    fill="currentColor"
                  />
                  {/* Белый квадрат внутри */}
                  <rect
                    x="16"
                    y="6"
                    width="2"
                    height="2"
                    rx="0.5"
                    fill="var(--bg-primary)"
                  />
                  
                  {/* Большой квадрат в нижнем левом углу (finder pattern) */}
                  <rect
                    x="4.5"
                    y="14.5"
                    width="5"
                    height="5"
                    rx="1.2"
                    fill="currentColor"
                  />
                  {/* Белый квадрат внутри */}
                  <rect
                    x="6"
                    y="16"
                    width="2"
                    height="2"
                    rx="0.5"
                    fill="var(--bg-primary)"
                  />
                  
                  {/* Паттерн данных в правом нижнем углу */}
                  <rect
                    x="14.5"
                    y="14.5"
                    width="2"
                    height="2"
                    rx="0.5"
                    fill="currentColor"
                  />
                  <circle
                    cx="18"
                    cy="15.5"
                    r="0.7"
                    fill="currentColor"
                  />
                  <circle
                    cx="18"
                    cy="17.5"
                    r="0.7"
                    fill="currentColor"
                  />
                  <rect
                    x="14.5"
                    y="17.5"
                    width="2"
                    height="2"
                    rx="0.5"
                    fill="currentColor"
                  />
                  <rect
                    x="17.5"
                    y="17.5"
                    width="2"
                    height="2"
                    rx="0.5"
                    fill="currentColor"
                  />
                  <circle
                    cx="18"
                    cy="19.5"
                    r="0.7"
                    fill="currentColor"
                  />
                  <circle
                    cx="20"
                    cy="17.5"
                    r="0.7"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div style={{
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '700',
                textAlign: 'center',
                flex: 1
              }}>
                Сканировать QR
              </div>
            </button>
          </div>
          
          {/* Стили для анимированной градиентной обводки */}
          <style>{`
            @keyframes qr-border-animation {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
            
            .qr-scan-button-wrapper {
              position: relative;
              padding: 2px;
              background: linear-gradient(135deg, #64d8cb, #b39ddb, #64d8cb, #b39ddb);
              background-size: 300% 300%;
              border-radius: var(--radius-lg);
              animation: qr-border-animation 3s ease infinite;
            }
            
            .qr-scan-button {
              position: relative;
              background: var(--glass-bg) !important;
            }
          `}</style>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: 'var(--error)',
              fontSize: '14px',
              marginTop: '12px'
            }}>
              {error}
            </div>
          )}
        </div>


        {/* Последняя активность */}
        <div className="modern-card fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Последняя активность
          </h3>
          
          <div 
            className="hidden-scrollbar"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}
          >
            {recentActivity.map((activity, index) => (
              <div 
                key={activity.id}
                className="liquid-glass liquid-glass-hover slide-up"
                style={{ 
                  animationDelay: `${0.3 + index * 0.1}s`,
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ 
                  fontSize: '20px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--glass-bg)',
                  borderRadius: '50%'
                }}>
                  {activity.icon}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    fontSize: '14px'
                  }}>
                    {activity.action}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)'
                  }}>
                    {activity.venue} • {activity.time}
                  </div>
                </div>
                
                <div style={{ 
                  fontWeight: '700',
                  color: activity.amount.startsWith('+') ? 'var(--success)' : 'var(--accent-primary)',
                  fontSize: '16px'
                }}>
                  {activity.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ModernNavbar />

        {/* Модальное окно сканера QR */}
        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScan={handleQRScan}
        />
      </div>
    </ErrorBoundary>
  );
};

export default ModernHomePage;
