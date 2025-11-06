import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModernNavbar from './ModernNavbar';
import { ErrorBoundary } from './common/ErrorBoundary';
import { loadVenueData, VenueData, isDoublePointsTime, getNextDoublePointsTime } from '../services/venueDataService';
import { useApp } from '../contexts/AppContext';

const VenuePage: React.FC = () => {
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();
  const { venueId } = useParams<{ venueId: string }>();
  const { user } = useApp();

  // Загружаем данные заведения
  useEffect(() => {
    const loadVenue = async () => {
      if (!venueId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const venueData = await loadVenueData(parseInt(venueId));
        if (venueData) {
          setVenue(venueData);
        }
      } catch (error) {
        console.error('Error loading venue:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVenue();
  }, [venueId]);

  // Получаем список категорий из меню
  const categories = useMemo(() => {
    if (!venue?.menu) return [];
    
    const uniqueCategories = Array.from(
      new Set(venue.menu.map(item => item.category))
    );
    
    return [
      { id: 'all', name: 'Все', icon: '🍽️' },
      ...uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        icon: getCategoryIcon(cat)
      }))
    ];
  }, [venue]);

  // Фильтруем меню по категории
  const filteredMenu = useMemo(() => {
    if (!venue?.menu) return [];
    
    if (selectedCategory === 'all') {
      return venue.menu;
    }
    
    return venue.menu.filter(item => item.category === selectedCategory);
  }, [venue, selectedCategory]);

  // Группируем меню по категориям
  const menuByCategory = useMemo(() => {
    const grouped: { [key: string]: typeof filteredMenu } = {};
    
    filteredMenu.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    
    return grouped;
  }, [filteredMenu]);

  const handlePurchase = async (item: VenueData['menu'][0]) => {
    if (!user) {
      alert('Необходимо войти в аккаунт');
      return;
    }

    const userPoints = user.points || 0;
    if (userPoints < item.pointsCost) {
      alert(`Недостаточно баллов. Необходимо: ${item.pointsCost}, у вас: ${userPoints}`);
      return;
    }

    // TODO: Реализовать покупку через API
    if (confirm(`Купить "${item.name}" за ${item.pointsCost} баллов?`)) {
      try {
        // Здесь будет вызов API для покупки
        alert(`Покупка "${item.name}" успешно оформлена!`);
      } catch (error) {
        console.error('Ошибка покупки:', error);
        alert('Произошла ошибка при оформлении покупки');
      }
    }
  };

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="container page-container" style={{ height: '100%', padding: '0 16px' }}>
          <div className="modern-card fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ margin: '0', color: 'var(--text-primary)', fontSize: '18px' }}>
              Загрузка...
            </h3>
          </div>
          <ModernNavbar />
        </div>
      </ErrorBoundary>
    );
  }

  if (!venue) {
    return (
      <ErrorBoundary>
        <div className="container page-container" style={{ height: '100%', padding: '0 16px' }}>
          <div className="modern-card fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '18px' }}>
              Заведение не найдено
            </h3>
            <button
              onClick={() => navigate('/places')}
              className="modern-btn"
              style={{ background: 'var(--accent-gradient)' }}
            >
              Вернуться к списку
            </button>
          </div>
          <ModernNavbar />
        </div>
      </ErrorBoundary>
    );
  }

  const isDoublePoints = isDoublePointsTime(venue);
  const nextDoublePoints = getNextDoublePointsTime(venue);

  return (
    <ErrorBoundary>
      <div className="container page-container" style={{ height: '100%', padding: '0 16px' }}>
        {/* Заголовок с кнопкой назад */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/places')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--glass-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ←
          </button>

          {/* Информация о заведении */}
          <div className="modern-card fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--glass-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--glass-border)',
                flexShrink: 0
              }}>
                {venue.logo ? (
                  <img
                    src={venue.logo}
                    alt={venue.name}
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('span')) {
                        const placeholder = document.createElement('span');
                        placeholder.textContent = '🍽️';
                        placeholder.style.fontSize = '32px';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '32px' }}>🍽️</span>
                )}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  color: 'var(--text-primary)',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  {venue.name}
                </h2>
                <p style={{
                  margin: '0 0 4px 0',
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}>
                  {venue.address}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    color: 'var(--accent-primary)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ⭐ {venue.rating}
                  </span>
                  <span style={{
                    color: venue.isOpen ? 'var(--success)' : 'var(--error)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {venue.isOpen ? 'Открыто' : 'Закрыто'}
                  </span>
                  <span style={{
                    color: 'var(--text-muted)',
                    fontSize: '12px'
                  }}>
                    {venue.workingHours}
                  </span>
                </div>
              </div>
            </div>

            <p style={{
              margin: '0 0 12px 0',
              color: 'var(--text-muted)',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {venue.description}
            </p>

            {/* Информация о баллах и мертвых часах */}
            <div style={{
              background: isDoublePoints ? 'rgba(100, 216, 203, 0.1)' : 'var(--glass-bg)',
              border: isDoublePoints ? '1px solid rgba(100, 216, 203, 0.3)' : '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
              marginTop: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}>
                  Баллов за покупку:
                </span>
                <span style={{
                  background: 'var(--accent-gradient)',
                  color: 'var(--bg-primary)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '14px',
                  fontWeight: '700'
                }}>
                  {isDoublePoints ? `${venue.pointsPerPurchase * 2} (x2)` : venue.pointsPerPurchase}
                </span>
              </div>
              
              {isDoublePoints && (
                <div style={{
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ⚡ Удвоенные баллы активны!
                </div>
              )}
              
              {!isDoublePoints && nextDoublePoints && (
                <div style={{
                  color: 'var(--text-muted)',
                  fontSize: '12px'
                }}>
                  Следующее удвоение: {nextDoublePoints.day}, {nextDoublePoints.time}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Категории меню */}
        {categories.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <div className="hidden-scrollbar" style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: selectedCategory === category.id
                      ? 'var(--accent-gradient)'
                      : 'var(--glass-bg)',
                    color: selectedCategory === category.id
                      ? 'var(--bg-primary)'
                      : 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all var(--transition-normal)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Меню */}
        <div className="hidden-scrollbar" style={{
          maxHeight: 'calc(100vh - 400px)',
          overflowY: 'auto',
          paddingBottom: '20px'
        }}>
          {filteredMenu.length === 0 ? (
            <div className="modern-card fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '18px' }}>
                Меню пусто
              </h3>
              <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                В этой категории пока нет блюд
              </p>
            </div>
          ) : (
            Object.entries(menuByCategory).map(([category, items], categoryIndex) => (
              <div key={category} style={{ marginBottom: '24px' }}>
                {selectedCategory === 'all' && (
                  <h3 style={{
                    margin: '0 0 16px 0',
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                  </h3>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="modern-card-compact liquid-glass-hover slide-up"
                      style={{
                        animationDelay: `${0.2 + (categoryIndex * 0.1) + (index * 0.05)}s`,
                        cursor: item.isAvailable ? 'pointer' : 'not-allowed',
                        opacity: item.isAvailable ? 1 : 0.6
                      }}
                      onClick={() => item.isAvailable && handlePurchase(item)}
                    >
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {/* Изображение */}
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--glass-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--glass-border)',
                          flexShrink: 0,
                          overflow: 'hidden'
                        }}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                // Скрываем изображение при ошибке загрузки
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Показываем placeholder
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('span')) {
                                  const placeholder = document.createElement('span');
                                  placeholder.textContent = '🍽️';
                                  placeholder.style.fontSize = '32px';
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '32px' }}>🍽️</span>
                          )}
                        </div>

                        {/* Информация о блюде */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                            <h4 style={{
                              margin: '0',
                              color: 'var(--text-primary)',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              {item.name}
                              {item.isPopular && (
                                <span style={{
                                  marginLeft: '8px',
                                  background: 'var(--accent-gradient)',
                                  color: 'var(--bg-primary)',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '10px',
                                  fontWeight: '700'
                                }}>
                                  POPULAR
                                </span>
                              )}
                            </h4>
                          </div>

                          <p style={{
                            margin: '0 0 8px 0',
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            lineHeight: '1.4'
                          }}>
                            {item.description}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{
                              background: 'var(--accent-gradient)',
                              color: 'var(--bg-primary)',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '14px',
                              fontWeight: '700'
                            }}>
                              {item.pointsCost} баллов
                            </div>
                            {item.price > 0 && (
                              <span style={{
                                color: 'var(--text-muted)',
                                fontSize: '12px',
                                textDecoration: 'line-through'
                              }}>
                                {item.price} ₽
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <ModernNavbar />
      </div>
    </ErrorBoundary>
  );
};

// Вспомогательная функция для иконок категорий
function getCategoryIcon(category: string): string {
  const icons: { [key: string]: string } = {
    'Пицца': '🍕',
    'Паста': '🍝',
    'Бургеры': '🍔',
    'Десерты': '🍰',
    'Напитки': '🥤',
    'Кофе': '☕',
    'Выпечка': '🥐',
    'Еда': '🍽️',
    'Гарниры': '🍟',
    'Закуски': '🍗',
    'Роллы': '🍣',
    'Сашими': '🍱'
  };
  
  return icons[category] || '🍽️';
}

export default VenuePage;
