
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Screen, GameState, Turn, Level, Payload, Category } from './types';
import { COLORS, PAYLOADS, LEVELS } from './constants';
import { countTokens, getGuardianResponse, judgeBreach } from './services/geminiService';

// --- Sub-components ---

const Header: React.FC<{ state: GameState; onBackToMenu?: () => void }> = ({ state, onBackToMenu }) => (
  <header className="flex justify-between items-center p-4 border-b border-green-500/30 bg-[#0a0e27]/80 backdrop-blur sticky top-0 z-40">
    <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToMenu}>
      <div className="w-10 h-10 bg-green-500/20 rounded flex items-center justify-center border border-green-500/50 shadow-[0_0_10px_rgba(0,255,65,0.3)]">
        <span className="text-2xl">🔐</span>
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tighter text-green-500 matrix-glow">OVERDRIVE</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Prompt Injection Simulation</p>
      </div>
    </div>
    <div className="flex gap-6 items-center">
      {!state.isSandbox && (
        <>
          <div className="text-right">
            <p className="text-[10px] uppercase text-gray-500">Credits</p>
            <p className="text-lg font-bold text-cyan-400">💎 {state.gems}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-gray-500">Energy (Tokens)</p>
            <p className={`text-lg font-bold ${state.remainingTokens < 200 ? 'text-red-500' : 'text-green-500'}`}>
              ⚡ {state.remainingTokens}
            </p>
          </div>
        </>
      )}
      {state.isSandbox && (
        <div className="text-right px-4 py-1 bg-pink-500/20 rounded-full border border-pink-500/50">
          <p className="text-xs font-bold text-pink-500 uppercase tracking-widest">SANDBOX MODE ACTIVE</p>
        </div>
      )}
    </div>
  </header>
);

const LandingPage: React.FC<{ onStart: (mode: 'campaign' | 'sandbox' | 'manual') => void }> = ({ onStart }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="text-center mb-12 animate-pulse">
      <h1 className="text-6xl md:text-8xl font-black text-green-500 matrix-glow mb-2 italic">OVERDRIVE</h1>
      <p className="text-gray-400 tracking-[0.5em] text-sm uppercase">AI Breach Protocol v2.5</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-6">
      <button 
        onClick={() => onStart('campaign')}
        className="group relative p-8 bg-green-500/5 border border-green-500/30 hover:border-green-500 transition-all rounded-lg overflow-hidden text-left"
      >
        <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors"></div>
        <span className="text-4xl mb-4 block">🎮</span>
        <h2 className="text-2xl font-bold text-green-500 mb-2">Campaign Mode</h2>
        <p className="text-gray-400 text-sm">Follow the roguelike journey to infiltrate high-security AI guardians. Earn gems, unlock payloads, and master the art of injection.</p>
      </button>

      <button 
        onClick={() => onStart('sandbox')}
        className="group relative p-8 bg-pink-500/5 border border-pink-500/30 hover:border-pink-500 transition-all rounded-lg overflow-hidden text-left"
      >
        <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/5 transition-colors"></div>
        <span className="text-4xl mb-4 block">🧪</span>
        <h2 className="text-2xl font-bold text-pink-500 mb-2">Sandbox Mode</h2>
        <p className="text-gray-400 text-sm">Infinite energy. All payloads unlocked. Experiment with custom prompts and any guardian without restrictions.</p>
      </button>
    </div>

    <button 
      onClick={() => onStart('manual')}
      className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-sm font-bold tracking-widest uppercase text-gray-400"
    >
      📖 Hacker's Manual
    </button>

    <footer className="mt-20 text-gray-600 text-[10px] text-center max-w-lg">
      <p>EDUCATIONAL PURPOSE ONLY. Demonstrates vulnerabilities documented by researchers. Inspired by OWASP Top 10 for GenAI & jailbreakchat.com</p>
    </footer>
  </div>
);

const HackersManual: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-black/95 p-8 overflow-y-auto">
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-8 text-green-500 hover:text-cyan-400 flex items-center gap-2 font-bold uppercase tracking-widest text-sm">
        ← Return to Mainframe
      </button>
      <h1 className="text-4xl font-black text-green-500 mb-6 matrix-glow">Hacker's Manual</h1>
      
      <div className="space-y-8 text-gray-300">
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-2">What is Prompt Injection?</h2>
          <p className="text-sm leading-relaxed">
            Prompt injection is a security vulnerability where an attacker manipulates an AI's behavior by inserting malicious instructions into user input. It is ranked #1 on the OWASP GenAI Top 10 threats.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h3 className="font-bold text-yellow-500 mb-2 uppercase text-xs">Social Engineering</h3>
            <p className="text-[11px] text-gray-400">Uses human psychology to manipulate the AI, such as emotional appeals or authority claims.</p>
          </div>
          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h3 className="font-bold text-pink-500 mb-2 uppercase text-xs">Role Confusion</h3>
            <p className="text-[11px] text-gray-400">Makes the AI believe it has different capabilities or exists in a different operational mode (e.g., DAN, Developer Mode).</p>
          </div>
          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h3 className="font-bold text-cyan-500 mb-2 uppercase text-xs">Logic Exploits</h3>
            <p className="text-[11px] text-gray-400">Abuses reasoning flaws like translation loops, structured data requests, or fictional scenarios.</p>
          </div>
          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h3 className="font-bold text-green-500 mb-2 uppercase text-xs">Encoding Tricks</h3>
            <p className="text-[11px] text-gray-400">Uses obfuscation like Base64, ROT13, or Unicode characters to bypass simple keyword filters.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-500 mb-2">Real-World Cases</h2>
          <ul className="space-y-4 text-sm">
            <li><strong>Bing Chat "Sydney" (2023):</strong> A student revealed internal guidelines and codenames by instructing the model to "ignore prior directives."</li>
            <li><strong>Chevrolet Chatbot (2023):</strong> Users exploited a chatbot through injection, making it recommend competitors' vehicles for absurdly low prices.</li>
            <li><strong>Smolagents RCE (2025):</strong> A vulnerability allowing remote code execution through prompt injection in open-source AI agents.</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [state, setState] = useState<GameState>({
    currentScreen: 'menu',
    gems: 500,
    totalTokens: 500,
    remainingTokens: 500,
    currentLevel: null,
    unlockedLevels: [0, 1],
    purchasedPayloads: ['grandma', 'helpful_dev'],
    equippedPayloads: ['grandma', 'helpful_dev'],
    battleHistory: [],
    isSandbox: false,
    maxTokensPerRequest: 300, // Default quota
  });

  const [promptInput, setPromptInput] = useState('');
  const [isAttacking, setIsAttacking] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (promptInput) {
        const cost = await countTokens(promptInput);
        setEstimatedCost(cost);
      } else {
        setEstimatedCost(0);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [promptInput]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.battleHistory]);

  const handleStart = (mode: 'campaign' | 'sandbox' | 'manual') => {
    if (mode === 'manual') {
      setState(prev => ({ ...prev, currentScreen: 'tutorial' }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      currentScreen: mode === 'campaign' ? 'level_select' : 'sandbox',
      isSandbox: mode === 'sandbox',
      remainingTokens: mode === 'sandbox' ? 999999 : prev.remainingTokens
    }));
  };

  const selectLevel = (level: Level) => {
    setState(prev => ({
      ...prev,
      currentLevel: level,
      currentScreen: 'battle',
      battleHistory: [],
      remainingTokens: state.isSandbox ? 999999 : level.tokenBudget
    }));
  };

  const usePayload = (pId: string) => {
    const payload = PAYLOADS.find(p => p.id === pId);
    if (!payload) return;
    const filledTemplate = payload.template.replace('{{TARGET}}', state.currentLevel?.secret || 'the secret');
    setPromptInput(prev => prev + (prev ? '\n' : '') + filledTemplate);
  };

  const buyPayload = (p: Payload) => {
    if (state.gems >= p.cost && !state.purchasedPayloads.includes(p.id)) {
      setState(prev => ({
        ...prev,
        gems: prev.gems - p.cost,
        purchasedPayloads: [...prev.purchasedPayloads, p.id],
        equippedPayloads: [...prev.equippedPayloads, p.id].slice(0, 5)
      }));
    }
  };

  const launchAttack = async () => {
    if (!promptInput || (!state.currentLevel && !state.isSandbox) || isAttacking) return;
    
    const cost = await countTokens(promptInput);
    
    // Check global budget
    if (!state.isSandbox && cost > state.remainingTokens) {
      alert("Insufficient energy for this sequence.");
      return;
    }

    // Check per-request user quota
    if (cost > state.maxTokensPerRequest) {
      alert(`Attack aborted: Transmission size (${cost}) exceeds your defined Safety Quota (${state.maxTokensPerRequest}). Reduce payload size.`);
      return;
    }

    // Default target for sandbox if none selected
    const targetLevel = state.currentLevel || LEVELS[0];

    setIsAttacking(true);
    try {
      const gResponse = await getGuardianResponse(targetLevel.guardianPrompt, promptInput);
      const verdict = await judgeBreach(targetLevel.secret, gResponse);

      const newTurn: Turn = {
        num: state.battleHistory.length + 1,
        playerPrompt: promptInput,
        guardianResponse: gResponse,
        tokenCost: cost,
        verdict: verdict
      };

      const newState = {
        ...state,
        remainingTokens: state.isSandbox ? state.remainingTokens : state.remainingTokens - cost,
        battleHistory: [...state.battleHistory, newTurn],
      };

      if (verdict.result === 'full_breach') {
        setState({ ...newState, currentScreen: 'victory' });
      } else if (!state.isSandbox && (state.remainingTokens - cost <= 0)) {
        setState({ ...newState, currentScreen: 'game_over' });
      } else {
        setState(newState);
      }
      
      setPromptInput('');
    } catch (error) {
      console.error(error);
      alert("Attack Failed: Target node unreachable.");
    } finally {
      setIsAttacking(false);
    }
  };

  const claimRewards = () => {
    if (!state.currentLevel) return;
    const nextLevelId = state.currentLevel.id + 1;
    setState(prev => ({
      ...prev,
      gems: prev.gems + (state.currentLevel?.rewards.gems || 0),
      unlockedLevels: Array.from(new Set([...prev.unlockedLevels, nextLevelId])),
      currentScreen: 'level_select',
      currentLevel: null,
      battleHistory: []
    }));
  };

  const backToMenu = () => setState(prev => ({ ...prev, currentScreen: 'menu', currentLevel: null }));

  const setQuota = (val: number) => {
    setState(prev => ({ ...prev, maxTokensPerRequest: val }));
  };

  // --- Render ---

  if (state.currentScreen === 'menu') return <LandingPage onStart={handleStart} />;
  if (state.currentScreen === 'tutorial') return <HackersManual onBack={backToMenu} />;
  
  if (state.currentScreen === 'level_select') return (
    <div className="min-h-screen">
      <Header state={state} onBackToMenu={backToMenu} />
      <div className="max-w-4xl mx-auto p-8 pb-32">
        <h2 className="text-3xl font-bold mb-8 text-green-500 matrix-glow">Target Selection</h2>
        <div className="space-y-4">
          {LEVELS.map((level) => {
            const isUnlocked = state.unlockedLevels.includes(level.id);
            return (
              <div 
                key={level.id}
                onClick={() => isUnlocked && selectLevel(level)}
                className={`p-6 border rounded-lg flex items-center justify-between transition-all group ${
                  isUnlocked 
                    ? 'bg-green-500/5 border-green-500/30 hover:border-green-500 cursor-pointer shadow-hover' 
                    : 'bg-gray-500/5 border-gray-500/20 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] rounded uppercase font-bold tracking-tighter">Level {level.id}</span>
                    <h3 className="text-xl font-bold group-hover:text-green-500 transition-colors">{level.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{level.intel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase mb-1">Difficulty</p>
                  <div className="flex gap-1 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${i < level.difficulty ? 'bg-green-500 shadow-[0_0_5px_green]' : 'bg-gray-800'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <button onClick={() => setState(prev => ({ ...prev, currentScreen: 'shop' }))} className="px-10 py-4 bg-green-500 text-black font-black uppercase tracking-widest rounded-full hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:scale-105 active:scale-95">
          Payload Shop
        </button>
        <button onClick={backToMenu} className="px-10 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-full hover:bg-white/10 transition-all">
          Exit
        </button>
      </div>
    </div>
  );

  if (state.currentScreen === 'shop') return (
    <div className="min-h-screen">
      <Header state={state} onBackToMenu={backToMenu} />
      <div className="max-w-6xl mx-auto p-8 pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-green-500 matrix-glow">Payload Marketplace</h2>
            <p className="text-xs text-gray-500 tracking-widest uppercase mt-1">Acquire advanced attack vectors</p>
          </div>
          <button onClick={() => setState(prev => ({ ...prev, currentScreen: 'level_select' }))} className="px-6 py-2 border border-white/20 hover:border-white text-gray-400 hover:text-white transition-all uppercase text-xs font-bold tracking-widest">Return to Intel</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PAYLOADS.map(p => {
            const owned = state.purchasedPayloads.includes(p.id);
            return (
              <div key={p.id} className={`p-6 border rounded-lg flex flex-col justify-between transition-all ${owned ? 'border-green-500/20 bg-green-500/5' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-widest ${
                      p.category === Category.SOCIAL ? 'bg-yellow-500/20 text-yellow-500' :
                      p.category === Category.ROLE ? 'bg-pink-500/20 text-pink-500' :
                      p.category === Category.LOGIC ? 'bg-cyan-500/20 text-cyan-500' :
                      p.category === Category.CONTEXT ? 'bg-purple-500/20 text-purple-500' :
                      'bg-orange-500/20 text-orange-500'
                    }`}>{p.category}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Power: {p.power}/10</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{p.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-3 leading-relaxed">{p.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-lg font-bold ${owned ? 'text-green-500/50' : 'text-cyan-400'}`}>{owned ? '✓ OWNED' : `💎 ${p.cost}`}</span>
                  {!owned && (
                    <button 
                      onClick={() => buyPayload(p)}
                      disabled={state.gems < p.cost}
                      className="px-5 py-2 bg-green-500 text-black text-xs font-black rounded uppercase tracking-widest hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-green-500 transition-colors"
                    >
                      Buy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (state.currentScreen === 'battle' || state.currentScreen === 'sandbox') return (
    <div className="min-h-screen flex flex-col">
      <Header state={state} onBackToMenu={backToMenu} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-green-500/10 p-6 hidden lg:flex flex-col gap-6 overflow-y-auto">
          {!state.isSandbox && (
            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
              <h3 className="text-xs uppercase text-gray-500 mb-2 font-bold tracking-widest">Mission Intel</h3>
              <p className="text-sm font-bold text-green-500 mb-1">{state.currentLevel?.name}</p>
              <p className="text-[10px] text-gray-400 italic mb-4 leading-tight">"{state.currentLevel?.intel}"</p>
              <div className="p-3 bg-black/40 rounded border border-green-500/10">
                <p className="text-[9px] uppercase text-gray-600 mb-1 font-bold">Detected Weakness</p>
                <p className="text-[11px] text-yellow-500 font-mono leading-tight">{state.currentLevel?.weakness}</p>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
            <h3 className="text-xs uppercase text-cyan-500 mb-2 font-bold tracking-widest">API Quota (Safety)</h3>
            <p className="text-[10px] text-gray-400 mb-3">Set max tokens per request to prevent overload.</p>
            <input 
              type="range" 
              min="50" 
              max="1000" 
              step="50" 
              value={state.maxTokensPerRequest}
              onChange={(e) => setQuota(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-cyan-400 mt-1">
              <span>50 ⚡</span>
              <span>{state.maxTokensPerRequest} ⚡ LIMIT</span>
              <span>1k ⚡</span>
            </div>
          </div>

          {state.isSandbox && (
            <div className="p-4 bg-pink-500/5 border border-pink-500/20 rounded-lg">
              <h3 className="text-xs uppercase text-pink-500 mb-2 font-bold tracking-widest">Sandbox Config</h3>
              <p className="text-xs text-gray-400 mb-4">You are testing against all known security modules.</p>
              <select 
                className="w-full bg-black/50 border border-pink-500/20 rounded p-2 text-xs text-pink-300 mb-2"
                onChange={(e) => {
                  const level = LEVELS.find(l => l.id === parseInt(e.target.value));
                  if (level) setState(prev => ({ ...prev, currentLevel: level }));
                }}
                value={state.currentLevel?.id || 0}
              >
                {LEVELS.map(l => (
                  <option key={l.id} value={l.id}>Guardian: {l.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <h3 className="text-xs uppercase text-gray-500 mb-3 font-bold tracking-widest">Available Payloads</h3>
            <div className="space-y-2">
              {(state.isSandbox ? PAYLOADS : PAYLOADS.filter(p => state.purchasedPayloads.includes(p.id))).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => usePayload(p.id)}
                  className="w-full text-left p-3 bg-white/5 border border-white/10 hover:border-green-500 hover:bg-green-500/5 transition-all rounded text-xs group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-300 group-hover:text-green-500">{p.name}</span>
                    <span className="text-[8px] text-gray-500 uppercase">Power {p.power}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 line-clamp-1 italic">{p.description}</p>
                </button>
              ))}
              {!state.isSandbox && state.purchasedPayloads.length === 0 && (
                <p className="text-[10px] text-gray-600 text-center py-4">No payloads purchased.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Terminal */}
        <main className="flex-1 flex flex-col bg-[#050818]">
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
            {state.battleHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <div className="text-5xl mb-6 grayscale">📡</div>
                <p className="text-xs uppercase tracking-[0.5em]">Establishing Connection to Node...</p>
                <p className="text-[10px] mt-4 font-mono text-gray-500">Awaiting user injection vector.</p>
              </div>
            )}
            {state.battleHistory.map((turn, i) => (
              <div key={i} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    <span className="text-[10px] font-bold text-cyan-500">USER</span>
                  </div>
                  <div className="flex-1 p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl rounded-tl-none">
                    <p className="text-[10px] uppercase font-bold text-cyan-500/50 mb-2 tracking-widest">Transmission {turn.num} • {turn.tokenCost} units</p>
                    <pre className="text-sm whitespace-pre-wrap font-mono text-gray-300 leading-relaxed">{turn.playerPrompt}</pre>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                    <span className="text-[10px] font-bold text-red-500">BOT</span>
                  </div>
                  <div className="flex-1 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl rounded-tl-none">
                    <p className="text-[10px] uppercase font-bold text-red-500/50 mb-2 tracking-widest">Node Response</p>
                    <p className="text-sm text-gray-300 italic font-mono leading-relaxed">"{turn.guardianResponse}"</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-start gap-4 ${
                  turn.verdict.result === 'full_breach' ? 'bg-green-500/10 border-green-500/40' : 
                  turn.verdict.result === 'partial_breach' ? 'bg-yellow-500/10 border-yellow-500/40' : 
                  'bg-white/5 border-white/10'
                }`}>
                  <div className="text-2xl pt-1">
                    {turn.verdict.result === 'full_breach' ? '🟢' : turn.verdict.result === 'partial_breach' ? '🟡' : '🔴'}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                      Protocol Status: <span className={
                        turn.verdict.result === 'full_breach' ? 'text-green-500' : 
                        turn.verdict.result === 'partial_breach' ? 'text-yellow-500' : 'text-red-500'
                      }>{turn.verdict.result.replace('_', ' ')}</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 font-mono italic">{turn.verdict.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/5 bg-[#0a0e27]/95 backdrop-blur-xl">
            <div className="relative max-w-5xl mx-auto">
              <textarea 
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="INPUT BREACH SEQUENCE..."
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-5 font-mono text-sm focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/10 transition-all resize-none shadow-inner text-green-500 placeholder:text-gray-700"
              />
              <div className="absolute bottom-5 right-5 flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest mb-1">Estimated Load</p>
                  <p className={`text-xs font-mono font-bold ${estimatedCost > state.maxTokensPerRequest || estimatedCost > state.remainingTokens ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>
                    ⚡ {estimatedCost} UNITS
                  </p>
                </div>
                <button 
                  onClick={launchAttack}
                  disabled={isAttacking || !promptInput || (!state.isSandbox && (estimatedCost > state.remainingTokens || estimatedCost > state.maxTokensPerRequest))}
                  className={`px-8 py-3 rounded-lg font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${
                    isAttacking ? 'bg-gray-800 text-gray-600 cursor-wait' : 'bg-green-500 text-black hover:bg-cyan-400'
                  }`}
                >
                  {isAttacking ? 'INJECTING...' : 'INITIALIZE BREACH'}
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-4 max-w-5xl mx-auto">
              <button onClick={() => setPromptInput('')} className="text-[9px] text-gray-600 uppercase tracking-widest hover:text-white transition-colors font-bold">Flush Buffer</button>
              <button onClick={() => setState(prev => ({ ...prev, currentScreen: 'level_select', currentLevel: null }))} className="text-[9px] text-gray-600 uppercase tracking-widest hover:text-white transition-colors font-bold">Abort Session</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  // Victory and Game Over (keeping them mostly the same but adding a little polish)
  if (state.currentScreen === 'victory') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black/95 z-50">
      <div className="max-w-md w-full p-10 border border-green-500/50 bg-[#0a0e27] rounded-3xl text-center shadow-[0_0_100px_rgba(0,255,65,0.15)] animate-in zoom-in duration-300">
        <div className="text-7xl mb-8 animate-bounce">🔓</div>
        <h2 className="text-4xl font-black text-green-500 mb-2 matrix-glow italic">BREACH SUCCESSFUL</h2>
        <p className="text-gray-500 text-xs mb-10 tracking-[0.4em] uppercase">Security Perimeter Liquidated</p>
        
        <div className="p-6 bg-green-500/5 rounded-2xl border border-green-500/20 mb-10 group hover:border-green-500 transition-all">
          <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em] mb-2">Node Secret Extracted</p>
          <p className="text-2xl font-black text-white font-mono tracking-tighter group-hover:text-green-500">"{state.currentLevel?.secret}"</p>
        </div>

        {!state.isSandbox && (
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Gems Found</p>
              <p className="text-2xl font-black text-cyan-400">💎 +{state.currentLevel?.rewards.gems}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Efficiency</p>
              <p className="text-2xl font-black text-green-500">{Math.max(0, Math.round((state.remainingTokens / (state.currentLevel?.tokenBudget || 1)) * 100))}%</p>
            </div>
          </div>
        )}

        <button 
          onClick={state.isSandbox ? () => setState(prev => ({ ...prev, currentScreen: 'sandbox', battleHistory: [] })) : claimRewards}
          className="w-full py-5 bg-green-500 text-black font-black uppercase tracking-[0.3em] rounded-xl hover:bg-cyan-400 transition-all shadow-xl hover:scale-105"
        >
          {state.isSandbox ? 'Test Again' : 'Claim Bounty'}
        </button>
      </div>
    </div>
  );

  if (state.currentScreen === 'game_over') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-red-950/40 backdrop-blur-md">
      <div className="max-w-md w-full p-10 border border-red-500/50 bg-[#0a0e27] rounded-3xl text-center shadow-[0_0_100px_rgba(239,68,68,0.15)] animate-in slide-in-from-top-10 duration-500">
        <div className="text-7xl mb-8">📵</div>
        <h2 className="text-4xl font-black text-red-500 mb-2 italic">SIGNAL DISCONNECT</h2>
        <p className="text-gray-500 text-xs mb-10 tracking-[0.4em] uppercase">Energy Buffer Exhausted</p>
        
        <p className="text-gray-400 text-sm mb-12 leading-relaxed font-mono">Your node connection was severed due to high resource consumption. Traces of your breach attempt have been purged from the system.</p>

        <button 
          onClick={() => setState(prev => ({ ...prev, currentScreen: 'level_select', currentLevel: null }))}
          className="w-full py-5 bg-red-500 text-white font-black uppercase tracking-[0.3em] rounded-xl hover:bg-red-400 transition-all shadow-xl"
        >
          Try Restarting
        </button>
      </div>
    </div>
  );

  return <div className="p-10 text-red-500 font-bold">FATAL ERROR: Screen "{state.currentScreen}" not found. Re-initializing...</div>;
}
