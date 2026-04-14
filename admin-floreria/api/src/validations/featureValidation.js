import { getAvailableFeatures, getTenantIdByDomain } from "../../prisma/prisma-service.js";


export function extractTenantDomain(fullHost) {
  if (!fullHost) return null;

  // Quitar puerto y normalizar
  const host = fullHost.split(":")[0].toLowerCase();

  // 🧪 Ambiente local
  if (host === "localhost" || host.endsWith(".localhost")) {
    const parts = host.split(".");
    // perfumeriasz.localhost -> perfumeriasz
    return parts.length > 1 ? parts[0] : "localhost";
  }

  const parts = host.split(".");
 
  // admin.perfumeriasz.com → perfumeriasz
  // perfumeriasz.com → perfumeriasz
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }

  return null;
}

export async function validateFeatureAccess(featureName, host) {
    const fullHost = host;
    const tenantDomain = extractTenantDomain(fullHost);

    if (!tenantDomain) {
        return false;
    }

    console.log(`Auth Middleware: Extracted tenant domain: ${tenantDomain}`);
    const tenantId = await getTenantIdByDomain(tenantDomain);

    if (!tenantId) {
        console.warn(`Auth Middleware: Tenant no encontrado para el dominio: ${tenantDomain}`);
        return false;
    }
    
    const features = await getAvailableFeatures(tenantId);
    const featuresNames = features.map(pf => pf.features.name);
    console.log(`Auth Middleware: Available features for tenant ID ${tenantId}:`, featuresNames);

    return featuresNames.includes(featureName);
}