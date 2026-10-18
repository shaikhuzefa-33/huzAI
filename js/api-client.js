/**
 * huzAI API Client
 * Seamless communication layer connecting the frontend UI with the Python Flask backend.
 */

class APIClient {
  constructor() {
    // Automatically detect backend port or use same origin
    if (typeof window !== 'undefined') {
      if (window.location.protocol === 'file:') {
        this.baseUrl = 'http://localhost:5000/api';
      } else if (window.location.port === '5000') {
        this.baseUrl = '/api';
      } else {
        this.baseUrl = 'http://localhost:5000/api';
      }
    } else {
      this.baseUrl = 'http://localhost:5000/api';
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`[huzAI API] Request to ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  // Health
  async health() {
    return this.request('/health');
  }

  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async signup(name, email, password) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Documents
  async getDocuments(category = 'All', search = '') {
    let endpoint = `/docs?category=${encodeURIComponent(category)}`;
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    return this.request(endpoint);
  }

  async getDocument(docId) {
    return this.request(`/docs/${encodeURIComponent(docId)}`);
  }

  async addDocument(docData) {
    return this.request('/docs', {
      method: 'POST',
      body: JSON.stringify(docData)
    });
  }

  async deleteDocument(docId) {
    return this.request(`/docs/${encodeURIComponent(docId)}`, {
      method: 'DELETE'
    });
  }

  // Reminders / Tasks
  async getReminders() {
    return this.request('/reminders');
  }

  async addReminder(taskData) {
    return this.request('/reminders', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async toggleReminder(taskId) {
    return this.request(`/reminders/${encodeURIComponent(taskId)}/toggle`, {
      method: 'PUT'
    });
  }

  async deleteReminder(taskId) {
    return this.request(`/reminders/${encodeURIComponent(taskId)}`, {
      method: 'DELETE'
    });
  }

  // AI Assistant
  async chat(message, sessionId = 'sess_default') {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId })
    });
  }

  // Government Guide
  async getGovtCategories() {
    return this.request('/govt/categories');
  }

  async getGovtServices() {
    return this.request('/govt/services');
  }

  async getGovtProcess(serviceId = 'srv-income-cert') {
    return this.request(`/govt/process/${encodeURIComponent(serviceId)}`);
  }

  // Trusted Family
  async getFamily() {
    return this.request('/family');
  }

  async inviteFamily(data) {
    return this.request('/family/invite', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateFamilyPermissions(memberId, permissions) {
    return this.request(`/family/${encodeURIComponent(memberId)}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    });
  }

  async revokeFamily(memberId) {
    return this.request(`/family/${encodeURIComponent(memberId)}`, {
      method: 'DELETE'
    });
  }

  // Profile & Settings
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(userData) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async updatePreferences(prefsData) {
    return this.request('/profile/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefsData)
    });
  }

  async exportData() {
    return this.request('/profile/export');
  }

  // Audit Logs
  async getAuditLogs() {
    return this.request('/audit/logs');
  }
}

// Global instance
window.huzAIApi = new APIClient();
