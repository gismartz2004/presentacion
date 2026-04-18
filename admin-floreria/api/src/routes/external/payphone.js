const express = require('express');
const { db: prisma } = require('../../lib/prisma');
const {
  createPendingPayphoneOrder,
  finalizePayphoneOrder,
} = require('../../services/payphoneOrderService');
const router = express.Router();

const log = (step, msg, data) => {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    console.log(`[PAYPHONE][${step}] ${ts} — ${msg}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[PAYPHONE][${step}] ${ts} — ${msg}`);
  }
};

router.post('/box-session', async (req, res) => {
  log('BOX_SESSION', 'Iniciando creación de sesión web');

  try {
    const session = await createPendingPayphoneOrder(prisma, {
      ...req.body,
      paymentLabel: 'Tarjeta (PayPhone Box)',
    });

    log('BOX_SESSION', 'Orden pendiente creada', {
      orderId: session.order.id,
      orderNumber: session.order.orderNumber,
      clientTransactionId: session.clientTransactionId,
      amountInCents: session.amountInCents,
    });

    return res.status(201).json({
      status: 'success',
      data: {
        orderId: session.order.id,
        orderNumber: session.order.orderNumber,
        clientTransactionId: session.clientTransactionId,
        amount: session.amountInCents,
        amountWithoutTax: session.amountInCents,
        amountWithTax: 0,
        tax: 0,
        currency: 'USD',
        reference: session.order.orderNumber,
      },
    });
  } catch (error) {
    log('BOX_SESSION', 'ERROR', { message: error.message, stack: error.stack });
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'No se pudo crear la sesión de pago.',
      detail: process.env.NODE_ENV === 'development' && !error.statusCode ? error.message : undefined,
    });
  }
});

router.post('/finalize', async (req, res) => {
  const {
    id: payphoneTransactionId,
    clientTransactionId,
    clientTxId,
    transactionStatus,
    amount,
    authorizationCode,
  } = req.body;
  const resolvedClientTxId = clientTxId || clientTransactionId;

  log('FINALIZE', 'Finalizando pago desde web-box', {
    payphoneTransactionId,
    clientTransactionId: resolvedClientTxId,
    transactionStatus,
    amount,
  });

  try {
    const finalization = await finalizePayphoneOrder(prisma, {
      clientTransactionId: resolvedClientTxId,
      payphoneTransactionId,
      transactionStatus,
      amount,
      authorizationCode,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        orderNumber: finalization.order.orderNumber,
        paymentStatus: finalization.paymentStatus,
        approved: finalization.approved,
        alreadyProcessed: finalization.alreadyProcessed,
      },
    });
  } catch (error) {
    log('FINALIZE', 'ERROR', { message: error.message, stack: error.stack });
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'No se pudo finalizar el pago.',
      detail: process.env.NODE_ENV === 'development' && !error.statusCode ? error.message : undefined,
    });
  }
});

module.exports = router;
