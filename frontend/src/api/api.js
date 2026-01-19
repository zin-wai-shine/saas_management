import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 404 errors specifically
    if (error.response?.status === 404) {
      // If the response data is a string (like "404 page not found"), try to extract JSON
      if (typeof error.response.data === 'string') {
        // Try to parse as JSON if it looks like JSON
        try {
          const parsed = JSON.parse(error.response.data);
          error.response.data = parsed;
        } catch (e) {
          // If it's not JSON, create a proper error object
          error.response.data = {
            error: `Route not found: ${error.config?.url || 'Unknown endpoint'}. Please check if the backend server is running and the route is registered.`,
          };
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Business API
export const businessAPI = {
  list: () => api.get('/businesses'),
  get: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`),
  search: () => api.get('/businesses/search'),
};

// Website API
export const websiteAPI = {
  list: () => api.get('/websites'),
  get: (id) => api.get(`/websites/${id}`),
  create: (data) => api.post('/websites', data),
  update: (id, data) => api.put(`/websites/${id}`, data),
  delete: (id) => api.delete(`/websites/${id}`),
  demos: () => api.get('/websites/demos'),
};

// Plan API
export const planAPI = {
  list: () => api.get('/plans'),
  get: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/admin/plans', data),
  update: (id, data) => api.put(`/admin/plans/${id}`, data),
  delete: (id) => api.delete(`/admin/plans/${id}`),
};

// Subscription API
export const subscriptionAPI = {
  list: () => api.get('/subscriptions'),
  get: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
};

// Notification API
export const notificationAPI = {
  list: () => api.get('/notifications'),
  get: (id) => api.get(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
  update: (id, data) => api.put(`/notifications/${id}`, data),
  delete: (id) => api.delete(`/notifications/${id}`),
  unreadCount: () => api.get('/notifications/unread-count'),
};

// User API (Admin)
export const userAPI = {
  list: () => api.get('/users'),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Message API
export const messageAPI = {
  listAll: () => api.get('/messages'),
  listConversations: () => api.get('/messages/conversations'),
  getOrCreateConversation: (otherUserId) => api.post('/messages/conversations', { other_user_id: otherUserId }),
  getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (data) => api.post('/messages/send', data),
  unreadCount: () => api.get('/messages/unread-count'),
};

export default api;

