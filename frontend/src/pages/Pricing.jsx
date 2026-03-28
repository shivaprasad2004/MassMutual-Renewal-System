import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Cylinder, PerspectiveCamera } from '@react-three/drei';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Landing3DScene from '../components/Landing3DScene';
import GradientMesh from '../components/GradientMesh';

// 3D Vector Diagram for Pricing - Stacks of Coins/Discs
const CoinStack = () => {
  const group = useRef();
  
  useFrame((state) => {
    group.current.rotation.y = state.clock.elapsedTime * 0.5;
  });

  return (
    <group ref={group} position={[4, -1, 0]}>
      {[...Array(5)].map((_, i) => (
        <Float key={i} speed={1} rotationIntensity={0} floatIntensity={0.5} floatingRange={[0, 0.2]}>
          <Cylinder 
            args={[1, 1, 0.2, 32]} 
            position={[0, i * 0.4, 0]}
            rotation={[0, 0, 0]}
          >
             <meshStandardMaterial 
               color="#fbbf24" 
               metalness={0.8} 
               roughness={0.2} 
             />
          </Cylinder>
        </Float>
      ))}
    </group>
  );
};

const Pricing = () => {
  return (
    <div className="relative bg-black text-white selection:bg-blue-500/30 overflow-hidden">
      <Landing3DScene />
      <GradientMesh />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
           <PerspectiveCamera makeDefault position={[0, 0, 10]} />
           <ambientLight intensity={0.8} />
           <pointLight position={[10, 10, 10]} intensity={1} />
           <CoinStack />
        </Canvas>
      </div>
      <Navbar />

      <div className="pt-32 pb-20 px-8 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold mb-6 tracking-tighter">
            Transparent <span className="text-amber-400">Value.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the level of protection that fits your scale. No hidden fees, just pure coverage.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
           {/* Tier 1 */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0 }}
             className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-slate-500 transition-all flex flex-col relative overflow-hidden"
           >
             <h3 className="text-2xl font-bold text-slate-300 mb-2 font-mono">STANDARD</h3>
             <div className="text-4xl font-bold text-white mb-6">$29<span className="text-sm text-slate-500 font-normal">/mo per user</span></div>
             <p className="text-slate-400 text-sm mb-8">Essential tools for individual agents and small brokerages.</p>
             
             <ul className="space-y-4 mb-8 flex-1">
                {['Basic Policy Management', 'Standard Renewals', 'Email Support', '5GB Document Storage'].map((feat, i) => (
                   <li key={i} className="flex items-center text-sm text-slate-300">
                      <span className="text-green-500 mr-2">✓</span> {feat}
                   </li>
                ))}
             </ul>
             
             <button className="w-full py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors font-mono text-sm">SELECT PLAN</button>
           </motion.div>

           {/* Tier 2 - Popular */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="glass-panel p-8 rounded-2xl border border-blue-500/50 bg-blue-900/10 hover:bg-blue-900/20 transition-all flex flex-col relative transform scale-105 shadow-2xl shadow-blue-900/20"
           >
             <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg font-mono">MOST POPULAR</div>
             <h3 className="text-2xl font-bold text-blue-400 mb-2 font-mono">PROFESSIONAL</h3>
             <div className="text-4xl font-bold text-white mb-6">$99<span className="text-sm text-slate-500 font-normal">/mo per user</span></div>
             <p className="text-slate-400 text-sm mb-8">Advanced telemetry and AI insights for growing firms.</p>
             
             <ul className="space-y-4 mb-8 flex-1">
                {['Everything in Standard', 'AI Risk Assessment', 'Automated Renewals', 'Priority 24/7 Support', 'Unlimited Storage', 'API Access'].map((feat, i) => (
                   <li key={i} className="flex items-center text-sm text-white">
                      <span className="text-blue-400 mr-2">✓</span> {feat}
                   </li>
                ))}
             </ul>
             
             <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-mono text-sm font-bold shadow-lg shadow-blue-600/20">START FREE TRIAL</button>
           </motion.div>

           {/* Tier 3 */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="glass-panel p-8 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col relative overflow-hidden"
           >
             <h3 className="text-2xl font-bold text-amber-400 mb-2 font-mono">ENTERPRISE</h3>
             <div className="text-4xl font-bold text-white mb-6">CUSTOM<span className="text-sm text-slate-500 font-normal"> pricing</span></div>
             <p className="text-slate-400 text-sm mb-8">Full-scale infrastructure for multinational carriers.</p>
             
             <ul className="space-y-4 mb-8 flex-1">
                {['Everything in Professional', 'Dedicated Success Manager', 'On-Premise Deployment', 'Custom AI Model Training', 'SLA Guarantees', 'White Labeling'].map((feat, i) => (
                   <li key={i} className="flex items-center text-sm text-slate-300">
                      <span className="text-amber-500 mr-2">✓</span> {feat}
                   </li>
                ))}
             </ul>
             
             <button className="w-full py-3 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors font-mono text-sm">CONTACT SALES</button>
           </motion.div>
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-24 max-w-5xl mx-auto"
        >
           <h2 className="text-3xl font-bold text-center mb-12">Feature Breakdown</h2>
           <div className="glass-panel overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-white/5 text-white font-mono uppercase text-xs">
                       <tr>
                          <th className="p-4 pl-8">Feature</th>
                          <th className="p-4 text-center">Standard</th>
                          <th className="p-4 text-center text-blue-400">Professional</th>
                          <th className="p-4 text-center text-amber-400">Enterprise</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {[
                          { name: 'Policy Limit', s: '1,000', p: '50,000', e: 'Unlimited' },
                          { name: 'Admin Seats', s: '1', p: '5', e: 'Unlimited' },
                          { name: 'API Access', s: '-', p: 'Read-Only', e: 'Full Access' },
                          { name: 'Support SLA', s: '48h', p: '12h', e: '1h Dedicated' },
                          { name: 'Data Retention', s: '1 Year', p: '7 Years', e: 'Indefinite' },
                          { name: 'Custom Branding', s: '-', p: 'Logo Only', e: 'Full Whitelabel' },
                          { name: 'On-Premise Option', s: '-', p: '-', e: 'Available' }
                       ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                             <td className="p-4 pl-8 font-medium text-white">{row.name}</td>
                             <td className="p-4 text-center">{row.s}</td>
                             <td className="p-4 text-center text-blue-300">{row.p}</td>
                             <td className="p-4 text-center text-amber-300">{row.e}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
