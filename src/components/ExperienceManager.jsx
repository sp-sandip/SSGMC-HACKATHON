import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Camera, Video, ArrowLeft } from 'lucide-react';
import ARTryOn from './ARTryOn';
import LiveSession from './LiveSession';



export default function ExperienceManager({ product, onClose }) {
  const [activeMode, setActiveMode] = useState('AR'); // 'AR' | 'LIVE'

  // Extract numeric ID assuming format 'dressX'
  const productNumber = String(product.id).replace('dress', '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-gradient-to-b from-[#111120] to-[#0a0a14] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">

        {/* ── HEADER ── */}
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors flex items-center gap-2 pr-4 tracking-wider text-xs font-bold uppercase cursor-pointer z-50">
              <ArrowLeft size={16} /> Back to Collection
            </button>
            <div className="h-6 w-px bg-white/10"></div>
            <div>
              <h2 style={{fontFamily:"Playfair Display,serif"}} className="text-2xl font-bold text-[#f2ede4] leading-tight">{product.name}</h2>
              <p className="text-[#C9A84C] text-[10px] tracking-[0.2em] uppercase font-bold">{product.category} · {product.subCategory}</p>
            </div>
          </div>
          
          {/* Mode Toggles */}
          <div className="flex bg-[#07070d] rounded-xl p-1.5 border border-white/5 shadow-inner relative z-50 cursor-pointer pointer-events-auto">
            {[
              { id: 'AR', icon: Camera, label: 'AR Try-On' },
              { id: 'LIVE', icon: Video, label: 'Consult Stylist' }
            ].map((mode, i) => (
              <button key={mode.id} onClick={() => setActiveMode(mode.id)}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                  activeMode === mode.id 
                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-slate-900 shadow-[0_0_20px_rgba(201,168,76,0.3)] pointer-events-none' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 pointer-events-auto'
                }`}>
                <mode.icon size={16} /> {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="flex-1 relative overflow-hidden flex bg-[#060610]" style={{ minHeight:0 }}>
          <AnimatePresence mode="wait">
            


            {activeMode === 'AR' && (
              <motion.div key="AR" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.98}} transition={{duration:0.3}}
                className="absolute inset-0">
                <ARTryOn product={product} />
              </motion.div>
            )}

            {activeMode === 'LIVE' && (
              <motion.div key="LIVE" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.98}} transition={{duration:0.3}}
                className="absolute inset-0 bg-[#060610]">
                {/* LiveSession has its own header/footer, but we can pass onClose to return to AR */}
                <LiveSession product={product} onClose={() => setActiveMode('AR')} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
