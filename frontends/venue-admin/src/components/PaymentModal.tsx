import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = selectedMonths * 1000;

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payment = await paymentService.createSubscriptionPayment(selectedMonths);
      
      // Перенаправляем на страницу оплаты Юкассы
      if (payment.confirmation?.confirmation_url) {
        // Открываем страницу оплаты в новом окне
        const paymentWindow = window.open(payment.confirmation.confirmation_url, '_blank');
        
        if (paymentWindow) {
          // Показываем уведомление об успешном создании платежа
          setError(null);
          // Можно добавить здесь более красивое уведомление
          console.log(`Платеж создан! ID: ${payment.id}, Сумма: ${totalAmount} ₽`);
          
          // Закрываем модальное окно
          onClose();
          
          // Вызываем callback успеха
          if (onSuccess) {
            onSuccess();
          }
        } else {
          throw new Error('Не удалось открыть окно оплаты. Проверьте блокировщик всплывающих окон.');
        }
      } else {
        throw new Error('Не получена ссылка для оплаты');
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка создания платежа');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Продление подписки</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="payment-notice">
          <div className="payment-badge">ОПЛАТА ЧЕРЕЗ ЮКАССУ</div>
          <p>Безопасная оплата через Юкассу</p>
          <p style={{fontSize: '12px', marginTop: '8px', opacity: 0.8}}>
            После нажатия "Оплатить" вы будете перенаправлены на страницу оплаты
          </p>
        </div>
        
        <div className="modal-body">
          <div className="payment-options">
            <h4>Выберите период продления:</h4>
            
            <div className="period-options">
              {[1, 3, 6, 12].map((months) => (
                <label key={months} className="period-option">
                  <input
                    type="radio"
                    name="period"
                    value={months}
                    checked={selectedMonths === months}
                    onChange={(e) => setSelectedMonths(Number(e.target.value))}
                  />
                  <div className="option-content">
                    <div className="option-months">
                      {months} {months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}
                    </div>
                    <div className="option-price">
                      {months * 1000} ₽
                    </div>
                    {months > 1 && (
                      <div className="option-discount">
                        Скидка {Math.round((1 - (months * 1000) / (months * 1000)) * 100)}%
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="payment-summary">
            <div className="summary-row">
              <span>Период:</span>
              <span>{selectedMonths} {selectedMonths === 1 ? 'месяц' : selectedMonths < 5 ? 'месяца' : 'месяцев'}</span>
            </div>
            <div className="summary-row">
              <span>Стоимость:</span>
              <span>{totalAmount} ₽</span>
            </div>
            <div className="summary-row total">
              <span>Итого:</span>
              <span>{totalAmount} ₽</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Отмена
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? 'Создание платежа...' : `Оплатить ${totalAmount} ₽`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
