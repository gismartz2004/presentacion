import { useState } from "react";
import { toast } from "sonner";
import AuthService from "../api/auth-service";

export default function useAuthentication() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await AuthService.authentication({ email, password });
      if (response.status === "success") {
        toast.success("Login exitoso");
        // redirect to dashboard
        window.location.href = "/app/dashboard";
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
        toast.error("Error de conexión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    setEmail,
    setPassword,
    handleSubmit,
  };
}
