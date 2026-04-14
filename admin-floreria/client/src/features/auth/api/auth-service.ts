// /* eslint-disable @typescript-eslint/no-explicit-any */
import service from "@/core/api/service";
import type { AuthType } from "../types/types";
import type { AxiosError } from "axios";

const authentication = async ({ email, password }: AuthType) => {
  try {
    const response = await service.post("/admin/login", { email, password });
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.data) {
      throw axiosError.response.data;
    }
    throw { message: axiosError.message || "Error desconocido" };
  }
};

const AuthService = {
  authentication,
};

export default AuthService;
