import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useApp } from '../contexts/AppContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { hapticFeedback } = useApp();
  const scannerId = 'qr-scanner';

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Создаем экземпляр сканера
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      // Начинаем сканирование
      await scanner.start(
        {
          facingMode: 'environment' // Используем заднюю камеру
        },
        {
          fps: 10, // Кадров в секунду
          qrbox: { width: 250, height: 250 } // Размер области сканирования
        },
        (decodedText) => {
          // QR-код успешно отсканирован
          hapticFeedback.notification('success');
          onScan(decodedText);
          stopScanning();
          onClose();
        },
        (errorMessage) => {
          // Игнорируем ошибки сканирования (код еще не найден)
          // Ошибки выводятся только в консоль для отладки
        }
      );
    } catch (err: any) {
      console.error('Ошибка доступа к камере:', err);
      
      let errorMessage = 'Не удалось получить доступ к камере.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Доступ к камере запрещен. Разрешите доступ в настройках браузера.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Камера не найдена на устройстве.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Камера уже используется другим приложением.';
      }
      
      setError(errorMessage);
      setIsScanning(false);
      hapticFeedback.notification('error');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Ошибка остановки сканера:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h3 style={{
            margin: '0 0 8px 0',
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Сканирование QR-кода
          </h3>
          <p style={{
            margin: '0',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Наведите камеру на QR-код
          </p>
        </div>

        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          background: '#000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          {/* Контейнер для сканера */}
          <div id={scannerId} style={{
            width: '100%',
            height: '100%'
          }} />
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            color: 'var(--error)',
            fontSize: '14px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
          
          <button
            onClick={() => {
              stopScanning();
              startScanning();
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--accent-gradient)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--bg-primary)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Повторить
          </button>
        </div>

      </div>
    </div>
  );
};

export default QRScannerModal;

