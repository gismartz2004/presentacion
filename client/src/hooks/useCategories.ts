import { useQuery } from "@tanstack/react-query";

const API_URL = "/api/external/products/categories";

export function useCategories() {
  return useQuery<string[], Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar categorías");
      
      const json = await res.json();
      if (json.status !== "success") throw new Error("Respuesta inválida del servidor");
      
      return json.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos (las categorías no cambian muy seguido)
  });
}
