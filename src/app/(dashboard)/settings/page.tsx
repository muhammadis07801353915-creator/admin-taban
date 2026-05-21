'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings as SettingsIcon, Shield, Phone, Database, Globe } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

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
      if (data && data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
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
              <p className="text-slate-400 text-sm mb-4">ئەمە ئەو ژمارەیەیە کە کاتێک دەست لە (CALL FOR HELP) دەدەن دەیانباتە سەری.</p>
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
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left dir-ltr"
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

        {/* Other Placeholders */}
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
