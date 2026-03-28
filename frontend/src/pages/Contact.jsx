import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, PerspectiveCamera, Ring } from '@react-three/drei';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Landing3DScene from '../components/Landing3DScene';
import GradientMesh from '../components/GradientMesh';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

// 3D Vector Diagram for Contact - Satellite/Signal
const SignalNode = () => {
  const group = useRef();
  
  useFrame((state) => {
    group.current.rotation.y = state.clock.elapsedTime * 0.3;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={group} position={[4, 0, 0]}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Icosahedron args={[1, 0]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#3b82f6" wireframe />
        </Icosahedron>
        <Ring args={[1.2, 1.25, 32]} rotation={[1.5, 0, 0]}>
            <meshBasicMaterial color="#fbbf24" side={2} transparent opacity={0.5} />
        </Ring>
        <Ring args={[1.6, 1.65, 32]} rotation={[1.5, 0, 0]}>
            <meshBasicMaterial color="#fbbf24" side={2} transparent opacity={0.3} />
        </Ring>
      </Float>
    </group>
  );
};

const Contact = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formState);
    alert('Transmission Received. Our team will respond shortly.');
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <div className="relative bg-black text-white selection:bg-blue-500/30 overflow-hidden">
      <Landing3DScene />
      <GradientMesh />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
           <PerspectiveCamera makeDefault position={[0, 0, 10]} />
           <ambientLight intensity={0.5} />
           <pointLight position={[10, 10, 10]} />
           <SignalNode />
        </Canvas>
      </div>
      <Navbar />

      <div className="pt-32 pb-20 px-8 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h1 className="text-6xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
            Get in <span className="text-blue-500">Touch.</span>
          </h1>

          <div className="prose prose-invert prose-lg text-slate-300 max-w-4xl">
            <p className="text-xl leading-relaxed">
              Our global support nodes are online 24/7/365. Reach out for enterprise inquiries, partnership opportunities, or technical support.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-8 mb-12">
               <div className="flex items-start space-x-6 group">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                     <FaMapMarkerAlt size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white mb-1">Headquarters</h3>
                     <p className="text-slate-400">1295 State Street<br/>Springfield, MA 01111-0001</p>
                  </div>
               </div>

               <div className="flex items-start space-x-6 group">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                     <FaPhone size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white mb-1">Phone Support</h3>
                     <p className="text-slate-400">+1 (800) 272-2216</p>
                     <p className="text-xs text-slate-500 mt-1">Mon-Fri, 8am - 8pm EST</p>
                  </div>
               </div>

               <div className="flex items-start space-x-6 group">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                     <FaEnvelope size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white mb-1">Email</h3>
                     <p className="text-slate-400">support@massmutual.com</p>
                     <p className="text-xs text-slate-500 mt-1">Average response time: 2 hours</p>
                  </div>
               </div>
            </div>

            <div className="mt-12 flex space-x-6">
               <a href="#" className="text-slate-500 hover:text-white transition-colors"><FaTwitter size={24} /></a>
               <a href="#" className="text-slate-500 hover:text-white transition-colors"><FaLinkedin size={24} /></a>
               <a href="#" className="text-slate-500 hover:text-white transition-colors"><FaGithub size={24} /></a>
            </div>

            {/* Global Operations Map Placeholder */}
            <div className="mt-12 p-1 border border-white/10 rounded-lg bg-black/50">
               <div className="h-48 w-full bg-slate-900 rounded relative overflow-hidden flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center grayscale"></div>
                  <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                  <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-amber-500 rounded-full animate-ping delay-300"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-green-500 rounded-full animate-ping delay-700"></div>
                  <span className="relative z-10 font-mono text-xs tracking-widest bg-black/80 px-3 py-1 rounded text-blue-400 border border-blue-500/30 group-hover:bg-blue-900/80 transition-colors">VIEW GLOBAL NODES</span>
               </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel p-8 rounded-2xl border border-white/10"
          >
            <h3 className="text-2xl font-bold mb-6 font-mono">SEND_TRANSMISSION //</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">Identity</label>
                  <input 
                     type="text" 
                     className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                     placeholder="John Doe"
                     value={formState.name}
                     onChange={e => setFormState({...formState, name: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">Contact Vector</label>
                  <input 
                     type="email" 
                     className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                     placeholder="john@company.com"
                     value={formState.email}
                     onChange={e => setFormState({...formState, email: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">Message Payload</label>
                  <textarea 
                     className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors h-32"
                     placeholder="Describe your inquiry..."
                     value={formState.message}
                     onChange={e => setFormState({...formState, message: e.target.value})}
                  ></textarea>
               </div>
               <button 
                  type="submit" 
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold tracking-wider shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-1"
               >
                  INITIATE CONTACT
               </button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
