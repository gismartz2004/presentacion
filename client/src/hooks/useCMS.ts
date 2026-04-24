import { useQuery } from "@tanstack/react-query";
import { resolveApiUrl } from "@/lib/api";

const API_URL = "/api/external/cms/home-hero";
export const cmsHomeHeroQueryKey = ["cms", "home-hero"] as const;

export interface HomeHero {
  id: number;
  title: string;
  description: string;
  images: Array<string | { url?: string; alt?: string }> | any;
  videoUrl?: string;
  backgroundType: "image" | "video" | "carousel";
}

export async function fetchHomeHero(baseUrl?: string): Promise<HomeHero | null> {
  try {
    const res = await fetch(resolveApiUrl(API_URL, baseUrl));
    if (!res.ok) throw new Error("Error al cargar contenido CMS");

    const json = await res.json();
    if (json.status !== "success") throw new Error("Respuesta inválida del servidor");

    const data = json.data;
    if (!data) return null;

    if (typeof data.images === "string") {
      try {
        data.images = JSON.parse(data.images);
      } catch {
        data.images = [];
      }
    }

    return data;
  } catch (error) {
    console.warn("Error fetching CMS home hero from API, using fallback data:", error);
    return null;
  }
}

export function useCMS() {
  return useQuery<HomeHero | null, Error>({
    queryKey: cmsHomeHeroQueryKey,
    queryFn: () => fetchHomeHero(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
