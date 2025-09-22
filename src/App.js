import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SpitForm from './components/SpitForm';
import SpitList from './components/SpitList';
import DailySummary from './components/DailySummary';
import './App.css';

function App() {
  const [spits, setSpits] = useState([]);
  const [currentView, setCurrentView] = useState('feed');
  const [currentLocation, setCurrentLocation] = useState(null);

  // Load spits from localStorage on component mount
  useEffect(() => {
    const savedSpits = localStorage.getItem('spits');
    if (savedSpits) {
      setSpits(JSON.parse(savedSpits));
    }
  }, []);

  // Save spits to localStorage whenever spits change
  useEffect(() => {
    localStorage.setItem('spits', JSON.stringify(spits));
  }, [spits]);

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

  const addSpit = (spitData) => {
    const newSpit = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...spitData
    };
    console.log('Adding new spit:', newSpit);
    setSpits(prevSpits => [newSpit, ...prevSpits]);
  };

  const deleteSpit = (spitId) => {
    setSpits(prevSpits => prevSpits.filter(spit => spit.id !== spitId));
  };

  const editSpit = (spitId, newContent) => {
    setSpits(prevSpits =>
      prevSpits.map(spit =>
        spit.id === spitId ? { ...spit, content: newContent } : spit
      )
    );
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

  return (
    <div className="app">
      <Header />
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

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
