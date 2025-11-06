import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ModernHomePage from './components/ModernHomePage';
import ModernPlacesPage from './components/ModernPlacesPage';
import ProfilePage from './components/ProfilePage';
import VenuePage from './components/VenuePage';
import ExchangePage from './components/ExchangePage';
import GeneralExchangePage from './components/GeneralExchangePage';
import RegistrationForm from './components/RegistrationForm';
import './App.css';
import './styles/modern.css';
import './styles/animations.css';

// Компонент для проверки регистрации
const AppContent: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useApp();
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    // Проверяем, завершена ли регистрация
    if (!isLoading && isAuthenticated && user) {
      // Проверяем, завершена ли регистрация (поле может быть false или undefined)
      const needsRegistration = user.isRegistrationComplete === false || 
                               (user.isRegistrationComplete === undefined && (!user.birthDate || !user.city));
      setShowRegistration(needsRegistration);
    } else if (!isLoading && !isAuthenticated) {
      setShowRegistration(false);
    }
  }, [user, isLoading, isAuthenticated]);

  // Показываем форму регистрации, если она не завершена
  if (showRegistration && isAuthenticated) {
    return (
      <RegistrationForm 
        onComplete={() => setShowRegistration(false)} 
      />
    );
  }

  // Показываем основной контент
  return (
    <Routes>
      <Route path="/" element={<ModernHomePage />} />
      <Route path="/home" element={<ModernHomePage />} />
      <Route path="/places" element={<ModernPlacesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/venue/:venueId" element={<VenuePage />} />
      <Route path="/venue/:venueId/exchange" element={<ExchangePage />} />
      <Route path="/exchange" element={<GeneralExchangePage />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="App">
            <div className="phone-frame">
              <div className="phone-screen">
                <AppContent />
              </div>
            </div>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
