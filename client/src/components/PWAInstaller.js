import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import './PWAInstaller.css';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si la app ya está instalada
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Verificar si ya está instalada
    if (checkIfInstalled()) {
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Escuchar el evento appinstalled
    const handleAppInstalled = () => {
      console.log('PWA: App instalada exitosamente');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar si el navegador soporta PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado exitosamente:', registration);
        })
        .catch((error) => {
          console.error('Error al registrar Service Worker:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();

      // Esperar a que el usuario responda
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`PWA: Usuario ${outcome} la instalación`);

      if (outcome === 'accepted') {
        console.log('PWA: Usuario aceptó la instalación');
      } else {
        console.log('PWA: Usuario rechazó la instalación');
      }

      // Limpiar el prompt
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error al mostrar el prompt de instalación:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // No mostrar nada si ya está instalada o no hay prompt disponible
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pwa-installer">
      <div className="installer-content">
        <div className="installer-icon">
          <Smartphone size={24} />
        </div>
        <div className="installer-text">
          <h3>¡Instala SpitIt!</h3>
          <p>Agrega SpitIt a tu pantalla de inicio para un acceso rápido y una mejor experiencia.</p>
        </div>
        <div className="installer-actions">
          <button
            onClick={handleInstallClick}
            className="install-btn"
          >
            <Download size={16} />
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="dismiss-btn"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller;
