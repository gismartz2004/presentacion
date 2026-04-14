import { useQuery } from "@tanstack/react-query";

const API_URL = "/api/external/cms/home-hero";

export interface HomeHero {
  id: number;
  title: string;
  description: string;
  images: string[] | any; // Puede venir como Array o JSON string depende de como se guardó
  videoUrl?: string;
  backgroundType: "image" | "video";
}

export function useCMS() {
  return useQuery<HomeHero, Error>({
    queryKey: ["cms", "home-hero"],
    queryFn: async () => {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar contenido CMS");
      
      const json = await res.json();
      if (json.status !== "success") throw new Error("Respuesta inválida del servidor");
      
      const data = json.data;
      
      if (!data) return null;

      // Asegurar que images sea un array
      if (typeof data.images === 'string') {
        try {
          data.images = JSON.parse(data.images);
        } catch {
          data.images = [];
        }
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
