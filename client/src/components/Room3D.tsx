import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, RoundedBox, Float, PresentationControls, ContactShadows, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { motion } from "framer-motion";

function DesignerDoor({ color = "#4B3621" }: { color?: string }) {
    return (
        <group position={[0, -0.6, 0]}>
            {/* Decorative Floor Base */}
            <RoundedBox args={[3, 0.05, 3]} radius={0.01} position={[0, -0.05, 0]}>
                <meshStandardMaterial color="#f8f8f0" roughness={0.1} />
            </RoundedBox>

            {/* Main Door Frame */}
            <group position={[0, 1.15, 0]}>
                {/* Frame Top */}
                <RoundedBox args={[1.5, 0.1, 0.2]} radius={0.02} position={[0, 1.1, 0]}>
                    <meshStandardMaterial color="#333" metalness={0.2} roughness={0.8} />
                </RoundedBox>
                {/* Frame Left */}
                <RoundedBox args={[0.1, 2.3, 0.2]} radius={0.02} position={[-0.7, 0, 0]}>
                    <meshStandardMaterial color="#333" metalness={0.2} roughness={0.8} />
                </RoundedBox>
                {/* Frame Right */}
                <RoundedBox args={[0.1, 2.3, 0.2]} radius={0.02} position={[0.7, 0, 0]}>
                    <meshStandardMaterial color="#333" metalness={0.2} roughness={0.8} />
                </RoundedBox>

                {/* The Door Panel */}
                <group position={[0, 0, 0]}>
                    <RoundedBox args={[1.2, 2.1, 0.1]} radius={0.04}>
                        <meshPhysicalMaterial
                            color={color}
                            roughness={0.2}
                            metalness={0.1}
                            clearcoat={0.8}
                            clearcoatRoughness={0.1}
                        />
                    </RoundedBox>

                    {/* Recessed Panel detail */}
                    <RoundedBox args={[0.8, 1.7, 0.05]} radius={0.02} position={[0, 0, 0.03]}>
                        <meshStandardMaterial color={color} roughness={0.5} opacity={0.5} transparent />
                    </RoundedBox>

                    {/* Luxury Handle Implementation */}
                    <group position={[0.45, 0, 0.08]}>
                        {/* Lock Plate */}
                        <RoundedBox args={[0.12, 0.4, 0.04]} radius={0.02}>
                            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.05} />
                        </RoundedBox>

                        {/* Fingerprint / Smart Area */}
                        <mesh position={[0, 0.1, 0.02]}>
                            <circleGeometry args={[0.03, 32]} />
                            <meshStandardMaterial color="#000080" emissive="#0000ff" emissiveIntensity={2} />
                        </mesh>

                        {/* Handle Lever */}
                        <group position={[0, -0.05, 0.02]}>
                            <mesh rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.015, 0.015, 0.15]} />
                                <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
                            </mesh>
                            <mesh position={[0, 0, 0.075]} rotation={[0, 0, Math.PI / 2]}>
                                <cylinderGeometry args={[0.015, 0.015, 0.3]} />
                                <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
                            </mesh>
                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
}

function Scene({ color }: { color?: string }) {
    return (
        <>
            <color attach="background" args={["#f5f5dc"]} />
            <PresentationControls
                speed={1.5}
                global
                zoom={0.8}
                polar={[-0.1, Math.PI / 4]}
            >
                <Stage environment="studio" intensity={0.6} adjustCamera={1.2}>
                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.1}>
                        <DesignerDoor color={color} />
                    </Float>
                </Stage>
                <ContactShadows
                    opacity={0.6}
                    scale={10}
                    blur={2}
                    far={1}
                    resolution={512}
                    color="#221100"
                    position={[0, -0.65, 0]}
                />
            </PresentationControls>
            <Environment preset="apartment" />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} />
        </>
    );
}

export default function Room3D({ color }: { color?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-[600px] md:h-[800px] rounded-[5rem] overflow-hidden bg-[#fafaf5] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative border border-white/60"
        >
            <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <div className="animate-pulse flex flex-col items-center gap-6">
                        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        <div className="text-center space-y-2">
                            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Cargando Studio</p>
                            <p className="text-muted-foreground text-[9px] font-bold">Iniciando motor de renderizado físico...</p>
                        </div>
                    </div>
                </div>
            }>
                <Canvas shadows camera={{ position: [0, 1.5, 6], fov: 35 }}>
                    <Scene color={color} />
                </Canvas>
            </Suspense>

            <div className="absolute top-12 left-12 z-10">
                <div className="flex flex-col gap-1">
                    <div className="px-5 py-2 bg-primary/95 backdrop-blur-xl rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white w-fit shadow-xl">
                        Edición Heritage 2025
                    </div>
                    <p className="text-[10px] font-bold text-primary/40 ml-1">Proyecto: Puerta de Entrada Inteligente</p>
                </div>
            </div>

            <div className="absolute bottom-12 right-12 z-10">
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-8 py-4 rounded-[2rem] shadow-2xl border border-white/40">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Motor de Render</span>
                        <span className="text-[10px] font-bold text-primary italic">Precision Realism™</span>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-accent animate-ping"></div>
                </div>
            </div>
        </motion.div>
    );
}
