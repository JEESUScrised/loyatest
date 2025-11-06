import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { apiClient } from '../services/apiClient';

interface RegistrationFormProps {
  onComplete: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onComplete }) => {
  const { user, refetch, hapticFeedback } = useApp();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.first_name || '',
    birthDate: '',
    city: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Выберите дату рождения';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // Если день рождения еще не наступил в этом году
        if (age < 13 || age > 120) {
          newErrors.birthDate = 'Введите корректную дату рождения';
        }
      } else if (age < 13 || age > 120) {
        newErrors.birthDate = 'Введите корректную дату рождения';
      }
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Введите город';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      hapticFeedback.notification('error');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback.selection();

    try {
      const response = await apiClient.put('/user/complete-registration', {
        firstName: formData.firstName.trim(),
        birthDate: formData.birthDate,
        city: formData.city.trim()
      });

      if (response.success) {
        hapticFeedback.notification('success');
        await refetch();
        onComplete();
      } else {
        throw new Error(response.message || 'Ошибка сохранения данных');
      }
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      hapticFeedback.notification('error');
      setErrors({
        submit: error.message || 'Не удалось сохранить данные. Попробуйте еще раз.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Получаем максимальную дату (сегодня) и минимальную (120 лет назад)
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  const minDate = new Date(today.getFullYear() - 120, 0, 1).toISOString().split('T')[0];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="modern-card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '32px',
        animation: 'fade-in 0.5s ease'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            margin: '0 0 12px 0',
            color: 'var(--text-primary)',
            fontSize: '28px',
            fontWeight: '700'
          }}>
            Добро пожаловать! 👋
          </h1>
          <p style={{
            margin: '0',
            color: 'var(--text-secondary)',
            fontSize: '16px'
          }}>
            Завершите регистрацию, чтобы начать зарабатывать баллы
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Имя */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Имя *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName' as keyof typeof formData, e.target.value)}
                className="modern-input"
                placeholder="Введите ваше имя"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--glass-bg)',
                  border: errors.firstName 
                    ? '1px solid var(--error)' 
                    : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  fontSize: '16px'
                }}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <div style={{
                  marginTop: '6px',
                  color: 'var(--error)',
                  fontSize: '12px'
                }}>
                  {errors.firstName}
                </div>
              )}
            </div>

            {/* Дата рождения */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Дата рождения *
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate' as keyof typeof formData, e.target.value)}
                min={minDate}
                max={maxDate}
                className="modern-input"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--glass-bg)',
                  border: errors.birthDate 
                    ? '1px solid var(--error)' 
                    : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  fontSize: '16px'
                }}
                disabled={isSubmitting}
              />
              {errors.birthDate && (
                <div style={{
                  marginTop: '6px',
                  color: 'var(--error)',
                  fontSize: '12px'
                }}>
                  {errors.birthDate}
                </div>
              )}
            </div>

            {/* Город */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Город *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city' as keyof typeof formData, e.target.value)}
                className="modern-input"
                placeholder="Введите ваш город"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--glass-bg)',
                  border: errors.city 
                    ? '1px solid var(--error)' 
                    : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  fontSize: '16px'
                }}
                disabled={isSubmitting}
              />
              {errors.city && (
                <div style={{
                  marginTop: '6px',
                  color: 'var(--error)',
                  fontSize: '12px'
                }}>
                  {errors.city}
                </div>
              )}
            </div>

            {/* Общая ошибка */}
            {errors.submit && (
              <div style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {errors.submit}
              </div>
            )}

            {/* Кнопка отправки */}
            <button
              type="submit"
              className="modern-btn"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '16px',
                marginTop: '8px',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Сохранение...' : 'Завершить регистрацию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;

