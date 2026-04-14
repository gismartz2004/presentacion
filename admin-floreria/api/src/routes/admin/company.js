const express = require('express');
const {
  generateApiKey,
  generateWebhookSecret,
  updateAllowedDomains,
  getApiConfig,
  getApiLogs
} = require('../../controllers/admin/apiConfigController');

const router = express.Router();

// Generar nueva API Key
router.post('/api-key', generateApiKey);

// Generar nuevo Webhook Secret
router.post('/webhook-secret', generateWebhookSecret);

// Actualizar dominios permitidos
router.put('/allowed-domains', updateAllowedDomains);

// Obtener configuración actual
router.get('/:companyId/api-config', getApiConfig);

// Obtener logs de API requests
router.get('/:companyId/api-logs', getApiLogs);

module.exports = router;