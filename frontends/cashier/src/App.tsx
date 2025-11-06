import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import CashierPage from './components/CashierPage';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="App">
              <div className="phone-frame">
                <div className="phone-screen">
                  <Routes>
                    <Route path="/" element={<CashierPage />} />
                    <Route path="/cashier" element={<CashierPage />} />
                  </Routes>
                </div>
              </div>
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
