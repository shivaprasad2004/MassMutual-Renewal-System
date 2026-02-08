import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import Landing3DScene from '../components/Landing3DScene';
import Footer from '../components/Footer';

const Section = ({ children, className }) => (
  <section className={`min-h-screen flex items-center justify-center relative z-10 p-8 ${className}`}>
    {children}
  </section>
);

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="relative bg-black text-white selection:bg-blue-500/30">
      <Landing3DScene />
      <Navbar />

      {/* Hero Section */}
      <Section>
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-300 to-slate-500">
              FUTURE <br />
              <span className="text-blue-500">SECURED.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
              Next-generation policy management driven by real-time telemetry and financial intelligence. Experience the new standard in insurance tech.
            </p>
            <div className="flex space-x-4">
              <Link to="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-mono tracking-wider transition-all">
                START_SESSION //
              </Link>
              <button className="px-8 py-3 border border-white/20 hover:border-white/50 text-white rounded-sm font-mono tracking-wider transition-all">
                VIEW_DEMO
              </button>
            </div>
          </motion.div>
          <div className="hidden lg:block relative h-96">
            {/* 3D elements are in the background, this is just spacing */}
          </div>
        </div>
      </Section>

      {/* Policies Section */}
      <Section className="bg-black/40 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-6xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight mb-4">Intelligent Policy Core</h2>
            <p className="text-slate-400">Automated risk assessment and renewal processing.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/solutions" className="block group">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, duration: 0.6 }}
                className="glass-panel p-8 hover:bg-slate-900/60 transition-colors h-full border-t-2 border-transparent hover:border-blue-500"
              >
                <div className="w-12 h-12 rounded bg-blue-500/10 mb-6 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 group-hover:animate-ping" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-mono">Smart Contracts</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Blockchain-verified policy terms with instant execution.</p>
              </motion.div>
            </Link>

            <Link to="/solutions" className="block group">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="glass-panel p-8 hover:bg-slate-900/60 transition-colors h-full border-t-2 border-transparent hover:border-amber-500"
              >
                <div className="w-12 h-12 rounded bg-amber-500/10 mb-6 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 group-hover:animate-ping" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-mono">Risk Analysis</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Real-time telemetry processing for dynamic premiums.</p>
              </motion.div>
            </Link>

            <Link to="/widgets" className="block group">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="glass-panel p-8 hover:bg-slate-900/60 transition-colors h-full border-t-2 border-transparent hover:border-green-500"
              >
                <div className="w-12 h-12 rounded bg-green-500/10 mb-6 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 group-hover:animate-ping" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-mono">Auto-Renewal</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Seamless coverage extension with zero downtime.</p>
              </motion.div>
            </Link>
          </div>
        </div>
      </Section>

      {/* Finance Section */}
      <Section>
         <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               className="order-2 lg:order-1 relative"
            >
               {/* Decorative Finance UI */}
               <div className="glass-card p-8 border border-slate-700/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent"></div>
                  <div className="flex justify-between items-end mb-8">
                     <div>
                        <div className="text-slate-500 font-mono text-xs mb-1">NET ASSET VALUE</div>
                        <div className="text-4xl font-bold text-white">$48,291,004.00</div>
                     </div>
                     <div className="text-green-500 font-mono text-sm">+2.4% ▲</div>
                  </div>
                  <div className="space-y-3">
                     {[80, 65, 90, 75].map((w, i) => (
                        <div key={i} className="h-2 bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${w}%` }}
                              transition={{ duration: 1, delay: i * 0.2 }}
                              className="h-full bg-amber-500"
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="order-1 lg:order-2"
            >
               <h2 className="text-4xl md:text-5xl font-bold mb-6">Financial Clarity.</h2>
               <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Advanced data visualization for complex financial structures. Track premiums, payouts, and dividends with military-grade precision.
               </p>
               <ul className="space-y-4 font-mono text-sm text-slate-300">
                  {['> REAL-TIME MARKET DATA', '> PREDICTIVE REVENUE MODELING', '> AUTOMATED COMPLIANCE CHECKS'].map((item, i) => (
                     <li key={i} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-amber-500 mr-3"></span>
                        {item}
                     </li>
                  ))}
               </ul>
               
               <div className="mt-8">
                  <Link to="/pricing" className="text-amber-500 hover:text-white font-mono flex items-center group text-sm tracking-widest">
                     EXPLORE ANALYTICS <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
               </div>
            </motion.div>
         </div>
      </Section>

      {/* CTA Section */}
      <Section className="border-t border-white/10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">
            READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">UPGRADE?</span>
          </h2>
          <Link 
            to="/login"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-black transition-all bg-white rounded-full hover:bg-slate-200 hover:scale-105 group"
          >
            Access Portal
            <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </Link>
        </motion.div>
  </Section>

      <Footer />
    </div>
  );
};

export default LandingPage;