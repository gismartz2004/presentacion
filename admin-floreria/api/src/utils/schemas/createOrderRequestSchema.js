// schemas/createOrderRequestSchema.js
const { z } = require("zod");

const orderItemSchema = z.object({
  quantity: z.number().int().positive(),
  productId: z.string().min(1),
  variantId: z.string().min(1).optional().nullable(),
  variantName: z.string().min(1).optional().nullable(),
  // price puede llegar desde el cliente, pero el servidor lo recalcula/valida
  price: z.number().nonnegative().optional(),
  // soporta payloads antiguos que enviaban el objeto product completo
  product: z
    .object({
      name: z.string(),
      description: z.string().nullable().optional(),
      image: z.string().nullable().optional(),
      category: z.string(),
    })
    .optional(),
});

const orderDataSchema = z.object({
  // El servidor recalcula subtotal/total; se aceptan por compatibilidad.
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  shipping: z.number().optional(),
  total: z.number().optional(),
  paymentStatus: z.string(),
  createdAt: z.coerce.date().optional(),
  paidAt: z.coerce.date().optional(),
  discountCode: z.string().min(1).optional().nullable(),
  couponDiscountCode: z.string().min(1).optional().nullable(),
  OrderItem: z.array(orderItemSchema).min(1),
});

const billingDataSchema = z.object({
  customerName: z.string(),
  customerLastName: z.string(),
  customerProvince: z.string(),
  billingCity: z.string(),
  billingPrincipalAddress: z.string(),
  billingSecondAddress: z.string(),
  customerReference: z.string(),
  deliveryNotes: z.string().optional(),
  orderNotes: z.string().optional(),
  billingContactName: z.string().optional(),
  Courier: z.enum(["Servientrega", "LaarCourier", "Speed"]).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string(),
});

const createOrderRequestSchema = z.object({
  billingData: billingDataSchema,
  orderData: orderDataSchema,
});

module.exports = {
  orderItemSchema,
  orderDataSchema,
  billingDataSchema,
  createOrderRequestSchema,
};
