import axios from "axios";

const ecommerceApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ContactHeroData {
  id?: number;
  lang: string;
  title: string;
  description?: string;
}

export interface ContactInfoCard {
  title: string;
  address?: string;
  numbers?: string;
  weekdays?: string;
  weekends?: string;
  emails?: string;
  note?: string;
}

export interface ContactInfoData {
  id?: number;
  lang: string;
  location?: ContactInfoCard;
  phone?: ContactInfoCard;
  hours?: ContactInfoCard;
  email?: ContactInfoCard;
}

export interface ContactMapData {
  id?: number;
  lang: string;
  title: string;
  description?: string;
  mapUrl?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactFaqData {
  id?: number;
  lang: string;
  title: string;
  description?: string;
  items?: FaqItem[];
}

export const cmsContactService = {
  // Contact Hero
  getContactHero: (lang: string = 'en') => 
    ecommerceApi.get(`/cms/contact-hero/${lang}`),
  
  updateContactHero: (lang: string, data: Partial<ContactHeroData>) => 
    ecommerceApi.put(`/cms/contact-hero/${lang}`, data),

  // Contact Info
  getContactInfo: (lang: string = 'en') => 
    ecommerceApi.get(`/cms/contact-info/${lang}`),
  
  updateContactInfo: (lang: string, data: Partial<ContactInfoData>) => 
    ecommerceApi.put(`/cms/contact-info/${lang}`, data),

  // Contact Map
  getContactMap: (lang: string = 'en') => 
    ecommerceApi.get(`/cms/contact-map/${lang}`),
  
  updateContactMap: (lang: string, data: Partial<ContactMapData>) => 
    ecommerceApi.put(`/cms/contact-map/${lang}`, data),

  // Contact FAQ
  getContactFaq: (lang: string = 'en') => 
    ecommerceApi.get(`/cms/contact-faq/${lang}`),
  
  updateContactFaq: (lang: string, data: Partial<ContactFaqData>) => 
    ecommerceApi.put(`/cms/contact-faq/${lang}`, data),
};
