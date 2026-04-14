import { useUserStore, type User } from "@/store/use-user-store";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import metadataService from "../api/metadata-service";
import Loading from "@/shared/components/loading";
import featuresService from "../api/features-service";

type Status = "loading" | "ready" | "unauth" | "forbidden";

// Normaliza roles considerando el campo simple `role` hoy,
// y `roles` (array) en el futuro.
function normalizeRoles(user: User | null): string[] {
  if (!user) return [];
  // futuro: roles: string[]
  if (Array.isArray((user as unknown as { roles?: string[] }).roles))
    return (user as unknown as { roles?: string[] }).roles ?? [];
  // actual: role: string
  if (typeof (user as unknown as { role?: string }).role === "string")
    return [(user as unknown as { role?: string }).role as string];
  return [];
}

function hasAllRoles(user: User | null, requiredRoles?: string[]) {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const roles = normalizeRoles(user);
  return requiredRoles.every((r) => roles.includes(r));
}

export default function ProtectRoutes({
  children,
  requiredRoles,
  redirectTo = "/auth",
}: {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}) {
  const {
    setUser,
    clearUser,
    user,
    lastFetchedAt,
    markFetchedNow,
    isHydrated,
    setFeatures,
  } = useUserStore();
  const [status, setStatus] = useState<Status>("loading");
  const location = useLocation();
  const mounted = useRef(true);
  // TTL para evitar refetch constante (ej: 60s)
  const TTL_MS = 60 * 1000;

  const rolesOk = useMemo(
    () => hasAllRoles(user, requiredRoles),
    [user, requiredRoles]
  );

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();

    const run = async () => {
      try {
        // Esperar a que el store esté rehidratado (persist)
        if (!isHydrated) return;

        // Si ya hay usuario y dentro de TTL, no refetch
        if (user && Date.now() - lastFetchedAt < TTL_MS) {
          console.log("ANTES DE CONSULTAR FEATURES");
          const features = await featuresService();
          setFeatures(features ?? []);
          setStatus(rolesOk ? "ready" : "forbidden");
          return;
        }

        // Intentar obtener el usuario desde el backend (cookie httpOnly o sesión)
        const resp = await metadataService({
          signal: controller.signal,
        });
        if (!mounted.current) return;
        if (resp?.status === "success" && resp?.data?.admin) {
          setUser(resp.data.admin);
          console.log("ANTES DE CONSULTAR FEATURES DESPUES DE CONSULTAR METADATA.");
          const FeaturesResponse = await featuresService();
          console.log("RESPUESTA DE FEATURES DESPUES DE METADATA: ", FeaturesResponse);
          setFeatures(FeaturesResponse);
          markFetchedNow();
          setStatus(
            hasAllRoles(resp.data.admin, requiredRoles) ? "ready" : "forbidden"
          );
        } else {
          clearUser();
          setStatus("unauth");
        }
      } catch (err: unknown) {
        const isAbortOrCancelError = (x: unknown): boolean => {
          if (!x || typeof x !== "object") return false;
          const name = (x as { name?: string }).name;
          const code = (x as { code?: string }).code;
          const cancelFlag = (x as { __CANCEL__?: boolean }).__CANCEL__;
          const message = (x as { message?: string }).message;
          if (name === "AbortError") return true;
          if (code === "ERR_CANCELED" || cancelFlag === true) return true;
          if (typeof message === "string") {
            const m = message.toLowerCase();
            if (
              m.includes("canceled") ||
              m.includes("cancelled") ||
              m.includes("aborted")
            )
              return true;
          }
          return false;
        };
        if (!mounted.current || isAbortOrCancelError(err)) return;
        // Si la API devuelve 401/403, tratar como no autenticado
        clearUser();
        setStatus("unauth");
      }
    };

    run();

    return () => {
      mounted.current = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser, clearUser, isHydrated, lastFetchedAt]); // evita re-fetch por cambio de roles y reduce aborts

  if (status === "loading")
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loading />
      </div>
    );

  if (status === "unauth") {
    // Redirige a login y guarda a dónde volver
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (status === "forbidden") {
    // Si autenticado pero sin permisos
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
