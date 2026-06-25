import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ChevronRight, Stethoscope, Activity, Sparkles, Search } from 'lucide-react';

const PatientView = ({ queueData }) => {
  const { queue = [], current = null, settings = {} } = queueData;
  const [personalToken, setPersonalToken] = useState('');
  
  const myStatus = queue.find(p => p.token === parseInt(personalToken));
  const myIndex = myStatus ? queue.findIndex(p => p._id === myStatus._id) : -1;

  return (
    <div className="flex flex-col gap-10 items-center py-10 px-4 max-w-6xl mx-auto">
      {/* 1. Header & Live Status */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/30 w-fit">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">OPD Session: Live</span>
          </div>
          <h2 className="text-3xl font-black text-white px-1">Waiting Room <span className="text-white/20">Display</span></h2>
        </div>

        {/* Personalized Token Tracker */}
        <div className="glass p-2 pl-6 rounded-2xl flex items-center gap-4 border border-white/5 focus-within:border-accent-cyan/30 transition-all">
          <Search className="text-white/20" size={18} />
          <input 
            className="bg-transparent border-none outline-none text-sm font-bold w-48 placeholder:text-white/10"
            placeholder="Track your Token #"
            value={personalToken}
            onChange={e => setPersonalToken(e.target.value)}
          />
          <div className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-secondary">Search</div>
        </div>
      </div>

      {/* 2. Personal Token Status (Conditional) */}
      <AnimatePresence>
        {myStatus && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full bg-accent-cyan/10 border-2 border-accent-cyan/30 p-8 rounded-[40px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Sparkles size={120} className="text-accent-cyan" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-4 text-center md:text-left">
                  <p className="text-xs font-black text-accent-cyan uppercase tracking-[0.3em]">Your Individual Status</p>
                  <h3 className="text-5xl font-black text-white">Hello, {myStatus.name}</h3>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                     <div className="bg-accent-cyan/20 px-4 py-2 rounded-xl border border-accent-cyan/20 flex items-center gap-2">
                        <Users size={16} className="text-accent-cyan" />
                        <span className="text-sm font-bold text-white">{myIndex} Patients Ahead</span>
                     </div>
                     <div className="bg-accent-cyan/20 px-4 py-2 rounded-xl border border-accent-cyan/20 flex items-center gap-2">
                        <Clock size={16} className="text-accent-cyan" />
                        <span className="text-sm font-bold text-white">~{myIndex * (settings.averageConsultationTime || 8)} Mins Wait</span>
                     </div>
                  </div>
               </div>
               <div className="text-center md:text-right space-y-2">
                  <p className="text-[10px] font-black text-accent-cyan uppercase tracking-widest">Assign Specialist</p>
                  <p className="text-3xl font-black text-white">{myStatus.assignedDoctor || 'Pending specialists...'}</p>
                  <p className="text-sm font-medium text-white/50">{myStatus.issue || 'Analyzing case...'}</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Hero Card - Now Serving */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full">
        <div className="lg:col-span-8 space-y-6">
          <div className="glass rounded-[50px] p-16 flex flex-col items-center text-center gap-8 relative overflow-hidden group min-h-[500px] justify-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-cyan/5 blur-[120px] group-hover:bg-accent-cyan/10 transition-all duration-1000" />
            
            <p className="text-secondary uppercase tracking-[0.5em] font-black text-sm">Now Serving</p>
            <AnimatePresence mode="wait">
              <motion.div 
                key={current?.token || 'idle'}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <h2 className="text-[18rem] font-black gradient-text leading-none transition-all tabular-nums tracking-tighter">
                  {current?.token ? String(current.token).padStart(2, '0') : '--'}
                </h2>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-4 -right-8"
                >
                  <Activity className="text-accent-cyan/20" size={80} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            
            {current && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 items-center"
              >
                <div className="px-8 py-3 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-5xl font-black tracking-tight">{current.name}</p>
                </div>
                <div className="flex items-center gap-3 text-accent-cyan font-black bg-accent-cyan/10 px-6 py-2.5 rounded-full border border-accent-cyan/20 text-sm uppercase tracking-widest">
                   <Stethoscope size={20} />
                   <span>Doctor: {current.assignedDoctor || 'Specialist'}</span>
                </div>
              </motion.div>
            )}
            {!current && (
              <p className="text-xl font-bold text-white/10 uppercase tracking-[0.2em] italic">Operational Standby...</p>
            )}
          </div>

          {/* Logic-based Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-10 flex flex-col gap-4 items-center text-center border-white/5 group hover:border-accent-cyan/30 transition-all">
              <div className="p-5 bg-accent-cyan/10 rounded-3xl group-hover:scale-110 transition-transform">
                <Clock className="text-accent-cyan" size={40} />
              </div>
              <div className="space-y-1">
                <p className="text-secondary text-[10px] uppercase font-black tracking-[0.3em]">Est. Average Wait</p>
                <h4 className="text-5xl font-black tracking-tighter tabular-nums">
                  {queue.length * (settings.averageConsultationTime || 8)} <span className="text-xl text-secondary/30 font-bold">m</span>
                </h4>
              </div>
            </div>
            <div className="glass p-10 flex flex-col gap-4 items-center text-center border-white/5 group hover:border-accent-purple/30 transition-all">
              <div className="p-5 bg-accent-purple/10 rounded-3xl group-hover:scale-110 transition-transform">
                <Users className="text-accent-purple" size={40} />
              </div>
              <div className="space-y-1">
                <p className="text-secondary text-[10px] uppercase font-black tracking-[0.3em]">Total Pipeline</p>
                <h4 className="text-5xl font-black tracking-tighter tabular-nums">{queue.length}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Upcoming Queue List (Sidebar) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase text-secondary tracking-widest flex items-center gap-3">
              Upcoming <ChevronRight size={14} className="text-secondary" />
            </h3>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter bg-white/5 px-2 py-1 rounded-md">LIVE SYNC</span>
          </div>

          <div className="flex flex-col gap-4 max-h-[1000px] overflow-y-auto pr-2 scrollbar-hide">
            <AnimatePresence initial={false}>
              {queue.slice(0, 8).map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={p._id} 
                  className={`glass p-6 flex flex-col gap-4 group hover:bg-white/[0.03] transition-all border border-white/5 ${p.token === parseInt(personalToken) ? 'border-accent-cyan/50 bg-accent-cyan/5' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-4xl font-black text-white/5 group-hover:text-accent-cyan/20 transition-colors">#{String(p.token).padStart(2, '0')}</span>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-1">Clinic ETA</p>
                       <p className="text-lg font-black text-white tabular-nums">
                         {new Date(Date.now() + (i * (settings.averageConsultationTime || 8) * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                       </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl font-bold text-white group-hover:text-accent-cyan transition-colors">{p.name}</p>
                    <div className="flex flex-wrap gap-2">
                       <span className="text-[9px] font-black text-accent-cyan/60 uppercase tracking-widest bg-accent-cyan/5 px-2 py-1 rounded-md flex items-center gap-1">
                         <Stethoscope size={10} /> {p.assignedDoctor?.split(' ')?.[1] || 'Specialist'}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {queue.length === 0 && !current && (
              <div className="text-center text-secondary/20 py-32 glass border-2 border-dashed border-white/5 rounded-[40px]">
                 <Users size={64} className="mx-auto mb-4 opacity-10" />
                 <p className="text-xs font-black uppercase tracking-widest">No Active Sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientView;
