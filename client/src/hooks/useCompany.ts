import { useQuery } from "@tanstack/react-query";

interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  settings?: any;
}

const API_URL = "/api/external/company";

export function useCompany() {
  return useQuery<CompanyInfo, Error>({
    queryKey: ["company-info"],
    queryFn: async () => {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar información de la empresa");
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos de caché para info corporativa
  });
}
