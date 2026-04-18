const { nanoid } = require("nanoid");

function splitFullName(fullName = "") {
  const trimmed = String(fullName).trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || trimmed,
    lastName: parts.slice(1).join(" "),
  };
}

function parseCurrencyLikeValue(value) {
  if (typeof value === "number") return value;
  const normalized = String(value || "")
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function resolveCoupon(prisma, { couponCode, total, shippingCost }) {
  if (!couponCode) {
    return { couponDiscountAmount: 0, couponId: null, appliedCouponCode: null };
  }

  const now = new Date();
  const coupon = await prisma.coupons.findFirst({
    where: {
      code: String(couponCode).toUpperCase(),
      isActive: true,
      validFrom: { lte: now },
      validUntil: { gte: now },
    },
  });

  if (!coupon) {
    return { couponDiscountAmount: 0, couponId: null, appliedCouponCode: null };
  }

  const subtotal = Number(total) - Number(shippingCost || 0);
  if (coupon.minAmount && subtotal < coupon.minAmount) {
    const error = new Error(`El cupón requiere una compra mínima de $${coupon.minAmount}`);
    error.statusCode = 400;
    throw error;
  }

  const couponDiscountAmount = coupon.type === "PERCENTAGE"
    ? subtotal * (coupon.value / 100)
    : coupon.value;

  return {
    couponDiscountAmount,
    couponId: coupon.id,
    appliedCouponCode: coupon.code,
  };
}

async function resolveProductId(prisma, { productId, productName }) {
  if (productId) return productId;
  if (!productName) return null;

  const product = await prisma.product.findFirst({
    where: {
      name: { contains: String(productName), mode: "insensitive" },
      isActive: true,
    },
  });

  return product?.id || null;
}

async function createPendingPayphoneOrder(prisma, payload) {
  const {
    productId,
    productName,
    productPrice,
    quantity = 1,
    receiverName,
    senderName,
    phone,
    deliveryDateTime,
    exactAddress,
    sector,
    shippingCost,
    cardMessage,
    total,
    couponCode,
    paymentLabel = "Tarjeta (PayPhone Box)",
  } = payload;

  if (!receiverName || !senderName || !phone || !total) {
    const error = new Error("Faltan datos obligatorios.");
    error.statusCode = 400;
    throw error;
  }

  const { couponDiscountAmount, couponId, appliedCouponCode } = await resolveCoupon(prisma, {
    couponCode,
    total,
    shippingCost,
  });

  const finalTotal = Number(total) - couponDiscountAmount;
  const amountInCents = Math.round(finalTotal * 100);
  const orderNumber = `DIFIORI-${Date.now()}`;
  const clientTransactionId = nanoid(16);
  const resolvedProductId = await resolveProductId(prisma, { productId, productName });
  const senderParts = splitFullName(senderName);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        clientTransactionId,
        customerName: senderParts.firstName,
        customerLastName: senderParts.lastName,
        customerPhone: phone,
        billingContactName: receiverName,
        billingPrincipalAddress: exactAddress || sector || "No especificado",
        billingSecondAddress: sector,
        subtotal: Number(total) - Number(shippingCost || 0) - couponDiscountAmount,
        tax: 0,
        shipping: Number(shippingCost || 0),
        total: finalTotal,
        paymentStatus: "PENDING",
        status: "PENDING",
        deliveryNotes: cardMessage || null,
        source: "TIENDA_WEB",
        discount_coupon_id: couponId,
        couponDiscountCode: appliedCouponCode,
        coupon_discounted_amount: couponDiscountAmount,
        total_discount_amount: couponDiscountAmount,
        orderNotes: `Recibe: ${receiverName} | Envía: ${senderName} | Sector: ${sector || "N/A"} | Método pago: ${paymentLabel} | Fecha entrega: ${deliveryDateTime || "No especificada"}${appliedCouponCode ? ` | Cupón: ${appliedCouponCode} (-$${couponDiscountAmount.toFixed(2)})` : ""}`,
      },
    });

    if (resolvedProductId) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: resolvedProductId,
          quantity: Number(quantity),
          price: parseCurrencyLikeValue(productPrice),
        },
      });
    }

    return newOrder;
  });

  return {
    order,
    amountInCents,
    finalTotal,
    clientTransactionId,
    orderNumber,
  };
}

async function finalizePayphoneOrder(prisma, payload) {
  const {
    clientTransactionId,
    payphoneTransactionId,
    transactionStatus,
    amount,
    authorizationCode,
  } = payload;

  if (!clientTransactionId) {
    const error = new Error("Faltan datos de confirmación.");
    error.statusCode = 400;
    throw error;
  }

  const order = await prisma.order.findUnique({ where: { clientTransactionId } });
  if (!order) {
    const error = new Error("Orden no encontrada.");
    error.statusCode = 404;
    throw error;
  }

  if (["PAID", "FAILED", "CANCELLED"].includes(order.paymentStatus)) {
    return {
      order,
      paymentStatus: order.paymentStatus,
      approved: order.paymentStatus === "PAID",
      alreadyProcessed: true,
    };
  }

  if (!payphoneTransactionId || transactionStatus === "CANCELLED") {
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "CANCELLED",
        payPhoneTransactionId: payphoneTransactionId ? String(payphoneTransactionId) : null,
      },
    });

    return {
      order: updatedOrder,
      paymentStatus: "CANCELLED",
      approved: false,
      alreadyProcessed: false,
    };
  }

  const approved = transactionStatus === "Approved";
  const normalizedAmount = Number(amount);
  if (approved && Number.isFinite(normalizedAmount)) {
    const expectedAmountCents = Math.round(Number(order.total) * 100);
    const amountMismatch = Math.abs(normalizedAmount - expectedAmountCents) > 2;
    if (amountMismatch) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          payPhoneTransactionId: String(payphoneTransactionId),
        },
      });

      const error = new Error("Error de integridad en el pago.");
      error.statusCode = 400;
      throw error;
    }
  }

  const newPaymentStatus = approved ? "PAID" : "FAILED";
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: newPaymentStatus,
      payPhoneTransactionId: String(payphoneTransactionId),
      payPhoneAuthCode: authorizationCode || null,
      paidAt: approved ? new Date() : null,
    },
  });

  if (approved && order.discount_coupon_id) {
    await prisma.coupons.update({
      where: { id: order.discount_coupon_id },
      data: { usesTotal: { increment: 1 } },
    });
  }

  return {
    order: updatedOrder,
    paymentStatus: newPaymentStatus,
    approved,
    alreadyProcessed: false,
  };
}

module.exports = {
  createPendingPayphoneOrder,
  finalizePayphoneOrder,
};
