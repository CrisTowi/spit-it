import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SpitForm from './components/SpitForm';
import SpitList from './components/SpitList';
import DailySummary from './components/DailySummary';
import SummaryTimeline from './components/SummaryTimeline';
import PWAInstaller from './components/PWAInstaller';
import OfflineIndicator from './components/OfflineIndicator';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import apiService from './services/api';
import './App.css';

function AppContent() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [spits, setSpits] = useState([]);
  const [currentView, setCurrentView] = useState('feed');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Load spits from API on component mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadSpits();
    } else {
      setSpits([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadSpits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSpits();
      setSpits(response.spits || []);
    } catch (err) {
      console.error('Failed to load spits:', err);
      setError('Error al cargar los spits. Por favor verifica tu conexión.');
      setSpits([]);
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Location obtained:', location);
          setCurrentLocation(location);
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        }
      );
    }
  }, []);

  const addSpit = async (spitData) => {
    try {
      const newSpit = await apiService.createSpit(spitData);
      console.log('Adding new spit:', newSpit);
      setSpits(prevSpits => [newSpit, ...prevSpits]);
    } catch (err) {
      console.error('Failed to create spit:', err);
      setError('Error al crear el spit. Por favor intenta nuevamente.');
    }
  };

  const deleteSpit = async (spitId) => {
    try {
      await apiService.deleteSpit(spitId);
      setSpits(prevSpits => prevSpits.filter(spit => spit._id !== spitId));
    } catch (err) {
      console.error('Failed to delete spit:', err);
      if (err.message.includes('resumen de IA')) {
        alert('No se puede eliminar un spit que ya ha sido incluido en un resumen de IA');
        return;
      }
      setError('Error al eliminar el spit. Por favor intenta nuevamente.');
    }
  };

  const editSpit = async (spitId, newContent) => {
    try {
      const updatedSpit = await apiService.updateSpit(spitId, newContent);
      setSpits(prevSpits =>
        prevSpits.map(spit =>
          spit._id === spitId ? updatedSpit : spit
        )
      );
    } catch (err) {
      console.error('Failed to update spit:', err);
      if (err.message.includes('resumen de IA')) {
        alert('No se puede editar un spit que ya ha sido incluido en un resumen de IA');
        return;
      }
      setError('Error al editar el spit. Por favor intenta nuevamente.');
    }
  };

  const getTodaysSpits = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return spits.filter(spit => {
      const spitDate = new Date(spit.timestamp);
      spitDate.setHours(0, 0, 0, 0);
      return spitDate.getTime() === today.getTime();
    });
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando SpitIt...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if not logged in
  if (!isAuthenticated) {
    console.log('Not authenticated');
    return <Auth />;
  }

  // Show loading screen while loading spits
  if (loading) {
    return (
      <div className="app">
        <Header user={user} onShowProfile={() => setShowUserProfile(true)} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tus spits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <OfflineIndicator />
      <Header user={user} onShowProfile={() => setShowUserProfile(true)} />
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={loadSpits} className="retry-btn">Reintentar</button>
        </div>
      )}

      <main className="main-content">
        {currentView === 'feed' && (
          <>
            <SpitForm onAddSpit={addSpit} currentLocation={currentLocation} />
            <SpitList
              spits={spits}
              onDeleteSpit={deleteSpit}
              onEditSpit={editSpit}
            />
          </>
        )}

        {currentView === 'summary' && (
          <DailySummary
            todaysSpits={getTodaysSpits()}
            totalSpits={spits.length}
          />
        )}

        {currentView === 'timeline' && (
          <SummaryTimeline />
        )}
      </main>

      {/* PWA Installer */}
      <PWAInstaller />

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
