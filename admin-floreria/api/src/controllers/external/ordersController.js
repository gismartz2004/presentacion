const { PrismaClient } = require("@prisma/client");
const { verifyWebhookSignature } = require("../../middlewares/webhookMiddleware");

const prisma = new PrismaClient();

/**
 * Recibir nueva orden desde web externa
 * POST /api/external/orders
 */
const createExternalOrder = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const company = req.company; // Viene del apiKeyMiddleware
    const rawBody = JSON.stringify(req.body);
    
    // Verificar webhook signature si está configurado
    if (company.webhookSecret && req.webhookSignature) {
      const isValidSignature = verifyWebhookSignature(
        rawBody,
        req.webhookSignature,
        company.webhookSecret,
        req.webhookTimestamp
      );
      
      if (!isValidSignature) {
        await req.logApiRequest(401, "Invalid webhook signature");
        return res.status(401).json({
          error: "Signature inválida",
          message: "La signature del webhook no es válida"
        });
      }
    }

    // Validar datos requeridos
    const {
      customerName,
      customerEmail,
      customerPhone,
      billingAddress,
      billingCity,
      billingState,
      billingZip,
      billingCountry,
      items,
      subtotal,
      tax = 0,
      shipping = 0,
      total,
      stripePaymentId,
      stripeSessionId,
      notes
    } = req.body;

    // Validaciones básicas
    if (!customerName || !customerEmail || !billingAddress || !items || items.length === 0) {
      await req.logApiRequest(400, "Missing required fields");
      return res.status(400).json({
        error: "Datos incompletos",
        message: "Faltan campos requeridos: customerName, customerEmail, billingAddress, items"
      });
    }

    // Generar número de orden único
    const lastOrder = await prisma.order.findFirst({
      where: { companyId: company.id },
      orderBy: { sequentialNumber: 'desc' }
    });
    
    const sequentialNumber = (lastOrder?.sequentialNumber || 0) + 1;
    const orderNumber = `${company.slug.toUpperCase()}-${String(sequentialNumber).padStart(6, '0')}`;

    // Crear la orden en una transacción
    const order = await prisma.$transaction(async (tx) => {
      // Crear la orden principal
      const newOrder = await tx.order.create({
        data: {
          companyId: company.id,
          orderNumber,
          sequentialNumber,
          customerName,
          customerEmail,
          customerPhone,
          billingAddress,
          billingCity,
          billingState,
          billingZip,
          billingCountry,
          subtotal,
          tax,
          shipping,
          total,
          stripePaymentId,
          stripeSessionId,
          paymentStatus: stripePaymentId ? 'PAID' : 'PENDING',
          source: 'api',
          sourceIp: req.ip || req.connection.remoteAddress,
          sourceUserAgent: req.headers['user-agent'],
          verifiedWebhook: company.webhookSecret ? true : false,
          notes,
          paidAt: stripePaymentId ? new Date() : null
        }
      });

      // Crear los items de la orden
      const orderItems = await Promise.all(
        items.map(async (item) => {
          return tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId || null,
              productName: item.name || item.productName,
              productDescription: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice || item.price,
              totalPrice: (item.unitPrice || item.price) * item.quantity
            }
          });
        })
      );

      return { ...newOrder, orderItems };
    });

    // Log del éxito
    await req.logApiRequest(201, "Order created successfully");

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: "Orden creada exitosamente",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        customerName: order.customerName
      }
    });

    // TODO: Aquí podrías agregar notificaciones en tiempo real
    // - WebSocket a dashboard admin
    // - Email al equipo
    // - Slack notification, etc.

  } catch (error) {
    console.error("Error creando orden externa:", error);
    
    // Log del error
    await req.logApiRequest(500, `Error: ${error.message}`);

    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error al procesar la orden",
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

/**
 * Obtener estados de órdenes para sincronización
 * GET /api/external/orders/status
 */
const getOrdersStatus = async (req, res) => {
  try {
    const company = req.company;
    const { orderNumbers } = req.query; // ?orderNumbers=ORDER-1,ORDER-2,ORDER-3

    if (!orderNumbers) {
      await req.logApiRequest(400, "Missing orderNumbers parameter");
      return res.status(400).json({
        error: "Parámetro requerido",
        message: "Debe proporcionar orderNumbers como query parameter"
      });
    }

    const orderNumbersArray = orderNumbers.split(',');
    
    const orders = await prisma.order.findMany({
      where: {
        companyId: company.id,
        orderNumber: {
          in: orderNumbersArray
        }
      },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        updatedAt: true,
        paidAt: true
      }
    });

    await req.logApiRequest(200, `Retrieved ${orders.length} order statuses`);

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error("Error obteniendo estados de órdenes:", error);
    await req.logApiRequest(500, `Error: ${error.message}`);

    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error al obtener estados de órdenes"
    });
  }
};

/**
 * Webhook para notificaciones de cambios de estado
 * POST /api/external/webhook/order-status
 */
const notifyOrderStatusChange = async (req, res) => {
  try {
    // Este endpoint sería llamado desde tu admin cuando cambies el estado de una orden
    // Para notificar a la web externa sobre el cambio
    
    const { orderNumber, newStatus, updatedAt } = req.body;
    
    // Aquí podrías implementar la lógica para notificar a la web externa
    // Por ejemplo, hacer un POST a su webhook endpoint

    res.json({
      success: true,
      message: "Notificación enviada exitosamente"
    });

  } catch (error) {
    console.error("Error enviando notificación:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error al enviar notificación"
    });
  }
};

module.exports = {
  createExternalOrder,
  getOrdersStatus,
  notifyOrderStatusChange
};