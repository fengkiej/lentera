// API Client untuk JWT Authentication tanpa Clerk
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interface untuk response API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Class untuk JWT API Client
export class JwtApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private static setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private static removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();

      if (!response.ok) {
        // Jika token expired atau invalid, hapus dari localStorage
        if (response.status === 401) {
          this.removeToken();
        }
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth methods
  static async login(email: string, password: string): Promise<ApiResponse<{ user: Record<string, unknown>; token: string }>> {
    const response = await this.post<{ user: Record<string, unknown>; token: string }>('/auth/login', {
      email,
      password,
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  static async register(name: string, email: string, password: string): Promise<ApiResponse<{ user: Record<string, unknown>; token: string }>> {
    const response = await this.post<{ user: Record<string, unknown>; token: string }>('/auth/register', {
      name,
      email,
      password,
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  static logout(): void {
    this.removeToken();
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async getCurrentUser(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.get('/auth/me');
  }
}

// Service class untuk instance-based usage
export class JwtApiService {
  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return JwtApiClient.get<T>(endpoint);
  }

  post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return JwtApiClient.post<T>(endpoint, data);
  }

  put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return JwtApiClient.put<T>(endpoint, data);
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return JwtApiClient.delete<T>(endpoint);
  }
}

// Default instance
export const jwtApiService = new JwtApiService();

// Hook untuk menggunakan JWT authentication dalam React components
export const useJwtApiClient = () => {
  return {
    get: <T>(endpoint: string) => JwtApiClient.get<T>(endpoint),
    post: <T>(endpoint: string, data?: unknown) => JwtApiClient.post<T>(endpoint, data),
    put: <T>(endpoint: string, data?: unknown) => JwtApiClient.put<T>(endpoint, data),
    delete: <T>(endpoint: string) => JwtApiClient.delete<T>(endpoint),
    login: (email: string, password: string) => JwtApiClient.login(email, password),
    register: (name: string, email: string, password: string) => JwtApiClient.register(name, email, password),
    logout: () => JwtApiClient.logout(),
    isAuthenticated: () => JwtApiClient.isAuthenticated(),
    getCurrentUser: () => JwtApiClient.getCurrentUser(),
  };
};

// Export untuk backward compatibility
export const ApiClient = JwtApiClient;
export const ApiService = JwtApiService;
export const apiService = jwtApiService;
export const useApiClient = useJwtApiClient;