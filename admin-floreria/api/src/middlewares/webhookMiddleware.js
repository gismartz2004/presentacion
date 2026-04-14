const crypto = require("crypto");

/**
 * Middleware para verificar webhooks usando HMAC SHA256
 * Similar a como lo hace Stripe, GitHub, etc.
 */
const webhookVerificationMiddleware = (req, res, next) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    
    if (!signature || !timestamp) {
      return res.status(401).json({ 
        error: "Webhook no autorizado",
        message: "Faltan headers de verificación (x-webhook-signature, x-webhook-timestamp)"
      });
    }

    // Verificar que el timestamp no sea muy viejo (previene ataques de replay)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    
    // Permitir máximo 5 minutos de diferencia
    if (Math.abs(currentTime - webhookTime) > 300) {
      return res.status(401).json({ 
        error: "Webhook expirado",
        message: "El timestamp del webhook es muy viejo"
      });
    }

    // La verificación real se hace en el controller después de obtener la company
    // porque necesitamos el webhookSecret específico de esa empresa
    req.webhookSignature = signature;
    req.webhookTimestamp = timestamp;
    
    next();
    
  } catch (error) {
    console.error("Error en webhookVerificationMiddleware:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor",
      message: "Error al verificar webhook"
    });
  }
};

/**
 * Función para verificar la signature del webhook
 * @param {string} payload - El cuerpo del request como string
 * @param {string} signature - La signature recibida
 * @param {string} secret - El webhook secret de la empresa
 * @param {string} timestamp - Timestamp del webhook
 */
const verifyWebhookSignature = (payload, signature, secret, timestamp) => {
  try {
    // Crear el payload para verificar: timestamp + payload
    const payloadToVerify = timestamp + payload;
    
    // Generar la signature esperada
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadToVerify, 'utf8')
      .digest('hex');
    
    // La signature viene como "sha256=abc123..."
    const receivedSignature = signature.replace('sha256=', '');
    
    // Comparación segura para evitar timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
    
  } catch (error) {
    console.error("Error verificando webhook signature:", error);
    return false;
  }
};

/**
 * Función para generar signature de webhook (para documentación)
 */
const generateWebhookSignature = (payload, secret, timestamp) => {
  const payloadToSign = timestamp + payload;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadToSign, 'utf8')
    .digest('hex');
  
  return `sha256=${signature}`;
};

module.exports = {
  webhookVerificationMiddleware,
  verifyWebhookSignature,
  generateWebhookSignature
};