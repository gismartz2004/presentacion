import type { FeaturesResponse } from "@/store/types";
import service from "./service";



export default async function featuresService() {
  try {
    const response = await service.get<FeaturesResponse>("/features/get-features");
    const features = response.data.data?.features ?? [];
    return features;
  } catch (error) {
    console.error(error)
    return [];
  }
}