const Stripe = require("stripe");
const { db: prisma } = require("../../lib/prisma");
const emailService = require("../../services/emailService");
const { orderEvents } = require("../../events/orderEvents");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Función para retry con backoff exponencial
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithBackoff(fn, maxAttempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    console.error("Missing Stripe signature");
    return res.status(400).json({ error: "Missing signature" });
  }

  let event;

  try {
    // Construir el evento usando el webhook secret
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  console.log("Webhook received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        console.log("Processing checkout session:", session.id);
        console.log("Session metadata:", session.metadata);

        // Obtener metadata con la información de la orden
        const {
          orderNumber,
          sequentialNumber,
          billingData,
          cartItems,
          totals,
        } = session.metadata || {};

        if (!orderNumber || !billingData || !cartItems || !totals) {
          console.error("Missing order data in session metadata");
          console.error("Available metadata:", session.metadata);
          return res.status(400).json({ error: "Missing order data" });
        }

        console.log("Parsed metadata successfully:");
        console.log("- Order Number:", orderNumber);
        console.log("- Sequential Number:", sequentialNumber);
        console.log("- Billing Data length:", billingData?.length);
        console.log("- Cart Items length:", cartItems?.length);
        console.log("- Totals length:", totals?.length);

        // Parsear los datos JSON
        let parsedBillingData, parsedCartItems, parsedTotals;

        try {
          parsedBillingData = JSON.parse(billingData);
          parsedCartItems = JSON.parse(cartItems);
          parsedTotals = JSON.parse(totals);

          console.log("Successfully parsed:");
          console.log(
            "- Customer:",
            parsedBillingData.name,
            parsedBillingData.email
          );
          console.log("- Items count:", parsedCartItems.length);
          console.log("- Total amount:", parsedTotals.total);
        } catch (parseError) {
          console.error("Error parsing metadata:", parseError);
          console.error("Raw metadata:", { billingData, cartItems, totals });
          return res.status(400).json({ error: "Invalid metadata format" });
        }

        // Crear la orden en la base de datos con retry
        let createdOrder;
        // await retryWithBackoff(async () => {
        createdOrder = await prisma.$transaction(async (tx) => {
          // Crear la orden
          const order = await tx.order.create({
            data: {
              orderNumber,
              description: parsedBillingData.description || null,
              sequentialNumber: parseInt(sequentialNumber, 10),
              customerName: parsedBillingData.name,
              customerEmail: parsedBillingData.email,
              customerPhone: parsedBillingData.phone || null,
              billingAddress: parsedBillingData.address,
              billingCity: parsedBillingData.city,
              billingState: parsedBillingData.state || null,
              billingZip: parsedBillingData.zip,
              billingCountry: parsedBillingData.country || "US",
              subtotal: parseFloat(parsedTotals.subtotal),
              tax: parseFloat(parsedTotals.tax || 0),
              shipping: parseFloat(parsedTotals.shipping || 0),
              total: parseFloat(parsedTotals.total),
              stripeSessionId: session.id,
              stripePaymentId: session.payment_intent,
              paymentStatus: "SUCCEEDED",
              status: "PENDING", // el estado inicial es PENDING
              paidAt: new Date(),
              notes: parsedBillingData.deliveryMethod === true ? "Para delivery" : "Para retiro",
            },
          });

          console.log("Order created:", order.id);

          // Crear los items de la orden
          const orderItems = [];
          for (const item of parsedCartItems) {
            const idOrderItem = item.id.split("-");
            const productId = idOrderItem[0];
            const variantId = idOrderItem.length > 1 ? idOrderItem[1] : null;

            // Si hay variantId, obtener el nombre de la variante
            let variantName = null;
            if (variantId) {
              const variant = await tx.productVariant.findUnique({
                where: { id: variantId },
                select: { name: true },
              });
              variantName = variant?.name || null;
            }

            // Obtener información del producto para el email
            const product = await tx.product.findUnique({
              where: { id: productId },
              select: { name: true },
            });

            const orderItem = await tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: productId,
                variantId: variantId,
                variantName: variantName,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price),
              },
            });

            // Agregar información del producto para el email
            orderItems.push({
              ...orderItem,
              productName: product?.name || "Producto",
              variantName: variantName,
              price: parseFloat(item.price),
              quantity: parseInt(item.quantity),
            });

            console.log(`Order item created for product: ${productId}`);
          }

          console.log("Order processing completed successfully");

          // Retornar la orden con los items para el email
          const fullOrder = {
            ...order,
            items: orderItems,
          };

          // Emitir evento de creación para SSE
          orderEvents.emit("order.created", {
            id: fullOrder.id,
            status: fullOrder.status,
            order: fullOrder.orderNumber,
            customerName: fullOrder.customerName,
            customerEmail: fullOrder.customerEmail,
            createdAt: fullOrder.createdAt,
          });

          return fullOrder;
        });
        // });

        // Enviar emails después de crear la orden exitosamente
        if (createdOrder) {
          try {
            console.log("Sending confirmation and invoice emails...");

            // Preparar datos para el email
            const emailData = {
              ...createdOrder,
              items: createdOrder.items,
              createdAt: new Date(createdOrder.createdAt).toLocaleDateString(
                "es-ES",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
            };

            // Enviar factura por email
            const invoiceResult = await emailService.sendInvoiceEmail(
              emailData
            );
            if (invoiceResult.success) {
              console.log("Invoice email sent successfully");
            } else {
              console.error(
                "Failed to send invoice email:",
                invoiceResult.error
              );
            }
          } catch (emailError) {
            // No fallar el webhook por errores de email, solo logear
            console.error("Error sending emails:", emailError);
          }
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Payment failed for:", paymentIntent.id);

        // Buscar y actualizar la orden si existe
        if (paymentIntent.metadata?.orderNumber) {
          await retryWithBackoff(async () => {
            const updated = await prisma.order.updateMany({
              where: {
                stripePaymentId: paymentIntent.id,
              },
              data: {
                paymentStatus: "FAILED",
                status: "CANCELLED",
              },
            });
            if (updated.count > 0) {
              // No tenemos las filas exactas aquí; se podría hacer un findMany si se requiere detalle.
              orderEvents.emit("order.status.updated", {
                paymentId: paymentIntent.id,
                newStatus: "CANCELLED",
              });
            }
          });
        }

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      error: "Webhook processing failed",
      details: error.message,
    });
  }
};
