'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings as SettingsIcon, Phone, Database, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVip, setSavingVip] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [korekNumber, setKorekNumber] = useState('');
  const [asiacellNumber, setAsiacellNumber] = useState('');
  const [fastpayNumber, setFastpayNumber] = useState('');
  const [fibNumber, setFibNumber] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
        if (data.korek_number) setKorekNumber(data.korek_number);
        if (data.asiacell_number) setAsiacellNumber(data.asiacell_number);
        if (data.fastpay_number) setFastpayNumber(data.fastpay_number);
        if (data.fib_number) setFibNumber(data.fib_number);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ whatsapp_number: whatsappNumber })
        .eq('id', 1);
        
      if (error) throw error;
      alert('بە سەرکەوتوویی پاشەکەوت کرا!');
    } catch (e) {
      console.error(e);
      alert('هەڵەیەک ڕوویدا لە پاشەکەوتکردن');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVip = async () => {
    setSavingVip(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          korek_number: korekNumber,
          asiacell_number: asiacellNumber,
          fastpay_number: fastpayNumber,
          fib_number: fibNumber
        })
        .eq('id', 1);
        
      if (error) throw error;
      alert('ژمارەکانی VIP بە سەرکەوتوویی پاشەکەوت کران!');
    } catch (e: any) {
      console.error(e);
      // If columns don't exist yet, show helpful message
      if (e.message?.includes('column')) {
        alert('تکایە پێشتر ئەم SQL ئەجرا بکە لە Supabase:\n\nalter table app_settings\nadd column if not exists korek_number text,\nadd column if not exists asiacell_number text;');
      } else {
        alert('هەڵەیەک ڕوویدا: ' + e.message);
      }
    } finally {
      setSavingVip(false);
    }
  };

  if (loading) return <div className="p-8 text-white">چاوەڕوان بە...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-[#CC222F]" />
          ڕێکخستنەکان
        </h1>
        <p className="text-slate-400 mt-2">ڕێکخستنی زانیارییە گشتییەکانی ئەپەکە</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Settings */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-sm flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1">ژمارەی وەتسئاپ</h3>
              <p className="text-slate-400 text-sm">ئەمە ئەو ژمارەیەیە کە کاتێک دەست لە (CALL FOR HELP) دەدەن دەیانباتە سەری.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">ژمارەی تەلەفۆن (بە کۆدی وڵاتەوە)</label>
              <input 
                type="text" 
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+964750..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
                dir="ltr"
              />
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#CC222F] text-white font-bold py-3 rounded-xl hover:bg-[#b3191f] transition-all disabled:opacity-50"
            >
              {saving ? 'خەزن دەکرێت...' : 'پاشەکەوتکردن'}
            </button>
          </div>
        </div>

        {/* VIP Payment Numbers */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-sm flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1">ژمارەکانی VIP (باڵانس)</h3>
              <p className="text-slate-400 text-sm">کاتێک بەکارهێنەر باڵانس دەنێرێت، دەروا بۆ ئەم ژمارانە دەگوازرێتەوە.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                ژمارەی کۆرەک
              </label>
              <input 
                type="text" 
                value={korekNumber}
                onChange={(e) => setKorekNumber(e.target.value)}
                placeholder="0750XXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
                dir="ltr"
              />
              <p className="text-slate-500 text-xs mt-1 text-left" dir="ltr">کۆد: *215*{korekNumber || '0750XXXXXXX'}*10000#</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                ژمارەی ئاسیاسێل
              </label>
              <input 
                type="text" 
                value={asiacellNumber}
                onChange={(e) => setAsiacellNumber(e.target.value)}
                placeholder="0770XXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
                dir="ltr"
              />
              <p className="text-slate-500 text-xs mt-1 text-left" dir="ltr">کۆد: *123*10000*{asiacellNumber || '0770XXXXXXX'}#</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                <span className="inline-block w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
                ژمارەی FastPay
              </label>
              <input 
                type="text" 
                value={fastpayNumber}
                onChange={(e) => setFastpayNumber(e.target.value)}
                placeholder="0750XXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                <span className="inline-block w-3 h-3 bg-cyan-500 rounded-full mr-2"></span>
                ژمارەی FIB
              </label>
              <input 
                type="text" 
                value={fibNumber}
                onChange={(e) => setFibNumber(e.target.value)}
                placeholder="0750XXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
                dir="ltr"
              />
            </div>

            <button 
              onClick={handleSaveVip}
              disabled={savingVip}
              className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
            >
              {savingVip ? 'خەزن دەکرێت...' : '✓ پاشەکەوتکردنی ژمارەکان'}
            </button>
          </div>
        </div>

        {/* DB Status */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-sm flex items-start gap-5">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">بەستنەوەی داتابەیس</h3>
            <p className="text-slate-400 text-sm mb-4">پەیوەندی لەگەڵ Supabase ئاساییە.</p>
            <button className="text-purple-400 font-bold text-sm">پشکنین</button>
          </div>
        </div>
      </div>
    </div>
  );
}
