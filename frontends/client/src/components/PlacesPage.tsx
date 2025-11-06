import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileTabBar from './MobileTabBar';
import { ErrorBoundary } from './common/ErrorBoundary';

const PlacesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Места');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    // Переключение между экранами через роутинг
    switch(tab) {
      case 'Главная':
        navigate('/');
        break;
      case 'Места':
        navigate('/places');
        break;
      case 'Кассир':
        navigate('/cashier');
        break;
      case 'Админ':
        navigate('/admin');
        break;
      default:
        break;
    }
  };

  const handlePlaceClick = (place: any) => {
    console.log('Выбрано место:', place);
    // Переходим на страницу конкретного заведения
    navigate(`/venue/${place.id}`);
  };

  // Определяем, является ли устройство мобильным
  const [isMobile, setIsMobile] = useState(false);

  const places = useMemo(() => [
    {
      id: 1,
      name: 'Пиццерия «Мама Мия»',
      address: 'ул. Ленина, 15',
      points: '5 баллов',
      logo: '/assets/brands/mamamia.svg'
    },
    {
      id: 2,
      name: 'Кофейня «Бодрость»',
      address: 'пр. Мира, 42',
      points: '3 балла',
      logo: '/assets/brands/bodrost.svg'
    },
    {
      id: 3,
      name: 'Бургерная «Вкусно»',
      address: 'ул. Гагарина, 8',
      points: '4 балла',
      logo: '/assets/brands/vkusno.svg'
    },
    {
      id: 4,
      name: 'Суши-бар «Сакура»',
      address: 'ул. Пушкина, 25',
      points: '6 баллов',
      logo: '/assets/brands/sakura.svg'
    },
    {
      id: 5,
      name: 'Стейк-хаус «Мясо»',
      address: 'пр. Победы, 78',
      points: '8 баллов',
      logo: '/assets/brands/meat.svg'
    },
    {
      id: 6,
      name: 'Пекарня «Свежий хлеб»',
      address: 'ул. Садовая, 12',
      points: '2 балла',
      logo: '/assets/brands/bread.svg'
    },
    {
      id: 7,
      name: 'Ресторан «Италия»',
      address: 'ул. Итальянская, 33',
      points: '7 баллов',
      logo: '/assets/brands/italy.svg'
    },
    {
      id: 8,
      name: 'Кафе «Уют»',
      address: 'ул. Центральная, 45',
      points: '3 балла',
      logo: '/assets/brands/cozy.svg'
    },
    {
      id: 9,
      name: 'Бар «Коктейль»',
      address: 'ул. Ночная, 67',
      points: '5 баллов',
      logo: '/assets/brands/cocktail.svg'
    },
    {
      id: 10,
      name: 'Фастфуд «Быстро»',
      address: 'ул. Скоростная, 89',
      points: '2 балла',
      logo: '/assets/brands/fast.svg'
    },
    {
      id: 11,
      name: 'Рыбный ресторан «Океан»',
      address: 'ул. Морская, 156',
      points: '9 баллов',
      logo: '/assets/brands/ocean.svg'
    },
    {
      id: 12,
      name: 'Веган-кафе «Зелень»',
      address: 'ул. Экологичная, 23',
      points: '4 балла',
      logo: '/assets/brands/green.svg'
    },
    {
      id: 13,
      name: 'Грузинский ресторан «Тбилиси»',
      address: 'ул. Кавказская, 78',
      points: '6 баллов',
      logo: '/assets/brands/tbilisi.svg'
    },
    {
      id: 14,
      name: 'Китайский ресторан «Дракон»',
      address: 'ул. Восточная, 91',
      points: '5 баллов',
      logo: '/assets/brands/dragon.svg'
    },
    {
      id: 15,
      name: 'Мексиканский ресторан «Сомбреро»',
      address: 'ул. Мексиканская, 44',
      points: '7 баллов',
      logo: '/assets/brands/sombrero.svg'
    },
    {
      id: 16,
      name: 'Французская пекарня «Круассан»',
      address: 'ул. Французская, 67',
      points: '4 балла',
      logo: '/assets/brands/croissant.svg'
    },
    {
      id: 17,
      name: 'Индийский ресторан «Карри»',
      address: 'ул. Индийская, 82',
      points: '6 баллов',
      logo: '/assets/brands/curry.svg'
    },
    {
      id: 18,
      name: 'Турецкий ресторан «Кебаб»',
      address: 'ул. Турецкая, 35',
      points: '5 баллов',
      logo: '/assets/brands/kebab.svg'
    },
    {
      id: 19,
      name: 'Японский ресторан «Токио»',
      address: 'ул. Японская, 58',
      points: '8 баллов',
      logo: '/assets/brands/tokyo.svg'
    },
    {
      id: 20,
      name: 'Корейский ресторан «Сеул»',
      address: 'ул. Корейская, 73',
      points: '6 баллов',
      logo: '/assets/brands/seoul.svg'
    },
    {
      id: 21,
      name: 'Тайский ресторан «Бангкок»',
      address: 'ул. Тайская, 29',
      points: '7 баллов',
      logo: '/assets/brands/bangkok.svg'
    },
    {
      id: 22,
      name: 'Вьетнамский ресторан «Хошимин»',
      address: 'ул. Вьетнамская, 46',
      points: '5 баллов',
      logo: '/assets/brands/hochimin.svg'
    },
    {
      id: 23,
      name: 'Испанский ресторан «Мадрид»',
      address: 'ул. Испанская, 61',
      points: '6 баллов',
      logo: '/assets/brands/madrid.svg'
    },
    {
      id: 24,
      name: 'Греческий ресторан «Афины»',
      address: 'ул. Греческая, 84',
      points: '5 баллов',
      logo: '/assets/brands/athens.svg'
    },
    {
      id: 25,
      name: 'Немецкий ресторан «Мюнхен»',
      address: 'ул. Немецкая, 97',
      points: '7 баллов',
      logo: '/assets/brands/munich.svg'
    },
    {
      id: 26,
      name: 'Американский ресторан «Техас»',
      address: 'ул. Американская, 52',
      points: '6 баллов',
      logo: '/assets/brands/texas.svg'
    },
    {
      id: 27,
      name: 'Бразильский ресторан «Рио»',
      address: 'ул. Бразильская, 38',
      points: '8 баллов',
      logo: '/assets/brands/rio.svg'
    },
    {
      id: 28,
      name: 'Аргентинский ресторан «Буэнос-Айрес»',
      address: 'ул. Аргентинская, 75',
      points: '7 баллов',
      logo: '/assets/brands/buenosaires.svg'
    },
    {
      id: 29,
      name: 'Перуанский ресторан «Лима»',
      address: 'ул. Перуанская, 43',
      points: '6 баллов',
      logo: '/assets/brands/lima.svg'
    },
    {
      id: 30,
      name: 'Чилийский ресторан «Сантьяго»',
      address: 'ул. Чилийская, 66',
      points: '5 баллов',
      logo: '/assets/brands/santiago.svg'
    }
  ], []);

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

  // Фильтрация заведений по поисковому запросу
  const filteredPlaces = useMemo(() => {
    if (searchTerm.trim() === '') {
      return places;
    } else {
      return places.filter(place =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [searchTerm, places]);

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
                  color: 'var(--text-color)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,123,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ←
              </button>
            </div>
          </div>

          <div className="scrollable-content">

                 {/* Поле поиска */}
                 <div style={{ marginBottom: '16px' }}>
                   <input
                     type="text"
                     placeholder="Поиск заведений..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     style={{
                       width: '100%',
                       padding: '12px 16px',
                       border: '1px solid rgba(255, 255, 255, 0.2)',
                       borderRadius: '8px',
                       background: 'rgba(255, 255, 255, 0.1)',
                       color: 'var(--text)',
                       fontSize: '16px',
                       outline: 'none',
                       transition: 'border-color 0.2s ease'
                     }}
                     onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                     onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                   />
                 </div>

                 {/* Описание заведений */}
                 <div style={{
                   background: 'rgba(100, 216, 203, 0.1)',
                   border: '1px solid rgba(100, 216, 203, 0.3)',
                   borderRadius: '12px',
                   padding: '16px',
                   marginBottom: '20px',
                   color: 'var(--accent)',
                   fontSize: '16px',
                   lineHeight: '1.5',
                   fontWeight: '500'
                 }}>
                   Эти заведения не принимают общие баллы, вы можете получить и потратить локальные баллы в этих заведениях
                 </div>


                 {/* Список заведений */}
          {filteredPlaces.length > 0 ? (
            filteredPlaces.map((place, index) => (
              <React.Fragment key={place.id}>
                <div className="list-item" onClick={() => handlePlaceClick(place)}>
                  <img className="brand" src={place.logo} alt={place.name} />
                  <div>
                    <div style={{fontWeight: 600}}>{place.name}</div>
                    <div className="sub">{place.address}</div>
                  </div>
                  <div className="meta">{place.points}</div>
                </div>
                {index < filteredPlaces.length - 1 && <div style={{height: '10px'}}></div>}
              </React.Fragment>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-secondary)',
              fontSize: '16px'
            }}>
              Заведения не найдены
            </div>
          )}
          </div>
          
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PlacesPage;
