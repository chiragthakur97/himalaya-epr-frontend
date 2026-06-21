export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
