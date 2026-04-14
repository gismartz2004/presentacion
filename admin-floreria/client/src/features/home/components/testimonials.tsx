import { Star, Users, Coffee, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

const testimonials = [
  {
    name: "María González",
    role: "Propietaria de Café Luna",
    content: "Desde que uso esta plataforma, he aumentado mis ventas en un 40%. La gestión de pedidos es súper fácil.",
    rating: 5,
    avatar: "MG"
  },
  {
    name: "Carlos Ruiz", 
    role: "Café Central",
    content: "Los reportes me ayudan a tomar mejores decisiones. Ahora sé exactamente qué productos funcionan mejor.",
    rating: 5,
    avatar: "CR"
  },
  {
    name: "Ana Morales",
    role: "Dulce Aroma",
    content: "La interfaz es intuitiva y moderna. Mis empleados la adoptaron rápidamente sin problemas.",
    rating: 5,
    avatar: "AM"
  }
];

const stats = [
  {
    icon: <Users className="h-6 w-6" />,
    number: "500+",
    label: "Cafeterías activas",
    color: "text-blue-600"
  },
  {
    icon: <Coffee className="h-6 w-6" />,
    number: "10K+",
    label: "Pedidos procesados",
    color: "text-amber-600"
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    number: "98%",
    label: "Satisfacción del cliente",
    color: "text-green-600"
  },
  {
    icon: <Star className="h-6 w-6" />,
    number: "4.9",
    label: "Calificación promedio",
    color: "text-yellow-600"
  }
];

export function TestimonialsSection() {
  return (
    <div className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Más de 500 cafeterías confían en nuestra plataforma para hacer crecer su negocio
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}