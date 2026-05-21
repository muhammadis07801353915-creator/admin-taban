'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [vipEnabled, setVipEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

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
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
      } else if (data) {
        setVipEnabled(data.vip_plan_enabled);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setSaving(true);
    const newValue = !vipEnabled;
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ vip_plan_enabled: newValue })
        .eq('id', 1);
        
      if (error) throw error;
      setVipEnabled(newValue);
    } catch (e) {
      console.error('Error updating setting:', e);
      alert('نەتوانرا گۆڕانکارییەکە پاشەکەوت بکرێت');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">چاوەڕوان بە...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">پارەدان و ڕیکلام</h1>
        <p className="text-slate-400 mt-2">ڕێکخستنی شێوازەکانی ڕیکلام و پارەدان لەناو ئەپەکە</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">ڕیکلامی VIP (١٠,٠٠٠ دینار)</h2>
            <p className="text-slate-400 mt-1">ئەمە دیاری دەکات کە ئایا بەکارهێنەران بتوانن ڕیکلامی پارەدار هەڵبژێرن یان نا.</p>
          </div>
          
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              vipEnabled ? 'bg-emerald-500' : 'bg-slate-600'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                vipEnabled ? '-translate-x-1' : '-translate-x-7'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
