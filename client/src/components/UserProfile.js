import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Settings, LogOut, Save, X, Eye, EyeOff } from 'lucide-react';
import './UserProfile.css';

const UserProfile = ({ onClose }) => {
  const { user, updateProfile, changePassword, logout, loading, error, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    clearError();
    const result = await updateProfile(profileForm);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    clearError();
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (result.success) {
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!user) return null;

  return (
    <div className="user-profile-overlay">
      <div className="user-profile-modal">
        <div className="user-profile-header">
          <h2>Mi Perfil</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="user-profile-content">
          <div className="profile-section">
            <div className="profile-info">
              <div className="profile-avatar">
                <User size={40} />
              </div>
              <div className="profile-details">
                <h3>{user.name}</h3>
                <p><Mail size={16} /> {user.email}</p>
                <p className="member-since">
                  Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="form-actions">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="save-button"
                  >
                    <Save size={16} />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setProfileForm({
                        name: user.name
                      });
                      clearError();
                    }}
                    className="cancel-button"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="edit-button"
              >
                <Settings size={16} />
                Editar Perfil
              </button>
            )}
          </div>

          <div className="settings-section">
            <div className="settings-group">
              <h4>Seguridad</h4>

              {isChangingPassword ? (
                <div className="password-form">
                  <div className="form-group">
                    <label>Contraseña Actual</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="password-toggle"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="password-toggle"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="password-toggle"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading || passwordForm.newPassword !== passwordForm.confirmPassword}
                      className="save-button"
                    >
                      <Save size={16} />
                      {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        clearError();
                      }}
                      className="cancel-button"
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="change-password-button"
                >
                  Cambiar Contraseña
                </button>
              )}
            </div>

            <div className="settings-group">
              <h4>Cuenta</h4>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
