import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import MobileTabBar from './MobileTabBar';
import { ErrorBoundary } from './common/ErrorBoundary';

const HomePage: React.FC = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { 
    user, 
    isLoading, 
    error, 
    useCode, 
    clearError,
    isAuthenticated 
  } = useApp();

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      try {
        clearError();
        const response = await useCode(code.toUpperCase());
        if (response) {
          // Показываем успешное сообщение
          alert(`Код успешно использован! Получено ${response.pointsEarned} баллов`);
          setCode('');
        }
      } catch (error) {
        // Ошибка уже обработана в контексте
        console.error('Ошибка использования кода:', error);
      }
    }
  };

  const handleTabClick = (tab: string) => {
    // Переключение между экранами через роутинг
    switch(tab) {
      case 'Главная':
        navigate('/');
        break;
      case 'Места':
        navigate('/places');
        break;
      case 'Кассир':
        navigate('/cashier');
        break;
      case 'Админ':
        navigate('/admin');
        break;
      default:
        break;
    }
  };

  const handleActionClick = (action: string) => {
    console.log('Действие:', action);
    // Здесь будет логика для каждого действия
    if (action === 'places') {
      navigate('/places');
    } else if (action === 'exchange') {
      navigate('/exchange');
    }
  };

  // Определяем, является ли устройство мобильным
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Добавляем класс для мобильной версии
    if (isMobile) {
      document.body.classList.add('mobile-layout');
    } else {
      document.body.classList.remove('mobile-layout');
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.classList.remove('mobile-layout');
    };
  }, [isMobile]);

  if (isLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: 'var(--muted)'
      }}>
        Загрузка...
      </div>
    );
  }

  // Убираем проверку авторизации для клиентского фронтенда
  // if (!isAuthenticated) {
  //   return (
  //     <div className="container">
  //       <div className="card">
  //         <h2>Добро пожаловать в Loya!</h2>
  //         <p>Для использования приложения необходимо авторизоваться через Telegram.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="card full-height-card">
          <h3 style={{marginBottom: '8px', fontSize: '20px'}}>Главная</h3>
          
          {/* Отображение ошибок */}
          {error && (
            <div style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '8px',
              color: '#ff6b6b',
              fontSize: '12px'
            }}>
              {error}
            </div>
          )}
          
          {/* Индикатор загрузки */}
          {isLoading && (
            <div style={{
              textAlign: 'center',
              padding: '8px',
              color: 'var(--muted)',
              fontSize: '14px'
            }}>
              Загрузка...
            </div>
          )}
          
          {/* Блок с баллами */}
          <div className="list-item" style={{padding: '10px', marginBottom: '8px'}}>
            <img
              src="/assets/icons/points-1-gold.svg"
              width="24"
              height="24"
              alt="баллы"
            />
            <div>
              <div className="points-text" style={{fontSize: '20px', lineHeight: '1.2'}}>
                {user?.pointsBalance || 0} баллов
              </div>
              <div className="sub" style={{fontSize: '12px', lineHeight: '1.3'}}>
                Эти баллы вы можете потратить и получить в любом заведении во вкладке обменять баллы
              </div>
            </div>
          </div>
          
          <div style={{height: '8px'}}></div>
          
          {/* Форма ввода кода */}
          <form onSubmit={handleCodeSubmit} style={{marginBottom: '8px'}}>
            <div style={{display: 'flex', gap: '16px', marginBottom: '8px', justifyContent: 'center'}}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={code[index] || ''}
                  onChange={(e) => {
                    const newCode = code.split('');
                    newCode[index] = e.target.value.toUpperCase();
                    setCode(newCode.join(''));
                    
                    // Автоматический переход к следующему полю
                    if (e.target.value && index < 5) {
                      const target = e.target as HTMLInputElement;
                      const nextInput = target.parentElement?.children[index + 1] as HTMLInputElement;
                      nextInput?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    // Переход к предыдущему полю при нажатии Backspace
                    if (e.key === 'Backspace' && !code[index] && index > 0) {
                      const target = e.target as HTMLInputElement;
                      const prevInput = target.parentElement?.children[index - 1] as HTMLInputElement;
                      prevInput?.focus();
                    }
                  }}
                  style={{
                    width: '45px',
                    height: '45px',
                    fontSize: '19px',
                    textAlign: 'center',
                    border: '2px solid #444',
                    borderRadius: '8px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    outline: 'none',
                    fontWeight: 'bold',
                    boxSizing: 'border-box'
                  }}
                />
              ))}
            </div>
            <button 
              type="submit" 
              className="btn"
              disabled={code.length !== 6}
              style={{
                fontSize: '16px', 
                padding: '8px 24px', 
                height: '32px', 
                lineHeight: '1.2', 
                width: '100%',
                marginTop: '12px'
              }}
            >
              Получить
            </button>
          </form>
          
          <div style={{height: '4px'}}></div>
          
          {/* Действия */}
          <div className="actions" style={{gap: '2px'}}>
            <div className="action" onClick={() => handleActionClick('places')} style={{padding: '10px'}}>
              <div style={{fontSize: '14px', fontWeight: '600', lineHeight: '1.2'}}>Баллы заведений</div>
              <span className="hint" style={{fontSize: '12px', lineHeight: '1.2'}}>Открыть список</span>
            </div>
            <div className="action" onClick={() => handleActionClick('exchange')} style={{padding: '10px'}}>
              <div style={{fontSize: '14px', fontWeight: '600', lineHeight: '1.2'}}>Обменять баллы</div>
              <span className="hint" style={{fontSize: '12px', lineHeight: '1.2'}}>Доступно {user?.pointsBalance || 0}</span>
            </div>
            <div className="action" onClick={() => handleActionClick('referral')} style={{padding: '10px'}}>
              <div style={{fontSize: '14px', fontWeight: '600', lineHeight: '1.2'}}>Реферальная система</div>
              <span className="hint" style={{fontSize: '12px', lineHeight: '1.2'}}>+5 за друга</span>
            </div>
          </div>
          
          <div style={{height: '8px'}}></div>
          
          
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;
