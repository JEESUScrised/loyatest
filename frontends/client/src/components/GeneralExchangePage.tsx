import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileTabBar from './MobileTabBar';
import { ErrorBoundary } from './common/ErrorBoundary';
import { useApp } from '../contexts/AppContext';

const GeneralExchangePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Главная');
  const navigate = useNavigate();
  const { user, isLoading, error } = useApp();

  const handleTabClick = (tab: string) => {
    if (tab === 'Главная') {
      navigate('/');
    }
  };

  const handleVenueClick = (venue: any) => {
    console.log('Выбрано заведение:', venue);
    // Переходим на страницу обмена баллов конкретного заведения
    navigate(`/venue/${venue.id}/exchange`);
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

  // Список заведений для обмена общих баллов (другие заведения)
  const venues = [
    {
      id: 4,
      name: 'Ресторан «Золотой Дракон»',
      address: 'пр. Победы, 25',
      logo: '/assets/brands/mamamia.svg', // Временно используем существующий логотип
      description: 'Азиатская кухня, суши, роллы'
    },
    {
      id: 5,
      name: 'Кафе «Уют»',
      address: 'ул. Центральная, 7',
      logo: '/assets/brands/bodrost.svg', // Временно используем существующий логотип
      description: 'Домашняя кухня, десерты, чай'
    },
    {
      id: 6,
      name: 'Столовая «Сытно»',
      address: 'ул. Рабочая, 12',
      logo: '/assets/brands/vkusno.svg', // Временно используем существующий логотип
      description: 'Бизнес-ланчи, супы, вторые блюда'
    },
    {
      id: 7,
      name: 'Пекарня «Свежий хлеб»',
      address: 'ул. Хлебная, 3',
      logo: '/assets/brands/mamamia.svg', // Временно используем существующий логотип
      description: 'Свежая выпечка, хлеб, кондитерские изделия'
    },
    {
      id: 8,
      name: 'Суши-бар «Сакура»',
      address: 'ул. Пушкина, 25',
      logo: '/assets/brands/sakura.svg',
      description: 'Японская кухня, суши, сашими'
    },
    {
      id: 9,
      name: 'Стейк-хаус «Мясо»',
      address: 'пр. Победы, 78',
      logo: '/assets/brands/meat.svg',
      description: 'Стейки, мясные блюда, гриль'
    },
    {
      id: 10,
      name: 'Ресторан «Италия»',
      address: 'ул. Итальянская, 33',
      logo: '/assets/brands/italy.svg',
      description: 'Итальянская кухня, паста, пицца'
    },
    {
      id: 11,
      name: 'Бар «Коктейль»',
      address: 'ул. Ночная, 67',
      logo: '/assets/brands/cocktail.svg',
      description: 'Коктейли, алкоголь, закуски'
    },
    {
      id: 12,
      name: 'Фастфуд «Быстро»',
      address: 'ул. Скоростная, 89',
      logo: '/assets/brands/fast.svg',
      description: 'Бургеры, картошка фри, напитки'
    },
    {
      id: 13,
      name: 'Рыбный ресторан «Океан»',
      address: 'ул. Морская, 156',
      logo: '/assets/brands/ocean.svg',
      description: 'Морепродукты, рыба, устрицы'
    },
    {
      id: 14,
      name: 'Веган-кафе «Зелень»',
      address: 'ул. Экологичная, 23',
      logo: '/assets/brands/green.svg',
      description: 'Веганская кухня, смузи, салаты'
    },
    {
      id: 15,
      name: 'Грузинский ресторан «Тбилиси»',
      address: 'ул. Кавказская, 78',
      logo: '/assets/brands/tbilisi.svg',
      description: 'Грузинская кухня, хачапури, шашлык'
    },
    {
      id: 16,
      name: 'Китайский ресторан «Дракон»',
      address: 'ул. Восточная, 91',
      logo: '/assets/brands/dragon.svg',
      description: 'Китайская кухня, лапша, утка'
    },
    {
      id: 17,
      name: 'Мексиканский ресторан «Сомбреро»',
      address: 'ул. Мексиканская, 44',
      logo: '/assets/brands/sombrero.svg',
      description: 'Мексиканская кухня, тако, буррито'
    },
    {
      id: 18,
      name: 'Французская пекарня «Круассан»',
      address: 'ул. Французская, 67',
      logo: '/assets/brands/croissant.svg',
      description: 'Французская выпечка, круассаны, макаруны'
    },
    {
      id: 19,
      name: 'Индийский ресторан «Карри»',
      address: 'ул. Индийская, 82',
      logo: '/assets/brands/curry.svg',
      description: 'Индийская кухня, карри, наан'
    },
    {
      id: 20,
      name: 'Турецкий ресторан «Кебаб»',
      address: 'ул. Турецкая, 35',
      logo: '/assets/brands/kebab.svg',
      description: 'Турецкая кухня, кебаб, дёнер'
    },
    {
      id: 21,
      name: 'Японский ресторан «Токио»',
      address: 'ул. Японская, 58',
      logo: '/assets/brands/tokyo.svg',
      description: 'Японская кухня, рамен, темпура'
    },
    {
      id: 22,
      name: 'Корейский ресторан «Сеул»',
      address: 'ул. Корейская, 73',
      logo: '/assets/brands/seoul.svg',
      description: 'Корейская кухня, кимчи, бибимбап'
    },
    {
      id: 23,
      name: 'Тайский ресторан «Бангкок»',
      address: 'ул. Тайская, 29',
      logo: '/assets/brands/bangkok.svg',
      description: 'Тайская кухня, том ям, пад тай'
    },
    {
      id: 24,
      name: 'Вьетнамский ресторан «Хошимин»',
      address: 'ул. Вьетнамская, 46',
      logo: '/assets/brands/hochimin.svg',
      description: 'Вьетнамская кухня, фо, спринг роллы'
    },
    {
      id: 25,
      name: 'Испанский ресторан «Мадрид»',
      address: 'ул. Испанская, 61',
      logo: '/assets/brands/madrid.svg',
      description: 'Испанская кухня, паэлья, тапас'
    },
    {
      id: 26,
      name: 'Греческий ресторан «Афины»',
      address: 'ул. Греческая, 84',
      logo: '/assets/brands/athens.svg',
      description: 'Греческая кухня, гирос, мусака'
    },
    {
      id: 27,
      name: 'Немецкий ресторан «Мюнхен»',
      address: 'ул. Немецкая, 97',
      logo: '/assets/brands/munich.svg',
      description: 'Немецкая кухня, колбаски, пиво'
    },
    {
      id: 28,
      name: 'Американский ресторан «Техас»',
      address: 'ул. Американская, 52',
      logo: '/assets/brands/texas.svg',
      description: 'Американская кухня, барбекю, стейки'
    },
    {
      id: 29,
      name: 'Бразильский ресторан «Рио»',
      address: 'ул. Бразильская, 38',
      logo: '/assets/brands/rio.svg',
      description: 'Бразильская кухня, фейжоада, шашлык'
    },
    {
      id: 30,
      name: 'Аргентинский ресторан «Буэнос-Айрес»',
      address: 'ул. Аргентинская, 75',
      logo: '/assets/brands/buenosaires.svg',
      description: 'Аргентинская кухня, асадо, эмпанадас'
    },
    {
      id: 31,
      name: 'Перуанский ресторан «Лима»',
      address: 'ул. Перуанская, 43',
      logo: '/assets/brands/lima.svg',
      description: 'Перуанская кухня, севиче, ломо сальтадо'
    },
    {
      id: 32,
      name: 'Чилийский ресторан «Сантьяго»',
      address: 'ул. Чилийская, 66',
      logo: '/assets/brands/santiago.svg',
      description: 'Чилийская кухня, эмпанадас, куранто'
    }
  ];

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="card full-height-card">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
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

          {/* Общий баланс баллов */}
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
          
          {/* Список заведений */}
          <div>
            <h4 style={{marginBottom: '16px', color: 'var(--text)'}}>
              Заведения для обмена баллов
            </h4>
            
            <div className="scrollable-content" style={{maxHeight: 'calc(100vh - 300px)', overflowY: 'auto'}}>
              {venues.map((venue, index) => (
                <React.Fragment key={venue.id}>
                  <div 
                    className="list-item" 
                    onClick={() => handleVenueClick(venue)}
                    style={{
                      marginBottom: index < venues.length - 1 ? '12px' : '0',
                      padding: '16px',
                      minHeight: '80px'
                    }}
                  >
                    <img className="brand" src={venue.logo} alt={venue.name} />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 600, fontSize: '16px'}}>
                        {venue.name}
                      </div>
                    </div>
                    <div style={{
                      color: 'var(--accent)',
                      fontSize: '18px',
                      fontWeight: '500'
                    }}>
                      →
                    </div>
                  </div>
                  {index < venues.length - 1 && <div style={{height: '8px'}}></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div style={{height: '12px'}}></div>
          
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default GeneralExchangePage;
