import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ModernNavbar from './ModernNavbar';
import { ErrorBoundary } from './common/ErrorBoundary';
import { useZoomDetection } from '../hooks/useZoomDetection';
import { loadAllVenues, VenueData } from '../services/venueDataService';

const ModernPlacesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pointsType, setPointsType] = useState<'general' | 'personal'>('general');
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isZoomed } = useZoomDetection();

  const categories = [
    { id: 'all', label: 'Все', icon: '•' },
    { id: 'restaurant', label: 'Рестораны', icon: '•' },
    { id: 'cafe', label: 'Кафе', icon: '•' },
    { id: 'fastfood', label: 'Фастфуд', icon: '•' },
    { id: 'bar', label: 'Бары', icon: '•' }
  ];

  // Загружаем данные заведений из JSON
  useEffect(() => {
    const loadVenues = async () => {
      setIsLoading(true);
      try {
        const loadedVenues = await loadAllVenues();
        setVenues(loadedVenues);
      } catch (error) {
        console.error('Error loading venues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVenues();
  }, []);

  // Преобразуем данные заведений в формат для отображения
  const places = useMemo(() => {
    return venues.map(venue => ({
      id: venue.id,
      name: venue.name,
      address: venue.address,
      points: `${venue.pointsPerPurchase} ${venue.pointsPerPurchase === 1 ? 'балл' : venue.pointsPerPurchase < 5 ? 'балла' : 'баллов'}`,
      pointsType: venue.pointsType,
      logo: venue.logo,
      category: venue.category,
      rating: venue.rating,
      distance: '0.5 км', // TODO: добавить расчет расстояния
      isOpen: venue.isOpen,
      workingHours: venue.workingHours,
      description: venue.description
    }));
  }, [venues]);

  const handlePlaceClick = (place: any) => {
    navigate(`/venue/${place.id}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Фильтрация заведений
  const filteredPlaces = useMemo(() => {
    let filtered = places;

    // Фильтр по типу баллов
    filtered = filtered.filter(place => place.pointsType === pointsType);

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }

    // Фильтр по поисковому запросу
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory, pointsType, places]);

  return (
    <ErrorBoundary>
      <div className="container page-container" style={{ 
        minHeight: '100vh', 
        padding: '0 16px',
        position: 'relative',
        zIndex: 1,
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>


        {/* Информационное сообщение с переключателем */}
        <div 
          className="liquid-glass fade-in" 
          style={{ 
            marginBottom: '24px',
            animationDelay: '0.2s',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            background: pointsType === 'general' 
              ? 'rgba(100, 216, 203, 0.1)' 
              : 'rgba(179, 157, 219, 0.1)',
            border: pointsType === 'general' 
              ? '1px solid rgba(100, 216, 203, 0.3)' 
              : '1px solid rgba(179, 157, 219, 0.3)',
            color: pointsType === 'general' 
              ? 'var(--accent-primary)' 
              : 'var(--accent-secondary)',
            fontSize: '14px',
            lineHeight: '1.5',
            position: 'relative',
            zIndex: 5
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            {pointsType === 'general' 
              ? 'Эти заведения принимают общие баллы. Вы можете использовать баллы Loya в любом из этих заведений.'
              : 'Эти заведения принимают личные баллы. Вы можете получить и потратить баллы в этих заведениях.'
            }
          </div>
          
          {/* Переключатель типа баллов */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            border: '1px solid var(--glass-border)'
          }}>
            <button
              onClick={() => setPointsType('general')}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: pointsType === 'general' ? 'var(--accent-gradient)' : 'transparent',
                color: pointsType === 'general' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)'
              }}
            >
              Общие баллы
            </button>
            <button
              onClick={() => setPointsType('personal')}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: pointsType === 'personal' ? 'var(--accent-gradient)' : 'transparent',
                color: pointsType === 'personal' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)'
              }}
            >
              Личные баллы
            </button>
          </div>
        </div>

        {/* Список заведений */}
        {isLoading ? (
          <div className="modern-card fade-in" style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            animationDelay: '0.3s'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: 'var(--text-primary)',
              fontSize: '18px'
            }}>
              Загрузка заведений...
            </h3>
          </div>
        ) : (
          <div 
            className="hidden-scrollbar" 
            style={{ 
              position: 'relative',
              zIndex: 1,
              height: 'calc(100vh - 280px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '4px',
              paddingBottom: '20px',
              marginRight: '-4px',
              marginBottom: '20px'
            }}
          >
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0 4px 0 0'
            }}>
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place, index) => (
                <div
                  key={place.id}
                  className="modern-card-compact liquid-glass-hover slide-up"
                  onClick={() => handlePlaceClick(place)}
                  style={{ 
                    animationDelay: `${0.3 + index * 0.1}s`,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Статус открыто/закрыто */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: place.isOpen ? 'var(--success)' : 'var(--error)',
                    color: 'white'
                  }}>
                    {place.isOpen ? 'Открыто' : 'Закрыто'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Логотип */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--glass-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                      border: '1px solid var(--glass-border)'
                    }}>
                      {place.logo ? (
                        <img 
                          src={place.logo} 
                          alt={place.name}
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.textContent?.includes('🍽️')) {
                              parent.textContent = '🍽️';
                            }
                          }}
                        />
                      ) : (
                        '🍽️'
                      )}
                    </div>

                    {/* Информация */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        color: 'var(--text-primary)',
                        fontSize: '18px',
                        fontWeight: '600'
                      }}>
                        {place.name}
                      </h3>
                      
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: 'var(--text-secondary)',
                        fontSize: '14px'
                      }}>
                        {place.address}
                      </p>
                      
                      <p style={{ 
                        margin: '0 0 12px 0', 
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        lineHeight: '1.4'
                      }}>
                        {place.description}
                      </p>

                      {/* Метаинформация */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: 'var(--accent-primary)',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {place.rating}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: 'var(--text-secondary)',
                          fontSize: '12px'
                        }}>
                          {place.distance}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: 'var(--text-muted)',
                          fontSize: '12px'
                        }}>
                          {place.workingHours}
                        </div>
                      </div>
                    </div>

                    {/* Баллы */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}>
                      <div style={{
                        background: 'var(--accent-gradient)',
                        color: 'var(--bg-primary)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>
                        {place.points}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="modern-card fade-in" style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                animationDelay: '0.3s'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: 'var(--text-primary)',
                  fontSize: '18px'
                }}>
                  Заведения не найдены
                </h3>
                <p style={{ 
                  margin: '0', 
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}>
                  Попробуйте изменить поисковый запрос или выберите другую категорию
                </p>
              </div>
            )}
            </div>
          </div>
        )}

        <ModernNavbar />
      </div>
    </ErrorBoundary>
  );
};

export default ModernPlacesPage;
