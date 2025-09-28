import React from 'react';
import { User } from 'lucide-react';
import './Header.css';

const Header = ({ user, onShowProfile }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            <span className="spit-icon">💭</span>
            Spit It
          </h1>
          <p className="header-subtitle">
            Captura tus pensamientos, ideas y experiencias
          </p>
        </div>

        {user && (
          <div className="header-right">
            <button
              onClick={onShowProfile}
              className="user-button"
              title="Mi Perfil"
            >
              <User size={20} />
              <span className="user-name">{user.name.split(' ')[0]}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

