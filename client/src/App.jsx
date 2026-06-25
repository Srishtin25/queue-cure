import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import PatientView from './components/PatientView';
import CoverPage from './components/CoverPage';
import Logo from './components/Logo';
import { Globe, Users, Layout } from 'lucide-react';

const socket = io('http://localhost:3001');

function App() {
  const [queueData, setQueueData] = useState({
    queue: [],
    current: null,
    settings: { averageConsultationTime: 8 },
    stats: { totalToday: 0, waitingNow: 0, completedToday: 0 },
    allToday: []
  });
  const [time, setTime] = useState(new Date());
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const fetchInitialData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/queue');
        setQueueData(res.data);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchInitialData();

    socket.on('queueUpdated', (queue) => {
      setQueueData(prev => ({ ...prev, queue }));
    });

    socket.on('currentToken', (current) => {
      if (current) addToast(`Token #${current.token} is now being served`, 'success');
      setQueueData(prev => ({ ...prev, current }));
    });
    
    socket.on('settingsUpdated', (settings) => {
      setQueueData(prev => ({ ...prev, settings }));
    });

    socket.on('statsUpdated', (data) => {
      setQueueData(prev => ({ ...prev, 
        stats: { 
          totalToday: data.totalToday, 
          waitingNow: data.waitingNow, 
          completedToday: data.completedToday 
        },
        allToday: data.allToday
      }));
    });

    return () => {
      clearInterval(timer);
      socket.off('queueUpdated');
      socket.off('currentToken');
      socket.off('settingsUpdated');
      socket.off('statsUpdated');
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-white font-['Outfit']">
        <Routes>
          <Route path="/" element={<CoverPage />} />
          <Route path="*" element={
            <>
              <header className="glass m-4 p-4 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-cyan/10 rounded-lg border border-accent-cyan/20">
                    <Logo className="w-6 h-6 text-accent-cyan" />
                  </div>
                  <Link to="/" className="text-xl font-black italic tracking-tighter">
                    QUEUE <span className="gradient-text non-italic">CURE</span>
                  </Link>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-accent-cyan tabular-nums tracking-tighter">
                      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </span>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">
                      {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <nav className="flex gap-6 items-center border-l border-white/5 pl-6">
                    <Link to="/receptionist" className="flex items-center gap-2 text-sm text-secondary hover:text-white transition uppercase font-black tracking-widest text-[10px]">
                      Receptionist
                    </Link>
                    <Link to="/patient" className="flex items-center gap-2 text-sm text-secondary hover:text-white transition uppercase font-black tracking-widest text-[10px]">
                      Patient View
                    </Link>
                  </nav>
                </div>
              </header>

              <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                  {toasts.map(toast => (
                    <motion.div
                      key={toast.id}
                      initial={{ opacity: 0, x: 50, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      className={`p-4 rounded-2xl glass border border-white/10 shadow-2xl min-w-[300px] flex items-center gap-4 ${
                        toast.type === 'success' ? 'bg-green-500/10' : 'bg-accent-cyan/10'
                      }`}
                    >
                      <div className={`w-1.5 h-8 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-accent-cyan'}`} />
                      <p className="text-sm font-bold">{toast.msg}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <main className="flex-1 px-4 pb-4">
                <Routes>
                  <Route path="/receptionist" element={<ReceptionistDashboard socket={socket} queueData={queueData} addToast={addToast} />} />
                  <Route path="/patient" element={<PatientView queueData={queueData} />} />
                </Routes>
              </main>

              <footer className="p-10 mt-auto border-t border-white/5 bg-white/[0.01]">
                 <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                       <Logo className="w-8 h-8 text-white/20" />
                       <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-[0.2em] italic">QUEUE <span className="gradient-text non-italic">CURE</span></p>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Institutional Queue Management</p>
                       </div>
                    </div>
                    <div className="text-center md:text-right space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Built with React • Express • Socket.IO • MongoDB</p>
                       <p className="text-[10px] font-medium text-white/10 uppercase tracking-tighter">© 2026 Queue Cure • Developed by Srishti Nautiyal</p>
                    </div>
                 </div>
              </footer>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
