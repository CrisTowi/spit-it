import React, { useState } from 'react';
import { MapPin, Paperclip, Eye, X } from 'lucide-react';
import './SpitItem.css';

const SpitItem = ({ spit, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(spit.content);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(spit._id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditContent(spit.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este spit?')) {
      onDelete(spit._id);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `hace ${diffInMinutes} minutos`;
    } else if (diffInHours < 24) {
      return `hace ${Math.floor(diffInHours)} horas`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString();
    }
  };


  const getMoodIcon = (mood) => {
    const icons = {
      happy: '😊',
      neutral: '😐',
      frustrated: '😤',
      inspired: '✨'
    };
    return icons[mood] || '😐';
  };

  const getLocationString = () => {
    if (spit.location) {
      return "Ubicación capturada";
    }
    return null;
  };

  const handleFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      window.open(file.data, '_blank');
    } else {
      // For other file types, you might want to download or show a preview
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      link.click();
    }
  };

  return (
    <div className="spit-item">
      <div className="spit-header">
        <div className="spit-meta">
          <span className="mood-badge">
            {getMoodIcon(spit.mood)}
          </span>
          {spit.location && (
            <span className="location-badge">
              <MapPin size={12} />
              Ubicación
            </span>
          )}
          {spit.files && spit.files.length > 0 && (
            <span className="files-badge">
              <Paperclip size={12} />
              {spit.files.length}
            </span>
          )}
          <span className="timestamp">
            {formatDate(spit.timestamp)}
          </span>
        </div>
        <div className="spit-actions">
          <button
            onClick={handleEdit}
            className="action-btn edit-btn"
            title={isEditing ? "Guardar cambios" : "Editar spit"}
          >
            {isEditing ? "💾" : "✏️"}
          </button>
          <button
            onClick={handleDelete}
            className="action-btn delete-btn"
            title="Eliminar spit"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="spit-content">
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-textarea"
              rows="3"
            />
            <div className="edit-actions">
              <button onClick={handleEdit} className="save-btn">
                Guardar
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="spit-content-wrapper">
            <p className="spit-text">{spit.content}</p>

            {spit.location && (
              <div className="spit-location">
                <MapPin size={14} />
                <span>{getLocationString()}</span>
              </div>
            )}

            {spit.files && spit.files.length > 0 && (
              <div className="spit-files">
                <div className="files-header">
                  <Paperclip size={14} />
                  <span>Adjuntos ({spit.files.length})</span>
                </div>
                <div className="files-list">
                  {spit.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <button
                        onClick={() => handleFilePreview(file)}
                        className="file-preview-btn"
                        title="Vista previa del archivo"
                      >
                        <Eye size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpitItem;
