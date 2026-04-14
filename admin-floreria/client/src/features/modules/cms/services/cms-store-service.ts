import axios from "axios";

const ecommerceApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StoreHeroData {
  id?: number;
  lang: string;
  title: string;
  description?: string;
}

export const cmsStoreService = {
  // Store Hero
  getStoreHero: (lang: string = 'en') => 
    ecommerceApi.get(`/cms/store-hero/${lang}`),
  
  updateStoreHero: (lang: string, data: Partial<StoreHeroData>) => 
    ecommerceApi.put(`/cms/store-hero/${lang}`, data),
};
