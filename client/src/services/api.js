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
    return this.request(`/spits/today?user=${user}`);
  }

  async getStats(user = 'anonymous') {
    return this.request(`/spits/stats?user=${user}`);
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

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
