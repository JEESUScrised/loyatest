import React, { useState } from 'react';
import Header from './common/Header';
import { ErrorBoundary } from './common/ErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './PaymentModal';

const VenueAdminPage: React.FC = () => {
  const [venueCode] = useState('VKU'); // По умолчанию
  const [activeTab, setActiveTab] = useState<'main' | 'cashiers'>('main');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuth();


  return (
    <ErrorBoundary>
      <div className="container">
        <div className="admin-panel">
          {/* Вкладки */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'main' ? 'active' : ''}`}
              onClick={() => setActiveTab('main')}
            >
              Основное
            </button>
            <button 
              className={`tab ${activeTab === 'cashiers' ? 'active' : ''}`}
              onClick={() => setActiveTab('cashiers')}
            >
              Кассиры
            </button>
          </div>

          <div className="admin-content">
          {activeTab === 'main' && (
            <div className="card">
              <h3>Панель управления заведением</h3>
              <p>Добро пожаловать в панель управления заведением Loya.</p>
              
              <div className="info-section">
                <div className="info-item">
                  <span className="info-label">Код заведения:</span>
                  <span className="info-value">{venueCode}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Статус:</span>
                  <span className="info-value">
                    <span className="badge success">Активно</span>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Подписка:</span>
                  <span className="info-value">
                    <span className="badge warning">Осталось 15 дней</span>
                  </span>
                </div>
              </div>

              <div className="subscription-section">
                <div className="subscription-info">
                  <h4>Управление подпиской</h4>
                  <p>Ваша подписка истекает через 15 дней</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    Продлить подписку
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cashiers' && (
            <div className="card">
              <h3>Управление кассирами</h3>
              <p>Добавляйте и управляйте аккаунтами кассиров для вашего заведения.</p>
              
              <div className="cashiers-section">
                <div className="cashiers-header">
                  <h4>Аккаунты кассиров</h4>
                  <button className="btn btn-primary btn-sm">
                    Добавить кассира
                  </button>
                </div>
                
                <div className="cashiers-list">
                  <div className="cashier-item">
                    <div className="cashier-info">
                      <div className="cashier-name">Иван Петров</div>
                      <div className="cashier-email">ivan@example.com</div>
                    </div>
                    <div className="cashier-actions">
                      <button className="btn btn-secondary btn-sm">Редактировать</button>
                      <button className="btn btn-danger btn-sm">Удалить</button>
                    </div>
                  </div>
                  
                  <div className="cashier-item">
                    <div className="cashier-info">
                      <div className="cashier-name">Мария Сидорова</div>
                      <div className="cashier-email">maria@example.com</div>
                    </div>
                    <div className="cashier-actions">
                      <button className="btn btn-secondary btn-sm">Редактировать</button>
                      <button className="btn btn-danger btn-sm">Удалить</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Модальное окно оплаты */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          // Здесь можно добавить логику обновления статуса подписки
        }}
      />
    </ErrorBoundary>
  );
};

export default VenueAdminPage;
