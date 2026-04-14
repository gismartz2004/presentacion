import service from "@/core/api/service";
import type { UpdateDiscountPayload } from "../types";

const get_all_discounts = async () => {
  const response = await service.get("/discounts");
  return response.data;
};

const updateDiscountProducts = async (discountId: string, productIds: string[]) => {
  const response = await service.put(`/discounts/${discountId}/products`, {
    productIds,
  });
  return response.data;
}

const getDiscountTypes = async () => {
  const response = await service.get("/discounts/types");
  return response.data;
}

const updateDiscounts = async (discountData : UpdateDiscountPayload) => {
  const response = await service.put(`/discounts/`, discountData);
  return response.data;
}

const deleteDiscount = async (id: number) => {
  const response = await service.put(`/discounts/${id}`)
  return response.data;
}

const insertDiscounts = async (discountData : Omit<UpdateDiscountPayload, 'id'>) => {
  const response = await service.post(`/discounts/`, discountData);
  return response.data;
}

const discountsService = {
  get_all_discounts,
  updateDiscountProducts,
  getDiscountTypes,
  updateDiscounts,
  insertDiscounts,
  deleteDiscount,
};

export default discountsService;