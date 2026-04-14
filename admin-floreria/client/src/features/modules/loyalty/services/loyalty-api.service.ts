import axios from 'axios';

const LOYALTY_API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const loyaltyApi = axios.create({
  baseURL: LOYALTY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customers
export const customersApi = {
  getAll: (params?: any) => loyaltyApi.get('/loyalty/customers', { params }),
  getOne: (id: string) => loyaltyApi.get(`/loyalty/customers/${id}`),
  getStats: () => loyaltyApi.get('/loyalty/customers/stats'),
  create: (data: any) => loyaltyApi.post('/loyalty/customers', data),
  update: (id: string, data: any) => loyaltyApi.patch(`/loyalty/customers/${id}`, data),
  delete: (id: string) => loyaltyApi.delete(`/loyalty/customers/${id}`),
};

// Segments
export const segmentsApi = {
  getAll: () => loyaltyApi.get('/loyalty/segments'),
  getOne: (id: string) => loyaltyApi.get(`/loyalty/segments/${id}`),
  evaluate: (id: string) => loyaltyApi.post(`/loyalty/segments/${id}/evaluate`),
  preview: (rules: any) => loyaltyApi.post('/loyalty/segments/preview', { rules }),
  create: (data: any) => loyaltyApi.post('/loyalty/segments', data),
  update: (id: string, data: any) => loyaltyApi.patch(`/loyalty/segments/${id}`, data),
  delete: (id: string) => loyaltyApi.delete(`/loyalty/segments/${id}`),
};

// Coupons
export const couponsApi = {
  getAll: () => loyaltyApi.get('/api/coupons'),
  getOne: (id: string) => loyaltyApi.get(`/api/coupons/${id}`),
  generateCode: (prefix?: string) => loyaltyApi.get('/api/coupons/generate-code', { params: { prefix } }),
  create: (data: any) => loyaltyApi.post('/api/coupons', data),
  update: (id: string, data: any) => loyaltyApi.put(`/api/coupons/${id}`, data),
  delete: (id: string) => loyaltyApi.delete(`/api/coupons/${id}`),
};

// Templates
export const templatesApi = {
  getAll: () => loyaltyApi.get('/loyalty/templates'),
  getOne: (id: string) => loyaltyApi.get(`/loyalty/templates/${id}`),
  getByType: (type: string) => loyaltyApi.get(`/loyalty/templates/by-type/${type}`),
  seed: () => loyaltyApi.post('/loyalty/templates/seed'),
  create: (data: any) => loyaltyApi.post('/loyalty/templates', data),
  update: (id: string, data: any) => loyaltyApi.patch(`/loyalty/templates/${id}`, data),
  delete: (id: string) => loyaltyApi.delete(`/loyalty/templates/${id}`),
};

// Campaigns
export const campaignsApi = {
  getAll: () => loyaltyApi.get('/loyalty/campaigns'),
  getById: (id: string) => loyaltyApi.get(`/loyalty/campaigns/${id}`),
  getOne: (id: string) => loyaltyApi.get(`/loyalty/campaigns/${id}`),
  getStats: () => loyaltyApi.get('/loyalty/campaigns/stats'),
  send: (id: string) => loyaltyApi.post(`/loyalty/campaigns/${id}/send`),
  create: (data: any) => loyaltyApi.post('/loyalty/campaigns', data),
  update: (id: string, data: any) => loyaltyApi.patch(`/loyalty/campaigns/${id}`, data),
  delete: (id: string) => loyaltyApi.delete(`/loyalty/campaigns/${id}`),
};

// Automations
export const automationsApi = {
  getAll: () => loyaltyApi.get('/loyalty/automations'),
  getOne: (id: string) => loyaltyApi.get(`/loyalty/automations/${id}`),
  getStats: () => loyaltyApi.get('/loyalty/automations/stats'),
  create: (data: any) => loyaltyApi.post('/loyalty/automations', data),
  update: (id: string, data: any) => loyaltyApi.patch(`/loyalty/automations/${id}`, data),
  delete: (id: string) => loyaltyApi.delete(`/loyalty/automations/${id}`),
};

// Helper functions for easy access (used in detail pages)
export const loyaltyApiHelpers = {
  // Segments
  getSegment: async (id: string) => {
    const response = await segmentsApi.getOne(id);
    return response.data;
  },
  updateSegment: async (id: string, data: any) => {
    const response = await segmentsApi.update(id, data);
    return response.data;
  },
  deleteSegment: async (id: string) => {
    const response = await segmentsApi.delete(id);
    return response.data;
  },
  evaluateSegment: async (id: string) => {
    const response = await segmentsApi.evaluate(id);
    return response.data;
  },

  // Coupons
  getCoupon: async (id: string) => {
    const response = await couponsApi.getOne(id);
    return response.data;
  },
  updateCoupon: async (id: string, data: any) => {
    const response = await couponsApi.update(id, data);
    return response.data;
  },
  deleteCoupon: async (id: string) => {
    const response = await couponsApi.delete(id);
    return response.data;
  },

  // Campaigns
  getCampaign: async (id: string) => {
    const response = await campaignsApi.getOne(id);
    return response.data;
  },
  updateCampaign: async (id: string, data: any) => {
    const response = await campaignsApi.update(id, data);
    return response.data;
  },
  deleteCampaign: async (id: string) => {
    const response = await campaignsApi.delete(id);
    return response.data;
  },

  // Templates
  getTemplate: async (id: string) => {
    const response = await templatesApi.getOne(id);
    return response.data;
  },
  updateTemplate: async (id: string, data: any) => {
    const response = await templatesApi.update(id, data);
    return response.data;
  },
  deleteTemplate: async (id: string) => {
    const response = await templatesApi.delete(id);
    return response.data;
  },

  // Automations
  getAutomation: async (id: string) => {
    const response = await automationsApi.getOne(id);
    return response.data;
  },
  updateAutomation: async (id: string, data: any) => {
    const response = await automationsApi.update(id, data);
    return response.data;
  },
  deleteAutomation: async (id: string) => {
    const response = await automationsApi.delete(id);
    return response.data;
  },
};

export default loyaltyApi;
