import React from 'react';
import { Calendar, MapPin, TrendingUp, Lightbulb } from 'lucide-react';
import './DailySummary.css';

const DailySummary = ({ todaysSpits, totalSpits }) => {
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
      happy: 'Happy',
      neutral: 'Neutral',
      frustrated: 'Frustrated',
      inspired: 'Inspired'
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

  const getMostCommonMood = () => {
    const moodStats = getMoodStats();
    if (!moodStats || moodStats.length === 0) return null;

    return moodStats.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    );
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const moodStats = getMoodStats();
  const mostCommonMood = getMostCommonMood();

  return (
    <div className="daily-summary">
      <div className="summary-header">
        <div className="summary-title">
          <Calendar size={24} />
          <h2>Daily Summary</h2>
        </div>
        <p className="summary-date">{formatDate()}</p>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">💭</div>
          <div className="stat-content">
            <div className="stat-number">{todaysSpits.length}</div>
            <div className="stat-label">Today's Spits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{totalSpits}</div>
            <div className="stat-label">Total Spits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <div className="stat-number">{getLocationCount()}</div>
            <div className="stat-label">With Location</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📎</div>
          <div className="stat-content">
            <div className="stat-number">{getAttachmentCount()}</div>
            <div className="stat-label">Attachments</div>
          </div>
        </div>
      </div>

      {todaysSpits.length > 0 ? (
        <>
          {moodStats && (
            <div className="mood-analysis">
              <h3 className="analysis-title">
                <TrendingUp size={20} />
                Mood Analysis
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

          {mostCommonMood && (
            <div className="insights">
              <h3 className="insights-title">
                <Lightbulb size={20} />
                Today's Insight
              </h3>
              <div className="insight-content">
                <p>
                  Your most common mood today was <strong>{getMoodLabel(mostCommonMood.mood)}</strong>
                  {' '}{getMoodIcon(mostCommonMood.mood)} with {mostCommonMood.count} spits.
                </p>
                {mostCommonMood.mood === 'happy' && (
                  <p>It looks like you had a positive day! Keep spreading that joy! ✨</p>
                )}
                {mostCommonMood.mood === 'frustrated' && (
                  <p>It seems like you had some challenges today. Remember, it's okay to feel frustrated - tomorrow is a new opportunity! 💪</p>
                )}
                {mostCommonMood.mood === 'inspired' && (
                  <p>What an inspiring day! Your creativity and motivation are shining through! 🌟</p>
                )}
                {mostCommonMood.mood === 'neutral' && (
                  <p>A balanced day with steady thoughts. Sometimes neutral is exactly what we need! ⚖️</p>
                )}
              </div>
            </div>
          )}

          <div className="recent-spits">
            <h3 className="recent-title">Today's Spits</h3>
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
          <h3>No spits today yet!</h3>
          <p>Start your day by sharing your first thought in the Feed tab.</p>
        </div>
      )}
    </div>
  );
};

export default DailySummary;
