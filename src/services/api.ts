export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Device API
export const deviceAPI = {
  getAll: () => apiCall('/devices'),
  getById: (id: string) => apiCall(`/devices/${id}`),
  create: (device: any) => apiCall('/devices', { method: 'POST', body: JSON.stringify(device) }),
  update: (id: string, device: any) => apiCall(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(device) }),
  updateStatus: (id: string, status: 'on' | 'off') =>
    apiCall(`/devices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string) => apiCall(`/devices/${id}`, { method: 'DELETE' }),
  bulkUpdate: (devices: any[]) =>
    apiCall('/devices/bulk', { method: 'POST', body: JSON.stringify({ devices }) }),
};

// Energy Data API
export const energyAPI = {
  getAll: (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();
    return apiCall(`/energy${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiCall(`/energy/${id}`),
  create: (dataPoint: any) => apiCall('/energy', { method: 'POST', body: JSON.stringify(dataPoint) }),
  bulkCreate: (dataPoints: any[]) =>
    apiCall('/energy/bulk', { method: 'POST', body: JSON.stringify({ dataPoints }) }),
  delete: (id: string) => apiCall(`/energy/${id}`, { method: 'DELETE' }),
  getStats: (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    const query = queryParams.toString();
    return apiCall(`/energy/stats/summary${query ? `?${query}` : ''}`);
  },
  cleanup: (days: number) => apiCall(`/energy/cleanup/${days}`, { method: 'DELETE' }),
};

// Goal API
export const goalAPI = {
  getAll: () => apiCall('/goals'),
  getById: (id: string) => apiCall(`/goals/${id}`),
  create: (goal: any) => apiCall('/goals', { method: 'POST', body: JSON.stringify(goal) }),
  update: (id: string, goal: any) => apiCall(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(goal) }),
  updateProgress: (id: string, current: number) =>
    apiCall(`/goals/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ current }) }),
  delete: (id: string) => apiCall(`/goals/${id}`, { method: 'DELETE' }),
};

// Recommendation API
export const recommendationAPI = {
  getAll: (params?: { implemented?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.implemented !== undefined) queryParams.append('implemented', params.implemented.toString());
    const query = queryParams.toString();
    return apiCall(`/recommendations${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiCall(`/recommendations/${id}`),
  create: (recommendation: any) =>
    apiCall('/recommendations', { method: 'POST', body: JSON.stringify(recommendation) }),
  bulkCreate: (recommendations: any[]) =>
    apiCall('/recommendations/bulk', { method: 'POST', body: JSON.stringify({ recommendations }) }),
  update: (id: string, recommendation: any) =>
    apiCall(`/recommendations/${id}`, { method: 'PUT', body: JSON.stringify(recommendation) }),
  markImplemented: (id: string, implemented: boolean) =>
    apiCall(`/recommendations/${id}/implement`, { method: 'PATCH', body: JSON.stringify({ implemented }) }),
  delete: (id: string) => apiCall(`/recommendations/${id}`, { method: 'DELETE' }),
};

// Achievement API
export const achievementAPI = {
  getAll: () => apiCall('/achievements'),
  getById: (id: string) => apiCall(`/achievements/${id}`),
  create: (achievement: any) =>
    apiCall('/achievements', { method: 'POST', body: JSON.stringify(achievement) }),
  bulkCreate: (achievements: any[]) =>
    apiCall('/achievements/bulk', { method: 'POST', body: JSON.stringify({ achievements }) }),
  update: (id: string, achievement: any) =>
    apiCall(`/achievements/${id}`, { method: 'PUT', body: JSON.stringify(achievement) }),
  unlock: (id: string) => apiCall(`/achievements/${id}/unlock`, { method: 'PATCH' }),
  delete: (id: string) => apiCall(`/achievements/${id}`, { method: 'DELETE' }),
};

// Schedule API
export const scheduleAPI = {
  getAll: (params?: { deviceId?: string; active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId);
    if (params?.active !== undefined) queryParams.append('active', params.active.toString());
    const query = queryParams.toString();
    return apiCall(`/schedules${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiCall(`/schedules/${id}`),
  create: (schedule: any) => apiCall('/schedules', { method: 'POST', body: JSON.stringify(schedule) }),
  update: (id: string, schedule: any) =>
    apiCall(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(schedule) }),
  delete: (id: string) => apiCall(`/schedules/${id}`, { method: 'DELETE' }),
};

// Notification API
export const notificationAPI = {
  getAll: (params?: { read?: boolean; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.read !== undefined) queryParams.append('read', params.read.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();
    return apiCall(`/notifications${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiCall(`/notifications/${id}`),
  create: (notification: any) =>
    apiCall('/notifications', { method: 'POST', body: JSON.stringify(notification) }),
  bulkCreate: (notifications: any[]) =>
    apiCall('/notifications/bulk', { method: 'POST', body: JSON.stringify({ notifications }) }),
  markRead: (id: string, read: boolean) =>
    apiCall(`/notifications/${id}/read`, { method: 'PATCH', body: JSON.stringify({ read }) }),
  markAllRead: () => apiCall('/notifications/read/all', { method: 'PATCH' }),
  delete: (id: string) => apiCall(`/notifications/${id}`, { method: 'DELETE' }),
  deleteAll: () => apiCall('/notifications', { method: 'DELETE' }),
};

// Health check
export const healthAPI = {
  check: () => apiCall('/health'),
};

export default {
  device: deviceAPI,
  energy: energyAPI,
  goal: goalAPI,
  recommendation: recommendationAPI,
  achievement: achievementAPI,
  schedule: scheduleAPI,
  notification: notificationAPI,
  health: healthAPI,
};

