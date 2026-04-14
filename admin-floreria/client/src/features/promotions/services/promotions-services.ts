import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const promotionsApi = axios.create({
  baseURL: `${BACKEND_URL}/promotions`,
  withCredentials: false,
});

export interface CreatePromotionDto {
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING";
  value?: number;
  buyQuantity?: number;
  getQuantity?: number;
  startsAt: string;
  endsAt?: string;
  minQuantity?: number;
  minAmount?: number;
  isActive?: boolean;
  productIds: string[];
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  buyQuantity?: number;
  getQuantity?: number;
  startsAt: string;
  endsAt?: string;
  minQuantity?: number;
  minAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products: Array<{
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
      price: number;
      image?: string;
    };
  }>;
}

export const promotionsService = {
  // Crear promoción
  create: async (data: CreatePromotionDto) => {
    const response = await promotionsApi.post<Promotion>("", data);
    return response.data;
  },

  // Obtener todas las promociones
  findAll: async () => {
    const response = await promotionsApi.get<Promotion[]>("");
    return response.data;
  },

  // Obtener promociones activas
  findActive: async () => {
    const response = await promotionsApi.get<Promotion[]>("/active");
    return response.data;
  },

  // Obtener promoción por ID
  findOne: async (id: string) => {
    const response = await promotionsApi.get<Promotion>(`/${id}`);
    return response.data;
  },

  // Obtener promociones de un producto
  findForProduct: async (productId: string) => {
    const response = await promotionsApi.get<Promotion[]>(
      `/for-product/${productId}`,
    );
    return response.data;
  },

  // Calcular precio con descuento
  calculatePrice: async (productId: string, price: number) => {
    const response = await promotionsApi.get<{
      originalPrice: number;
      discountedPrice: number;
      discount: number;
      promotions: Array<{
        id: string;
        name: string;
        type: string;
        value: number;
      }>;
    }>(`/calculate-price/${productId}?price=${price}`);
    return response.data;
  },

  // Actualizar promoción
  update: async (id: string, data: Partial<CreatePromotionDto>) => {
    const response = await promotionsApi.patch<Promotion>(`/${id}`, data);
    return response.data;
  },

  // Desactivar promoción (soft delete)
  remove: async (id: string) => {
    const response = await promotionsApi.delete<Promotion>(`/${id}`);
    return response.data;
  },

  // Eliminar permanentemente
  hardDelete: async (id: string) => {
    const response = await promotionsApi.delete<Promotion>(`/${id}/hard`);
    return response.data;
  },
};
