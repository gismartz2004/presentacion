export interface Variant {
  id?: string;
  name: string;
  price: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category: string;
  stock: number;
  isActive: boolean;
  featured: boolean;
  hasVariants: boolean;
  createdAt: string;
  // Para productos con variantes
  variants?: Array<Variant>;
  // Precio calculado (de la variante por defecto o 0)
  price?: number;
  discounts: Array<{
    id: number;
    percent: number;
    percent_value: number;
    priority: number;
    stackable: boolean;
  }>;
}

export interface FormData {
  name: string;
  description: string;
  category: string;
  stock: number;
  price: number;
  image: string;
  isActive: boolean;
  featured: boolean;
  hasVariants: boolean;
  // IDs para persistir relación en product_filters
  selectedFilterCategoryId?: string;
  selectedFilterOptionId?: string;
  // Múltiples filtros del producto
  productFilters?: Array<{ categoryId: string; optionId: string }>; 
}

export interface IFilters{
  productId: string;
  categoryId: string;
  optionId: string;
}