import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Heart, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const CoverPage = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-[#0a0a0c] text-white">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Users/srishtinautiyal/.gemini/antigravity/brain/41aae795-5dbe-4648-a59f-c17e15cf1a49/queue_hero_abstract_1782364582536.png" 
          alt="Clinic Hero" 
          className="w-full h-full object-cover opacity-20 bg-blend-soft-light"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-transparent to-[#0a0a0c]" />
      </div>

      {/* Floating Blobs for Dynamic feel */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-cyan/10 blur-[100px] rounded-full"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-purple/10 blur-[100px] rounded-full"
      />

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl w-full px-6 flex flex-col items-center text-center gap-12">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <ShieldCheck size={16} className="text-accent-cyan" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Advanced Healthcare Sync</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
            QUEUE <span className="gradient-text non-italic">CURE</span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-white/50 font-medium leading-relaxed">
            Eliminating clinical friction with real-time digital synchronization. 
            The professional standard for patient flow management in <span className="text-white italic">modern clinics</span>.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl pt-8">
          <Link to="/receptionist" className="group">
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass p-10 flex flex-col gap-6 text-left border-white/5 hover:border-accent-cyan/30 transition-all cursor-pointer h-full relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Zap size={150} />
              </div>
              <div className="p-4 bg-accent-cyan/10 rounded-2xl w-fit group-hover:bg-accent-cyan/20 transition-all">
                <Shield className="text-accent-cyan" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                  Staff Control Panel <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </h3>
                <p className="text-secondary text-sm font-medium leading-relaxed">
                  Manage patient registration, clinical routing, and queue flow with institutional precision.
                </p>
              </div>
            </motion.div>
          </Link>

          <Link to="/patient" className="group">
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass p-10 flex flex-col gap-6 text-left border-white/5 hover:border-accent-purple/30 transition-all cursor-pointer h-full relative overflow-hidden"
            >
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Heart size={150} />
              </div>
              <div className="p-4 bg-accent-purple/10 rounded-2xl w-fit group-hover:bg-accent-purple/20 transition-all">
                <Activity className="text-accent-purple" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                  Patient Terminal <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </h3>
                <p className="text-secondary text-sm font-medium leading-relaxed">
                  High-fidelity waiting room display with real-time ETAs and personalized token tracking.
                </p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-12 mt-10 md:mt-20 opacity-20 grayscale border-t border-white/5 pt-10"
        >
          <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest">
            <ShieldCheck size={20} /> Data Secure
          </div>
          <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest">
            <Zap size={20} /> Instant Sync
          </div>
          <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest">
            <Activity size={20} /> Live Stats
          </div>
        </motion.div>
      </div>

      {/* Decorative Lines */}
      <div className="fixed top-0 left-1/4 w-[1px] h-full bg-white/5 z-0" />
      <div className="fixed top-0 right-1/4 w-[1px] h-full bg-white/5 z-0" />
    </div>
  );
};

export default CoverPage;
