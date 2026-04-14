import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { FadeIn } from "../components/animations";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,rgba(255,255,255,0.3))] -z-10" />
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">

          {/* Hero Title */}
          <FadeIn delay={300}>
            <div className="space-y-6">
              <h1 className="hero-title text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Gestiona tu{" "}
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Negocio
                </span>{" "}
                <br />
                con Estilo
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Plataforma completa para administrar productos, pedidos y analíticas. 
                <br />
                Diseñada para hacer crecer tu negocio con elegancia y simplicidad.
              </p>
            </div>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={500}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" className="group px-10 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                <a href="/auth" className="flex items-center gap-3">
                  {/* <Coffee className="h-5 w-5" /> */}
                  Comenzar Ahora
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-4 text-lg font-medium border-2 hover:bg-gray-50 transition-all duration-300"
              >
                Ver Características
              </Button>
            </div>
          </FadeIn>

          {/* Subtle Stats */}
          <FadeIn delay={700}>
            <div className="pt-12 border-t border-gray-200/50 mt-16">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Seguro y Confiable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Fácil de Usar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Soporte 24/7</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 right-20 w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full opacity-20 animate-pulse"></div>
    </div>
  );
}
