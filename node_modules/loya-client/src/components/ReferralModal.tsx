import React, { useState, useEffect } from 'react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  referralLink: string;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, referralCode, referralLink }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  useEffect(() => {
    if (isOpen && referralLink) {
      generateQRCode();
    }
  }, [isOpen, referralLink]);

  const generateQRCode = async () => {
    try {
      setIsLoadingQR(true);
      // Используем внешний API для генерации QR-кода
      const size = 256;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(referralLink)}`;
      
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
      };
      
      img.src = qrUrl;
    } catch (error) {
      console.error('Ошибка генерации QR-кода:', error);
      setIsLoadingQR(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Ссылка скопирована в буфер обмена!');
    }).catch(() => {
      alert('Не удалось скопировать ссылку');
    });
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      alert('Код скопирован в буфер обмена!');
    }).catch(() => {
      alert('Не удалось скопировать код');
    });
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
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="modern-card"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '24px',
          position: 'relative',
          animation: 'fade-in 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all var(--transition-normal)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--glass-bg)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{
            margin: '0 0 8px 0',
            color: 'var(--text-primary)',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            Реферальная программа
          </h2>
          <p style={{
            margin: '0',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Пригласите друга и получите бонусы!
          </p>
        </div>

        {/* QR-код */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)'
          }}>
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
              <div style={{
                width: '200px',
                height: '200px',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                {isLoadingQR ? 'Генерация QR-кода...' : 'Загрузка QR-кода...'}
              </div>
            )}
          </div>
        </div>

        {/* Реферальный код */}
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            marginBottom: '8px',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            Ваш реферальный код
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--accent-primary)',
              letterSpacing: '4px',
              flex: 1,
              textAlign: 'center',
              fontFamily: 'monospace'
            }}>
              {referralCode}
            </div>
            <button
              onClick={copyReferralCode}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '14px',
                transition: 'all var(--transition-normal)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--glass-hover)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--glass-bg)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              📋
            </button>
          </div>
        </div>

        {/* Реферальная ссылка */}
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            marginBottom: '8px',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            Реферальная ссылка
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-primary)',
              flex: 1,
              wordBreak: 'break-all',
              fontFamily: 'monospace'
            }}>
              {referralLink}
            </div>
            <button
              onClick={copyReferralLink}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '14px',
                transition: 'all var(--transition-normal)',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--glass-hover)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--glass-bg)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              📋
            </button>
          </div>
        </div>

        {/* Информация о бонусах */}
        <div style={{
          background: 'rgba(100, 216, 203, 0.1)',
          border: '1px solid rgba(100, 216, 203, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🎁</span>
            <div style={{
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Как это работает?
            </div>
          </div>
          <ul style={{
            margin: '0',
            paddingLeft: '20px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            lineHeight: '1.6'
          }}>
            <li>Поделитесь QR-кодом или ссылкой с другом</li>
            <li>Друг регистрируется по вашей ссылке</li>
            <li>Вы получаете бонусные баллы!</li>
          </ul>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="modern-btn"
          style={{
            width: '100%',
            padding: '14px'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ReferralModal;

