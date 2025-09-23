import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SpitForm from './components/SpitForm';
import SpitList from './components/SpitList';
import DailySummary from './components/DailySummary';
import apiService from './services/api';
import './App.css';

function App() {
  const [spits, setSpits] = useState([]);
  const [currentView, setCurrentView] = useState('feed');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load spits from API on component mount
  useEffect(() => {
    loadSpits();
  }, []);

  const loadSpits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSpits();
      setSpits(response.spits || []);
    } catch (err) {
      console.error('Failed to load spits:', err);
      setError('Error al cargar los spits. Por favor verifica tu conexión.');
      // Fallback to localStorage if API fails
      const savedSpits = localStorage.getItem('spits');
      if (savedSpits) {
        setSpits(JSON.parse(savedSpits));
      }
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
      // Also save to localStorage as backup
      localStorage.setItem('spits', JSON.stringify([newSpit, ...spits]));
    } catch (err) {
      console.error('Failed to create spit:', err);
      // Fallback to localStorage
      const fallbackSpit = {
        _id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...spitData
      };
      setSpits(prevSpits => [fallbackSpit, ...prevSpits]);
      localStorage.setItem('spits', JSON.stringify([fallbackSpit, ...spits]));
    }
  };

  const deleteSpit = async (spitId) => {
    try {
      await apiService.deleteSpit(spitId);
      setSpits(prevSpits => prevSpits.filter(spit => spit._id !== spitId));
      // Update localStorage
      const updatedSpits = spits.filter(spit => spit._id !== spitId);
      localStorage.setItem('spits', JSON.stringify(updatedSpits));
    } catch (err) {
      console.error('Failed to delete spit:', err);
      // Fallback to localStorage
      setSpits(prevSpits => prevSpits.filter(spit => spit._id !== spitId));
      const updatedSpits = spits.filter(spit => spit._id !== spitId);
      localStorage.setItem('spits', JSON.stringify(updatedSpits));
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
      // Update localStorage
      const updatedSpits = spits.map(spit =>
        spit._id === spitId ? updatedSpit : spit
      );
      localStorage.setItem('spits', JSON.stringify(updatedSpits));
    } catch (err) {
      console.error('Failed to update spit:', err);
      // Fallback to localStorage
      setSpits(prevSpits =>
        prevSpits.map(spit =>
          spit._id === spitId ? { ...spit, content: newContent } : spit
        )
      );
      const updatedSpits = spits.map(spit =>
        spit._id === spitId ? { ...spit, content: newContent } : spit
      );
      localStorage.setItem('spits', JSON.stringify(updatedSpits));
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

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tus spits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
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
      </main>
    </div>
  );
}

export default App;
