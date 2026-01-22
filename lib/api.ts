// API client for making direct requests to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Note: To change the API URL, create a .env.local file with:
// NEXT_PUBLIC_API_URL=http://your-backend-url:port

export class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    const baseHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };

    // Create final headers object
    let headers: HeadersInit = baseHeaders;

    // Merge additional headers if they exist and are objects
    if (options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)) {
      headers = { ...headers, ...options.headers };
    }

    // Remove Content-Type header if body is FormData (let browser set it)
    if (options.body instanceof FormData) {
      const headersObj = headers as Record<string, string>;
      delete headersObj['Content-Type'];
      headers = headersObj;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }

  async get(endpoint: string): Promise<any> {
    const response = await this.request(endpoint);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async post(endpoint: string, data?: any): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async put(endpoint: string, data?: any): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async delete(endpoint: string): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  // File upload method
  async upload(endpoint: string, formData: FormData): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  // Login method with form data
  async login(email: string, password: string): Promise<any> {
    const url = `${API_BASE_URL}/api/v1/auth/access-token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
      mode: 'cors', // Explicitly set CORS mode
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
  }

  // Register method
  async register(userData: { email: string; password: string; full_name?: string }): Promise<any> {
    return this.post('/api/v1/auth/register', userData);
  }
}

export const apiClient = new ApiClient();
