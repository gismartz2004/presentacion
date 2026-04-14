const { getAvailableFeatures, getTenantIdByDomain } = require("../../prisma/prisma-service");
const { extractTenantDomain } = require("../validations/featureValidation");

function featureMiddleware(featureName) {
    return async (req, res, next) => {
        try {
            // --- 2. Determinación del Tenant ID (por Dominio) ---
            const fullHost = req.headers.host;
            const tenantDomain = extractTenantDomain(fullHost);
        
            if (!tenantDomain) {
                return res.status(400).json({ status: "error", message: "Dominio inválido" });
            }
        
            console.log(`Auth Middleware: Extracted tenant domain: ${tenantDomain}`);
            const tenantId = await getTenantIdByDomain(tenantDomain);
            console.log(`Auth Middleware: Resolved tenant ID: ${tenantId} for domain: ${tenantDomain}`);
        
            if (!tenantId) {
                console.warn(`Auth Middleware: Tenant no encontrado para el dominio: ${tenantDomain}`);
                return res.status(404).json({ status: "error", message: "Tenant no encontrado para esta sesión." });
            }
            
            const features = await getAvailableFeatures(tenantId);
            const featuresNames = features.map(pf => pf.features.name);
            console.log(`Auth Middleware: Available features for tenant ID ${tenantId}:`, featuresNames);

            const hasFeature = featuresNames.includes(featureName);
            console.log(`Feature Middleware: Checking access for feature "${featureName}" for tenant ID ${tenantId}: ${hasFeature}`);

            if (!hasFeature) {
                return res.status(403).json({ status: "error", message: `Acceso denegado a la característica: ${featureName}` });
            }
            console.log(`Feature Middleware: Access granted to feature "${featureName}" for tenant ID ${tenantId}`);
            next();
        } catch (err) {
        return res.status(401).json({ status: "error", message: "Token inválido" });
        }
    }
}

module.exports = featureMiddleware;