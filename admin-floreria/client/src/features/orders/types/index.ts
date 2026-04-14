export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  orderId: string;
  variantName?: string | null;
  discounts_percents?: string | null;
  discounts_ids?: string | null;
  product: {
    id: string;
    name: string;
    price?: number;
    image?: string | null;
  };
}

export interface Order {
  id: string;
  description?: string | null;
  orderNumber: string;
  customerName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerProvince: string | null;
  billingCity: string;
  billingPrincipalAddress: string;
  billingSecondAddress?: string | null;
  customerReference?: string | null;
  billingContactName?: string | null;
  deliveryNotes?: string | null;
  orderNotes?: string | null;
  Courier: string;
  
  // Montos (compatibilidad con ambos sistemas)
  totalAmount?: number; // Legacy
  total: number; // Nuevo (ecommerce-be)
  subtotal: number;
  tax: number;
  shipping: number;
  
  // Descuentos (campos nuevos del ecommerce-be)
  total_discount_amount: number;
  product_discounted_amount: number;
  code_discounted_amount: number;
  coupon_discounted_amount: number;
  discount_coupon_percent?: number | null;
  discount_code_percent?: number | null;
  discount_coupon_id?: number | null;
  discount_code_id?: number | null;
  couponDiscountCode?: string | null;
  
  // Descuentos legacy (compatibilidad)
  discountCode?: string | null;
  discountPercent?: number | null;
  discountAmount?: number;
  estimatedDiscountAmount?: number;
  
  // Pagos
  pendingAmount?: number;
  cashOnDelivery: boolean;
  paymentStatus: string;
  paidAt?: string | null;
  
  // Estado
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  
  // PayPhone
  clientTransactionId?: string | null;
  payPhoneTransactionId?: string | null;
  payPhoneAuthCode?: string | null;
  
  // Items
  orderItems: OrderItem[];
}