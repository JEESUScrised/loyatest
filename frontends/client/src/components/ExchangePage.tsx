import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileTabBar from './MobileTabBar';
import Modal from './common/Modal';
import { ErrorBoundary } from './common/ErrorBoundary';
import { useApp } from '../contexts/AppContext';

const ExchangePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Главная');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate();
  const { venueId } = useParams<{ venueId: string }>();
  const { user, isLoading, error } = useApp();

  // Данные заведений
  const venues = {
    '1': {
      id: 1,
      name: 'Пиццерия «Мама Мия»',
      address: 'ул. Ленина, 15',
      points: '5 баллов',
      logo: '/assets/brands/mamamia.svg'
    },
    '2': {
      id: 2,
      name: 'Кофейня «Бодрость»',
      address: 'пр. Мира, 42',
      points: '3 балла',
      logo: '/assets/brands/bodrost.svg'
    },
    '3': {
      id: 3,
      name: 'Бургерная «Вкусно»',
      address: 'ул. Гагарина, 8',
      points: '4 балла',
      logo: '/assets/brands/vkusno.svg'
    },
    '4': {
      id: 4,
      name: 'Ресторан «Золотой Дракон»',
      address: 'пр. Победы, 25',
      points: '6 баллов',
      logo: '/assets/brands/mamamia.svg'
    },
    '5': {
      id: 5,
      name: 'Кафе «Уют»',
      address: 'ул. Центральная, 7',
      points: '4 балла',
      logo: '/assets/brands/bodrost.svg'
    },
    '6': {
      id: 6,
      name: 'Столовая «Сытно»',
      address: 'ул. Рабочая, 12',
      points: '3 балла',
      logo: '/assets/brands/vkusno.svg'
    },
    '7': {
      id: 7,
      name: 'Пекарня «Свежий хлеб»',
      address: 'ул. Хлебная, 3',
      points: '2 балла',
      logo: '/assets/brands/mamamia.svg'
    }
  };

  const venue = venues[venueId as keyof typeof venues];

  if (!venue) {
    return (
      <ErrorBoundary>
        <div className="container">
          <div className="card">
            <h3>Заведение не найдено</h3>
            <button onClick={() => navigate('/places')} className="btn">
              Вернуться к списку заведений
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Меню заведения
  const menuItems = {
    '1': [ // Пиццерия «Мама Мия»
      { id: 1, name: 'Пицца Маргарита', price: 150, points: 30, category: 'Пицца' },
      { id: 2, name: 'Пицца Пепперони', price: 180, points: 36, category: 'Пицца' },
      { id: 3, name: 'Паста Карбонара', price: 120, points: 24, category: 'Паста' },
      { id: 4, name: 'Салат Цезарь', price: 90, points: 18, category: 'Салаты' },
      { id: 5, name: 'Кока-Кола 0.5л', price: 50, points: 10, category: 'Напитки' }
    ],
    '2': [ // Кофейня «Бодрость»
      { id: 1, name: 'Капучино', price: 80, points: 16, category: 'Кофе' },
      { id: 2, name: 'Латте', price: 90, points: 18, category: 'Кофе' },
      { id: 3, name: 'Американо', price: 60, points: 12, category: 'Кофе' },
      { id: 4, name: 'Круассан с шоколадом', price: 70, points: 14, category: 'Выпечка' },
      { id: 5, name: 'Чизкейк', price: 100, points: 20, category: 'Десерты' }
    ],
    '3': [ // Бургерная «Вкусно»
      { id: 1, name: 'Классический бургер', price: 200, points: 40, category: 'Бургеры' },
      { id: 2, name: 'Чизбургер', price: 220, points: 44, category: 'Бургеры' },
      { id: 3, name: 'Картофель фри', price: 80, points: 16, category: 'Гарниры' },
      { id: 4, name: 'Куриные крылышки', price: 150, points: 30, category: 'Закуски' },
      { id: 5, name: 'Молочный коктейль', price: 90, points: 18, category: 'Напитки' }
    ],
    '4': [ // Ресторан «Золотой Дракон»
      { id: 1, name: 'Ролл Филадельфия', price: 250, points: 50, category: 'Суши' },
      { id: 2, name: 'Ролл Калифорния', price: 200, points: 40, category: 'Суши' },
      { id: 3, name: 'Лапша удон с курицей', price: 180, points: 36, category: 'Лапша' },
      { id: 4, name: 'Суп том ям', price: 150, points: 30, category: 'Супы' },
      { id: 5, name: 'Зеленый чай', price: 60, points: 12, category: 'Напитки' }
    ],
    '5': [ // Кафе «Уют»
      { id: 1, name: 'Борщ украинский', price: 120, points: 24, category: 'Супы' },
      { id: 2, name: 'Котлета по-киевски', price: 180, points: 36, category: 'Основные блюда' },
      { id: 3, name: 'Тирамису', price: 100, points: 20, category: 'Десерты' },
      { id: 4, name: 'Чай с лимоном', price: 50, points: 10, category: 'Напитки' },
      { id: 5, name: 'Блины с вареньем', price: 80, points: 16, category: 'Выпечка' }
    ],
    '6': [ // Столовая «Сытно»
      { id: 1, name: 'Бизнес-ланч', price: 150, points: 30, category: 'Комплексные обеды' },
      { id: 2, name: 'Суп гороховый', price: 80, points: 16, category: 'Супы' },
      { id: 3, name: 'Гречка с мясом', price: 120, points: 24, category: 'Гарниры' },
      { id: 4, name: 'Компот из сухофруктов', price: 40, points: 8, category: 'Напитки' },
      { id: 5, name: 'Хлеб ржаной', price: 20, points: 4, category: 'Хлеб' }
    ],
    '7': [ // Пекарня «Свежий хлеб»
      { id: 1, name: 'Хлеб бородинский', price: 60, points: 12, category: 'Хлеб' },
      { id: 2, name: 'Булочка с маком', price: 40, points: 8, category: 'Выпечка' },
      { id: 3, name: 'Торт Наполеон', price: 200, points: 40, category: 'Торты' },
      { id: 4, name: 'Печенье овсяное', price: 30, points: 6, category: 'Печенье' },
      { id: 5, name: 'Круассан с сыром', price: 50, points: 10, category: 'Выпечка' }
    ]
  };

  const items = menuItems[venueId as keyof typeof menuItems] || [];

  const handleTabClick = (tab: string) => {
    if (tab === 'Главная') {
      navigate('/');
    }
  };

  const handleItemClick = (item: any) => {
    console.log('Выбран товар:', item);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (selectedItem) {
      // Здесь будет логика покупки товара за баллы
      console.log('Покупка подтверждена:', selectedItem);
      alert(`Покупка "${selectedItem.name}" за ${selectedItem.points} баллов успешно совершена!`);
      setIsModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Определяем, является ли устройство мобильным
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Добавляем класс для мобильной версии
    if (isMobile) {
      document.body.classList.add('mobile-layout');
    } else {
      document.body.classList.remove('mobile-layout');
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.classList.remove('mobile-layout');
    };
  }, [isMobile]);

  // Группируем товары по категориям
  const groupedItems = items.reduce((acc: any, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <ErrorBoundary>
      <div className="container" style={{height: '100%', padding: 0}}>
        <div className="card full-height-card" style={{borderRadius: '38px'}}>
          <div style={{padding: '20px 20px 0 20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <button 
                onClick={() => navigate('/')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ←
              </button>
            </div>
          </div>
          
          <div className="scrollable-content">
          
          {/* Баланс баллов */}
          {/* Отображение ошибок */}
          {error && (
            <div style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#ff6b6b'
            }}>
              {error}
            </div>
          )}

          {/* Индикатор загрузки */}
          {isLoading && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--muted)'
            }}>
              Загрузка...
            </div>
          )}

          {/* Блок с общими баллами */}
          <div className="list-item">
            <img 
              src="/assets/icons/points-1-gold.svg" 
              width="32" 
              height="32" 
              alt="баллы"
            />
            <div>
              <div className="points-text">
                {user?.pointsBalance || 0} баллов
              </div>
              <div className="sub">Общий баланс</div>
            </div>
          </div>
          
          <div style={{height: '12px'}}></div>
          
          {/* Меню заведения */}
          <div>
            <h4 style={{marginBottom: '16px', color: 'var(--text)'}}>Меню {venue.name}</h4>
            
              {Object.entries(groupedItems).map(([category, categoryItems]: [string, any]) => (
                <div key={category} style={{marginBottom: '24px'}}>
                  <h5 style={{
                    marginBottom: '12px', 
                    color: 'var(--accent)', 
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {category}
                  </h5>
                  
                  {categoryItems.map((item: any) => (
                    <div 
                      key={item.id}
                      className="list-item" 
                      onClick={() => handleItemClick(item)}
                      style={{marginBottom: '8px'}}
                    >
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 600, marginBottom: '4px'}}>{item.name}</div>
                        <div className="sub">{item.price} ₽</div>
                      </div>
                      <div className="meta" style={{color: 'var(--accent)', fontWeight: '600'}}>
                        {item.points} баллов
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{height: '12px'}}></div>
          
          </div>
        </div>

        {/* Модальное окно подтверждения покупки */}
        <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Подтверждение покупки"
      >
        {selectedItem && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--accent)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                🍕
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '20px' }}>
                  {selectedItem.name}
                </div>
                <div className="sub" style={{ fontSize: '16px' }}>
                  {selectedItem.price} ₽
                </div>
              </div>
              <div style={{
                color: 'var(--accent)',
                fontWeight: '600',
                fontSize: '22px'
              }}>
                {selectedItem.points} баллов
              </div>
            </div>

            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(100, 216, 203, 0.1)',
              border: '1px solid rgba(100, 216, 203, 0.3)',
              borderRadius: '12px',
              color: 'var(--accent)',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              У вас есть {user?.pointsBalance || 0} баллов. Для покупки необходимо {selectedItem.points} баллов.
            </div>

            <div style={{
              display: 'flex',
              gap: '16px'
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  minHeight: '56px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmPurchase}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  border: 'none',
                  color: '#0b0f14',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  minHeight: '56px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                Купить
              </button>
            </div>
          </div>
        )}
      </Modal>
    </ErrorBoundary>
  );
};

export default ExchangePage;
