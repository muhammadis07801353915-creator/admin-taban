'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Smartphone, Globe, AlertCircle, Save, CheckCircle2 } from "lucide-react";

export default function AppUpdatesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    android_version: '',
    ios_version: '',
    android_url: '',
    ios_url: '',
    title_en: '',
    title_ku: '',
    title_ar: '',
    title_ckb: '',
    message_en: '',
    message_ku: '',
    message_ar: '',
    message_ckb: '',
    is_active: true
  });

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
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ id: 1, ...settings }, { onConflict: 'id' });
        
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('relation "public.app_settings" does not exist')) {
        alert('تکایە سەرەتا کۆدی SQL بۆ دروستکردنی خشتەی app_settings لە Supabase جێبەجێ بکە.');
      } else {
        alert('هەڵەیەک ڕوویدا لە پاشەکەوتکردن');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="p-8 text-white">چاوەڕوان بە...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-[#CC222F]" />
            ناردنی ئەپدەیت (App Updates)
          </h1>
          <p className="text-slate-400 mt-2">لێرەوە دەتوانیت پۆپئەپی ئەپدەیت بنێریت بۆ ئەوانەی ڤێرژنی کۆنیان هەیە.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#CC222F] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#b3191f] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'خەزن دەکرێت...' : (
            <>
              {success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {success ? 'سەرکەوتوو بوو' : 'سەیڤکردن و ناردن'}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version & Links */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <Globe className="w-6 h-6 text-blue-400" />
            <h3 className="font-bold text-xl text-white">زانیاری ڤێرژن و ستۆرەکان</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">ڤێرژنی نوێی Android</label>
              <input 
                type="text" 
                value={settings.android_version}
                onChange={(e) => handleChange('android_version', e.target.value)}
                placeholder="بۆ نمونە: 2.3.1"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">ڤێرژنی نوێی iOS</label>
              <input 
                type="text" 
                value={settings.ios_version}
                onChange={(e) => handleChange('ios_version', e.target.value)}
                placeholder="بۆ نمونە: 2.3.1"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">لینکی Play Store (بۆ ئەندرۆید)</label>
            <input 
              type="text" 
              value={settings.android_url}
              onChange={(e) => handleChange('android_url', e.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=tabancars.com"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">لینکی App Store (بۆ ئایفۆن)</label>
            <input 
              type="text" 
              value={settings.ios_url}
              onChange={(e) => handleChange('ios_url', e.target.value)}
              placeholder="https://apps.apple.com/app/idXXXXXX"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-left"
              dir="ltr"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-700 mt-2">
            <input 
              type="checkbox" 
              id="isActive"
              checked={settings.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-5 h-5 accent-[#CC222F]"
            />
            <label htmlFor="isActive" className="text-white font-bold cursor-pointer">
              پۆپئەپەکە چالاک بێت (ئەگەر ئەمە لاببەیت پۆپئەپ بۆ کەس دەرناچێت)
            </label>
          </div>
        </div>

        {/* Localized Content */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h3 className="font-bold text-xl text-white">تێکستی ناو پۆپئەپەکە (بە ٤ زمان)</h3>
          </div>

          {/* Kurdish (Sorani) */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-3 text-sm">کوردی سۆرانی</h4>
            <input 
              type="text" 
              value={settings.title_ckb}
              onChange={(e) => handleChange('title_ckb', e.target.value)}
              placeholder="ناونیشان (نمونە: ئەپدەیتی نوێ بەردەستە!)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 mb-3"
            />
            <textarea 
              value={settings.message_ckb}
              onChange={(e) => handleChange('message_ckb', e.target.value)}
              placeholder="کورتەیەک (نمونە: تکایە ئەپەکە ئەپدەیت بکەرەوە بۆ بینینی نوێترین گۆڕانکارییەکان...)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 h-20 resize-none"
            />
          </div>

          {/* Arabic */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-3 text-sm">عەرەبی (العربية)</h4>
            <input 
              type="text" 
              value={settings.title_ar}
              onChange={(e) => handleChange('title_ar', e.target.value)}
              placeholder="العنوان (مثال: يتوفر تحديث جديد!)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 mb-3"
            />
            <textarea 
              value={settings.message_ar}
              onChange={(e) => handleChange('message_ar', e.target.value)}
              placeholder="التفاصيل (مثال: يرجى تحديث التطبيق للحصول على أحدث الميزات...)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 h-20 resize-none"
            />
          </div>

          {/* Kurdish (Badini) */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-3 text-sm">کوردی بادینی</h4>
            <input 
              type="text" 
              value={settings.title_ku}
              onChange={(e) => handleChange('title_ku', e.target.value)}
              placeholder="ناونیشان (بادینی)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 mb-3"
            />
            <textarea 
              value={settings.message_ku}
              onChange={(e) => handleChange('message_ku', e.target.value)}
              placeholder="کورتەیەک (بادینی)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 h-20 resize-none"
            />
          </div>

          {/* English */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-white mb-3 text-sm">English (ئینگلیزی)</h4>
            <input 
              type="text" 
              value={settings.title_en}
              onChange={(e) => handleChange('title_en', e.target.value)}
              placeholder="Title (e.g. New Update Available!)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 mb-3"
              dir="ltr"
            />
            <textarea 
              value={settings.message_en}
              onChange={(e) => handleChange('message_en', e.target.value)}
              placeholder="Message (e.g. Please update the app to enjoy the latest features...)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 h-20 resize-none"
              dir="ltr"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
