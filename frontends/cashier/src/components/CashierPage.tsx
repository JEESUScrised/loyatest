import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './auth/LoginForm';
import LoadingSpinner from './common/LoadingSpinner';
import { ErrorBoundary } from './common/ErrorBoundary';
import QRGeneratorModal from './QRGeneratorModal';
import QRScannerModal from './QRScannerModal';

const CashierPage: React.FC = () => {
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();

  const handleLoginSuccess = () => {
    // Авторизация прошла успешно, состояние обновится автоматически
    console.log('Авторизация успешна');
  };

  const handleGenerateQR = () => {
    // Генерируем QR-код без суммы покупки (только для начисления баллов)
    setPurchaseAmount(0);
    setIsQRGeneratorOpen(true);
  };

  const handleScanQR = () => {
    setIsQRScannerOpen(true);
  };

  const handleQRScanned = (code: string) => {
    // Обработка отсканированного QR-кода
    console.log('Отсканирован QR-код:', code);
    
    // Парсим данные из QR-кода
    // Формат может быть:
    // 1. venueCode:amount:timestamp:transactionCode - QR-код покупки
    // 2. venueCode:timestamp:transactionCode - QR-код без суммы
    // 3. Просто код пользователя (ID или referral code)
    try {
      const parts = code.split(':');
      if (parts.length >= 3) {
        // Это QR-код транзакции
        const [scannedVenueCode, amountOrTimestamp, timestampOrCode, transactionCode] = parts;
        
        // Проверяем, есть ли сумма (если второй элемент - число больше 1000, это timestamp, иначе - сумма)
        const secondPart = parseFloat(amountOrTimestamp);
        if (!isNaN(secondPart) && secondPart < 1000000) {
          // Это сумма
          const amount = secondPart;
          const timestamp = parseInt(timestampOrCode);
          alert(`QR-код покупки:\nЗаведение: ${scannedVenueCode}\nСумма: ${amount}₽\nВремя: ${new Date(timestamp).toLocaleString()}\nКод транзакции: ${transactionCode || 'N/A'}`);
        } else {
          // Это timestamp
          const timestamp = parseInt(amountOrTimestamp);
          alert(`QR-код транзакции:\nЗаведение: ${scannedVenueCode}\nВремя: ${new Date(timestamp).toLocaleString()}\nКод транзакции: ${timestampOrCode}`);
        }
      } else {
        // Это QR-код пользователя для начисления баллов
        alert(`QR-код пользователя: ${code}\nНачисление баллов...`);
        // Здесь можно вызвать API для начисления баллов
        // Например: await apiClient.post('/cashier/award-points', { userCode: code, venueCode });
      }
    } catch (error) {
      console.error('Ошибка обработки QR-кода:', error);
      alert('Ошибка обработки QR-кода');
    }
  };

  if (authLoading) {
    return <LoadingSpinner text="Загрузка..." />;
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <div className="container">
          <div className="card">
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const venueCode = (user as any)?.venue_code || 'VKU';

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="card">
          <h3>Кассир</h3>
          
          {user && (
            <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Заведение: {(user as any)?.venue_name || venueCode}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <button 
              className="btn btn-primary btn-full" 
              onClick={handleGenerateQR}
              style={{
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <span>📱</span>
              <span>Сгенерировать QR</span>
            </button>

            <button 
              className="btn btn-secondary btn-full" 
              onClick={handleScanQR}
              style={{
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <span>📷</span>
              <span>Сканировать QR</span>
            </button>
          </div>

          <div className="cashier-actions">
            <button 
              className="btn btn-secondary"
              onClick={logout}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно генерации QR */}
      <QRGeneratorModal
        isOpen={isQRGeneratorOpen}
        onClose={() => setIsQRGeneratorOpen(false)}
        purchaseAmount={purchaseAmount}
        venueCode={venueCode}
      />

      {/* Модальное окно сканирования QR */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScanned}
      />
    </ErrorBoundary>
  );
};

export default CashierPage;
