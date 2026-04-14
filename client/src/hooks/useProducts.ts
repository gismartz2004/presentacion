import { useQuery } from "@tanstack/react-query";
import { Product } from "../data/mock";

const API_URL = "/api/external/products";
const IMG_BASE_URL = "http://localhost:4001"; // En producción esto debería ser una variable de entorno

function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/assets/product1.png";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${IMG_BASE_URL}${path}`;
}

async function fetchProducts(category?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);

  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar productos");

  const json = await res.json();
  if (json.status !== "success") throw new Error("Respuesta inválida del servidor");

  // Mapear formato del backend al formato Product de la tienda
  return json.data.map((p: any): Product => ({
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
}

/**
 * Hook para obtener productos desde la API de producción.
 */
export function useProducts(category?: string) {
  return useQuery<Product[], Error>({
    queryKey: ["products", category],
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
      const res = await fetch(`${API_URL}?featured=true`);
      if (!res.ok) throw new Error("Error al cargar productos destacados");
      const json = await res.json();
      return json.data.map((p: any): Product => ({
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
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
