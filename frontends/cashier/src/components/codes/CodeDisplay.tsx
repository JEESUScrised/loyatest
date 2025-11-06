import React, { useState, useEffect } from 'react';

interface CodeDisplayProps {
  code: string;
  expiryTime?: number; // в секундах
  onExpired?: () => void;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ 
  code, 
  expiryTime = 300, // 5 минут по умолчанию
  onExpired 
}) => {
  const [timeLeft, setTimeLeft] = useState(expiryTime);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (onExpired) {
            onExpired();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpired]);

  useEffect(() => {
    const newProgress = (timeLeft / expiryTime) * 100;
    setProgress(newProgress);
  }, [timeLeft, expiryTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // Можно добавить уведомление об успешном копировании
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  return (
    <div className="cashier">
      <div style={{fontWeight: 700, marginBottom: '8px'}}>
        Код для получения баллов
      </div>
      <div className="code">{code}</div>
      <div className="progress">
        <div style={{width: `${progress}%`}}></div>
      </div>
      <div className="time-left">
        Осталось: {timeLeft} сек
      </div>
      <div style={{height: '10px'}}></div>
      <button 
        className="btn"
        onClick={copyToClipboard}
      >
        Копировать код
      </button>
    </div>
  );
};

export default CodeDisplay;
