import { useState, useEffect } from "react";
import {
  customersApi,
  segmentsApi,
  couponsApi,
  templatesApi,
  campaignsApi,
  automationsApi,
} from "../services/loyalty-api.service";

export const useLoyaltyStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customers, coupons, campaigns, automations] = await Promise.all([
          customersApi.getStats(),
          couponsApi.getStats(),
          campaignsApi.getStats(),
          automationsApi.getStats(),
        ]);

        setStats({
          customers: customers.data,
          coupons: coupons.data,
          campaigns: campaigns.data,
          automations: automations.data,
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export const useCustomers = (params?: any) => {
  const [customers, setCustomers] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getAll(params);
      setCustomers(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [JSON.stringify(params)]);

  return { customers, loading, error, refetch: fetchCustomers };
};

export const useSegments = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await segmentsApi.getAll();
      setSegments(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  return { segments, loading, error, refetch: fetchSegments };
};

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponsApi.getAll();
      setCoupons(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return { coupons, loading, error, refetch: fetchCoupons };
};

export const useTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templatesApi.getAll();
      setTemplates(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return { templates, loading, error, refetch: fetchTemplates };
};

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignsApi.getAll();
      setCampaigns(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return { campaigns, loading, error, refetch: fetchCampaigns };
};

export const useAutomations = () => {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response = await automationsApi.getAll();
      setAutomations(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  return { automations, loading, error, refetch: fetchAutomations };
};
