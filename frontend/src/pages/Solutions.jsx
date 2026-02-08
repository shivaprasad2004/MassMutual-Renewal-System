import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, Octahedron, PerspectiveCamera } from '@react-three/drei';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Landing3DScene from '../components/Landing3DScene';
import { FaServer, FaBrain, FaShieldAlt, FaIndustry, FaHospital, FaHome, FaBriefcase, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// 3D Vector Diagram for Solutions - Concentric Circles
const SolutionRings = () => {
  const group = useRef();
  
  useFrame((state) => {
    group.current.rotation.x = state.clock.elapsedTime * 0.1;
    group.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <group ref={group} position={[4, 0, 0]}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <Torus args={[2, 0.02, 16, 100]} rotation={[1.5, 0, 0]}>
           <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </Torus>
        <Torus args={[1.5, 0.02, 16, 100]} rotation={[0, 1.5, 0]}>
           <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} />
        </Torus>
        <Torus args={[2.5, 0.02, 16, 100]} rotation={[0.5, 0.5, 0]}>
           <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </Torus>
        <Octahedron args={[0.5]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#3b82f6" wireframe />
        </Octahedron>
      </Float>
    </group>
  );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:text-blue-400 transition-colors"
            >
                <span className="font-bold text-lg">{question}</span>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-400 leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Solutions = () => {
  return (
    <div className="relative bg-black text-white selection:bg-blue-500/30 overflow-hidden">
      <Landing3DScene />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
           <PerspectiveCamera makeDefault position={[0, 0, 10]} />
           <ambientLight intensity={0.5} />
           <SolutionRings />
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
          <h1 className="text-6xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Enterprise <br /> <span className="text-white">Solutions.</span>
          </h1>

          <div className="prose prose-invert prose-lg text-slate-300 max-w-4xl">
            <p className="text-xl leading-relaxed">
              We provide end-to-end policy management infrastructure for modern insurers. From automated underwriting to claims processing, our solutions are architected for scale, security, and speed.
            </p>
          </div>
        </motion.div>

        {/* Core Solutions Grid */}
        <div className="space-y-24 mb-32">
            {/* Solution 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="glass-panel p-8 border-t-4 border-blue-500">
                  <div className="text-blue-500 font-mono text-sm mb-2 flex items-center"><FaServer className="mr-2"/> 01 // CORE INFRASTRUCTURE</div>
                  <h2 className="text-3xl font-bold mb-4">Cloud-Native Policy Engine</h2>
                  <p className="text-slate-400 mb-6">
                    Move beyond legacy mainframes. Our microservices-based architecture allows for infinite scalability. Deploy new products in days, not months.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300 font-mono">
                     <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 mr-2 rounded-full"></span>99.999% Uptime SLA</li>
                     <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 mr-2 rounded-full"></span>Geo-Redundant Storage</li>
                     <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 mr-2 rounded-full"></span>Auto-Scaling Clusters</li>
                  </ul>
               </div>
               <div className="relative h-64 w-full bg-gradient-to-br from-blue-900/20 to-black rounded-lg border border-blue-500/20 flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
                     {[...Array(64)].map((_, i) => (
                        <div key={i} className="border border-blue-500/30"></div>
                     ))}
                  </div>
                  <div className="text-blue-500 font-mono text-2xl tracking-widest group-hover:scale-110 transition-transform duration-500">SERVERLESS ARCHITECTURE</div>
               </div>
            </div>

            {/* Solution 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="order-2 lg:order-1 relative h-64 w-full bg-gradient-to-br from-amber-900/20 to-black rounded-lg border border-amber-500/20 flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-40 h-40 border-2 border-amber-500/30 rounded-full animate-ping"></div>
                     <div className="w-32 h-32 border-2 border-amber-500/50 rounded-full absolute animate-pulse"></div>
                  </div>
                  <div className="text-amber-500 font-mono text-2xl tracking-widest relative z-10 group-hover:scale-110 transition-transform duration-500">PREDICTIVE AI</div>
               </div>
               <div className="order-1 lg:order-2 glass-panel p-8 border-t-4 border-amber-500">
                  <div className="text-amber-500 font-mono text-sm mb-2 flex items-center"><FaBrain className="mr-2"/> 02 // INTELLIGENCE</div>
                  <h2 className="text-3xl font-bold mb-4">AI-Driven Risk Assessment</h2>
                  <p className="text-slate-400 mb-6">
                    Leverage billions of data points to price risk more accurately. Our machine learning models adapt in real-time to changing market conditions.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300 font-mono">
                     <li className="flex items-center"><span className="w-2 h-2 bg-amber-500 mr-2 rounded-full"></span>Sub-second Underwriting</li>
                     <li className="flex items-center"><span className="w-2 h-2 bg-amber-500 mr-2 rounded-full"></span>Fraud Detection Neural Net</li>
                     <li className="flex items-center"><span className="w-2 h-2 bg-amber-500 mr-2 rounded-full"></span>Behavioral Analysis</li>
                  </ul>
               </div>
            </div>

            {/* Solution 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="glass-panel p-8 border-t-4 border-green-500">
                  <div className="text-green-500 font-mono text-sm mb-2 flex items-center"><FaShieldAlt className="mr-2"/> 03 // SECURITY</div>
                  <h2 className="text-3xl font-bold mb-4">Smart Contract Renewals</h2>
                  <p className="text-slate-400 mb-6">
                    Automate the entire lifecycle of a policy. Smart contracts on our private blockchain ensure transparency and immutable record keeping.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300 font-mono">
                     <li className="flex items-center"><span className="w-2 h-2 bg-green-500 mr-2 rounded-full"></span>Zero-Touch Renewals</li>
                     <li className="flex items-center"><span className="w-2 h-2 bg-green-500 mr-2 rounded-full"></span>Audit-Ready Ledgers</li>
                     <li className="flex items-center"><span className="w-2 h-2 bg-green-500 mr-2 rounded-full"></span>Automated Compliance</li>
                  </ul>
               </div>
               <div className="relative h-64 w-full bg-gradient-to-br from-green-900/20 to-black rounded-lg border border-green-500/20 flex items-center justify-center overflow-hidden group">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                   <div className="text-green-500 font-mono text-2xl tracking-widest group-hover:scale-110 transition-transform duration-500">BLOCKCHAIN LEDGER</div>
               </div>
            </div>
        </div>

        {/* Industries Section */}
        <div className="mb-32">
            <h2 className="text-3xl font-bold mb-12 text-center">Industries <span className="text-slate-500">Served</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: <FaIndustry />, name: "Commercial Liability", desc: "For large-scale manufacturing and industrial risks." },
                    { icon: <FaHospital />, name: "Health & Life", desc: "Group policies and individual term life management." },
                    { icon: <FaHome />, name: "Property & Casualty", desc: "Real estate portfolios and personal property coverage." },
                    { icon: <FaBriefcase />, name: "Wealth Management", desc: "Annuities and long-term investment vehicles." }
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="glass-panel p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                    >
                        <div className="text-3xl text-slate-300 mb-4">{item.icon}</div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Technology Stack Section */}
        <div className="mb-32">
            <h2 className="text-3xl font-bold mb-12 text-center">Technology <span className="text-amber-400">Stack</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    "React 19", "Three.js", "Node.js", "GraphQL",
                    "Docker", "Kubernetes", "PostgreSQL", "Redis",
                    "TensorFlow", "Kafka", "AWS Lambda", "Terraform"
                ].map((tech, i) => (
                    <div key={i} className="p-4 border border-white/10 rounded-lg text-center font-mono text-sm text-slate-400 hover:text-white hover:border-blue-500 transition-colors">
                        {tech}
                    </div>
                ))}
            </div>
        </div>

        {/* Case Studies Section */}
        <div className="mb-32">
             <h2 className="text-3xl font-bold mb-12 text-center">Success <span className="text-green-500">Stories</span></h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-2xl border-l-4 border-green-500">
                    <h3 className="text-2xl font-bold text-white mb-2">Fortune 500 Insurer</h3>
                    <p className="text-green-400 font-mono text-sm mb-4">Reduced Claims Processing Time by 70%</p>
                    <p className="text-slate-400 leading-relaxed">
                        By implementing our AI-driven risk assessment engine, this client automated 85% of their low-value claims, freeing up adjusters to focus on complex cases.
                    </p>
                </div>
                <div className="glass-panel p-8 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-2xl font-bold text-white mb-2">Global Reinsurance Firm</h3>
                    <p className="text-blue-400 font-mono text-sm mb-4">Zero Downtime Migration</p>
                    <p className="text-slate-400 leading-relaxed">
                        Migrated 50 million policy records from a 40-year-old mainframe to our cloud-native infrastructure with zero data loss and no service interruption.
                    </p>
                </div>
             </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold mb-12 text-center">Technical <span className="text-blue-500">FAQ</span></h2>
            <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <FAQItem 
                    question="Can we deploy on-premise?" 
                    answer="Yes, our Enterprise tier supports full on-premise deployment via Docker containers or Kubernetes clusters, fully air-gapped if necessary." 
                />
                <FAQItem 
                    question="How do you handle data migration?" 
                    answer="We provide a dedicated migration team and automated ETL tools to ingest data from legacy systems (Mainframes, Excel, SQL) with 99.9% accuracy guarantees." 
                />
                <FAQItem 
                    question="Is the API REST or GraphQL?" 
                    answer="We offer both. Our core transactional API is RESTful for compatibility, while our data querying layer uses GraphQL for flexible, efficient data retrieval." 
                />
                <FAQItem 
                    question="What compliance standards do you meet?" 
                    answer="We are SOC2 Type II certified, HIPAA compliant, and adhere to GDPR/CCPA regulations. All data is encrypted at rest and in transit." 
                />
            </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Solutions;