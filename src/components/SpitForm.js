import React, { useState, useRef } from 'react';
import { Upload, MapPin, X } from 'lucide-react';
import './SpitForm.css';

const SpitForm = ({ onAddSpit, currentLocation }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [files, setFiles] = useState([]);
  const [location, setLocation] = useState(currentLocation);
  const fileInputRef = useRef(null);
  const MAX_CHARACTERS = 180;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onAddSpit({
        content: content.trim(),
        mood,
        files: files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: file.data
        })),
        location
      });
      setContent('');
      setMood('neutral');
      setFiles([]);
      setLocation(currentLocation);
    }
  };

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target.result
        };
        setFiles(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moodOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'contemplative', emoji: '🤔', label: 'Contemplative' },
    { value: 'inspired', emoji: '✨', label: 'Inspired' }
  ];

  return (
    <div className="spit-form-container">
      <h2 className="form-title">What's on your mind?</h2>
      <form onSubmit={handleSubmit} className="spit-form">
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, ideas, or experiences..."
            className="spit-textarea"
            rows="4"
            maxLength={MAX_CHARACTERS}
            required
          />
          <div className="character-count">
            {content.length}/{MAX_CHARACTERS}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Attachments:</label>
          <div className="file-upload-section">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="file-upload-btn"
            >
              <Upload size={16} />
              Add Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            {files.length > 0 && (
              <div className="file-preview">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">How are you feeling?</label>
          <div className="mood-buttons">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`mood-btn ${mood === option.value ? 'selected' : ''}`}
                onClick={() => setMood(option.value)}
              >
                <span className="mood-emoji">{option.emoji}</span>
                <span className="mood-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          <span className="btn-icon">💭</span>
          Spit It Out!
        </button>
      </form>
    </div>
  );
};

export default SpitForm;
