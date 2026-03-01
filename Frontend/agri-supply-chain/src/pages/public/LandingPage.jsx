import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useLenis from '../../hooks/useLenis';
import { useDarkMode } from '../../hooks/useDarkMode';
import {
  Sprout, Truck, Shield, CheckCircle, QrCode, Package,
  ShoppingCart, Github, Twitter, ChevronDown, ArrowRight,
  Database, Zap, Search, Eye, ExternalLink, Activity, Info, User,
  Globe, Clock, MapPin, Award, Box, Loader2
} from 'lucide-react';
import PublicTopNav from '../../components/layout/PublicTopNav';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import heroBg from '../../assets/hero_farmland_bg.png';

const LandingPage = () => {
  useLenis();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [isDark] = useDarkMode();

  useEffect(() => {
    if (isAuthenticated && role) navigate(`/${role.toLowerCase()}/dashboard`);
  }, [isAuthenticated, role, navigate]);

  const HeroSection = () => (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Farmland Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-950/90 dark:to-slate-950/95 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md text-emerald-300 rounded-full text-[10px] md:text-xs font-black mb-8 border border-white/20 tracking-widest uppercase">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Trusted by 10,000+ Farmers Across India
          </div>

          <h1 className="text-4xl md:text-8xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
            From Farm to Fork,<br />
            <span className="text-emerald-400">Every Step Verified</span>
          </h1>

          <p className="text-slate-200 text-base md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium opacity-90">
            AgriChain creates unbreakable trust in India's agricultural supply chain. Track, verify, and prove the journey of every harvest with tamper-proof records.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/role-selection"
              className="group w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-600/40 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              Get Started
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-white/50" />
        </motion.div>
      </div>
    </section>
  );

  const StakeholderMesh = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Dynamic coordinates for responsiveness
    const stakeholders = isMobile ? [
      { id: 'farmer', label: 'Farmer', icon: Sprout, x: 50, y: 15 },
      { id: 'transporter', label: 'Transporter', icon: Truck, x: 80, y: 35 },
      { id: 'distributor', label: 'Distributor', icon: Package, x: 80, y: 65 },
      { id: 'retailer', label: 'Retailer', icon: ShoppingCart, x: 20, y: 65 },
      { id: 'consumer', label: 'Consumer', icon: User, x: 20, y: 35 },
      { id: 'admin', label: 'QC', icon: Shield, x: 50, y: 50 },
    ] : [
      { id: 'farmer', label: 'Farmer', icon: Sprout, x: 50, y: 20 },
      { id: 'transporter', label: 'Transporter', icon: Truck, x: 80, y: 50 },
      { id: 'distributor', label: 'Distributor', icon: Package, x: 65, y: 85 },
      { id: 'retailer', label: 'Retailer', icon: ShoppingCart, x: 35, y: 85 },
      { id: 'consumer', label: 'Consumer', icon: User, x: 20, y: 50 },
      { id: 'admin', label: 'Quality Control', icon: Shield, x: 50, y: 53 },
    ];

    const connections = [
      ['farmer', 'transporter'], ['transporter', 'distributor'],
      ['distributor', 'retailer'], ['retailer', 'consumer'],
      ['farmer', 'admin'], ['transporter', 'admin'],
      ['distributor', 'admin'], ['retailer', 'admin']
    ];

    return (
      <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 relative h-[500px] md:h-[600px]">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-30">
            {connections.map(([from, to], idx) => {
              const startNode = stakeholders.find(s => s.id === from);
              const endNode = stakeholders.find(s => s.id === to);

              return (
                <motion.line
                  key={`${idx}-${isMobile}`}
                  x1={`${startNode.x}%`} y1={`${startNode.y}%`}
                  x2={`${endNode.x}%`} y2={`${endNode.y}%`}
                  stroke="currentColor" strokeWidth="1"
                  className="text-emerald-600 dark:text-emerald-500"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: idx * 0.1 }}
                />
              );
            })}
          </svg>

          {stakeholders.map((s, idx) => (
            <motion.div
              key={`${s.id}-${isMobile}`}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: idx * 0.1 }}
              className="absolute group"
              style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-50 dark:bg-slate-900 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.05)] md:shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:border-emerald-500 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all cursor-crosshair">
                  <s.icon className="w-6 h-6 md:w-10 md:h-10" />
                </div>
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{s.label}</span>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-xs">
              <h3 className="text-emerald-500/10 dark:text-emerald-400/20 text-3xl md:text-4xl font-black uppercase tracking-[0.2em] select-none">Consensus</h3>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const VerticalTimeline = () => {
    const steps = [
      {
        title: 'Harvest',
        role: 'Farmer',
        icon: Sprout,
        desc: 'Farmers create verified batches with images and location data. Every harvest is recorded with immutable proof of origin.',
        color: 'bg-emerald-500',
        lightBg: 'bg-emerald-50',
        darkBg: 'bg-emerald-900/10'
      },
      {
        title: 'Quality Inspection',
        role: 'Inspector',
        icon: Shield,
        desc: 'Certified inspectors verify quality and safety. Approval locks all previous records, ensuring data integrity.',
        color: 'bg-blue-500',
        lightBg: 'bg-blue-50',
        darkBg: 'bg-blue-900/10'
      },
      {
        title: 'Transport',
        role: 'Transporter',
        icon: Truck,
        desc: 'Transporters document pickup and delivery with timestamped images. Movement is tracked in real-time.',
        color: 'bg-amber-500',
        lightBg: 'bg-amber-50',
        darkBg: 'bg-amber-900/10'
      },
      {
        title: 'Storage & Processing',
        role: 'Distributor',
        icon: Package,
        desc: 'Storage conditions are monitored and recorded. Any handling is added to the product\'s permanent history.',
        color: 'bg-purple-500',
        lightBg: 'bg-purple-50',
        darkBg: 'bg-purple-900/10'
      },
      {
        title: 'Retail Distribution',
        role: 'Retailer',
        icon: ShoppingCart,
        desc: 'Retailers receive verified products with complete journey history. Pricing and shelf placement are logged.',
        color: 'bg-pink-500',
        lightBg: 'bg-pink-50',
        darkBg: 'bg-pink-900/10'
      },
      {
        title: 'Consumer Verification',
        role: 'Consumer',
        icon: User,
        desc: 'Consumers scan QR codes to see the complete journey. Trust is built through transparency and real data.',
        color: 'bg-indigo-500',
        lightBg: 'bg-indigo-50',
        darkBg: 'bg-indigo-900/10'
      }
    ];

    return (
      <section className="py-24 md:py-32 bg-[#F9F7F2] dark:bg-slate-950 relative bg-dot-grid dark:bg-dot-grid-dark transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 md:mb-32">
            <span className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-200 dark:border-amber-800/50 mb-6">
              Farm to Fork Journey
            </span>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
              Every Step, <span className="text-amber-600 dark:text-amber-500">Verified & Trusted</span>
            </h2>
            <p className="mt-8 text-slate-600 dark:text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-medium">
              Follow your food's complete journey from farm to table. Each step is permanently recorded, creating an unbreakable chain of trust.
            </p>
          </div>

          <div className="relative">
            {/* Center Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-amber-200 dark:bg-amber-900/30 md:-translate-x-1/2 rounded-full"></div>

            <div className="space-y-12 md:space-y-24 relative">
              {steps.map((step, idx) => {
                const isEven = idx % 2 === 0;
                const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

                return (
                  <div key={idx} ref={ref} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Content Card */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`w-full md:w-[45%] pl-12 md:pl-0 ${isEven ? 'md:text-left' : 'md:text-left text-left'}`}
                    >
                      <div className={`p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl md:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-800 ${step.lightBg} dark:${step.darkBg} group hover:-translate-y-2`}>
                        <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${step.color} text-white flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform`}>
                            <step.icon className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/50">STEP {idx + 1}</span>
                            <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium mb-6">
                          {step.desc}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          <User className="w-3 h-3 md:w-4 md:h-4" />
                          Primary Actor: {step.role}
                        </div>
                      </div>
                    </motion.div>

                    {/* Timeline Node */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white dark:border-slate-950 z-10 shadow-[0_0_15px_rgba(212,163,115,0.5)]"></div>

                    {/* Spacer for other side */}
                    <div className="hidden md:block w-[45%]"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const TraceSection = () => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    return (
      <section id="trace" className="py-24 md:py-32 bg-white dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1 }}
              className="flex-1 text-center lg:text-left"
            >
              <span className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-200 dark:border-emerald-800/50 mb-8">
                Consumer Verification
              </span>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter mb-8">
                Seeing is <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 italic">Believing</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-2xl mb-12 leading-relaxed font-medium">
                Scan any QR code on an AgriChain product to unveil its journey. From seeds to shipment, trust is just a scan away.
              </p>
              <Link
                to="/consumer/trace"
                className="inline-flex items-center gap-4 px-10 md:px-12 py-5 md:py-6 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-black rounded-[2rem] transition-all shadow-2xl hover:-translate-y-1 group"
              >
                Trace Now
                <ExternalLink className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="flex-1 w-full max-w-lg mx-auto"
            >
              <div className="relative">
                {/* Floating Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 md:p-6 rounded-[3rem] md:rounded-[4rem] backdrop-blur-xl border border-slate-200 dark:border-white/5 relative z-10 shadow-2xl">
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs tracking-widest mb-2">BATCH #AC-2024-001</div>
                        <div className="text-slate-950 dark:text-white text-2xl md:text-3xl font-black tracking-tight">Kashmiri Saffron</div>
                      </div>
                      <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black border border-emerald-200 dark:border-emerald-500/20">VERIFIED</div>
                    </div>

                    <div className="space-y-6 mb-12">
                      {[
                        { label: 'Harvested', sub: 'Budgam, J&K', icon: Sprout },
                        { label: 'Quality Pass', sub: '99.8% Purity', icon: Shield },
                        { label: 'In Transit', sub: 'En route to Delhi', icon: Truck },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-slate-900 dark:text-white font-black text-sm">{item.label}</div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold">{item.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center group cursor-pointer relative">
                      <div className="p-8 bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-0 rotate-2 border border-slate-100">
                        <QrCode className="w-24 h-24 md:w-32 md:h-32 text-slate-900" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black shadow-lg">SCAN TO VERIFY</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  const Footer = () => (
    <footer className="bg-slate-950 text-white py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform shadow-xl shadow-emerald-600/20">F2F</div>
              <span className="text-3xl font-black text-white tracking-tighter">AgriChain</span>
            </Link>
            <p className="text-slate-400 font-medium mb-10 leading-relaxed">
              Empowering India's agriculture through blockchain transparency. From soil to soul, we verify every step.
            </p>
            <div className="flex gap-4">
              {[Github, Twitter].map((Icon, i) => (
                <button key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Platform</h4>
            <ul className="space-y-4 text-slate-400 font-bold text-sm">
              <li><Link to="/role-selection" className="hover:text-emerald-400 transition-colors">Stakeholders</Link></li>
              <li><Link to="/consumer/portal" className="hover:text-emerald-400 transition-colors">Marketplace</Link></li>
              <li><Link to="/consumer/trace" className="hover:text-emerald-400 transition-colors">Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Legal</h4>
            <ul className="space-y-4 text-slate-400 font-bold text-sm">
              <li><Link to="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-emerald-400 transition-colors">Blockchain Ethics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Infrastructure</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                <Globe className="w-4 h-4 text-emerald-500" /> Distributed Mainnet
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                <Clock className="w-4 h-4 text-emerald-500" /> 99.9% Uptime
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                <Award className="w-4 h-4 text-emerald-500" /> Certified Secure
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 font-black text-sm tracking-tight italic">© 2024 F2F • Handcrafted for Bharat</p>
          <div className="flex gap-10 text-[10px] font-black uppercase text-slate-600 tracking-widest">
            <Link to="#" className="hover:text-emerald-500">Security Audit</Link>
            <Link to="#" className="hover:text-emerald-400">Node Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-500 selection:bg-emerald-500 selection:text-white overflow-hidden">
      <PublicTopNav />
      <HeroSection />
      <StakeholderMesh />
      <VerticalTimeline />
      <TraceSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
