import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { getProdTemplate, serveStatic } from "./static";
import { createServer } from "http";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import {
  BEST_SELLERS_CATEGORY_NAME,
  BEST_SELLERS_CATEGORY_SLUG,
  findCategoryNameBySlug,
  getCategoryPath,
  getProductIdFromSlug,
  getProductPath,
  isPublicCatalogProduct,
  slugify,
} from "../shared/catalog";
import { createAppQueryClient } from "../client/src/lib/queryClient";
import { renderApp } from "../client/src/server-entry";
import { DEFAULT_SEO_STATE, renderSeoTags } from "../client/src/components/Seo";
import { categoriesQueryKey, fetchCategories } from "../client/src/hooks/useCategories";
import { companyQueryKey, fetchCompany } from "../client/src/hooks/useCompany";
import { cmsHomeHeroQueryKey, fetchHomeHero } from "../client/src/hooks/useCMS";
import { productsQueryKey, fetchProducts } from "../client/src/hooks/useProducts";
import type { Product } from "../client/src/data/mock";
import type { QueryClient } from "@tanstack/react-query";
import type { ViteDevServer } from "vite";

const app = express();
const httpServer = createServer(app);

function normalizeUrl(value?: string | null) {
  const normalized = String(value || "").trim();
  return normalized ? normalized.replace(/\/$/, "") : "";
}

function hydratePayphoneEnvFromAdminEnv() {
  if (process.env.PAYPHONE_WEB_TOKEN && process.env.PAYPHONE_WEB_STORE_ID) return;

  const envPath = resolve(process.cwd(), "admin-floreria/api/.env");
  if (!existsSync(envPath)) return;

  const envFile = readFileSync(envPath, "utf8");
  for (const rawLine of envFile.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (
      key !== "PAYPHONE_WEB_TOKEN" &&
      key !== "PAYPHONE_WEB_STORE_ID" &&
      key !== "PAYPHONE_TOKEN" &&
      key !== "PAYPHONE_STORE_ID"
    ) continue;

    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (value && !process.env[key]) {
      process.env[key] = value;
    }
  }

  if (!process.env.PAYPHONE_WEB_TOKEN && process.env.PAYPHONE_TOKEN) {
    process.env.PAYPHONE_WEB_TOKEN = process.env.PAYPHONE_TOKEN;
  }
  if (!process.env.PAYPHONE_WEB_STORE_ID && process.env.PAYPHONE_STORE_ID) {
    process.env.PAYPHONE_WEB_STORE_ID = process.env.PAYPHONE_STORE_ID;
  }
}

hydratePayphoneEnvFromAdminEnv();

const BACKEND_ORIGIN = normalizeUrl(process.env.BACKEND_URL || "http://localhost:4001");
const SITE_URL =
  normalizeUrl(process.env.APP_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.VITE_SITE_URL) ||
  "https://difiori.com";
const ASSET_BASE_URL =
  normalizeUrl(process.env.APP_PUBLIC_ASSET_URL || process.env.ASSET_BASE_URL || process.env.VITE_ASSET_BASE_URL) ||
  "";
const DEFAULT_HERO_IMAGE = "/assets/banner_collage.jpg";
const HOME_PRODUCT_LIMIT = 8;
const PAYPHONE_WEB_TOKEN = process.env.PAYPHONE_WEB_TOKEN || process.env.PAYPHONE_TOKEN;
const PAYPHONE_WEB_STORE_ID = process.env.PAYPHONE_WEB_STORE_ID || process.env.PAYPHONE_STORE_ID;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

function buildBackendUrl(originalUrl: string) {
  return `${BACKEND_ORIGIN}${originalUrl}`;
}

function buildSiteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatPayphonePhone(rawPhone: unknown) {
  const normalized = String(rawPhone || "").trim().replace(/\s+/g, "");
  if (!normalized) return undefined;
  if (normalized.startsWith("+")) return normalized;
  if (normalized.startsWith("0")) return `+593${normalized.slice(1)}`;
  if (/^\d+$/.test(normalized)) return `+593${normalized}`;
  return normalized;
}

function buildRequestOrigin(req: Request) {
  return `${req.protocol}://${req.get("host")}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function serializeForScript(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function injectHtml(
  template: string,
  {
    head,
    appHtml = "",
    stateScript = "",
  }: {
    head: string;
    appHtml?: string;
    stateScript?: string;
  },
) {
  return template
    .replace("<!--app-head-->", head)
    .replace("<!--app-html-->", appHtml)
    .replace("<!--app-state-->", stateScript);
}

function buildPublicConfigScript() {
  return `<script>window.__APP_CONFIG__ = ${serializeForScript({
    siteUrl: SITE_URL,
    ...(ASSET_BASE_URL ? { assetBaseUrl: ASSET_BASE_URL } : {}),
  })}</script>`;
}

function normalizePublicAssetUrl(url: string) {
  if (!url || url.startsWith("data:")) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const path = url.startsWith("/") ? url : `/${url}`;
  return ASSET_BASE_URL ? `${ASSET_BASE_URL}${path}` : path;
}

function getHomeHeroPreload(queryClient: QueryClient) {
  const cms = queryClient.getQueryData<{
    images?: Array<string | { url?: unknown }> | string | null;
  }>(cmsHomeHeroQueryKey);
  const images = Array.isArray(cms?.images) ? cms.images : [];
  const firstImage = images[0];
  const rawImage =
    typeof firstImage === "string"
      ? firstImage
      : firstImage && typeof firstImage === "object"
        ? String(firstImage.url || "")
        : DEFAULT_HERO_IMAGE;
  const href = normalizePublicAssetUrl(rawImage.trim() || DEFAULT_HERO_IMAGE);

  return href
    ? `<link rel="preload" as="image" href="${escapeXml(href)}" fetchpriority="high" imagesizes="100vw" />`
    : "";
}

function shouldSsrPath(path: string) {
  return (
    path === "/" ||
    path === "/shop" ||
    path.startsWith("/categoria/") ||
    path.startsWith("/producto/")
  );
}

async function prefetchSsrRouteData(queryClient: QueryClient, path: string, baseUrl: string) {
  if (path === "/") {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: productsQueryKey({ limit: HOME_PRODUCT_LIMIT }),
        queryFn: () => fetchProducts({ limit: HOME_PRODUCT_LIMIT }, baseUrl),
      }),
      queryClient.prefetchQuery({
        queryKey: categoriesQueryKey,
        queryFn: () => fetchCategories(baseUrl),
      }),
      queryClient.prefetchQuery({
        queryKey: companyQueryKey,
        queryFn: () => fetchCompany(baseUrl),
      }),
      queryClient.prefetchQuery({
        queryKey: cmsHomeHeroQueryKey,
        queryFn: () => fetchHomeHero(baseUrl),
      }),
    ]);

    return 200;
  }

  if (path === "/shop") {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: productsQueryKey(),
        queryFn: () => fetchProducts(undefined, baseUrl),
      }),
      queryClient.prefetchQuery({
        queryKey: categoriesQueryKey,
        queryFn: () => fetchCategories(baseUrl),
      }),
    ]);

    return 200;
  }

  if (path.startsWith("/categoria/")) {
    await queryClient.prefetchQuery({
      queryKey: categoriesQueryKey,
      queryFn: () => fetchCategories(baseUrl),
    });

    const categories = queryClient.getQueryData<string[]>(categoriesQueryKey) || [];
    const slug = decodeURIComponent(path.replace("/categoria/", ""));
    const categoryName = findCategoryNameBySlug(categories, slug);

    if (!categoryName) {
      return 404;
    }

    const categoryFilter = slug === BEST_SELLERS_CATEGORY_SLUG ? undefined : categoryName;
    await queryClient.prefetchQuery({
      queryKey: productsQueryKey(categoryFilter),
      queryFn: () => fetchProducts(categoryFilter, baseUrl),
    });

    return 200;
  }

  if (path.startsWith("/producto/")) {
    await queryClient.prefetchQuery({
      queryKey: productsQueryKey(),
      queryFn: () => fetchProducts(undefined, baseUrl),
    });

    const slug = decodeURIComponent(path.replace("/producto/", ""));
    const products = queryClient.getQueryData<Product[]>(productsQueryKey()) || [];
    const productId = getProductIdFromSlug(slug);
    const product = products.find((item) => {
      if (productId && String(item.id) === String(productId)) return true;
      return slugify(item.name) === slug;
    });

    return product ? 200 : 404;
  }

  return 200;
}

async function proxyToBackend(req: Request, res: Response) {
  const backendUrl = buildBackendUrl(req.originalUrl);
  const contentType = req.get("Content-Type");
  const accept = req.get("Accept");
  const ifNoneMatch = req.get("If-None-Match");
  const ifModifiedSince = req.get("If-Modified-Since");
  const range = req.get("Range");
  const cacheControl = req.get("Cache-Control");

  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(accept ? { Accept: accept } : {}),
        ...(ifNoneMatch ? { "If-None-Match": ifNoneMatch } : {}),
        ...(ifModifiedSince ? { "If-Modified-Since": ifModifiedSince } : {}),
        ...(range ? { Range: range } : {}),
        ...(cacheControl ? { "Cache-Control": cacheControl } : {}),
      },
      body: ["POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });

    response.headers.forEach((value, key) => {
      if (["content-length", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
        return;
      }

      res.setHeader(key, value);
    });

    if (req.originalUrl.startsWith("/uploads/") && !response.headers.has("cache-control")) {
      res.setHeader("Cache-Control", "public, max-age=31536000, stale-while-revalidate=86400");
    }

    if (
      req.method === "GET" &&
      req.originalUrl.startsWith("/api/external/") &&
      !response.headers.has("cache-control")
    ) {
      res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    }

    res.status(response.status);

    if (req.method === "HEAD" || !response.body) {
      return res.end();
    }

    await pipeline(Readable.fromWeb(response.body as any), res);
    return;
  } catch (error) {
    console.error(`Proxy Error (Store -> Backend) [${req.method} ${backendUrl}]:`, error);
    return res.status(500).json({ status: "error", message: "Error conectando con el servidor de productos" });
  }
}

async function postJsonToBackend(path: string, payload: unknown) {
  const response = await fetch(buildBackendUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();

  let data: unknown = null;
  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    data = rawBody;
  }

  return { response, data, rawBody };
}

app.post("/api/payphone-web/box-prepare", async (req: Request, res: Response) => {
  try {
    if (!PAYPHONE_WEB_TOKEN) {
      return res.status(503).json({
        status: "error",
        message: "PAYPHONE_WEB_TOKEN no está configurado en el servidor web.",
      });
    }

    const { response, data, rawBody } = await postJsonToBackend("/api/external/payphone/box-session", req.body);
    if (!response.ok || !data || typeof data !== "object" || !("status" in data) || data.status !== "success") {
      return res.status(response.ok ? 502 : response.status).json({
        status: "error",
        message: typeof data === "object" && data && "message" in data ? String(data.message) : "No se pudo crear la sesión de pago.",
        detail: rawBody,
      });
    }

    const sessionData = (data as unknown as {
      data: {
        orderId: string;
        orderNumber: string;
        clientTransactionId: string;
        amount: number;
        amountWithoutTax: number;
        amountWithTax: number;
        tax: number;
        currency: string;
        reference: string;
      };
    }).data as {
      orderId: string;
      orderNumber: string;
      clientTransactionId: string;
      amount: number;
      amountWithoutTax: number;
      amountWithTax: number;
      tax: number;
      currency: string;
      reference: string;
    };
    const phoneNumber = formatPayphonePhone(req.body?.phone);

    const paymentBoxData = {
      amount: sessionData.amount,
      amountWithoutTax: sessionData.amountWithoutTax,
      amountWithTax: sessionData.amountWithTax,
      tax: sessionData.tax,
      service: 0,
      tip: 0,
      currency: sessionData.currency,
      token: PAYPHONE_WEB_TOKEN,
      ...(PAYPHONE_WEB_STORE_ID ? { storeId: PAYPHONE_WEB_STORE_ID } : {}),
      reference: sessionData.reference,
      lang: "es",
      defaultMethod: "card",
      timeZone: -5,
      lat: "-1.831239",
      lng: "-78.183406",
      optionalParameter: sessionData.orderId,
      ...(phoneNumber ? { phoneNumber } : {}),
      clientTransactionId: sessionData.clientTransactionId,
    };

    console.log("[PAYPHONE_WEB][BOX_PREPARE]", JSON.stringify({
      orderId: sessionData.orderId,
      orderNumber: sessionData.orderNumber,
      reference: sessionData.reference,
      clientTransactionId: sessionData.clientTransactionId,
      paymentBoxData: {
        ...paymentBoxData,
        token: `${PAYPHONE_WEB_TOKEN.slice(0, 8)}...`,
      },
    }, null, 2));

    return res.status(200).json({
      status: "success",
      data: {
        orderId: sessionData.orderId,
        orderNumber: sessionData.orderNumber,
        reference: sessionData.reference,
        clientTransactionId: sessionData.clientTransactionId,
        paymentBoxData,
      },
    });
  } catch (error) {
    console.error("[PAYPHONE_WEB][BOX_PREPARE][ERROR]", error);
    return res.status(500).json({
      status: "error",
      message: "No se pudo preparar el Payment Box desde el servidor web.",
    });
  }
});

app.post("/api/payphone-web/finalize", async (req: Request, res: Response) => {
  try {
    const { response, data, rawBody } = await postJsonToBackend("/api/external/payphone/finalize", req.body);

    console.log("[PAYPHONE_WEB][FINALIZE_PROXY]", JSON.stringify({
      status: response.status,
      body: rawBody,
    }, null, 2));

    if (!response.ok) {
      return res.status(response.status).json(
        typeof data === "object" && data ? data : {
          status: "error",
          message: "No se pudo persistir el resultado del pago en el backend.",
          detail: rawBody,
        },
      );
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("[PAYPHONE_WEB][FINALIZE][ERROR]", error);
    return res.status(500).json({
      status: "error",
      message: "No se pudo finalizar el pago desde el servidor web.",
    });
  }
});

function sendGone(res: Response, path: string) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.status(410).type("text/html").send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Contenido retirado | DIFIORI</title>
  </head>
  <body>
    <main style="font-family: sans-serif; max-width: 40rem; margin: 4rem auto; line-height: 1.6; padding: 0 1.5rem;">
      <h1>Contenido retirado</h1>
      <p>La ruta <strong>${escapeXml(path)}</strong> fue eliminada y ya no está disponible.</p>
    </main>
  </body>
</html>`);
}

type PublicProduct = {
  id: string;
  name: string;
  category: string;
  isBestSeller: boolean;
  description: string;
  price: string;
};

async function fetchPublicProducts(): Promise<PublicProduct[]> {
  try {
    const response = await fetch(buildBackendUrl("/api/external/products"));

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const payload = await response.json();
    if (payload.status !== "success" || !Array.isArray(payload.data)) {
      throw new Error("Invalid payload");
    }

    return payload.data
      .map((product: { id?: string | number; name?: string; description?: string; price?: string | number; category?: string; isBestSeller?: boolean }) => ({
        id: String(product.id || "").trim(),
        name: String(product.name || "").trim(),
        description: String(product.description || "").trim(),
        price: String(product.price || "").trim(),
        category: String(product.category || "General").trim(),
        isBestSeller: Boolean(product.isBestSeller),
      }))
      .filter((product: PublicProduct) => product.id && isPublicCatalogProduct(product));
  } catch (error) {
    console.warn("Could not fetch live products for sitemap.", error);
    return [];
  }
}

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }

  if (req.path === "/v2" || req.path === "/v2/") {
    return res.redirect(301, "/");
  }

  if (req.path.startsWith("/v2/product/")) {
    const productId = req.path.split("/").filter(Boolean).pop();
    return res.redirect(301, productId ? `/product/${encodeURIComponent(productId)}` : "/shop");
  }

  if (req.path.startsWith("/v2") || req.path === "/admin" || req.path.startsWith("/admin/")) {
    return sendGone(res, req.path);
  }

  return next();
});

app.get("/product/:id", async (req, res, next) => {
  try {
    const products = await fetchPublicProducts();
    const product = products.find((item) => item.id === req.params.id);

    if (product) {
      return res.redirect(301, getProductPath(product));
    }
  } catch (error) {
    console.warn("Could not redirect legacy product URL.", error);
  }

  return next();
});

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /checkout",
    "Disallow: /payment-result",
    "Disallow: /admin",
    "Disallow: /v2",
    `Sitemap: ${buildSiteUrl("/sitemap.xml")}`,
  ].join("\n"));
});

app.get("/sitemap.xml", async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const products = await fetchPublicProducts();
  const categoryUrls = Array.from(new Set([
    getCategoryPath(BEST_SELLERS_CATEGORY_NAME),
    ...products.map((product) => getCategoryPath(product.category)),
  ]));
  const urls = Array.from(new Set([
    "/",
    "/shop",
    ...categoryUrls,
    ...products.map((product) => getProductPath(product)),
  ]));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => `  <url>
    <loc>${escapeXml(buildSiteUrl(path))}</loc>
    <lastmod>${today}</lastmod>
  </url>`)
  .join("\n")}
</urlset>`;

  res.type("application/xml");
  res.send(xml);
});

app.use("/api/external", proxyToBackend);
app.use("/api/checkout", proxyToBackend);
app.use("/uploads", proxyToBackend);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  let vite: ViteDevServer | undefined;
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    vite = await setupVite(httpServer, app);
  }

  app.get("/{*path}", async (req, res, next) => {
    try {
      const template =
        process.env.NODE_ENV === "production"
          ? await getProdTemplate()
          : await (await import("./vite")).getDevTemplate(vite!, req.originalUrl);

      if (!shouldSsrPath(req.path)) {
        const page = injectHtml(template, {
          head: renderSeoTags(DEFAULT_SEO_STATE),
          stateScript: buildPublicConfigScript(),
        });
        return res.status(200).type("text/html").send(page);
      }

      const queryClient = createAppQueryClient();
      const requestOrigin = buildRequestOrigin(req);
      const statusCode = await prefetchSsrRouteData(queryClient, req.path, requestOrigin);
      const { appHtml, dehydratedState, seo } = renderApp({
        path: req.originalUrl,
        queryClient,
      });

      const page = injectHtml(template, {
        head: `${renderSeoTags(seo)}${req.path === "/" ? getHomeHeroPreload(queryClient) : ""}`,
        appHtml,
        stateScript: `${buildPublicConfigScript()}<script>window.__REACT_QUERY_STATE__ = ${serializeForScript(dehydratedState)}</script>`,
      });

      return res.status(statusCode).type("text/html").send(page);
    } catch (error) {
      if (vite) {
        vite.ssrFixStacktrace(error as Error);
      }

      return next(error);
    }
  });

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "3000", 10);
  // En desarrollo escuchamos en 0.0.0.0 para evitar problemas de binding local,
  // pero puedes abrir la app desde http://localhost:5000 sin problema.
  const host = "0.0.0.0";
  httpServer.listen(
    {
      port,
      host,
    },
    () => {
      log(`serving on port ${port}`);
      log(`web config: BACKEND_URL=${BACKEND_ORIGIN} SITE_URL=${SITE_URL}${ASSET_BASE_URL ? ` ASSET_BASE_URL=${ASSET_BASE_URL}` : ""}`);
    },
  );
})();
