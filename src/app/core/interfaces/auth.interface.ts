export interface LoginRequest {
  email: string;
  password: string;
}

export interface Role {
  id: string;
  name: string;
  createdAt?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  isActive?: boolean;
  role: Role | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  user_id?: string;
  role?: string;
}

export function getUserRoleName(user: User | null): string {
  if (!user?.role) return '';
  return typeof user.role === 'string' ? user.role : user.role.name;
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return '';
  return user.fullName || user.email;
}
