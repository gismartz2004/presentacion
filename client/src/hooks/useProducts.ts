import { useQuery } from "@tanstack/react-query";
import { Product, INITIAL_PRODUCTS } from "../data/mock";
import { resolveApiUrl } from "@/lib/api";
import { getPublicAppConfig } from "@/lib/runtime-config";

const API_URL = "/api/external/products";
export const productsQueryKey = (category?: string) => ["products", category || "all"] as const;

function getImageUrl(imagePath: string | null | undefined): string {
  // Placeholder neutral en caso de que no haya imagen
  const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3ESin imagen disponible%3C/text%3E%3C/svg%3E";

  if (!imagePath || imagePath.trim() === "" || imagePath === "/assets/product1.png") {
    return PLACEHOLDER;
  }
  
  if (imagePath.startsWith("data:image/")) return imagePath;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  const { assetBaseUrl } = getPublicAppConfig();
  if (assetBaseUrl) return `${assetBaseUrl}${path}`;
  if (typeof window !== "undefined") return `${window.location.origin}${path}`;
  return path;
}

export async function fetchProducts(category?: string, baseUrl?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);

    const query = params.toString();
    const endpoint = query ? `${API_URL}?${query}` : API_URL;
    const res = await fetch(resolveApiUrl(endpoint, baseUrl));
    if (!res.ok) throw new Error("Error al cargar productos");

    const json = await res.json();
    if (json.status !== "success") throw new Error("Respuesta inválida del servidor");

    // Mapear formato del backend al formato Product de la tienda
    const products = json.data.map((p: any): Product => ({
      id: String(p.id),
      name: p.name,
      description: p.description || "",
      category: p.category || "General",
      price: p.price || "$0.00",
      image: getImageUrl(p.image),
      isBestSeller: p.isBestSeller || false,
      stock: p.stock ?? 99,
      deliveryTime: p.deliveryTime || "",
      size: p.size || "",
      includes: p.includes || p.description || "",
    }));

    // Si no hay productos de la API, usar datos mock
    return products.length > 0 ? products : INITIAL_PRODUCTS;
  } catch (error) {
    console.warn("Error fetching products from API, using mock data:", error);
    // Fallback a datos mock si hay error en la API
    return INITIAL_PRODUCTS;
  }
}

/**
 * Hook para obtener productos desde la API de producción.
 */
export function useProducts(category?: string) {
  return useQuery<Product[], Error>({
    queryKey: productsQueryKey(category),
    queryFn: () => fetchProducts(category),
    staleTime: 1000 * 60 * 2, // 2 minutos de caché
    retry: 1,
  });
}

/**
 * Hook para obtener solo los productos destacados (featured).
 */
export function useFeaturedProducts() {
  return useQuery<Product[], Error>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      try {
        const res = await fetch(resolveApiUrl(`${API_URL}?featured=true`));
        if (!res.ok) throw new Error("Error al cargar productos destacados");
        const json = await res.json();

        const products = json.data.map((p: any): Product => ({
          id: String(p.id),
          name: p.name,
          description: p.description || "",
          category: p.category || "General",
          price: p.price || "$0.00",
          image: getImageUrl(p.image),
          isBestSeller: p.isBestSeller || true,
          stock: p.stock ?? 99,
          deliveryTime: p.deliveryTime || "2-3 horas",
          size: p.size || "-",
          includes: p.includes || p.description || "",
        }));

        // Si no hay productos destacados de la API, usar productos mock destacados
        return products.length > 0 ? products : INITIAL_PRODUCTS.filter(p => p.isBestSeller);
      } catch (error) {
        console.warn("Error fetching featured products from API, using mock data:", error);
        // Fallback a productos mock destacados
        return INITIAL_PRODUCTS.filter(p => p.isBestSeller);
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
