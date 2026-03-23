import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Lock, Eye, EyeOff, User } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', mobile: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  const validate = () => {
    let newErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email format.";
    if (!isLogin && !/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Please enter a valid 10-digit mobile number.";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShake(s => s + 1);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const r = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const d = await r.json();
      
      if (!r.ok) {
        setErrors({ general: d.message || "Authentication failed." });
        setShake(s => s + 1);
      } else {
        localStorage.setItem('userToken', d.token);
        onAuthSuccess(d.token);
      }
    } catch (err) {
      setErrors({ general: "Network error. Please try again." });
      setShake(s => s + 1);
    }
    setBusy(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setForm({ email: '', mobile: '', password: '' });
  };

  const inputClass = "w-full bg-[#090912]/80 border border-white/10 rounded-xl px-12 py-3.5 text-sm text-[#f2ede4] font-dm focus:outline-none focus:border-[#C9A84C]/60 transition-colors";
  
  return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Particles Decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-64 h-64 bg-[#C9A84C] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-blue-900 rounded-full blur-[150px]" />
      </div>

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="bg-[#0b0b14]/70 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

          <div className="text-center mb-8">
            <h2 className="font-syne text-3xl font-bold text-white mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Webion AR'}
            </h2>
            <p className="text-gray-400 font-dm text-sm">
              {isLogin ? 'Sign in to access your premium catalog' : 'Create an account for exclusive AR access'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg text-center"
                >
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <motion.div animate={errors.email ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }} key={shake + 'email'}>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  placeholder="Email Address"
                  className={inputClass}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="text-red-400 text-[11px] mt-1 ml-2">{errors.email}</p>}
            </motion.div>

            {/* Mobile Field (Signup Only) - Framer Motion slide open */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div animate={errors.mobile ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }} key={shake + 'mobile'}>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="tel"
                        placeholder="Mobile Number (10 Digits)"
                        className={inputClass}
                        value={form.mobile}
                        onChange={e => setForm({ ...form, mobile: e.target.value })}
                      />
                    </div>
                    {errors.mobile && <p className="text-red-400 text-[11px] mt-1 ml-2">{errors.mobile}</p>}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Field */}
            <motion.div animate={errors.password ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }} key={shake + 'pwd'}>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Password"
                  className={inputClass}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[11px] mt-1 ml-2">{errors.password}</p>}
            </motion.div>

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-6 py-4 rounded-xl font-bold text-[#111] text-sm tracking-wide bg-gradient-to-r from-[#C9A84C] to-[#F0D080] hover:shadow-[0_8px_24px_-8px_rgba(201,168,76,0.5)] transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
            >
              {busy ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={toggleMode}
              className="text-[#888] hover:text-[#C9A84C] text-sm font-dm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
