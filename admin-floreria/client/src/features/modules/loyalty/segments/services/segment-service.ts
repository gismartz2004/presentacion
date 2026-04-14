import axios from "axios";
import type {
  CreateSegmentPayload,
  UpdateSegmentPayload,
} from "../interfaces/segments-interface";

const LOYALTY_API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const loyaltyApi = axios.create({
  baseURL: LOYALTY_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const segmentsApi = {
  getAll: () => loyaltyApi.get("/loyalty/segments"),
  getOne: (id: string) => loyaltyApi.get(`/loyalty/segments/${id}`),
  evaluate: (id: string) => loyaltyApi.post(`/loyalty/segments/${id}/evaluate`),
  // preview: (rules: any) =>
  //   loyaltyApi.post("/loyalty/segments/preview", { rules }),
  create: (data: CreateSegmentPayload) =>
    loyaltyApi.post("/loyalty/segments", data),
  update: (id: string, data: UpdateSegmentPayload) =>
    loyaltyApi.patch(`/loyalty/segments/${id}`, data),
  delete: (id: string) => loyaltyApi.delete(`/loyalty/segments/${id}`),
};
