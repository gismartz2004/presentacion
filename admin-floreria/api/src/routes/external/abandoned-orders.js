const express = require("express");
const { db: prisma } = require("../../lib/prisma");
const { sendAbandonedCartEmail } = require("../../utils/mail");
const router = express.Router();

/**
 * POST /api/external/store-orders/abandoned
 * Recibir datos de carrito abandonado y notificar por email
 */
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      phone,
      items,
      total,
      senderName,
      senderEmail,
      senderPhone,
      receiverName,
      receiverPhone,
      exactAddress,
      sector,
      paymentMethod,
      deliveryDateTime,
      cardMessage,
      observations,
      couponCode,
      abandonedAt,
      source,
      checkoutStep,
      checkoutStepLabel,
      abandonmentSessionId,
    } = req.body;

    if (!customerName || !phone || !items || items.length === 0) {
      return res.status(400).json({ status: "error", message: "Datos incompletos para notificacion de abandono" });
    }

    const resolvedCheckoutStepLabel = checkoutStepLabel || (
      checkoutStep === "sender"
        ? "Datos de quien envia"
        : checkoutStep === "receiver"
          ? "Datos de quien recibe"
          : checkoutStep === "payment"
            ? "Metodo de pago"
            : ""
    );

    console.log(`Notificando carrito abandonado de: ${customerName} (${phone})`);

    const company = await prisma.company.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        settings: true,
      },
    });

    if (!company) {
      return res.status(404).json({ status: "error", message: "Empresa no configurada" });
    }

    const formattedItems = items.map((item) => ({
      name: item.product?.name || item.name || "Producto",
      quantity: item.quantity,
      price: item.product?.price || item.price || 0,
    }));

    const paymentSettings = company?.settings && typeof company.settings === "object"
      ? company.settings.paymentSettings || {}
      : {};

    const normalizedSessionId = String(abandonmentSessionId || "").trim();
    const recentDuplicate = normalizedSessionId
      ? await prisma.abandonedCart.findFirst({
          where: {
            companyId: company.id,
            notes: {
              contains: `Abandono ID: ${normalizedSessionId}`,
            },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : null;

    const abandonedCart = recentDuplicate || await prisma.abandonedCart.create({
      data: {
        companyId: company.id,
        customerName,
        customerPhone: phone,
        senderName: senderName || null,
        receiverName: receiverName || null,
        exactAddress: exactAddress || null,
        sector: sector || null,
        paymentMethod: paymentMethod || null,
        deliveryDateTime: deliveryDateTime || null,
        cardMessage: cardMessage || null,
        couponCode: couponCode || null,
        notes: [
          normalizedSessionId ? `Abandono ID: ${normalizedSessionId}` : "",
          resolvedCheckoutStepLabel ? `Paso abandonado: ${resolvedCheckoutStepLabel}` : "",
          senderEmail ? `Correo envia: ${senderEmail}` : "",
          senderPhone ? `Telefono envia: ${senderPhone}` : "",
          receiverPhone ? `Telefono recibe: ${receiverPhone}` : "",
          observations ? `Observaciones: ${observations}` : "",
        ].filter(Boolean).join(" | ") || null,
        total: Number(total) || 0,
        items: formattedItems,
        source: source || "CHECKOUT_WEB",
        ownerEmail: paymentSettings.ownerNotificationEmail || company.email || null,
        abandonedAt: abandonedAt ? new Date(abandonedAt) : new Date(),
      },
    });

    const shouldSendEmail = !recentDuplicate || !recentDuplicate.emailSent;

    const sent = shouldSendEmail
      ? await sendAbandonedCartEmail({
          customerName,
          phone,
          items: formattedItems,
          total: Number(total),
          recipientEmail: paymentSettings.ownerNotificationEmail || company?.email,
          ownerName: paymentSettings.ownerNotificationName || company?.name,
          senderName,
          senderEmail,
          senderPhone,
          receiverName,
          receiverPhone,
          exactAddress,
          sector,
          paymentMethod,
          deliveryDateTime,
          cardMessage,
          observations,
          couponCode,
          abandonedAt,
          source: resolvedCheckoutStepLabel ? `${source || "CHECKOUT_WEB"} (${resolvedCheckoutStepLabel})` : source,
        })
      : true;

    if (sent && abandonedCart && !abandonedCart.emailSent) {
      await prisma.abandonedCart.update({
        where: { id: abandonedCart.id },
        data: {
          emailSent: true,
        },
      });
    }

    if (sent) {
      return res.json({
        status: "success",
        message: "Notificacion de abandono enviada",
        data: {
          id: abandonedCart.id,
        },
      });
    }

    return res.status(500).json({ status: "error", message: "Error enviando notificacion" });
  } catch (error) {
    console.error("Abandoned order route error:", error);
    res.status(500).json({ status: "error", message: "Error interno" });
  }
});

module.exports = router;
