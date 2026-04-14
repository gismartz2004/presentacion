export type Feature = {
  name: string;
  display_name: string;
};

export type FeatureItem = {
  plan_id: number;
  feature_id: string;
  features: Feature;
};

export type FeaturesResponse = {
  status: "success" | "error";
  data?: { features: Feature[] };
  message?: string;
};