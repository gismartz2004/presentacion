import { motion } from "framer-motion";
import { ArrowRight, Star, Home as HomeIcon, Droplet, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden px-6 md:px-20">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[2px] w-12 bg-accent"></div>
              <span className="text-accent font-bold tracking-[0.3em] text-xs uppercase">Estudio Boutique</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-serif text-primary leading-[0.85] mb-8 font-bold">
              Detalles <br />
              <span className="text-accent italic">Infinitos</span>
            </h1>
            <p className="text-muted-foreground max-w-md text-xl mb-12 leading-relaxed font-medium">
              Desde grifería escultural hasta cerraduras inteligentes. Redefinimos el minimalismo con colores vivos y tecnología punta.
            </p>
            <div className="flex gap-4">
              <Link href="/shop" className="bg-accent text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group">
                Ver Catálogo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="bg-white text-primary px-10 py-5 rounded-2xl font-bold border border-border hover:bg-muted transition-all">
                Asesoría
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="hidden md:block relative"
          >
            <div className="w-[500px] h-[600px] bg-gradient-to-br from-accent to-orange-400 rounded-[4rem] rotate-6 absolute -z-10 blur-3xl opacity-20 animate-pulse"></div>
            <img 
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000" 
              alt="Interior Design"
              className="w-full h-[700px] object-cover rounded-[3rem] shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-32 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-5xl font-serif text-primary mb-4">Nuestros Especialistas</h2>
            <p className="text-muted-foreground text-lg">Curaduría experta para cada rincón de tu hogar.</p>
          </div>
          <Link href="/shop" className="text-accent font-bold flex items-center gap-2 group">
            Ver Todo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { title: "Grifería Premium", icon: <Droplet className="text-blue-500" />, desc: "Diseños que fluyen con elegancia.", color: "bg-blue-50" },
            { title: "Cerraduras Smart", icon: <Lock className="text-purple-500" />, desc: "Seguridad invisible, estética visible.", color: "bg-purple-50" },
            { title: "Mobiliario Autor", icon: <HomeIcon className="text-orange-500" />, desc: "Piezas únicas que definen espacios.", color: "bg-orange-50" }
          ].map((cat, i) => (
            <motion.div key={i} variants={item} className={cn("p-10 rounded-[2.5rem] glass-card hover:-translate-y-2 transition-transform cursor-pointer", cat.color)}>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
                {cat.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{cat.title}</h3>
              <p className="text-muted-foreground mb-6 font-medium">{cat.desc}</p>
              <div className="flex items-center gap-2 text-primary font-bold">
                Explorar <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products Scroll */}
      <section className="py-32 bg-primary overflow-hidden">
        <div className="px-6 md:px-20 max-w-7xl mx-auto mb-16">
          <h2 className="text-5xl font-serif text-white mb-4">Tendencias Vividas</h2>
          <p className="text-white/60">Colores que dan vida a la sobriedad del minimalismo.</p>
        </div>
        
        <div className="flex gap-10 px-6 overflow-x-auto no-scrollbar pb-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[400px] group cursor-pointer">
              <div className="relative h-[500px] rounded-[3rem] overflow-hidden mb-6">
                <img 
                  src={`https://images.unsplash.com/photo-${1580000000000 + i*1000}?auto=format&fit=crop&q=80&w=600`} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt="Product"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <span className="bg-accent px-4 py-1 rounded-full text-xs font-bold mb-2 inline-block">Nuevo</span>
                  <h4 className="text-2xl font-bold">Concepto #{i}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
