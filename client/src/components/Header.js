import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">
          <span className="spit-icon">💭</span>
          Spit It
        </h1>
        <p className="header-subtitle">
          Captura tus pensamientos, ideas y experiencias
        </p>
      </div>
    </header>
  );
};

export default Header;

