export interface NavConfigItem {
  label: string;
  icon: string;
  route: string;
  permission: string;
  group: 'main' | 'users_roles' | 'administration';
  parentLabel: string | null;
}

export interface PermissionMatrixModule {
  module: string;
  label: string;
  actions: ('view' | 'create' | 'edit' | 'delete')[];
  permissions: Partial<
    Record<'view' | 'create' | 'edit' | 'delete', { id: string; key: string }>
  >;
}

export interface AppPermissionConfig {
  navigation: NavConfigItem[];
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDetail extends RoleListItem {
  permissionKeys: string[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface CloneRoleDto {
  name: string;
  description?: string;
}
