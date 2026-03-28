import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, PerspectiveCamera } from '@react-three/drei';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Landing3DScene from '../components/Landing3DScene';
import GradientMesh from '../components/GradientMesh';

// 3D Vector Diagram for Widgets - Abstract Data Blocks
const DataBlocks = () => {
  const group = useRef();
  
  useFrame((state) => {
    group.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <group ref={group} position={[4, 0, 0]}>
      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
          <Box 
            args={[0.8, 0.8, 0.8]} 
            position={[
              Math.sin(i) * 3, 
              Math.cos(i * 1.5) * 2, 
              Math.cos(i) * 3
            ]}
          >
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#3b82f6" : "#fbbf24"} 
              wireframe 
              transparent 
              opacity={0.6} 
            />
          </Box>
        </Float>
      ))}
    </group>
  );
};

const Widgets = () => {
  return (
    <div className="relative bg-black text-white selection:bg-blue-500/30 overflow-hidden">
      <Landing3DScene />
      <GradientMesh />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
           <PerspectiveCamera makeDefault position={[0, 0, 10]} />
           <ambientLight intensity={0.8} />
           <pointLight position={[10, 10, 10]} />
           <DataBlocks />
        </Canvas>
      </div>
      <Navbar />

      <div className="pt-32 pb-20 px-8 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-300">
            System <br /> <span className="text-white">Widgets.</span>
          </h1>

          <div className="prose prose-invert prose-lg text-slate-300 max-w-4xl mb-16">
            <p className="text-xl leading-relaxed">
              Our dashboard is composed of modular, high-performance widgets designed to provide instant visibility into critical metrics. Each widget functions as an independent micro-application, streaming real-time data from our core policy engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "Policy Health Monitor", 
                desc: "Real-time tracking of active policies, flagging risks and coverage gaps instantly.",
                icon: "📊"
              },
              { 
                title: "Renewal Countdown", 
                desc: "Precision timers for upcoming renewals with automated notification triggers.",
                icon: "⏱️"
              },
              { 
                title: "Premium Analytics", 
                desc: "Visual breakdown of revenue streams, forecasted growth, and churn rates.",
                icon: "💰"
              },
              { 
                title: "Claim Telemetry", 
                desc: "Live feed of claim processing stages, from submission to final settlement.",
                icon: "📡"
              },
              { 
                title: "Member Sentiment", 
                desc: "AI-driven analysis of customer interactions and satisfaction scores.",
                icon: "❤️"
              },
              { 
                title: "Compliance Sentinel", 
                desc: "Automated regulatory checks ensuring all policies meet state and federal standards.",
                icon: "⚖️"
              }
            ].map((widget, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass-panel p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{widget.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{widget.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{widget.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Integration Section */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <h2 className="text-3xl font-bold mb-6">Seamless <span className="text-amber-400">Integration</span></h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Embed our widgets directly into your existing CRM or portal. Our lightweight JavaScript SDK allows for drag-and-drop implementation with zero latency overhead.
                </p>
                <ul className="space-y-4 font-mono text-sm text-slate-300">
                    <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> React / Vue / Angular Compatible</li>
                    <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> WebSocket Real-time Updates</li>
                    <li className="flex items-center"><span className="text-green-500 mr-3">✓</span> JWT Authentication Support</li>
                </ul>
                <button className="mt-8 px-6 py-3 border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 rounded-lg font-mono text-sm transition-colors">
                    VIEW DOCUMENTATION
                </button>
            </div>
            <div className="glass-panel p-6 rounded-lg border border-white/10 font-mono text-xs overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-2 text-slate-500">JSON</div>
                <pre className="text-slate-300 overflow-x-auto">
{`// Widget Configuration
const riskMonitor = new MassMutual.Widget({
  type: 'RISK_ANALYSIS',
  target: '#dashboard-container',
  config: {
    refreshRate: 1000,
    theme: 'dark',
    filters: {
      region: 'NA_EAST',
      threshold: 0.85
    }
  },
  onAlert: (data) => {
    console.log('Risk Threshold Breached:', data);
  }
});

riskMonitor.mount();`}
                </pre>
            </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Widgets;
