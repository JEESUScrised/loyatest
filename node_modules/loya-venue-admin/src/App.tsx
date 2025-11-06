import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import VenueAdminPage from './components/VenueAdminPage';
import { UserRole } from './types';
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
                    <Route path="/" element={
                      <ProtectedRoute requiredRole={UserRole.VENUE_ADMIN}>
                        <VenueAdminPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRole={UserRole.VENUE_ADMIN}>
                        <VenueAdminPage />
                      </ProtectedRoute>
                    } />
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
