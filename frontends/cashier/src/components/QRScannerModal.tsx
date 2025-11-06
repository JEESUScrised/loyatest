import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerId = 'qr-scanner-cashier';

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
          onScan(decodedText);
          stopScanning();
          onClose();
        },
        (errorMessage) => {
          // Игнорируем ошибки сканирования (код еще не найден)
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
          Сканировать QR-код
        </h3>
        <p
          style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '24px'
          }}
        >
          Наведите камеру на QR-код клиента
        </p>

        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}
        >
          <div
            id={scannerId}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
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
              marginTop: '12px',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

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
            width: '100%',
            marginTop: error ? '0' : '16px'
          }}
        >
          Отмена
        </button>

        {error && (
          <button
            onClick={startScanning}
            style={{
              background: '#007bff',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              marginTop: '12px',
              border: 'none'
            }}
          >
            Повторить
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;

