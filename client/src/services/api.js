const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
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

  // Authentication API
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount(password) {
    return this.request('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify-token', {
      method: 'POST',
    });
  }

  // Spits API
  async getSpits(page = 1, limit = 50) {
    return this.request(`/spits?page=${page}&limit=${limit}`);
  }

  async getTodaysSpits() {
    return this.request('/spits/today');
  }

  async getStats() {
    return this.request('/spits/stats');
  }

  async createSpit(spitData) {
    return this.request('/spits', {
      method: 'POST',
      body: JSON.stringify(spitData),
    });
  }

  async updateSpit(id, content) {
    return this.request(`/spits/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteSpit(id) {
    return this.request(`/spits/${id}`, {
      method: 'DELETE',
    });
  }

  // Summaries API
  async getTodaysSummary() {
    return this.request('/summaries/today');
  }

  async getLatestSummary() {
    return this.request('/summaries/latest');
  }

  async getAllSummaries(limit = 30) {
    return this.request(`/summaries/all?limit=${limit}`);
  }

  async getUnsummarizedSpitsCount() {
    return this.request('/summaries/unsummarized-count');
  }

  async generateSummary(limit = 20) {
    return this.request('/summaries/generate', {
      method: 'POST',
      body: JSON.stringify({ limit }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
