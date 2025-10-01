export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'member';
  name: string;
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}