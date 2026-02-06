import { motion } from "framer-motion";
import { ArrowRight, Home as HomeIcon, Droplet, Lock, ChevronDown, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import ColorCustomizer from "@/components/ColorCustomizer";

export default function Home() {
  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "circOut" } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 md:px-20 pt-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 -z-20 hidden lg:block"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "circOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-[2px] w-16 bg-accent"></div>
              <span className="text-accent font-black tracking-[0.4em] text-xs uppercase">Estudio Boutique de Élite</span>
            </motion.div>

            <h1 className="text-7xl md:text-[10rem] font-serif text-primary leading-[0.8] mb-10 font-bold tracking-tighter">
              Diseño <br />
              <motion.span
                initial={{ opacity: 0, rotate: -5 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="text-accent italic block mt-2"
              >
                Inmersivo.
              </motion.span>
            </h1>

            <p className="text-slate-600 max-w-lg text-xl mb-12 leading-relaxed font-medium">
              Fusionamos la ingeniería de precisión con el diseño de vanguardia. Experimenta la arquitectura del mañana, hoy.
            </p>

            <div className="flex flex-wrap gap-6">
              <Link href="/shop" className="group relative bg-primary text-white px-12 py-6 rounded-2xl font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 cursor-pointer">
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative flex items-center gap-3">
                  Explorar Catálogo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/contact" className="px-12 py-6 rounded-2xl font-bold border-2 border-slate-200 hover:border-primary hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2">
                Asesoría Privada
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-20 flex items-center gap-10 opacity-40 hover:opacity-100 transition-opacity"
            >
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">Scroll para explorar</div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronDown className="w-5 h-5 text-accent" />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative z-10">
              <img
                src="/assets/hero.png"
                alt="Interior Design Hero"
                className="w-full h-[800px] object-cover rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
              />
              <div className="absolute bottom-10 -left-20 bg-white p-8 rounded-[2rem] shadow-2xl space-y-4 max-w-xs border border-slate-100 backdrop-blur-xl bg-white/90">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-1 bg-accent rounded-full"></div>)}
                </div>
                <p className="font-bold text-primary text-lg leading-tight">"La simplicidad es la máxima sofisticación."</p>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">— Leonardo da Vinci</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive 3D Experience */}
      <section className="py-40 px-6 md:px-20 bg-background">
        <div className="max-w-7xl mx-auto">
          <ColorCustomizer />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-32 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold uppercase tracking-widest text-xs">Curaduría Experta</span>
            </div>
            <h2 className="text-6xl font-serif text-primary mb-6 leading-tight">Nuestros Especialistas</h2>
            <p className="text-muted-foreground text-xl font-medium">Seleccionamos piezas que no solo llenan espacios, sino que cuentan historias.</p>
          </div>
          <Link href="/shop" className="text-primary font-black flex items-center gap-3 group cursor-pointer bg-secondary/10 px-8 py-4 rounded-2xl hover:bg-secondary/20 transition-colors">
            Ver Todo el Catálogo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {[
            { title: "Grifería Premium", icon: <Droplet className="text-blue-500 w-8 h-8" />, desc: "Diseños que fluyen con elegancia y sostenibilidad.", color: "bg-blue-50/50" },
            { title: "Cerraduras Smart", icon: <Lock className="text-purple-500 w-8 h-8" />, desc: "Seguridad invisible con estética de alta gama.", color: "bg-purple-50/50" },
            { title: "Mobiliario Autor", icon: <HomeIcon className="text-orange-500 w-8 h-8" />, desc: "Piezas únicas firmadas por diseñadores globales.", color: "bg-orange-50/50" }
          ].map((cat, i) => (
            <motion.div key={i} variants={item} className={cn("p-12 rounded-[3.5rem] border border-transparent hover:border-slate-200 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-slate-200/50", cat.color)}>
              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                {cat.icon}
              </div>
              <h3 className="text-3xl font-bold mb-4 text-primary">{cat.title}</h3>
              <p className="text-slate-500 mb-8 text-lg leading-relaxed font-medium">{cat.desc}</p>
              <div className="flex items-center gap-2 text-primary font-black group-hover:gap-4 transition-all uppercase text-xs tracking-widest">
                Explorar Colección <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products Scroll - Cinematic */}
      <section className="py-40 bg-primary overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10 blur-[150px]"></div>
        <div className="px-6 md:px-20 max-w-7xl mx-auto mb-20 relative z-10">
          <h2 className="text-7xl font-serif text-white mb-6">Tendencias Vividas</h2>
          <p className="text-white/50 text-xl max-w-xl">Una explosión de color que desafía la monotonía del minimalismo tradicional.</p>
        </div>

        <div className="flex gap-12 px-6 overflow-x-auto no-scrollbar pb-20 relative z-10">
          {[
            { id: 1, img: "/assets/faucet.png", title: "Grifería Elite", tag: "Azul Marino" },
            { id: 2, img: "/assets/lock.png", title: "Seguridad Biométrica", tag: "Madera Café" },
            { id: 3, img: "/assets/chair.png", title: "Confort Minimalista", tag: "Beige Soft" },
          ].map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -20 }}
              className="min-w-[450px] group cursor-pointer"
            >
              <div className="relative h-[650px] rounded-[4rem] overflow-hidden mb-8 shadow-2xl">
                <img
                  src={item.img}
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  alt={item.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-12 left-12 text-white">
                  <span className="bg-accent/80 backdrop-blur-md px-6 py-2 rounded-full text-xs font-black mb-4 inline-block uppercase tracking-widest">{item.tag}</span>
                  <h4 className="text-4xl font-bold mb-2">{item.title}</h4>
                  <p className="text-white/60 font-medium">Colección Exclusiva 2025</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
