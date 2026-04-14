import axios from "axios";

const ecommerceApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AboutHeroData {
  id?: number;
  lang: string;
  title: string;
  description?: string;
}

export interface AboutStoryData {
  id?: number;
  lang: string;
  title: string;
  content: string;
  image?: string;
}

export const cmsAboutService = {
  // About Hero
  getAboutHero: (lang: string = 'en') => 
    ecommerceApi.get(`/cms/about-hero/${lang}`),
  
  updateAboutHero: (lang: string, data: Partial<AboutHeroData>) => 
    ecommerceApi.put(`/cms/about-hero/${lang}`, data),

  // About Story
  getAboutStory: (lang: string = 'en') => 
    ecommerceApi.get(`/cms/about-story/${lang}`),
  
  updateAboutStory: (lang: string, data: Partial<AboutStoryData>) => 
    ecommerceApi.put(`/cms/about-story/${lang}`, data),
};
