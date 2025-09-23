import React from 'react';
import { Home, Map, FileText } from 'lucide-react';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'feed', label: 'Inicio', icon: Home },
    { id: 'summary', label: 'Resumen', icon: FileText }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${currentView === id ? 'active' : ''}`}
            onClick={() => onViewChange(id)}
          >
            <Icon size={20} />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
