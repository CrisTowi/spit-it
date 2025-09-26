import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sparkles, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../services/api';
import './SummaryTimeline.css';

const SummaryTimeline = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMaps, setExpandedMaps] = useState({});

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllSummaries();
      setSummaries(response.summaries || []);
    } catch (error) {
      console.error('Error loading summaries:', error);
      setError('Error al cargar los resúmenes');
    } finally {
      setLoading(false);
    }
  };

  const toggleMap = (summaryId) => {
    setExpandedMaps(prev => ({
      ...prev,
      [summaryId]: !prev[summaryId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateRange = (summary) => {
    if (!summary.summarizedSpits || summary.summarizedSpits.length === 0) {
      return formatDate(summary.date);
    }

    const spits = summary.summarizedSpits;
    const oldestSpit = spits[spits.length - 1];
    const newestSpit = spits[0];

    const oldestDate = new Date(oldestSpit.timestamp);
    const newestDate = new Date(newestSpit.timestamp);

    if (oldestDate.toDateString() === newestDate.toDateString()) {
      return formatDate(newestDate);
    } else {
      return `${oldestDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${newestDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMapCenter = (locations) => {
    if (locations.length === 0) return [0, 0];
    if (locations.length === 1) {
      return [locations[0].lat, locations[0].lng];
    }

    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
    return [avgLat, avgLng];
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

  const getMoodLabel = (mood) => {
    const labels = {
      happy: 'Feliz',
      neutral: 'Neutral',
      frustrated: 'Frustrado',
      inspired: 'Inspirado'
    };
    return labels[mood] || mood;
  };

  if (loading) {
    return (
      <div className="summary-timeline">
        <div className="timeline-header">
          <h2>Timeline de Resúmenes IA</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando resúmenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-timeline">
        <div className="timeline-header">
          <h2>Timeline de Resúmenes IA</h2>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadSummaries} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="summary-timeline">
        <div className="timeline-header">
          <h2>Timeline de Resúmenes IA</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>¡Aún no hay resúmenes!</h3>
          <p>Genera tu primer resumen de IA en la pestaña de Resumen Diario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-timeline">
      <div className="timeline-header">
        <h2>
          <Sparkles size={24} />
          Timeline de Resúmenes IA
        </h2>
        <p className="timeline-subtitle">
          {summaries.length} resumen{summaries.length !== 1 ? 'es' : ''} generado{summaries.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="timeline-container">
        {summaries.map((summary, index) => (
          <div key={summary._id} className="timeline-item">
            <div className="timeline-marker">
              <div className="marker-icon">
                <Calendar size={16} />
              </div>
              {index < summaries.length - 1 && <div className="timeline-line"></div>}
            </div>

            <div className="timeline-content">
              <div className="summary-header">
                <div className="summary-date">
                  <h3>{formatDateRange(summary)}</h3>
                  <span className="summary-time">
                    <Clock size={14} />
                    {formatTime(summary.createdAt)}
                  </span>
                </div>
                <div className="summary-stats">
                  <span className="stat">
                    <span className="stat-number">{summary.spitsCount}</span>
                    <span className="stat-label">spits</span>
                  </span>
                  {summary.locationCount > 0 && (
                    <span className="stat">
                      <span className="stat-number">{summary.locationCount}</span>
                      <span className="stat-label">ubicaciones</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="summary-text">
                {summary.summary}
              </div>

              {/* Mood Analysis */}
              {summary.moodAnalysis && summary.moodAnalysis.length > 0 && (
                <div className="mood-analysis">
                  <h4>Análisis de Estado de Ánimo</h4>
                  <div className="mood-stats">
                    {summary.moodAnalysis.map(({ mood, count, percentage }) => (
                      <div key={mood} className="mood-stat">
                        <span className="mood-emoji">{getMoodIcon(mood)}</span>
                        <span className="mood-name">{getMoodLabel(mood)}</span>
                        <div className="mood-bar">
                          <div
                            className="mood-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="mood-count">{count} ({percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              {summary.locations && summary.locations.length > 0 && (
                <div className="location-section">
                  <button
                    className="map-toggle-btn"
                    onClick={() => toggleMap(summary._id)}
                  >
                    <MapPin size={16} />
                    Ver Mapa de Ubicaciones ({summary.locations.length})
                    {expandedMaps[summary._id] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {expandedMaps[summary._id] && (
                    <div className="map-container">
                      <MapContainer
                        center={getMapCenter(summary.locations)}
                        zoom={13}
                        style={{ height: '300px', width: '100%' }}
                        className="leaflet-container"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* Markers for each location */}
                        {summary.locations.map((location, locIndex) => {
                          const spit = summary.summarizedSpits?.find(s => s._id === location.spitId);
                          return (
                            <Marker
                              key={locIndex}
                              position={[location.lat, location.lng]}
                              icon={L.divIcon({
                                className: 'custom-marker',
                                html: `<div class="marker-content">${spit ? getMoodIcon(spit.mood) : '📍'}</div>`,
                                iconSize: [30, 30],
                                iconAnchor: [15, 15]
                              })}
                            >
                              <Popup className="map-popup">
                                <div className="popup-content">
                                  {spit && (
                                    <>
                                      <div className="popup-header">
                                        <span className="popup-mood">{getMoodIcon(spit.mood)}</span>
                                        <span className="popup-time">{formatTime(spit.timestamp)}</span>
                                      </div>
                                      <div className="popup-text">{spit.content}</div>
                                    </>
                                  )}
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}

                        {/* Polyline connecting all locations */}
                        {summary.locations.length > 1 && (
                          <Polyline
                            positions={summary.locations.map(loc => [loc.lat, loc.lng])}
                            color="#3b82f6"
                            weight={3}
                            opacity={0.7}
                          />
                        )}
                      </MapContainer>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryTimeline;
