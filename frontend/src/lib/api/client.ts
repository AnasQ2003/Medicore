// Centralized Axios API client for MediCore HMS
// Targets the local Express backend at http://localhost:5000/api

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('medicore_user');
      if (!user) return null;
      const parsed = JSON.parse(user);
      return parsed?.token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 - token expired or invalid
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('medicore_user');
        window.location.href = '/login';
      }
    }

    const data = await res.json();
    return data as ApiResponse<T>;
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>('GET', endpoint, undefined, params);
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>('POST', endpoint, body);
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>('PUT', endpoint, body);
  }

  delete<T>(endpoint: string) {
    return this.request<T>('DELETE', endpoint);
  }
}

export const api = new ApiClient(API_BASE_URL);

// ─── Auth APIs ───────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<{ id: number; name: string; email: string; role: string; patientCode: string | null; token: string }>('/auth/login', { email, password }),
  register: (data: {
    name: string; email: string; password: string; role: string;
    phone?: string; address?: string; gender?: string; age?: number; bloodGroup?: string;
  }) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/auth/profile', data),
};

// ─── Appointments APIs ────────────────────────────────────────────────────────
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  book: (data: {
    patientId?: number; doctorId?: number; time: string;
    date?: string; reason: string; type?: string;
  }) => api.post('/appointments/book', data),
  updateStatus: (code: string, status: string, time?: string) =>
    api.put(`/appointments/${code}/status`, { status, time }),
  delete: (code: string) => api.delete(`/appointments/${code}`),
};

// ─── Prescriptions APIs ────────────────────────────────────────────────────────
export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  create: (data: { patientId: number; items: string; status?: string }) =>
    api.post('/prescriptions/new', data),
};

// ─── Patients APIs ─────────────────────────────────────────────────────────────
export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id: number | string) => api.get(`/patients/${id}`),
  recordVitals: (data: {
    patientId: number; bp: string; pulse: number; temp: number; spo2: number;
  }) => api.post('/vitals/record', data),
};

// ─── Beds APIs ─────────────────────────────────────────────────────────────────
export const bedAPI = {
  getAll: () => api.get('/beds'),
  updateStatus: (id: number, status: string, patientId?: number | null) =>
    api.put(`/beds/${id}/status`, { status, patientId }),
};

// ─── Tasks APIs ─────────────────────────────────────────────────────────────────
export const taskAPI = {
  getAll: () => api.get('/tasks'),
  updateStatus: (id: number, status: string) =>
    api.put(`/tasks/${id}/status`, { status }),
};

// ─── Bills APIs ─────────────────────────────────────────────────────────────────
export const billAPI = {
  getAll: () => api.get('/bills'),
  create: (data: { patientId: number; amount: number; description: string }) =>
    api.post('/bills/create', data),
  pay: (code: string) => api.put(`/bills/${code}/pay`),
};

// ─── Notifications APIs ────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ─── Admin APIs ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getDoctors: () => api.get('/doctors'),
};

export default api;
