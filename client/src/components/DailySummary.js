import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../services/api';
import './DailySummary.css';

const DailySummary = ({ todaysSpits, totalSpits }) => {
  const [aiSummary, setAiSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [hasGeneratedToday, setHasGeneratedToday] = useState(false);
  const getMoodStats = () => {
    const moodCounts = todaysSpits.reduce((acc, spit) => {
      acc[spit.mood] = (acc[spit.mood] || 0) + 1;
      return acc;
    }, {});

    const totalMoods = todaysSpits.length;
    if (totalMoods === 0) return null;

    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / totalMoods) * 100)
    }));
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

  const getLocationCount = () => {
    return todaysSpits.filter(spit => spit.location).length;
  };

  const getAttachmentCount = () => {
    return todaysSpits.reduce((total, spit) => {
      return total + (spit.files ? spit.files.length : 0);
    }, 0);
  };

  const getMapCenter = () => {
    const locationsWithSpits = todaysSpits.filter(spit => spit.location);
    if (locationsWithSpits.length === 0) return [0, 0];

    if (locationsWithSpits.length === 1) {
      return [locationsWithSpits[0].location.lat, locationsWithSpits[0].location.lng];
    }

    // Calculate center point for multiple locations
    const avgLat = locationsWithSpits.reduce((sum, spit) => sum + spit.location.lat, 0) / locationsWithSpits.length;
    const avgLng = locationsWithSpits.reduce((sum, spit) => sum + spit.location.lng, 0) / locationsWithSpits.length;

    return [avgLat, avgLng];
  };


  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load existing AI summary on component mount
  useEffect(() => {
    loadTodaysSummary();
  }, []);

  const loadTodaysSummary = async () => {
    try {
      const response = await apiService.getTodaysSummary();
      if (response.summary) {
        setAiSummary(response.summary);
        setHasGeneratedToday(true);
      }
    } catch (error) {
      console.error('Error loading today\'s summary:', error);
    }
  };

  const generateAISummary = async () => {
    if (todaysSpits.length === 0) {
      setSummaryError('No hay spits para generar un resumen');
      return;
    }

    setIsGenerating(true);
    setSummaryError(null);

    try {
      const response = await apiService.generateSummary();
      setAiSummary(response.summary);
      setHasGeneratedToday(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      if (error.message.includes('Ya se ha generado')) {
        setHasGeneratedToday(true);
        setSummaryError('Ya se ha generado un resumen para hoy');
      } else {
        setSummaryError('Error al generar el resumen. Inténtalo de nuevo.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const moodStats = getMoodStats();

  return (
    <div className="daily-summary">
      <div className="summary-header">
        <div className="summary-title">
          <Calendar size={24} />
          <h2>Resumen Diario</h2>
        </div>
        <p className="summary-date">{formatDate()}</p>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">💭</div>
          <div className="stat-content">
            <div className="stat-number">{todaysSpits.length}</div>
            <div className="stat-label">Spits de Hoy</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{totalSpits}</div>
            <div className="stat-label">Total de Spits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <div className="stat-number">{getLocationCount()}</div>
            <div className="stat-label">Con Ubicación</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📎</div>
          <div className="stat-content">
            <div className="stat-number">{getAttachmentCount()}</div>
            <div className="stat-label">Adjuntos</div>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="ai-summary-section">
        <div className="ai-summary-header">
          <h3 className="ai-summary-title">
            <Sparkles size={20} />
            Resumen con IA
          </h3>
          {!hasGeneratedToday && todaysSpits.length > 0 && (
            <button
              onClick={generateAISummary}
              disabled={isGenerating}
              className="generate-summary-btn"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generar Resumen
                </>
              )}
            </button>
          )}
        </div>

        {summaryError && (
          <div className="summary-error">
            <p>{summaryError}</p>
          </div>
        )}

        {aiSummary && (
          <div className="ai-summary-content">
            <div className="ai-summary-text">
              {aiSummary.summary}
            </div>
            <div className="ai-summary-meta">
              <span className="ai-summary-date">
                Generado el {new Date(aiSummary.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        )}

        {!aiSummary && !isGenerating && !summaryError && todaysSpits.length > 0 && (
          <div className="ai-summary-placeholder">
            <p>Genera un resumen inteligente de tu día basado en tus spits</p>
          </div>
        )}
      </div>

      {todaysSpits.length > 0 ? (
        <>
          {moodStats && (
            <div className="mood-analysis">
              <h3 className="analysis-title">
                <TrendingUp size={20} />
                Análisis de Estado de Ánimo
              </h3>
              <div className="mood-stats">
                {moodStats.map(({ mood, count, percentage }) => (
                  <div key={mood} className="mood-stat">
                    <div className="mood-info">
                      <span className="mood-emoji">{getMoodIcon(mood)}</span>
                      <span className="mood-name">{getMoodLabel(mood)}</span>
                    </div>
                    <div className="mood-bar">
                      <div
                        className="mood-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="mood-count">{count} ({percentage}%)</div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {getLocationCount() > 0 && (
            <div className="map-section">
              <h3 className="map-title">
                <MapPin size={20} />
                Ubicaciones de Hoy
              </h3>
              <div className="map-container">
                <MapContainer
                  center={getMapCenter()}
                  zoom={13}
                  style={{ height: '300px', width: '100%' }}
                  className="leaflet-container"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {todaysSpits
                    .filter(spit => spit.location)
                    .map((spit) => (
                      <Marker
                        key={spit.id}
                        position={[spit.location.lat, spit.location.lng]}
                        icon={L.divIcon({
                          className: 'custom-marker',
                          html: `<div class="marker-content">${getMoodIcon(spit.mood)}</div>`,
                          iconSize: [30, 30],
                          iconAnchor: [15, 15]
                        })}
                      >
                        <Popup className="map-popup">
                          <div className="popup-content">
                            <div className="popup-header">
                              <span className="popup-mood">{getMoodIcon(spit.mood)}</span>
                              <span className="popup-time">{formatDate(spit.timestamp)}</span>
                            </div>
                            <div className="popup-text">{spit.content}</div>
                            {spit.files && spit.files.length > 0 && (
                              <div className="popup-files">
                                📎 {spit.files.length} attachment{spit.files.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>
              </div>
            </div>
          )}

          <div className="recent-spits">
            <h3 className="recent-title">Spits de Hoy</h3>
            <div className="recent-list">
              {todaysSpits.slice(0, 3).map((spit) => (
                <div key={spit.id} className="recent-spit">
                  <div className="recent-mood">{getMoodIcon(spit.mood)}</div>
                  <div className="recent-content">
                    <p className="recent-text">{spit.content}</p>
                    <div className="recent-meta">
                      {spit.location && <span className="recent-location">📍</span>}
                      {spit.files && spit.files.length > 0 && (
                        <span className="recent-files">📎 {spit.files.length}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-summary">
          <div className="empty-icon">📝</div>
          <h3>¡Aún no hay spits hoy!</h3>
          <p>Comienza tu día compartiendo tu primer spit en la pestaña de Inicio.</p>
        </div>
      )}
    </div>
  );
};

export default DailySummary;
