import axios from "axios";

const ecommerceApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HomeHeroData {
  id?: number;
  lang: string;
  title: string;
  description?: string;
  nameLink?: string;
  images?: any; // Array de objetos {url: string, alt: string}
  link_women?: string;
  link_men?: string;
  backgroundType?: "video" | "carousel";
  videoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image: string | null;
  isLimited?: boolean;
  featured?: boolean;
  stock: number;
  category: string;
}

export const cmsHomeService = {
  // HomeHero
  getHomeHero: (lang: string = 'es') => 
    ecommerceApi.get(`/cms/home-hero?lang=${lang}`),
  
  getAllHomeHero: () => 
    ecommerceApi.get('/cms/home-hero/all'),
  
  updateHomeHero: (lang: string, data: Partial<HomeHeroData>) => 
    ecommerceApi.put(`/cms/home-hero/${lang}`, data),
  
  deleteHomeHero: (lang: string) => 
    ecommerceApi.delete(`/cms/home-hero/${lang}`),

  // Productos Limitados
  getLimitedProducts: async (): Promise<Product[]> => {
    const response = await ecommerceApi.get('/cms/limited-products');
    return response.data.data;
  },

  toggleLimitedProduct: async (productId: string, isLimited: boolean): Promise<Product> => {
    const response = await ecommerceApi.put(`/cms/limited-products/${productId}`, { isLimited });
    return response.data.data;
  },

  // Productos Destacados
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await ecommerceApi.get('/cms/featured-products');
    return response.data.data;
  },

  toggleFeaturedProduct: async (productId: string, featured: boolean): Promise<Product> => {
    const response = await ecommerceApi.put(`/cms/featured-products/${productId}`, { featured });
    return response.data.data;
  },

  // Home Craftsmanship
  getHomeCraftsmanship: (lang: string = 'es') => 
    ecommerceApi.get(`/cms/home-craftsmanship?lang=${lang}`),
  
  updateHomeCraftsmanship: (lang: string, data: any) => 
    ecommerceApi.put(`/cms/home-craftsmanship/${lang}`, data),

  // Home Timeline
  getHomeTimeline: (lang: string = 'es') => 
    ecommerceApi.get(`/cms/home-timeline/${lang}`),
  
  updateHomeTimeline: (lang: string, data: any) => 
    ecommerceApi.put(`/cms/home-timeline/${lang}`, data),
};
