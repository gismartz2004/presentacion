export interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate?: string; // ISO string - fecha inicio campaña
  endDate?: string;   // ISO string - fecha fin campaña
  segmentId: string;
  templateId: string;
  couponId?: string; // Cupón asociado opcional
  isActive: boolean; // Controla visibilidad en web
  showInBanner: boolean; // Mostrar en banner web
  bannerText?: string; // Texto personalizado banner
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  subject: string;
  metadata?: any;
  coupon?: {
    id: string;
    code: string;
    type: string;
    value: number;
    validFrom: string;
    validUntil: string;
  };
}