import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface QRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseAmount?: number;
  venueCode?: string;
}

const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({ 
  isOpen, 
  onClose, 
  purchaseAmount = 0,
  venueCode = ''
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [qrInfo, setQrInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen && venueCode) {
      generateQRCode();
    }
  }, [isOpen, purchaseAmount, venueCode]);

  const generateQRCode = async () => {
    try {
      setIsLoadingQR(true);
      setError(null);
      
      // Отправляем запрос на бэкенд для генерации QR-кода
      // Если сумма не указана, отправляем 0 или минимальное значение
      const response = await apiClient.post('/venue/generate-qr', {
        venueCode,
        purchaseAmount: purchaseAmount || 0
      });

      if (!response.success) {
        throw new Error(response.message || 'Ошибка генерации QR-кода');
      }

      const transactionId = response.data?.qrData || response.data?.transactionId;
      if (!transactionId) {
        throw new Error('Не получен transactionId от сервера');
      }

      setQrData(transactionId);
      setQrInfo(response.data);
      
      // Используем внешний API для генерации QR-кода
      const size = 256;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(transactionId)}`;
      
      // Загружаем изображение QR-кода
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Создаем canvas для конвертации в data URL
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          setQrCodeDataUrl(canvas.toDataURL('image/png'));
        }
        setIsLoadingQR(false);
      };
      
      img.onerror = () => {
        console.error('Ошибка загрузки QR-кода');
        setIsLoadingQR(false);
        setError('Ошибка загрузки QR-кода');
      };
      
      img.src = qrUrl;
    } catch (error: any) {
      console.error('Ошибка генерации QR-кода:', error);
      setError(error.message || 'Ошибка генерации QR-кода');
      setIsLoadingQR(false);
    }
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData).then(() => {
      alert('Данные QR-кода скопированы в буфер обмена!');
    }).catch(() => {
      alert('Не удалось скопировать данные.');
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#666',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <h3
          style={{
            color: '#333',
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '16px'
          }}
        >
          QR-код для начисления баллов
        </h3>
        
        <div style={{ marginBottom: '24px' }}>
          {purchaseAmount > 0 && (
            <p
              style={{
                color: '#666',
                fontSize: '14px',
                marginBottom: '4px'
              }}
            >
              Сумма: {purchaseAmount}₽
            </p>
          )}
          {qrInfo && (
            <>
              <p
                style={{
                  color: '#666',
                  fontSize: '14px',
                  marginBottom: '4px',
                  fontWeight: '600'
                }}
              >
                Баллов: {qrInfo.pointsValue}
              </p>
              {qrInfo.isDoublePoints && (
                <p
                  style={{
                    color: '#10b981',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}
                >
                  ✨ Удвоенные баллы!
                </p>
              )}
            </>
          )}
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              color: '#ef4444',
              fontSize: '14px',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        {/* QR Code */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            {qrCodeDataUrl && !isLoadingQR ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                style={{
                  width: '200px',
                  height: '200px',
                  display: 'block'
                }}
              />
            ) : (
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '14px'
                }}
              >
                {isLoadingQR ? 'Генерация QR-кода...' : 'Загрузка QR-кода...'}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка копирования данных */}
        <button
          onClick={copyQRData}
          style={{
            background: '#007bff',
            border: 'none',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '12px'
          }}
        >
          Копировать данные
        </button>

        <button
          onClick={onClose}
          style={{
            background: '#f0f0f0',
            border: 'none',
            color: '#666',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default QRGeneratorModal;

