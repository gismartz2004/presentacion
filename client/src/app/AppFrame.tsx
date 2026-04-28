import { Suspense, useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

const FACEBOOK_PIXEL_ID = "1783051885578047";

type FacebookPixel = ((action: string, eventName: string) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => number;
};

declare global {
  interface Window {
    fbq?: FacebookPixel;
    _fbq?: typeof window.fbq;
  }
}

function initFacebookPixel() {
  if (typeof window === "undefined" || typeof document === "undefined" || typeof window.fbq === "function") {
    return;
  }

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }

    fbq.queue.push(args);
  } as FacebookPixel;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = (...args: unknown[]) => fbq.queue.push(args);

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", FACEBOOK_PIXEL_ID);
  fbq("track", "PageView");
}

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

interface AppFrameProps {
  Routes: ComponentType;
  fallback?: ReactNode;
}

export function AppFrame({ Routes, fallback = <RouteFallback /> }: AppFrameProps) {
  const [location] = useLocation();
  const hasTrackedInitialPageView = useRef(false);
  const hasInitializedPixel = useRef(false);
  const hideNavbar = location === "/checkout" || location === "/payment-gateway" || location === "/payment-result";

  useEffect(() => {
    if (hasInitializedPixel.current || typeof window === "undefined") return;
    hasInitializedPixel.current = true;

    const bootPixel = () => initFacebookPixel();

    if (document.readyState === "complete") {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => bootPixel());
      } else {
        window.setTimeout(bootPixel, 1200);
      }
      return;
    }

    const onLoad = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => bootPixel());
      } else {
        window.setTimeout(bootPixel, 1200);
      }
    };

    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      return;
    }

    if (typeof window.fbq !== "function") return;

    window.fbq("track", "PageView");
  }, [location]);

  return (
    <div className="relative min-h-screen text-foreground selection:bg-[#5A3F73] selection:text-white">
      <div className="relative z-10">
        {!hideNavbar && <Navbar />}
        <Suspense fallback={fallback}>
          <Routes />
        </Suspense>
      </div>
      <Toaster />
    </div>
  );
}
