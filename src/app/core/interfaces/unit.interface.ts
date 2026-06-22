export interface Unit {
  id: string;
  name: string;
  shortCode: string;
  createdAt?: string;
}

export interface CreateUnitDto {
  name: string;
  shortCode: string;
}

export type UpdateUnitDto = Partial<CreateUnitDto>;
