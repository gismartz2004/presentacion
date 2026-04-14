import type { Campaign } from "../../campaigns/interfaces/campaigns-interfaces";

export interface SegmentRules {
  lastPurchaseDays?: { gte?: number; lte?: number; gt?: number; lt?: number };
  totalSpent?: { gte?: number; lte?: number; gt?: number; lt?: number };
  purchaseCount?: { gte?: number; lte?: number; gt?: number; lt?: number };
  tags?: { in?: string[] };
  isActiveCustomer?: boolean;
  city?: { in?: string[]; notIn?: string[]; equals?: string };
  acceptsMarketing?: boolean;
  birthday?: { month?: number; day?: number };
}

export interface Segment {
  id: string;
  name: string;
  description?: string | null;
  rules: SegmentRules;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  campaigns?: Campaign[];
}

export type CreateSegmentPayload = Omit<
  Segment,
  "id" | "createdAt" | "updatedAt" | "campaigns"
>;

export type UpdateSegmentPayload = Partial<
  Omit<
    Segment,
    "id" | "createdAt" | "updatedAt" | "campaigns"
  >
>;
