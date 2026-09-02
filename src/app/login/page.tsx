"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setError('تکایە کۆدی تێپەڕبوون بنووسە');
      return;
    }

    if (attempts >= 5) {
      setError('زۆر داواکاری هەڵەت کردووە. تکایە دواتر تاقی بکەرەوە.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAttempts(prev => prev + 1);
        setError(data.error || 'کۆدی تێپەڕبوون هەڵەیە');
        setLoading(false);
        return;
      }

      // Success
      router.push(data.redirectUrl || '/dashboard');
      router.refresh();
    } catch (err) {
      setError('هەڵەیەک ڕوویدا لە پەیوەندیکردن بە سێرڤەر');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#CC222F]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#CC222F] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-red-600/30 mb-4 border border-red-500/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">سیستەمی کارگێڕی تابان کارس</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">تکایە کۆدی تێپەڕبوون (Passcode) بنووسە</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm font-semibold">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 font-bold text-sm mb-2 text-right">
              کۆدی ئادمین (Passcode)
            </label>
            <div className="relative flex items-center">
              <input
                type={showPasscode ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pr-12 pl-12 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-[#CC222F] focus:ring-2 focus:ring-[#CC222F]/20 transition-all placeholder:text-slate-600"
              />
              <KeyRound className="w-5 h-5 text-slate-500 absolute right-4 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute left-4 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#CC222F] hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-600/30 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>چوونە ژوورەوە</span>
                <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>سیستەمێکی بەهێزکراو بە پاراستنی فرەئاستی SSL & Security Guard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
