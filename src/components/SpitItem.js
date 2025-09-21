import React, { useState } from 'react';
import { MapPin, Paperclip, Eye, X } from 'lucide-react';
import './SpitItem.css';

const SpitItem = ({ spit, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(spit.content);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(spit.id, editContent);
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
    if (window.confirm('Are you sure you want to delete this spit?')) {
      onDelete(spit.id);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };


  const getMoodIcon = (mood) => {
    const icons = {
      happy: '😊',
      neutral: '😐',
      excited: '🤩',
      contemplative: '🤔',
      grateful: '🙏',
      inspired: '✨',
      tired: '😴',
      frustrated: '😤'
    };
    return icons[mood] || '😐';
  };

  const getLocationString = () => {
    if (spit.location) {
      return `${spit.location.lat.toFixed(4)}, ${spit.location.lng.toFixed(4)}`;
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
              Location
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
            title={isEditing ? "Save changes" : "Edit spit"}
          >
            {isEditing ? "💾" : "✏️"}
          </button>
          <button
            onClick={handleDelete}
            className="action-btn delete-btn"
            title="Delete spit"
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
                Save
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
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
                  <span>Attachments ({spit.files.length})</span>
                </div>
                <div className="files-list">
                  {spit.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <button
                        onClick={() => handleFilePreview(file)}
                        className="file-preview-btn"
                        title="Preview file"
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
