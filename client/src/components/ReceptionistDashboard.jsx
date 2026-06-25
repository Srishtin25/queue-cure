import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Settings, Clock, Users, Trash2, Search, Download, CheckCircle, Activity, ChevronRight, Stethoscope, Play, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const ReceptionistDashboard = ({ socket, queueData, addToast }) => {
  const { queue = [], current = null, settings = {}, stats = {}, allToday = [] } = queueData;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [issue, setIssue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (queue.length > 0) handleCallNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queue]);

  const exportToCSV = () => {
    if (allToday.length === 0) {
      addToast('No data to export yet', 'info');
      return;
    }
    const headers = ['Token', 'Patient', 'Phone', 'Condition', 'Dept', 'Status', 'Registered At'];
    const rows = allToday.map(p => [
      p.token, p.name, p.phone, p.issue || 'N/A', p.assignedDoctor || 'General', p.status, 
      new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    ]);
    const csvString = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `queue_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addToast('Data exported successfully', 'success');
  };
  
  const handleSettingsUpdate = (val) => {
    const numericVal = parseInt(val);
    if (!isNaN(numericVal) && numericVal > 0) {
      axios.post('http://localhost:3001/settings', { averageConsultationTime: numericVal }).catch(console.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 10) return;

    setIsAdding(true);
    try {
      await axios.post('http://localhost:3001/patient', { name, phone, issue });
      setIsSuccess(true);
      addToast('Token Issued Successfully', 'success');
      setName(''); setPhone(''); setIssue('');
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      addToast('Registration failed', 'error');
    }
    setIsAdding(false);
  };

  const handleCallNext = async () => {
    try {
      await axios.post('http://localhost:3001/next');
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemovePatient = async (id) => {
    if (!window.confirm('Delete this patient record and revoke token?')) return;
    try {
      await axios.delete(`http://localhost:3001/patient/${id}`);
      addToast('Record deleted');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = allToday.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.token.toString().includes(search);
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getEstimatedCompletion = () => {
    if (!current) return '--:--';
    const end = new Date();
    end.setMinutes(end.getMinutes() + (settings.averageConsultationTime || 15));
    return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="op-dashboard-root max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Analytics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Today's Volume", val: stats.totalToday || 0, icon: Users, color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
          { label: "Pipeline Backlog", val: stats.waitingNow || 0, icon: Clock, color: "text-accent-purple", bg: "bg-accent-purple/10" },
          { label: "Projected Wait", val: `${(stats.waitingNow || 0) * (settings.averageConsultationTime || 15)}m`, icon: Activity, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Resolved Today", val: stats.completedToday || 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" }
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass p-6 flex items-center justify-between group"
          >
            <div>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{kpi.label}</p>
              <h4 className="text-3xl font-black tabular-nums tracking-tighter">{kpi.val}</h4>
            </div>
            <div className={`p-3 rounded-xl ${kpi.bg}`}><kpi.icon className={kpi.color} size={20} /></div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          <section className="glass p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3"><UserPlus className="text-accent-cyan" size={18} /><h3 className="font-black text-xs uppercase tracking-widest text-secondary">Patient Intake</h3></div>
            <form onSubmit={handleRegister} className="space-y-4">
              <input className="w-full text-sm font-bold" value={name} onChange={e => setName(e.target.value)} placeholder="Patient Name" required />
              <input className="w-full text-sm font-bold" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} placeholder="Phone Number" required />
              <textarea className="w-full text-sm font-bold h-24" value={issue} onChange={e => setIssue(e.target.value)} placeholder="Symptoms / Reason for Visit (e.g. Fever, Pain...)" />
              <button disabled={!name || phone.length < 10 || isAdding} className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${isSuccess ? 'bg-emerald-500 text-white' : 'primary opacity-100 disabled:opacity-20'}`}>
                {isAdding ? 'Issuing...' : isSuccess ? '✓ Token Issued' : 'Register Patient'}
              </button>
            </form>
          </section>

          <section className="glass p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3"><Settings className="text-accent-purple" size={18} /><h3 className="font-bold text-xs uppercase tracking-widest text-secondary">Operational Sync</h3></div>
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Consultation Avg.</label>
                  <div className="relative">
                    <input type="number" value={settings.averageConsultationTime || 15} onChange={(e) => handleSettingsUpdate(e.target.value)} className="w-full pl-6 pr-16 bg-white/5 py-4 rounded-xl border border-white/5 font-black text-xl outline-none focus:border-accent-purple/30 transition-all" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-secondary">MINS</span>
                  </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Keyboard Sync</span>
                  <div className="flex items-center gap-2"><kbd className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-black">SPACE</kbd><span className="text-[8px] font-bold text-secondary">Next</span></div>
               </div>
            </div>
          </section>
        </aside>

        {/* Live Operations Workspace */}
        <main className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
          <section className="glass p-6 md:p-10 relative overflow-hidden flex flex-col justify-center min-h-[350px]">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                <div className="space-y-6 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan/10 rounded-full border border-accent-cyan/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                    <span className="text-[9px] font-black text-accent-cyan uppercase tracking-widest">Global Status: Live</span>
                  </div>

                  {current ? (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-2">Currently Serving</p>
                        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none italic">
                          <span className="text-accent-cyan non-italic mr-4">#{current.token}</span>
                          {current.name}
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="flex items-center gap-3 bg-white/5 px-6 py-2.5 rounded-xl border border-white/5">
                          <Stethoscope size={16} className="text-accent-cyan" />
                          <span className="text-xs font-black uppercase tracking-tight">{current.assignedDoctor || 'General Consultation'}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-accent-cyan/10 px-6 py-2.5 rounded-xl border border-accent-cyan/20">
                          <Clock size={16} className="text-accent-cyan" />
                          <span className="text-xs font-bold text-white uppercase tracking-tighter">Ends ~{getEstimatedCompletion()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-8"><h2 className="text-4xl font-black text-white/5 uppercase italic">Ready for Patient</h2><p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] mt-3">Pipeline standby mode</p></div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-6">
                  <motion.button animate={queue.length > 0 ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px var(--accent-cyan)", "0 0 40px var(--accent-cyan)", "0 0 0px var(--accent-cyan)"] } : {}} transition={{ repeat: Infinity, duration: 2 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={handleCallNext} disabled={queue.length === 0}
                    className="w-48 h-48 rounded-full primary flex flex-col items-center justify-center gap-2 disabled:grayscale disabled:opacity-20 shadow-2xl relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Play size={40} fill="currentColor" />
                    <span className="text-[9px] font-black uppercase tracking-widest translate-y-1">Next Token</span>
                  </motion.button>
                  <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5"><span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Next Up: #{queue[0]?.token || '--'}</span></div>
                </div>
             </div>
          </section>

          {/* Pipeline Dashboard Progress */}
          <section className="glass p-6 md:p-8">
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-3">Pipeline Flow Monitor <Activity size={12} className="text-accent-cyan" /></h3>
                <div className="flex gap-4">
                   {[{l:"Serving",c:"bg-accent-cyan"},{l:"Waiting",c:"bg-accent-purple"},{l:"Done",c:"bg-emerald-500"}].map(x => (
                     <div key={x.l} className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${x.c}`} /><span className="text-[8px] font-black text-white/40 uppercase">{x.l}</span></div>
                   ))}
                </div>
             </div>
             <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5 border border-white/5 p-[1px]">
                <motion.div animate={{ width: `${(current ? 1 : 0) / (allToday.length || 1) * 100}%` }} className="h-full bg-accent-cyan shadow-[0_0_15px_var(--accent-cyan)] rounded-l-full" />
                <motion.div animate={{ width: `${queue.length / (allToday.length || 1) * 100}%` }} className="h-full bg-accent-purple" />
                <motion.div animate={{ width: `${stats.completedToday / (allToday.length || 1) * 100}%` }} className="h-full bg-emerald-500 rounded-r-full" />
             </div>
          </section>

          {/* Data Table */}
          <section className="glass flex-1 flex flex-col border border-white/5 overflow-hidden min-h-[500px]">
             <header className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center bg-white/[0.01]">
                <div className="relative flex-1 w-full group">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-cyan transition-colors" />
                   <input className="w-full pl-12 pr-6 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-accent-cyan/30 text-sm font-medium" placeholder="Search operational database..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={exportToCSV} className="w-full md:w-auto px-6 py-3 glass text-[9px] font-black uppercase text-accent-cyan hover:bg-accent-cyan/10 transition-all border border-accent-cyan/20 flex items-center justify-center gap-2"><Download size={14} /> Export CSV</button>
             </header>

             <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                   <thead className="sticky top-0 bg-[#0a0a0c]/95 backdrop-blur-3xl z-10 border-b border-white/10">
                      <tr className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
                         <th className="p-6">Token ID</th>
                         <th className="p-6 text-center">Lifecycle</th>
                         <th className="p-6">Patient Details</th>
                         <th className="p-6">Consultation Type</th>
                         <th className="p-6 text-right pr-10">Meta Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      <AnimatePresence initial={false}>
                        {filteredPatients.map((p) => {
                          const isNextUp = p.status === 'waiting' && queue[0]?._id === p._id;
                          return (
                            <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`group border-b border-white/[0.03] transition-all hover:bg-white/[0.01] ${p.status === 'serving' ? 'bg-accent-cyan/[0.04]' : ''}`}>
                              <td className="p-6"><span className={`text-4xl font-black italic tracking-tighter ${p.status === 'serving' ? 'text-accent-cyan' : isNextUp ? 'text-accent-purple' : 'text-white/5 group-hover:text-white/20'}`}>#{p.token}</span></td>
                              <td className="p-6 text-center">
                                 {p.status === 'serving' ? <span className="text-[8px] font-black uppercase text-accent-cyan bg-accent-cyan/10 px-2.5 py-1 rounded-md border border-accent-cyan/20 animate-pulse">In Session</span> : 
                                  isNextUp ? <span className="text-[8px] font-black uppercase text-white bg-accent-purple px-2.5 py-1 rounded-md shadow-lg shadow-accent-purple/20">Next Up</span> :
                                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border border-white/5 ${p.status === 'completed' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-white/20'}`}>{p.status}</span>}
                              </td>
                              <td className="p-6 flex flex-col justify-center h-full"><span className="text-lg font-black text-white tracking-tight">{p.name}</span><span className="text-[10px] font-black text-secondary/40 tabular-nums">ID: {p.phone}</span></td>
                              <td className="p-6"><div className="flex flex-col"><span className="text-sm font-black text-secondary tracking-widest">{p.assignedDoctor || 'General OPD'}</span><span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em]">{p.issue || 'Routine Consultation'}</span></div></td>
                              <td className="p-6 text-right pr-10">
                                 <div className="flex justify-end gap-4">
                                    {p.status === 'waiting' && <button onClick={() => handleRemovePatient(p._id)} className="p-2 text-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>}
                                    <ChevronRight size={18} className="text-white/5 group-hover:text-white/30" />
                                 </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                   </tbody>
                </table>
                {filteredPatients.length === 0 && (
                   <div className="h-[400px] flex flex-col items-center justify-center gap-6">
                      <div className="p-12 bg-white/[0.02] rounded-full opacity-10"><Logo className="w-32 h-32" /></div>
                      <div className="text-center space-y-2">
                        <p className="text-xs font-black uppercase tracking-[0.5em] text-white/20">No patients in queue</p>
                        <p className="text-[9px] font-bold uppercase text-white/10 tracking-widest italic">Register a patient to begin pipeline ops.</p>
                      </div>
                   </div>
                )}
             </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
