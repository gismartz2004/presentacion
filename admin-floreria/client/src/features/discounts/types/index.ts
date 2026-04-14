export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface DiscountType {
  id: number;
  type_name: string;
  description: string;
}

export interface Discount {
  id: number;
  percent: number;
  description: string;
  starts_at?: string | null;
  ends_at?: string | null;
  priority?: number;
  stackable?: boolean;
  code?: string | null;
  code_auto_generated?: boolean;
  max_uses?: number | null;
  uses?: number;
  discount_types: DiscountType;
  products: Product[];
  is_active: boolean;
}

export interface UpdateDiscountPayload {
  id: number;
  percent: number;
  description: string;
  discount_type: number;
  starts_at?: string | null;
  ends_at?: string | null;
  priority?: number;
  stackable?: boolean;
  code?: string | null;
  generate_code?: boolean;
  max_uses?: number | null;
}

export interface GetDiscountTypesResponse {
  message: string;
  data: DiscountType[];
}

export interface GetDiscountsResponse {
  message: string;
  data: Discount[];
}

export interface UpdateDiscountResponse {
  message: string;
  data: Discount;
  status: string;
}

export interface DeleteDiscountResponse {
  message: string;
  data: Discount[];
  status: string;
}