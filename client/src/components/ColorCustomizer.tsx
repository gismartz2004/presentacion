import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Room3D from "./Room3D";
import { Palette, MousePointer2, Box } from "lucide-react";

const COLORS = [
    { id: "navy", name: "Azul Marino", value: "#000080", bg: "bg-[#000080]" },
    { id: "coffee", name: "Café", value: "#4B3621", bg: "bg-[#4B3621]" },
    { id: "beige", name: "Beige", value: "#F5F5DC", bg: "bg-[#F5F5DC]" },
    { id: "white", name: "Blanco", value: "#FFFFFF", bg: "bg-[#FFFFFF]" },
    { id: "brown", name: "Marrón", value: "#654321", bg: "bg-[#654321]" },
    { id: "slate", name: "Anthracite", value: "#334155", bg: "bg-slate-700" },
];

export default function ColorCustomizer() {
    const [activeColor, setActiveColor] = useState(COLORS[0]);

    return (
        <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* 3D Visualizer Column */}
            <div className="lg:col-span-7 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Room3D color={activeColor.value} />
            </div>

            {/* Control Panel Column */}
            <div className="lg:col-span-5 space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-accent/10 rounded-2xl">
                            <Palette className="w-6 h-6 text-accent" />
                        </div>
                        <span className="text-accent font-bold tracking-widest text-xs uppercase">Personalización Elite</span>
                    </div>
                    <h2 className="text-5xl font-serif text-primary leading-tight mb-6">
                        Tu estilo, <br />
                        <span className="text-accent italic">tu visión</span>
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                        Experimenta con nuestra paleta curada de pigmentos industriales. Visualiza cómo cada tono transforma la atmósfera de tu espacio en tiempo real.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                        {COLORS.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => setActiveColor(color)}
                                className={`group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeColor.id === color.id
                                    ? "ring-4 ring-accent/20 scale-110 shadow-lg"
                                    : "hover:scale-105"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${color.bg} shadow-inner`}></div>
                                <AnimatePresence>
                                    {activeColor.id === color.id && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full border-2 border-white flex items-center justify-center"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-semibold text-slate-500">
                            <span className="text-primary">+1,200 diseñadores</span> ya están usando esta herramienta.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                        <MousePointer2 className="w-4 h-4" /> Interactuar
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                        <Box className="w-4 h-4" /> 3D View
                    </div>
                </div>
            </div>
        </div>
    );
}
