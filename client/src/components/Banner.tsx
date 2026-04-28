import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCMS } from "@/hooks/useCMS";
import { DEFAULT_COMPANY } from "@/lib/site";
import { getPublicAppConfig } from "@/lib/runtime-config";

const DEFAULT_SLIDES = [
  {
    image: "/assets/banner_collage.jpg",
    title: "Sorprende hoy. Nosotros lo entregamos por ti.",
    subtitle: "Historias reales de alegria en Guayaquil",
    cta: "Ver testimonios",
    href: "/#testimonios",
  },
  {
    image: "/assets/banner_collage.jpg",
    title: "Entregas reales personas reales.",
    subtitle: "Entrega en Guayaquil en horas",
    cta: "Comprar ahora",
    href: "/shop",
  },
];

function normalizeHeroImageUrl(image: unknown) {
  const rawUrl =
    typeof image === "string"
      ? image
      : image && typeof image === "object" && "url" in image
        ? String((image as { url?: unknown }).url || "")
        : "";
  const url = rawUrl.trim();

  if (!url) return "";
  if (url.startsWith("data:image/")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const path = url.startsWith("/") ? url : `/${url}`;
  const { assetBaseUrl } = getPublicAppConfig();
  return assetBaseUrl ? `${assetBaseUrl}${path}` : path;
}

export function Banner() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: cms } = useCMS();

  const slides = useMemo(() => {
    if (!cms) return DEFAULT_SLIDES;

    const imageUrls = Array.isArray(cms.images)
      ? cms.images.map(normalizeHeroImageUrl).filter(Boolean)
      : [];

    if (imageUrls.length === 0) return DEFAULT_SLIDES;

    return imageUrls.map((img: string) => ({
      image: img,
      title: cms.title || "DIFIORI",
      subtitle: cms.description || "Disenando emociones",
      cta: "Comprar ahora",
      href: "/shop",
    }));
  }, [cms]);

  const activeSlide = slides[selectedIndex] || DEFAULT_SLIDES[0];
  const shouldAutoplay = Boolean(cms && slides.length > 1);

  useEffect(() => {
    setSelectedIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!shouldAutoplay) return;

    const timer = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % slides.length);
    }, 12000);

    return () => window.clearInterval(timer);
  }, [shouldAutoplay, slides.length]);

  return (
    <section className="relative overflow-hidden bg-[#111]">
      <div className="relative h-[72vh] min-h-[560px] md:h-[82vh]">
        <img
          src={activeSlide.image}
          alt={`Floreria DIFIORI - ${activeSlide.title}`}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.86]"
        />

        <div className="absolute inset-0 bg-black/32" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/95 via-[#111111]/34 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%),linear-gradient(135deg,rgba(17,17,17,0.08),rgba(17,17,17,0.42))]" />

        <div className="relative z-10 flex h-full items-end pb-10 md:pb-14">
          <div className="w-full px-8 md:px-16 lg:px-28 xl:px-36">
            <div className="max-w-3xl text-center md:text-left">
              <div className="mb-5 inline-flex rounded-full border border-white/16 bg-white/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/85 backdrop-blur-sm">
                DIFIORI Guayaquil
              </div>
              <h2 className="text-4xl font-semibold leading-[0.94] tracking-tight text-white md:text-6xl lg:text-7xl">
                {activeSlide.title}
              </h2>
              <p className="mt-5 max-w-2xl text-lg italic leading-relaxed text-white/72 md:text-2xl">
                {activeSlide.subtitle}
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:items-start">
                <Link
                  href={activeSlide.href}
                  className="inline-flex min-h-[56px] min-w-[220px] items-center justify-center gap-3 rounded-full bg-accent px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#3D2852]/30 transition-colors hover:bg-[#4A3362]"
                >
                  {activeSlide.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={`https://wa.me/${DEFAULT_COMPANY.phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full border border-[#25D366]/30 bg-[#25D366] px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_42px_rgba(37,211,102,0.28)] transition-colors hover:bg-[#1ebe5d]"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </div>
            </div>

            {slides.length > 1 ? (
              <div className="mt-8 flex justify-center gap-3 opacity-80 md:justify-start">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Ver banner ${index + 1}`}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "h-[3px] rounded-full transition-all duration-300",
                      selectedIndex === index ? "w-12 bg-white" : "w-5 bg-white/35",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
