import axios from "axios";
import { useUserStore } from "@/store/use-user-store";

/**
 * Servicio para el backend de ecommerce (NestJS)
 * Apunta a VITE_BACKEND_URL
 */
const ecommerceService = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Interceptor de respuesta: si 401/419 limpia sesión y redirige a login
ecommerceService.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 419 || status === 403) {
      try {
        const { clearUser } = useUserStore.getState();
        clearUser();
      } catch {
        // ignore store access errors in non-react contexts
      }
    }
    return Promise.reject(error);
  }
);

export default ecommerceService;
