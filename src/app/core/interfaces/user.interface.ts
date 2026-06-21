export interface Role {
  id: string;
  name: string;
  createdAt?: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
}
