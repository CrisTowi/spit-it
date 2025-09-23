import React, { useState, useRef, useEffect } from 'react';
import { Upload, MapPin, X, Map, MapPinIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SpitForm.css';

const SpitForm = ({ onAddSpit, currentLocation }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [files, setFiles] = useState([]);
  const [location, setLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [mapCenter, setMapCenter] = useState(currentLocation ? [currentLocation.lat, currentLocation.lng] : [40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(currentLocation ? 15 : 10);
  const searchTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const MAX_CHARACTERS = 180;

  // Update location when currentLocation changes
  useEffect(() => {
    if (useLocation && currentLocation) {
      setLocation(currentLocation);
    }
  }, [currentLocation, useLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      const spitData = {
        content: content.trim(),
        mood,
        files: files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: file.data
        })),
        location
      };

      console.log('Submitting spit with location:', location);
      console.log('Full spit data:', spitData);

      onAddSpit(spitData);
      setContent('');
      setMood('neutral');
      setFiles([]);
      setLocation(null);
      setUseLocation(false);
      setSelectedLocation(null);
      setShowLocationPicker(false);
      setSearchQuery('');
      setSearchResults([]);
      setNoResultsFound(false);
    }
  };

  const handleLocationToggle = (enabled) => {
    setUseLocation(enabled);
    if (enabled && currentLocation) {
      setLocation(currentLocation);
    } else {
      setLocation(null);
    }
  };

  const handleManualLocationSelect = (lat, lng) => {
    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    setLocation(newLocation);
    setShowLocationPicker(false);
  };

  const handleLocationPickerToggle = () => {
    setShowLocationPicker(!showLocationPicker);
    if (!showLocationPicker) {
      // Reset search when opening
      setSearchQuery('');
      setSearchResults([]);
      setNoResultsFound(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setNoResultsFound(false);
      return;
    }

    setIsSearching(true);
    setNoResultsFound(false);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const results = await response.json();
      setSearchResults(results);
      setNoResultsFound(results.length === 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setNoResultsFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = (query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };

  const handleSearchResultClick = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedLocation({ lat, lng });
    setLocation({ lat, lng });
    setMapCenter([lat, lng]);
    setMapZoom(15);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    setNoResultsFound(false);
  };

  const handleEnterSearch = async () => {
    if (!searchQuery.trim()) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    await handleSearch(searchQuery);
    setSearchResults([]);
    setNoResultsFound(false);

    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      const lat = parseFloat(firstResult.lat);
      const lng = parseFloat(firstResult.lon);
      setMapCenter([lat, lng]);
      setMapZoom(15);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterSearch();
    }
  };

  const closeSearchOptions = () => {
    setSearchResults([]);
    setNoResultsFound(false);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        setLocation({ lat, lng });
      },
    });
    return null;
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
    { value: 'happy', emoji: '😊', label: 'Feliz' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'frustrated', emoji: '😤', label: 'Frustrado' },
    { value: 'inspired', emoji: '✨', label: 'Inspirado' }
  ];


  return (
    <div className="spit-form-container">
      <h2 className="form-title">¿Qué tienes en mente?</h2>
      <form onSubmit={handleSubmit} className="spit-form">
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte tus pensamientos, ideas o experiencias..."
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
          <label className="form-label">Adjuntos:</label>
          <div className="file-upload-section">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="file-upload-btn"
            >
              <Upload size={16} />
              Agregar Archivos
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
          <label className="form-label">¿Cómo te sientes?</label>
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

        <div className="form-group">
          <label className="form-label">Ubicación:</label>
          <div className="location-controls">
            <div className="location-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={useLocation}
                  onChange={(e) => handleLocationToggle(e.target.checked)}
                />
                <span className="toggle-text">Usar ubicación actual</span>
              </label>
            </div>

            <div className="location-options">
              <button
                type="button"
                onClick={handleLocationPickerToggle}
                className="location-picker-btn"
              >
                <Map size={16} />
                {showLocationPicker ? 'Ocultar mapa' : 'Seleccionar ubicación manualmente'}
              </button>
            </div>
          </div>

          {showLocationPicker && (
            <div className="inline-location-picker">
              <div className="location-search-section">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Buscar una ubicación..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                    onKeyPress={handleKeyPress}
                    className="location-search-input"
                  />
                  {isSearching && <div className="search-spinner"></div>}
                </div>
              </div>

              <div className="inline-map-container">
                <div className="inline-map">
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '250px', width: '100%' }}
                    key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler />
                    {selectedLocation && (
                      <Marker
                        position={[selectedLocation.lat, selectedLocation.lng]}
                        icon={L.divIcon({
                          className: 'temp-marker',
                          html: '<div class="temp-marker-content">📍</div>',
                          iconSize: [30, 30],
                          iconAnchor: [15, 15]
                        })}
                      />
                    )}
                  </MapContainer>
                </div>

                {searchResults.length > 0 && (
                  <div className="search-results-floating">
                    <div className="search-results-header">
                      <span>Resultados de búsqueda</span>
                      <button
                        onClick={closeSearchOptions}
                        className="close-search-btn"
                        title="Cerrar resultados"
                      >
                        ×
                      </button>
                    </div>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <div className="search-result-name">{result.display_name}</div>
                        {result.address && (
                          <div className="search-result-address">
                            {result.address.city || result.address.town || result.address.village || ''}
                            {result.address.country && `, ${result.address.country}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {noResultsFound && searchQuery.trim() && !isSearching && (
                  <div className="no-results-message">
                    <div className="no-results-header">
                      <span>Sin resultados</span>
                      <button
                        onClick={closeSearchOptions}
                        className="close-search-btn"
                        title="Cerrar mensaje"
                      >
                        ×
                      </button>
                    </div>
                    <p>No se encontraron ubicaciones para "{searchQuery}"</p>
                    <p className="no-results-hint">Presiona Enter para centrar el mapa en tu búsqueda y selecciona manualmente</p>
                  </div>
                )}
              </div>

              <p className="map-instructions">Busca una ubicación, presiona Enter para centrar el mapa, o haz clic en el mapa para seleccionar</p>
            </div>
          )}

          {location && (
            <div className="location-indicator">
              <MapPin size={16} />
              <span>La ubicación se guardará con este spit</span>
              <button
                type="button"
                onClick={() => {
                  setLocation(null);
                  setUseLocation(false);
                  setSelectedLocation(null);
                  setSearchQuery('');
                  setSearchResults([]);
                  setNoResultsFound(false);
                }}
                className="remove-location-btn"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn">
          <span className="btn-icon">💭</span>
          ¡Expúlsalo!
        </button>
      </form>

    </div>
  );
};

export default SpitForm;
