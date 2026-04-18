import React, { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ShoppingBag, MessageSquare, Truck, ShieldCheck, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";
import { Seo } from "@/components/Seo";
import { DEFAULT_COMPANY, absoluteUrl } from "@/lib/site";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCategoryPath, getProductIdFromSlug, getProductPath, slugify } from "@shared/catalog";

export default function ProductDetails() {
  const [canonicalMatch, canonicalParams] = useRoute("/producto/:slug");
  const [legacyMatch, legacyParams] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { data: allProducts = [], isLoading } = useProducts();

  const routeValue = canonicalMatch ? canonicalParams?.slug || "" : legacyParams?.id || "";
  const routePath = canonicalMatch ? `/producto/${routeValue}` : `/product/${routeValue}`;
  const legacyProductId = legacyMatch ? legacyParams?.id : getProductIdFromSlug(routeValue);
  const product = allProducts.find((item) => {
    if (!routeValue) return false;
    if (legacyProductId && String(item.id) === String(legacyProductId)) return true;
    return slugify(item.name) === routeValue;
  });
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

  // Update selected image when product is loaded
  React.useEffect(() => {
    if (product) setSelectedImage(product.image);
  }, [product]);

  React.useEffect(() => {
    if (!product) return;

    const canonicalPath = getProductPath(product);
    if (routePath !== canonicalPath) {
      setLocation(canonicalPath, { replace: true });
    }
  }, [product, routePath, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Seo
          title="Cargando producto | DIFIORI"
          description="Cargando información del producto."
          path={routePath}
          robots="noindex, nofollow"
        />
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 text-center text-foreground font-serif text-2xl">
        <Seo
          title="Producto no encontrado | DIFIORI"
          description="La ficha del producto solicitado no está disponible."
          path={routePath}
          robots="noindex, nofollow"
        />
        Producto no encontrado
      </div>
    );
  }

  const priceValue = product.price.replace(/[^0-9.]/g, "");
  const productPath = getProductPath(product);
  const categoryPath = getCategoryPath(product.category);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [absoluteUrl(product.image), ...(product.additionalImages || []).map((image) => absoluteUrl(image))],
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "DIFIORI",
    },
    offers: {
      "@type": "Offer",
      url: `https://difiori.com${productPath}`,
      priceCurrency: "USD",
      price: priceValue,
      availability: "https://schema.org/InStock",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://difiori.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Catálogo",
          item: "https://difiori.com/shop",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.category,
          item: `https://difiori.com${categoryPath}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: product.name,
          item: `https://difiori.com${productPath}`,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-20 px-6">
      <Seo
        title={`${product.name} | Arreglos Florales en Guayaquil | DIFIORI`}
        description={product.description}
        path={productPath}
        image={product.image}
        type="product"
        schema={productSchema}
      />
      <div className="container mx-auto">
        <Breadcrumb className="mb-10">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/" className="transition-colors hover:text-foreground">
                Inicio
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link href="/shop" className="transition-colors hover:text-foreground">
                Catálogo
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link href={categoryPath} className="transition-colors hover:text-foreground">
                {product.category}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Photos Section */}
          <div className="space-y-8 flex flex-col items-center lg:items-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[4/5] w-full max-w-xl rounded-[3rem] overflow-hidden border border-primary/20 shadow-2xl group bg-white"
            >
              <img 
                src={selectedImage} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                alt={product.name}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              <button className="absolute top-8 right-8 p-4 bg-white/80 backdrop-blur-md rounded-full text-accent shadow-xl border border-primary/10 hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </button>
            </motion.div>
            
            <div className="flex gap-4 justify-center lg:justify-start w-full max-w-xl overflow-x-auto pb-4 no-scrollbar">
              {[product.image, ...(product.additionalImages || [])].map((img, i) => (
                <button 
                  key={i}
                  onMouseEnter={() => setSelectedImage(img)}
                  onClick={() => setSelectedImage(img)}
                  className={cn(
                    "w-24 h-24 min-w-[6rem] rounded-2xl overflow-hidden border-2 transition-all transition-transform hover:scale-105",
                    selectedImage === img ? "border-accent shadow-lg" : "border-primary/10"
                  )}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`${product.name} vista ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[1px] bg-accent/30"></div>
              <span className="text-accent font-black uppercase tracking-[0.4em] text-[10px]">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-8 leading-tight italic">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 mb-12">
               <span className="text-5xl font-black text-foreground font-serif underline decoration-accent/20 underline-offset-8 decoration-4">{product.price}</span>
               <div className="px-4 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">Disponible Ahora</div>
            </div>

            <p className="text-foreground/60 text-xl leading-relaxed mb-12 max-w-xl font-serif italic border-l-4 border-primary/30 pl-8">
              "{product.description}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Lo que recibes</h4>
                  <p className="text-foreground/80 font-medium text-sm leading-relaxed">{product.includes}</p>
               </div>
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Dimensiones</h4>
                  <p className="text-foreground/80 font-medium text-sm leading-relaxed">{product.size}</p>
               </div>
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Promesa de Entrega</h4>
                  <p className="text-foreground/80 font-medium text-sm leading-relaxed flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {product.deliveryTime} (Guayaquil)
                  </p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mt-auto">
              <button className="flex-1 bg-accent hover:bg-accent/90 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">
                Comprar ahora
              </button>
              <a 
                href={`https://wa.me/${DEFAULT_COMPANY.phoneDigits}?text=Hola!%20Deseo%20ordenar%20el%20arreglo:%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white border-2 border-accent/40 text-accent hover:bg-accent hover:text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                <MessageSquare className="w-6 h-6" /> Pedir por WhatsApp
              </a>
            </div>
            
            <div className="mt-12 pt-12 border-t border-primary/10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-foreground/30">
               <span className="flex items-center gap-2"><Truck className="w-4 h-4"/> Envío Seguro</span>
               <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Pago Protegido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
