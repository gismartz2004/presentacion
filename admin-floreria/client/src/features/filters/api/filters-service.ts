import service from "@/core/api/service";
import type { FilterCategoryFormData, FilterOptionFormData, ApiResponse, FilterCategory, FilterOption } from "../types";

// Categories
const getCategories = async (): Promise<ApiResponse<FilterCategory[]>> => {
  const response = await service.get("/filters/categories");
  return response.data;
};

const getCategoryById = async (id: string): Promise<ApiResponse<FilterCategory>> => {
  const response = await service.get(`/filters/categories/${id}`);
  return response.data;
};

const createCategory = async (data: FilterCategoryFormData): Promise<ApiResponse<FilterCategory>> => {
  const response = await service.post("/filters/categories", data);
  return response.data;
};

const updateCategory = async (id: string, data: FilterCategoryFormData): Promise<ApiResponse<FilterCategory>> => {
  const response = await service.put(`/filters/categories/${id}`, data);
  return response.data;
};

const deleteCategory = async (id: string): Promise<ApiResponse> => {
  const response = await service.delete(`/filters/categories/${id}`);
  return response.data;
};

// Options
const getOptions = async (): Promise<ApiResponse<FilterOption[]>> => {
  const response = await service.get("/filters/options");
  return response.data;
};

const getOptionsByCategory = async (categoryId: string): Promise<ApiResponse<FilterOption[]>> => {
  const response = await service.get(`/filters/options/categories/${categoryId}`);
  return response.data;
};

const createOption = async (data: FilterOptionFormData): Promise<ApiResponse<FilterOption>> => {
  const response = await service.post("/filters/options", data);
  return response.data;
};

const updateOption = async (id: string, data: FilterOptionFormData): Promise<ApiResponse<FilterOption>> => {
  const response = await service.put(`/filters/options/${id}`, data);
  return response.data;
};

const deleteOption = async (id: string): Promise<ApiResponse> => {
  const response = await service.delete(`/filters/options/${id}`);
  return response.data;
};

export default {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Options
  getOptions,
  getOptionsByCategory,
  createOption,
  updateOption,
  deleteOption,
};