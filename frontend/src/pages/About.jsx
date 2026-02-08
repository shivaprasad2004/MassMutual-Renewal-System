import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, PerspectiveCamera, Icosahedron } from '@react-three/drei';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Landing3DScene from '../components/Landing3DScene';
import { FaHistory, FaUsers, FaGlobeAmericas, FaAward, FaHandshake, FaChartLine } from 'react-icons/fa';

// 3D Vector Diagram for About Page - Connected Network
const NetworkDiagram = () => {
  const group = useRef();
  
  useFrame((state) => {
    group.current.rotation.y += 0.002;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  const points = [];
  const connections = [];
  const count = 20;
  const radius = 3.5;

  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2;
    const y = (Math.random() - 0.5) * 2.5;
    const r = radius * Math.sqrt(1 - (y/2.5)**2);
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    points.push([x, y, z]);
  }

  // Create connections
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (Math.random() > 0.8) {
        connections.push([points[i], points[j]]);
      }
    }
  }

  return (
    <group ref={group} position={[3, 0, 0]}>
      {points.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}
      {connections.map((line, i) => (
        <Line key={i} points={line} color="#3b82f6" lineWidth={1} transparent opacity={0.2} />
      ))}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
         <Icosahedron args={[0.5, 0]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#3b82f6" wireframe />
         </Icosahedron>
      </Float>
    </group>
  );
};

const About = () => {
  return (
    <div className="relative bg-black text-white selection:bg-blue-500/30 overflow-hidden">
      <Landing3DScene />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
           <PerspectiveCamera makeDefault position={[0, 0, 10]} />
           <ambientLight intensity={0.5} />
           <NetworkDiagram />
        </Canvas>
      </div>
      <Navbar />

      <div className="pt-32 pb-20 px-8 max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-24"
        >
          <h1 className="text-6xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
            Pioneering Financial <br /> <span className="text-blue-500">Resilience.</span>
          </h1>
          
          <div className="prose prose-invert prose-lg text-slate-300 space-y-8 max-w-3xl">
            <p className="text-xl leading-relaxed">
              At MassMutual, we don't just predict the future; we secure it. For over 170 years, we have been the silent architect behind the financial stability of millions. Today, we are evolving into a digital-first fortress of wealth protection, combining centuries of actuarial wisdom with cutting-edge artificial intelligence.
            </p>
          </div>
        </motion.div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-10 border-l-4 border-amber-400 rounded-r-2xl"
          >
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6">
               <FaAward className="text-amber-500 text-2xl" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-slate-400 leading-relaxed">To provide an unshakeable foundation for our policyholders through data-driven insights, transparent governance, and unwavering commitment to long-term value generation. We exist to help people secure their future and protect the ones they love.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-10 border-l-4 border-blue-500 rounded-r-2xl"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
               <FaGlobeAmericas className="text-blue-500 text-2xl" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">The Vision</h3>
            <p className="text-slate-400 leading-relaxed">A world where financial uncertainty is obsolete. By integrating real-time telemetry with actuarial science, we are building a self-correcting financial ecosystem that adapts to market volatility instantly, ensuring stability for generations to come.</p>
          </motion.div>
        </div>

        {/* Statistics Section */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
        >
            <h2 className="text-3xl font-bold text-center mb-16"><span className="text-blue-500">Scale</span> of Operations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: "Assets Under Mgmt", value: "$900B+", icon: <FaChartLine /> },
                    { label: "Policyholders", value: "5M+", icon: <FaUsers /> },
                    { label: "Year Founded", value: "1851", icon: <FaHistory /> },
                    { label: "Dividends Paid", value: "$1.9B", icon: <FaHandshake /> }
                ].map((stat, i) => (
                    <div key={i} className="text-center p-6 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors group">
                        <div className="text-4xl text-blue-500 mb-4 flex justify-center group-hover:scale-110 transition-transform">{stat.icon}</div>
                        <div className="text-4xl font-bold text-white mb-2 font-mono">{stat.value}</div>
                        <div className="text-slate-500 text-sm uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>
        </motion.div>

        {/* History Timeline */}
        <div className="mb-32 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Legacy of <span className="text-amber-400">Innovation</span></h2>
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                {[
                    { year: "1851", title: "The Foundation", desc: "Founded in Springfield, Massachusetts, with a singular purpose: to help people navigate financial storms." },
                    { year: "1929", title: "Resilience Tested", desc: "Navigated the Great Depression without missing a dividend payment, proving our conservative investment strategy works." },
                    { year: "1980", title: "Digital Dawn", desc: "Early adoption of mainframe computing to process policies faster and more accurately than any competitor." },
                    { year: "2024", title: "AI Integration", desc: "Launch of the Quantum Policy Engine, bringing real-time risk assessment and automated underwriting to the masses." }
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-slate-900 group-hover:bg-blue-500 transition-colors shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-slate-500 group-hover:text-white font-bold text-xs">
                            {/* Dot */}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-6 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-200">{item.title}</div>
                                <time className="font-mono text-xs text-blue-400">{item.year}</time>
                            </div>
                            <div className="text-slate-400 text-sm">{item.desc}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-32">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Core <span className="text-blue-500">Values</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Integrity First", desc: "We believe that trust is the currency of our business. Every decision is weighed against our ethical compass.", color: "border-blue-500" },
                    { title: "Resilient Innovation", desc: "We don't chase trends. We build sustainable, long-term solutions that withstand market turbulence.", color: "border-amber-400" },
                    { title: "Policyholder Focus", desc: "Our structure as a mutual company means we answer to our customers, not Wall Street.", color: "border-green-500" }
                ].map((value, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-panel p-8 rounded-xl border-t-4 ${value.color} hover:-translate-y-2 transition-transform duration-300`}
                    >
                        <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{value.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default About;