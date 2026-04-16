const express = require('express');
const { db: prisma } = require('../../lib/prisma');
const { nanoid } = require('nanoid');
const router = express.Router();

const PAYPHONE_API = 'https://pay.payphonetodoespos.com/api/button';
const PAYPHONE_TOKEN = process.env.PAYPHONE_TOKEN;
const PAYPHONE_STORE_ID = process.env.PAYPHONE_STORE_ID;

const log = (step, msg, data) => {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    console.log(`[PAYPHONE][${step}] ${ts} — ${msg}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[PAYPHONE][${step}] ${ts} — ${msg}`);
  }
};

/**
 * POST /api/external/payphone/prepare
 * Crea la orden en estado PENDING y llama a PayPhone para obtener el link de pago.
 */
router.post('/prepare', async (req, res) => {
  log('PREPARE', 'Iniciando solicitud de pago');

  try {
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
      callbackUrl,
      cancellationUrl,
    } = req.body;

    log('PREPARE', 'Datos recibidos', {
      productId, productName, quantity, senderName, receiverName,
      phone, sector, shippingCost, total, couponCode,
      callbackUrl, cancellationUrl,
    });

    // 1. Validar campos obligatorios
    if (!receiverName || !senderName || !phone || !total) {
      log('PREPARE', 'ERROR — Faltan campos obligatorios');
      return res.status(400).json({ status: 'error', message: 'Faltan datos obligatorios.' });
    }

    // 2. Validar credenciales PayPhone
    const tokenOk = PAYPHONE_TOKEN && PAYPHONE_TOKEN !== 'your_payphone_token_here';
    const storeOk = PAYPHONE_STORE_ID && PAYPHONE_STORE_ID !== 'your_payphone_store_id_here';
    log('PREPARE', 'Credenciales PayPhone', {
      token_set: tokenOk,
      token_preview: tokenOk ? `${PAYPHONE_TOKEN.slice(0, 8)}...` : 'NO CONFIGURADO',
      store_id: storeOk ? PAYPHONE_STORE_ID : 'NO CONFIGURADO',
    });

    if (!tokenOk || !storeOk) {
      return res.status(503).json({
        status: 'error',
        message: 'El pago con tarjeta no está disponible en este momento.',
      });
    }

    // 3. Validar cupón si existe
    let couponDiscountAmount = 0;
    let couponId = null;
    let appliedCouponCode = null;

    if (couponCode) {
      log('PREPARE', `Validando cupón: ${couponCode}`);
      const now = new Date();
      const coupon = await prisma.coupons.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: now },
          validUntil: { gte: now },
        },
      });

      if (coupon) {
        const subtotal = Number(total) - Number(shippingCost || 0);
        if (coupon.minAmount && subtotal < coupon.minAmount) {
          log('PREPARE', `ERROR — Monto mínimo no cumplido: ${subtotal} < ${coupon.minAmount}`);
          return res.status(400).json({
            status: 'error',
            message: `El cupón requiere una compra mínima de $${coupon.minAmount}`,
          });
        }
        couponDiscountAmount = coupon.type === 'PERCENTAGE'
          ? subtotal * (coupon.value / 100)
          : coupon.value;
        couponId = coupon.id;
        appliedCouponCode = coupon.code;
        log('PREPARE', `Cupón aplicado: ${appliedCouponCode} — descuento $${couponDiscountAmount.toFixed(2)}`);
      } else {
        log('PREPARE', 'Cupón no encontrado o inactivo — se ignora');
      }
    }

    // 4. Recalcular total en servidor
    const finalTotal = Number(total) - couponDiscountAmount;
    const amountInCents = Math.round(finalTotal * 100);
    log('PREPARE', `Totales calculados`, { total_recibido: total, descuento: couponDiscountAmount, final: finalTotal, centavos: amountInCents });

    // 5. Generar IDs
    const orderNumber = `DIFIORI-${Date.now()}`;
    const clientTransactionId = nanoid(16);
    log('PREPARE', `IDs generados`, { orderNumber, clientTransactionId });

    // 6. Resolver producto
    let resolvedProductId = productId;
    if (!resolvedProductId && productName) {
      log('PREPARE', `Buscando producto por nombre: ${productName}`);
      const product = await prisma.product.findFirst({
        where: { name: { contains: productName, mode: 'insensitive' }, isActive: true },
      });
      resolvedProductId = product?.id;
      log('PREPARE', `Producto encontrado: ${resolvedProductId || 'NO ENCONTRADO'}`);
    }

    // 7. Crear la orden en DB antes de llamar a PayPhone
    log('PREPARE', 'Creando orden en DB...');
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          clientTransactionId,
          customerName: senderName.split(' ')[0] || senderName,
          customerLastName: senderName.split(' ').slice(1).join(' ') || '',
          customerPhone: phone,
          billingContactName: receiverName,
          billingPrincipalAddress: exactAddress || sector || 'No especificado',
          billingSecondAddress: sector,
          subtotal: Number(total) - Number(shippingCost || 0) - couponDiscountAmount,
          tax: 0,
          shipping: Number(shippingCost || 0),
          total: finalTotal,
          paymentStatus: 'PENDING',
          status: 'PENDING',
          deliveryNotes: cardMessage || null,
          source: 'TIENDA_WEB',
          discount_coupon_id: couponId,
          couponDiscountCode: appliedCouponCode,
          coupon_discounted_amount: couponDiscountAmount,
          total_discount_amount: couponDiscountAmount,
          orderNotes: `Recibe: ${receiverName} | Envía: ${senderName} | Sector: ${sector || 'N/A'} | Método pago: Tarjeta (PayPhone) | Fecha entrega: ${deliveryDateTime || 'No especificada'}${appliedCouponCode ? ` | Cupón: ${appliedCouponCode} (-$${couponDiscountAmount.toFixed(2)})` : ''}`,
        },
      });

      if (resolvedProductId) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: resolvedProductId,
            quantity: Number(quantity),
            price: Number(productPrice?.toString().replace(/[^0-9.-]/g, '') || 0),
          },
        });
      }

      return newOrder;
    });
    log('PREPARE', `Orden creada en DB`, { orderId: order.id, orderNumber: order.orderNumber });

    // 8. Llamar a PayPhone API
    const payphonePayload = {
      amount: amountInCents,
      amountWithTax: 0,
      amountWithoutTax: amountInCents,
      tax: 0,
      service: 0,
      tip: 0,
      currency: 'USD',
      storeId: Number(PAYPHONE_STORE_ID),
      clientTransactionId,
      reference: orderNumber,
      lang: 'es',
      responseUrl: callbackUrl,
      cancellationUrl: cancellationUrl || callbackUrl,
    };

    const payphoneUrl = `${PAYPHONE_API}/Prepare`;
    log('PREPARE', `Llamando a PayPhone API`, { url: payphoneUrl, payload: payphonePayload });

    let payphoneResponse;
    try {
      payphoneResponse = await fetch(payphoneUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYPHONE_TOKEN}`,
        },
        body: JSON.stringify(payphonePayload),
      });
    } catch (networkError) {
      log('PREPARE', `ERROR DE RED al contactar PayPhone`, {
        error: networkError.message,
        cause: networkError.cause?.message,
        code: networkError.cause?.code,
        hint: networkError.cause?.code === 'ENOTFOUND'
          ? 'DNS no resuelve el dominio — verifica conectividad o que la URL es correcta'
          : 'Error de red desconocido',
      });
      // Marcar orden como FAILED
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });
      return res.status(502).json({
        status: 'error',
        message: 'No se pudo conectar con la pasarela de pago. Intenta con transferencia.',
        detail: process.env.NODE_ENV === 'development' ? `${networkError.cause?.code}: ${networkError.cause?.message}` : undefined,
      });
    }

    const payphoneRawBody = await payphoneResponse.text();
    log('PREPARE', `Respuesta PayPhone`, {
      status: payphoneResponse.status,
      statusText: payphoneResponse.statusText,
      body: payphoneRawBody,
    });

    if (!payphoneResponse.ok) {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });
      return res.status(502).json({
        status: 'error',
        message: `PayPhone rechazó la solicitud (HTTP ${payphoneResponse.status}).`,
        detail: process.env.NODE_ENV === 'development' ? payphoneRawBody : undefined,
      });
    }

    let payphoneData;
    try {
      payphoneData = JSON.parse(payphoneRawBody);
    } catch {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });
      return res.status(502).json({
        status: 'error',
        message: 'Respuesta inválida de PayPhone.',
        detail: process.env.NODE_ENV === 'development' ? payphoneRawBody : undefined,
      });
    }

    if (!payphoneData.payWithCard) {
      log('PREPARE', 'ERROR — PayPhone no devolvió payWithCard', payphoneData);
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });
      return res.status(502).json({
        status: 'error',
        message: 'PayPhone no devolvió URL de pago.',
        detail: process.env.NODE_ENV === 'development' ? payphoneData : undefined,
      });
    }

    log('PREPARE', `OK — URL de pago obtenida`, { payWithCard: payphoneData.payWithCard });

    return res.status(200).json({
      status: 'success',
      data: {
        paymentUrl: payphoneData.payWithCard,
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientTransactionId,
      },
    });

  } catch (error) {
    log('PREPARE', 'ERROR NO CONTROLADO', { message: error.message, stack: error.stack });
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo iniciar el pago. Intenta de nuevo.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/external/payphone/confirm
 * Confirma el pago con PayPhone y actualiza la orden.
 */
router.post('/confirm', async (req, res) => {
  const { id: payphoneTransactionId, clientTransactionId, transactionStatus } = req.body;
  log('CONFIRM', 'Iniciando confirmación', { payphoneTransactionId, clientTransactionId, transactionStatus });

  try {
    if (!clientTransactionId) {
      log('CONFIRM', 'ERROR — clientTransactionId ausente');
      return res.status(400).json({ status: 'error', message: 'Faltan datos de confirmación.' });
    }

    // Buscar orden
    const order = await prisma.order.findUnique({ where: { clientTransactionId } });
    if (!order) {
      log('CONFIRM', `ERROR — Orden no encontrada para clientTransactionId: ${clientTransactionId}`);
      return res.status(404).json({ status: 'error', message: 'Orden no encontrada.' });
    }
    log('CONFIRM', `Orden encontrada`, { orderId: order.id, orderNumber: order.orderNumber, paymentStatus: order.paymentStatus });

    // Idempotencia
    if (order.paymentStatus === 'PAID' || order.paymentStatus === 'FAILED') {
      log('CONFIRM', `Orden ya procesada — retornando estado actual: ${order.paymentStatus}`);
      return res.status(200).json({
        status: 'success',
        data: { orderNumber: order.orderNumber, paymentStatus: order.paymentStatus, alreadyProcessed: true },
      });
    }

    // Cancelación sin pago
    if (!payphoneTransactionId || transactionStatus === 'CANCELLED') {
      log('CONFIRM', 'Pago cancelado por el usuario');
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'CANCELLED' } });
      return res.status(200).json({
        status: 'success',
        data: { orderNumber: order.orderNumber, paymentStatus: 'CANCELLED' },
      });
    }

    // Confirmar con PayPhone
    const confirmPayload = { id: Number(payphoneTransactionId), clientTransactionId };
    const confirmUrl = `${PAYPHONE_API}/V2/Confirm`;
    log('CONFIRM', `Llamando a PayPhone Confirm`, { url: confirmUrl, payload: confirmPayload });

    let confirmResponse;
    try {
      confirmResponse = await fetch(confirmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYPHONE_TOKEN}`,
        },
        body: JSON.stringify(confirmPayload),
      });
    } catch (networkError) {
      log('CONFIRM', `ERROR DE RED al confirmar con PayPhone`, {
        error: networkError.message,
        cause: networkError.cause?.message,
      });
      return res.status(502).json({
        status: 'error',
        message: 'No se pudo confirmar el pago con PayPhone.',
        detail: process.env.NODE_ENV === 'development' ? networkError.message : undefined,
      });
    }

    const confirmRawBody = await confirmResponse.text();
    log('CONFIRM', `Respuesta PayPhone Confirm`, {
      status: confirmResponse.status,
      body: confirmRawBody,
    });

    if (!confirmResponse.ok) {
      return res.status(502).json({
        status: 'error',
        message: `PayPhone Confirm HTTP ${confirmResponse.status}`,
        detail: process.env.NODE_ENV === 'development' ? confirmRawBody : undefined,
      });
    }

    const confirmData = JSON.parse(confirmRawBody);
    const approved = confirmData.transactionStatus === 'Approved';
    log('CONFIRM', `Estado de transacción PayPhone`, { transactionStatus: confirmData.transactionStatus, approved });

    // Validar monto (±2 centavos)
    const confirmedAmountCents = confirmData.amount;
    const expectedAmountCents = Math.round(order.total * 100);
    const amountMismatch = Math.abs(confirmedAmountCents - expectedAmountCents) > 2;

    if (approved && amountMismatch) {
      log('CONFIRM', `ERROR — Monto no coincide`, { esperado: expectedAmountCents, recibido: confirmedAmountCents });
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED', payPhoneTransactionId: String(payphoneTransactionId) },
      });
      return res.status(400).json({ status: 'error', message: 'Error de integridad en el pago.' });
    }

    // Actualizar orden
    const newPaymentStatus = approved ? 'PAID' : 'FAILED';
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newPaymentStatus,
        payPhoneTransactionId: String(payphoneTransactionId),
        payPhoneAuthCode: confirmData.authorizationCode || null,
        paidAt: approved ? new Date() : null,
      },
    });
    log('CONFIRM', `Orden actualizada`, { orderNumber: order.orderNumber, paymentStatus: newPaymentStatus });

    // Incrementar uso del cupón solo si fue exitoso
    if (approved && order.discount_coupon_id) {
      await prisma.coupons.update({
        where: { id: order.discount_coupon_id },
        data: { usesTotal: { increment: 1 } },
      });
      log('CONFIRM', `Uso de cupón incrementado para couponId: ${order.discount_coupon_id}`);
    }

    return res.status(200).json({
      status: 'success',
      data: { orderNumber: order.orderNumber, paymentStatus: newPaymentStatus, approved },
    });

  } catch (error) {
    log('CONFIRM', 'ERROR NO CONTROLADO', { message: error.message });
    return res.status(500).json({
      status: 'error',
      message: 'Error al confirmar el pago.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
