import type { FeaturesResponse } from "@/store/types";
import service from "./service";

const FEATURE_ENDPOINTS = ["/features/get-features", "/admin/metadata/features"];

export default async function featuresService() {
  let lastError: unknown = null;

  for (const endpoint of FEATURE_ENDPOINTS) {
    try {
      const response = await service.get<FeaturesResponse>(endpoint);
      const features = response.data.data?.features ?? [];
      return features;
    } catch (error: any) {
      lastError = error;
      if (error?.response?.status !== 404) break;
    }
  }

  console.error(lastError);
  return [];
}
