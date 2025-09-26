const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Spits API
  async getSpits(page = 1, limit = 50, user = 'anonymous') {
    return this.request(`/spits?page=${page}&limit=${limit}&user=${user}`);
  }

  async getTodaysSpits(user = 'anonymous') {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.request(`/spits/today?user=${user}&timezone=${encodeURIComponent(timezone)}`);
  }

  async getStats(user = 'anonymous') {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.request(`/spits/stats?user=${user}&timezone=${encodeURIComponent(timezone)}`);
  }

  async createSpit(spitData, user = 'anonymous') {
    return this.request('/spits', {
      method: 'POST',
      body: JSON.stringify({ ...spitData, user }),
    });
  }

  async updateSpit(id, content, user = 'anonymous') {
    return this.request(`/spits/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content, user }),
    });
  }

  async deleteSpit(id, user = 'anonymous') {
    return this.request(`/spits/${id}?user=${user}`, {
      method: 'DELETE',
    });
  }

  // Summaries API
  async getTodaysSummary(user = 'anonymous') {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.request(`/summaries/today?user=${user}&timezone=${encodeURIComponent(timezone)}`);
  }

  async getLatestSummary(user = 'anonymous') {
    return this.request(`/summaries/latest?user=${user}`);
  }

  async getAllSummaries(user = 'anonymous', limit = 30) {
    return this.request(`/summaries/all?user=${user}&limit=${limit}`);
  }

  async getUnsummarizedSpitsCount(user = 'anonymous') {
    return this.request(`/summaries/unsummarized-count?user=${user}`);
  }

  async generateSummary(user = 'anonymous', limit = 20) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.request('/summaries/generate', {
      method: 'POST',
      body: JSON.stringify({ user, timezone, limit }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
