import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import Landing3DScene from '../components/Landing3DScene';
import Footer from '../components/Footer';
import HeroDashboardMockup from '../components/HeroDashboardMockup';

const Section = ({ children, className }) => (
  <section className={`min-h-screen flex items-center justify-center relative z-10 p-8 ${className}`}>
    {children}
  </section>
);

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */
const useAnimatedCounter = (end, duration = 2000, startOnView = false) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const start = () => {
    if (hasStarted) return;
    setHasStarted(true);
  };

  useEffect(() => {
    if (!hasStarted) return;
    let startTime = null;
    let rafId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [hasStarted, end, duration]);

  return { count, start };
};

/* ------------------------------------------------------------------ */
/*  Stat Counter Card                                                  */
/* ------------------------------------------------------------------ */
const StatCard = ({ value, suffix, label, duration }) => {
  const { count, start } = useAnimatedCounter(value, duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      onViewportEnter={start}
      className="flex flex-col items-center px-6 py-4"
    >
      <span className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tight">
        {suffix === '₹' && '₹'}
        {count.toLocaleString('en-IN')}
        {suffix && suffix !== '₹' && suffix}
      </span>
      <span className="text-slate-400 text-sm font-mono mt-2 tracking-wider uppercase">{label}</span>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */
const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  /* -- Company logos for social proof -- */
  const companies = [
    'FORTUNE LIFE',
    'GLOBAL RE',
    'PACIFIC MUTUAL',
    'STERLING TRUST',
    'NEXUS CAPITAL',
    'ATLAS SECURE',
  ];

  /* -- Stats data -- */
  const stats = [
    { value: 75, suffix: 'L+', prefix: '₹', label: 'Assets Managed' },
    { value: 5, suffix: 'M+', label: 'Policyholders' },
    { value: 99, suffix: '.99%', label: 'Uptime' },
    { value: 170, suffix: '+', label: 'Years' },
  ];

  /* -- How-it-works steps -- */
  const steps = [
    {
      num: '01',
      title: 'Connect Your Data',
      description: 'Securely integrate your existing policy databases, financial feeds, and third-party data sources into a unified pipeline.',
      icon: (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'AI Analyzes Risk',
      description: 'Our engine processes millions of data points in real time, evaluating exposure, market conditions, and actuarial models.',
      icon: (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Automate Renewals',
      description: 'Policies are renewed, adjusted, and delivered automatically -- reducing cycle time from weeks to minutes.',
      icon: (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992" />
        </svg>
      ),
    },
  ];

  /* -- Testimonials data -- */
  const testimonials = [
    {
      quote: 'MassMutual Renewal has cut our policy renewal cycle by 73%. What used to take our team weeks now completes in hours with higher accuracy and zero manual intervention.',
      name: 'Sarah Chen',
      title: 'VP of Operations',
      company: 'Fortune Life',
    },
    {
      quote: 'The AI-driven risk engine is nothing short of transformative. It identifies exposure patterns our actuaries would take months to uncover, giving us a genuine competitive edge.',
      name: 'Marcus Webb',
      title: 'CTO',
      company: 'Global Reinsurance',
    },
    {
      quote: 'Real-time risk analytics across our entire portfolio changed how we approach underwriting. Our loss ratios improved by 18% in the first quarter after deployment.',
      name: 'Diana Frost',
      title: 'Head of Risk',
      company: 'Pacific Mutual',
    },
  ];

  return (
    <div className="relative bg-black text-white selection:bg-blue-500/30">
      <Landing3DScene />
      <Navbar />

      {/* ============================================================ */}
      {/* Hero Section                                                  */}
      {/* ============================================================ */}
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
            <HeroDashboardMockup />
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/* Trusted By / Social Proof Bar                                 */}
      {/* ============================================================ */}
      <section className="relative z-10 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-8">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-slate-500 font-mono text-xs tracking-[0.3em] uppercase mb-12"
          >
            Trusted by Industry Leaders
          </motion.p>

          <div className="glass-panel px-8 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {companies.map((name, i) => (
              <motion.span
                key={name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="font-mono text-sm md:text-base tracking-[0.2em] text-slate-400 hover:text-white transition-colors duration-300 cursor-default select-none whitespace-nowrap"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Live Stats Ticker                                             */}
      {/* ============================================================ */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card border border-slate-700/50 overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-700/50 divide-y md:divide-y-0">
              {stats.map((stat, i) => (
                <StatCard
                  key={i}
                  value={stat.value}
                  suffix={stat.prefix === '₹' ? '₹' : stat.suffix}
                  label={stat.label}
                  duration={2000 + i * 300}
                />
              ))}
            </div>

            {/* suffix label bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-700/50">
              {stats.map((stat, i) => (
                <div key={i} className="text-center py-2">
                  <span className="font-mono text-xs text-slate-600">
                    {stat.prefix === '₹' ? `₹${stat.value}${stat.suffix}` : `${stat.value}${stat.suffix}`}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Intelligent Policy Core                                       */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* How It Works                                                  */}
      {/* ============================================================ */}
      <section className="relative z-10 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Three steps from raw data to fully automated, AI-optimized renewals.</p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Dashed connector line (visible on md+) */}
            <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] border-t-2 border-dashed border-slate-700/60" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Numbered circle */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6">
                  <span className="font-mono text-blue-400 font-bold text-sm">{step.num}</span>
                </div>

                {/* Icon */}
                <div className="mb-4">
                  {step.icon}
                </div>

                <h3 className="text-xl font-bold mb-3 font-mono">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Financial Clarity                                             */}
      {/* ============================================================ */}
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
                        <div className="text-4xl font-bold text-white">₹4,82,91,004.00</div>
                     </div>
                     <div className="text-green-500 font-mono text-sm">+2.4% &#9650;</div>
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

      {/* ============================================================ */}
      {/* Testimonials                                                  */}
      {/* ============================================================ */}
      <section className="relative z-10 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">What Leaders Say</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Hear from the executives transforming their organizations with our platform.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-panel p-8 flex flex-col justify-between hover:bg-slate-900/40 transition-colors border-t-2 border-transparent hover:border-blue-500/50"
              >
                {/* Quote icon */}
                <div>
                  <span className="text-5xl leading-none text-blue-500/30 font-serif select-none">&ldquo;</span>
                  <p className="text-slate-300 text-sm leading-relaxed mt-2 mb-8">
                    {t.quote}
                  </p>
                </div>

                {/* Attribution */}
                <div>
                  {/* 5-star rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs font-mono mt-1">{t.title}, {t.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA Section                                                   */}
      {/* ============================================================ */}
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
