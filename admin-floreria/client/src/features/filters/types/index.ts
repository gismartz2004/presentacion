export interface FilterCategory {
  id: string;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: FilterType;
  minRange?: number | null;
  maxRange?: number | null;
  isActive: boolean;
  sortOrder: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  filter_options?: FilterOption[];
}

export interface FilterOption {
  id: string;
  categoryId: string;
  value: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: FilterCategory;
}

export type FilterType = 
  | "SELECT" 
  | "MULTISELECT" 
  | "RANGE" 
  | "TOGGLE" 
  | "COLOR" 
  | "SIZE" 
  | "RATING";

export interface FilterCategoryFormData {
  name: string;
  label: string;
  description: string;
  placeholder: string;
  type: FilterType;
  minRange: number | null;
  maxRange: number | null;
  isActive: boolean;
  sortOrder: number;
  isRequired: boolean;
}

export interface FilterOptionFormData {
  categoryId: string;
  value: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
}