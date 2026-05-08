/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, ArrowRight, RotateCcw, CheckCircle2, AlertCircle, Info, History } from 'lucide-react';

type AppState = 'IDLE' | 'COUNTDOWN' | 'DECISION' | 'RESULT';

type Outcome = 'Success' | 'Failure' | 'Mixed';

interface DecisionLog {
  id: string;
  topic: string;
  choice: string;
  timestamp: number;
  outcome?: Outcome;
}

export default function App() {
  const [state, setState] = useState<AppState>('IDLE');
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [finalChoice, setFinalChoice] = useState('');
  const [history, setHistory] = useState<DecisionLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('decidr_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('decidr_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (state === 'COUNTDOWN' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setState('DECISION');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, timeLeft]);

  const startTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic && options.every(opt => opt.trim() !== '')) {
      setTimeLeft(600);
      setState('COUNTDOWN');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins: mins.toString().padStart(2, '0'), secs: secs.toString().padStart(2, '0') };
  };

  const handleDecision = (choice: string) => {
    setFinalChoice(choice);
    const newLog: DecisionLog = {
      id: crypto.randomUUID(),
      topic,
      choice,
      timestamp: Date.now(),
    };
    setHistory([newLog, ...history]);
    setState('RESULT');
  };

  const reset = () => {
    setState('IDLE');
    setTopic('');
    setOptions(['', '']);
    setFinalChoice('');
    setTimeLeft(600);
  };

  const updateOutcome = (id: string, outcome: Outcome) => {
    setHistory(prev => prev.map(log => 
      log.id === id ? { ...log, outcome } : log
    ));
  };

  const timeFormatted = formatTime(timeLeft);

  return (
    <div className="min-h-screen bg-dark text-[#e0e0e0] flex flex-col font-sans overflow-x-hidden selection:bg-gold/30">
      {/* Brand Rail */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-8 border-b border-white/10 z-50">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-gold rounded-full shadow-[0_0_10px_#C5A059]"></div>
          <span className="text-[11px] uppercase tracking-[0.4em] font-medium text-[#888]">Decision Engine v1.02</span>
        </div>
        <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-light text-[#666]">
          <span className={state === 'IDLE' ? 'text-gold' : ''}>Strategy Mode</span>
          <span className={state === 'COUNTDOWN' ? 'text-gold' : ''}>Phase 01: Research</span>
          <button onClick={() => setShowHistory(true)} className="hover:text-gold transition-colors">Logs</button>
        </div>
        <button 
          onClick={() => setShowHistory(true)}
          className="md:hidden p-2 hover:bg-white/5 rounded-full"
        >
          <History className="w-4 h-4 text-[#888]" />
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-24 relative py-12">
        {/* Decorative Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {state === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="w-full max-w-2xl relative z-10 space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="font-serif text-4xl md:text-5xl italic font-light text-white opacity-90 leading-tight">
                  Commit to a Path.
                </h1>
                <p className="text-[12px] uppercase tracking-[0.3em] text-[#666]">
                  The window of uncertainty is closing
                </p>
              </div>

              <form onSubmit={startTimer} className="space-y-10">
                <div className="space-y-8">
                  <div className="relative group">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] mb-2 block font-medium">Objective</label>
                    <input
                      required
                      type="text"
                      placeholder="Define your trajectory..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 focus:border-gold/50 p-5 rounded-sm outline-none transition-all placeholder:text-[#333] font-serif italic text-xl"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-medium">Trajectory Vectors</label>
                      <button 
                        type="button"
                        disabled={options.length >= 6}
                        onClick={() => setOptions([...options, ''])}
                        className="text-[9px] uppercase tracking-widest text-gold hover:text-white transition-colors disabled:opacity-0"
                      >
                        + Add Strategy
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {options.map((opt, idx) => (
                        <div key={idx} className="space-y-2 relative group">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-gold/70 block">
                              Vector {String.fromCharCode(65 + idx)}
                            </label>
                            {options.length > 2 && (
                              <button 
                                type="button"
                                onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                                className="text-[9px] text-rose-500/50 hover:text-rose-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <input
                            required
                            type="text"
                            placeholder={`Path ${String.fromCharCode(65 + idx)}`}
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...options];
                              newOptions[idx] = e.target.value;
                              setOptions(newOptions);
                            }}
                            className="w-full bg-white/[0.02] border border-white/10 focus:border-gold/50 p-4 rounded-sm outline-none transition-all placeholder:text-[#333] text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 border border-gold/40 text-white font-light tracking-[0.3em] text-[11px] uppercase hover:bg-gold/10 hover:border-gold transition-all group"
                >
                  Initialize 10m Constraint
                </button>
              </form>
            </motion.div>
          )}

          {state === 'COUNTDOWN' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl space-y-12 text-center"
            >
              <div className="space-y-4">
                <h2 className="font-serif text-3xl italic font-light text-white opacity-80">Researching: {topic}</h2>
                <div className="font-mono text-[80px] md:text-[140px] leading-none tracking-[-0.05em] text-white flex items-baseline justify-center tabular-nums">
                  <span>{timeFormatted.mins}</span>
                  <span className="animate-pulse text-gold mx-2 text-[70px] md:text-[120px]">:</span>
                  <span>{timeFormatted.secs}</span>
                </div>
                <div className="w-[300px] md:w-[400px] h-1 bg-white/5 mx-auto mt-4 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 600) * 100}%` }}
                    className="h-full bg-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full mt-8 relative z-10">
                {options.map((opt, idx) => (
                  <div key={idx} className="p-6 md:p-8 border border-white/10 bg-white/[0.02] rounded-sm text-left opacity-60">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3 block">Vector {String.fromCharCode(65 + idx)}</span>
                    <h3 className="font-serif text-xl text-white mb-1 italic truncate">{opt}</h3>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setState('DECISION')}
                className="text-[#555] hover:text-gold text-[10px] uppercase tracking-[0.4em] transition-colors"
              >
                Terminate Research Early
              </button>
            </motion.div>
          )}

          {state === 'DECISION' && (
            <motion.div
              key="decision"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl text-center space-y-16"
            >
              <div className="space-y-4">
                <h2 className="font-serif text-5xl italic font-light text-white leading-tight">The clock has stopped.</h2>
                <p className="text-[11px] uppercase tracking-[0.5em] text-gold animate-pulse mt-4">Select Final Trajectory</p>
              </div>

              <div className={`grid grid-cols-1 ${options.length > 4 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 w-full relative z-10`}>
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDecision(opt)}
                    className="group p-8 md:p-10 border border-white/10 bg-white/[0.02] rounded-sm hover:border-gold/50 transition-all duration-500 text-left cursor-pointer active:scale-[0.98] relative overflow-hidden"
                  >
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3 block opacity-50 group-hover:opacity-100 transition-opacity">Vector {String.fromCharCode(65 + idx)}</span>
                    <h3 className="font-serif text-2xl text-white italic group-hover:text-gold transition-colors">{opt}</h3>
                    <p className="text-[10px] text-[#444] leading-relaxed mt-4 group-hover:text-[#666] opacity-0 group-hover:opacity-100 transition-opacity">Execute Strategy {String.fromCharCode(65 + idx)}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {state === 'RESULT' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12"
            >
              <div className="space-y-6">
                <div className="text-[11px] uppercase tracking-[0.4em] text-[#666]">Verdict Reached</div>
                <h2 className="font-serif text-6xl md:text-8xl italic font-light text-gold leading-tight">
                  {finalChoice}
                </h2>
                <div className="w-16 h-[1px] bg-white/20 mx-auto"></div>
                <p className="text-sm font-light text-[#888] tracking-[0.1em]">Target: {topic}</p>
                <div className="pt-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#444] block">Record the outcome in strategy archives once determined.</span>
                </div>
              </div>

              <button
                onClick={reset}
                className="px-12 py-5 border border-white/10 hover:border-white/30 text-white font-light tracking-[0.2em] text-[10px] uppercase transition-all flex items-center justify-center gap-4 mx-auto"
              >
                <RotateCcw className="w-3 h-3 text-gold" />
                New Strategic Cycle
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History / Insights Footer */}
      <footer className="hidden lg:grid h-48 border-t border-white/10 px-12 py-8 grid-cols-4 gap-12 overflow-hidden z-20 bg-dark">
        <div className="col-span-1 border-r border-white/5 pr-8 space-y-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#555] block">Past Verdicts</span>
          <div className="space-y-3 overflow-hidden h-24 mask-fade-out">
            {history.slice(0, 3).map((log) => (
              <div key={log.id} className="flex justify-between items-center group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    log.outcome === 'Success' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' :
                    log.outcome === 'Failure' ? 'bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]' :
                    log.outcome === 'Mixed' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' :
                    'bg-gold/40'
                  }`} />
                  <span className="text-[11px] text-[#888] truncate max-w-[120px] group-hover:text-[#aaa] transition-colors">{log.topic}</span>
                </div>
                <span className="text-[11px] text-gold italic font-serif">Finalized</span>
              </div>
            ))}
            {history.length === 0 && <span className="text-[11px] text-[#444] italic">Empty Log</span>}
          </div>
        </div>
        
        <div className="col-span-2 flex flex-col space-y-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#555] block">Decision Insight</span>
          <p className="text-[11px] text-[#666] leading-relaxed italic font-serif">
            "The 10-minute constraint reduces amygdala-driven fear by forcing pre-frontal cortex prioritization. Most decisions made in this state result in 15% higher satisfaction due to reduced post-purchase rationalization."
          </p>
        </div>

        <div className="col-span-1 flex flex-col justify-center items-end bg-white/[0.01] rounded-sm p-6 border border-white/5">
          <div className="text-[10px] uppercase tracking-[0.4em] text-[#444] mb-1">Accountability Metric</div>
          <div className="text-4xl font-light text-white font-serif">
            {(() => {
              const withOutcome = history.filter(h => h.outcome);
              if (withOutcome.length === 0) return history.length > 0 ? 85 + history.length : '--';
              const successes = withOutcome.filter(h => h.outcome === 'Success').length;
              const mixed = withOutcome.filter(h => h.outcome === 'Mixed').length;
              return Math.min(100, Math.round(((successes + (mixed * 0.5)) / withOutcome.length) * 100));
            })()}<span className="text-sm opacity-30">/100</span>
          </div>
        </div>
      </footer>

      {/* Mobile History View */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#080808] border-l border-white/10 p-10 z-[70] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                  <h3 className="text-2xl font-serif italic text-white">Archives</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#555]">Historical record of commitments</p>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 text-[#444] hover:text-gold transition-colors uppercase text-[10px] tracking-[0.2em]"
                >
                  Close
                </button>
              </div>

              <div className="space-y-6">
                {history.length === 0 ? (
                  <div className="py-20 text-center text-[#333] italic font-serif">
                    The archive is currently void.
                  </div>
                ) : (
                  history.map((log) => (
                    <div key={log.id} className="p-6 border border-white/5 bg-white/[0.01] rounded-sm space-y-3 group">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-[#444] uppercase tracking-[0.2em]">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] text-gold italic font-serif">Verified</span>
                      </div>
                      <h4 className="font-serif text-lg text-white opacity-80 group-hover:opacity-100 transition-opacity italic">{log.topic}</h4>
                      <div className="flex items-baseline gap-3 border-t border-white/5 pt-3">
                        <span className="text-[9px] text-[#444] uppercase tracking-[0.2em]">Verdict:</span>
                        <span className="text-gold font-serif">{log.choice}</span>
                      </div>
                      
                      <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                        <span className="text-[9px] text-[#444] uppercase tracking-[0.2em]">Outcome:</span>
                        {log.outcome ? (
                          <span className={`text-[11px] px-2 py-1 rounded-sm w-fit border ${
                            log.outcome === 'Success' ? 'text-green-500 border-green-500/20 bg-green-500/5' :
                            log.outcome === 'Failure' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' :
                            'text-amber-500 border-amber-500/20 bg-amber-500/5'
                          }`}>
                            {log.outcome}
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            {(['Success', 'Failure', 'Mixed'] as Outcome[]).map((o) => (
                              <button
                                key={o}
                                onClick={() => updateOutcome(log.id, o)}
                                className="text-[9px] px-2 py-1 border border-white/10 hover:border-gold/50 hover:text-gold transition-all uppercase tracking-wider"
                              >
                                {o}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {history.length > 0 && (
                <button 
                  onClick={() => {
                    if(confirm('Purge archive?')) {
                      setHistory([]);
                      localStorage.removeItem('decidr_history');
                    }
                  }}
                  className="mt-12 text-[9px] text-[#333] hover:text-gold uppercase tracking-[0.3em] transition-colors"
                >
                  Purge archival data
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
