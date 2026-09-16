'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  DownloadCloud, Smartphone, Apple, RefreshCw, 
  TrendingUp, Users, Calendar, ShieldCheck, Save,
  CheckCircle2, AlertCircle, Filter, Search
} from 'lucide-react';

interface VisitRecord {
  id: string;
  device_id: string;
  user_id: string | null;
  visited_at: string;
  platform?: string;
}

export default function DownloadsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  
  // Store offset values from settings
  const [androidBase, setAndroidBase] = useState<number>(0);
  const [iosBase, setIosBase] = useState<number>(0);
  const [savingBase, setSavingBase] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'android' | 'ios'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch app visits
      const { data: visitData, error: vErr } = await supabase
        .from('app_visits')
        .select('*')
        .order('visited_at', { ascending: false });

      if (!vErr && visitData) {
        setVisits(visitData as VisitRecord[]);
      }

      // Fetch base offsets from app_settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('android_version, ios_version, title_en')
        .eq('id', 1)
        .single();

      // Read custom base counts if stored in localStorage or app_settings
      const savedAndroid = localStorage.getItem('taban_android_downloads_base');
      const savedIos = localStorage.getItem('taban_ios_downloads_base');
      if (savedAndroid) setAndroidBase(parseInt(savedAndroid, 10) || 0);
      if (savedIos) setIosBase(parseInt(savedIos, 10) || 0);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSaveBases = () => {
    setSavingBase(true);
    localStorage.setItem('taban_android_downloads_base', androidBase.toString());
    localStorage.setItem('taban_ios_downloads_base', iosBase.toString());
    setTimeout(() => {
      setSavingBase(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 300);
  };

  // Helper to categorize a visit/device platform
  const getDevicePlatform = (deviceId: string): 'android' | 'ios' => {
    if (!deviceId) return 'android';
    const lower = deviceId.toLowerCase();
    if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) return 'ios';
    return 'android';
  };

  // Unique devices breakdown
  const uniqueDevices = new Set<string>();
  const androidDevices = new Set<string>();
  const iosDevices = new Set<string>();

  visits.forEach(v => {
    const devId = v.device_id || v.id;
    uniqueDevices.add(devId);
    const platform = getDevicePlatform(devId);
    if (platform === 'ios') {
      iosDevices.add(devId);
    } else {
      androidDevices.add(devId);
    }
  });

  // Calculate totals including optional store base numbers
  const liveAndroid = androidDevices.size;
  const liveIos = iosDevices.size;

  const totalAndroid = liveAndroid + androidBase;
  const totalIos = liveIos + iosBase;
  const grandTotal = totalAndroid + totalIos;

  const androidPercent = grandTotal > 0 ? Math.round((totalAndroid / grandTotal) * 100) : 50;
  const iosPercent = grandTotal > 0 ? 100 - androidPercent : 50;

  // Filtered visits table
  const filteredVisits = visits.filter(v => {
    const devId = v.device_id || '';
    const platform = getDevicePlatform(devId);
    
    if (selectedPlatform === 'android' && platform !== 'android') return false;
    if (selectedPlatform === 'ios' && platform !== 'ios') return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return devId.toLowerCase().includes(q) || (v.user_id && v.user_id.toLowerCase().includes(q));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-4 border-[#CC222F] border-t-transparent rounded-full" />
          <p className="text-slate-500 font-medium text-sm">تکایە چاوەڕوان بە... داتای داولۆندەکان باردەکرێت</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <DownloadCloud className="w-9 h-9 text-[#CC222F]" />
            داتای دابەزاندن و داولۆندەکان (App Downloads)
          </h1>
          <p className="text-slate-500 mt-1">ئامارە زانیارییە دابەزیوەکان بۆ ئەندرۆید و ئایفۆن بە زانیاری داتابێس</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start md:self-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>نوێکردنەوەی داتا</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Android Card */}
        <div className="bg-emerald-950/5 border border-emerald-500/20 rounded-[28px] p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black">
              {androidPercent}% سەرجەم
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{totalAndroid.toLocaleString()}</div>
            <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <span>🤖 داگرتنی ئەندرۆید (Android)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              ڕاستەوخۆ: {liveAndroid} + زافە: {androidBase}
            </p>
          </div>
        </div>

        {/* iOS Card */}
        <div className="bg-slate-900 text-white rounded-[28px] p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-white/10 text-slate-200 rounded-full text-xs font-black">
              {iosPercent}% سەرجەم
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{totalIos.toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-300 mt-1 flex items-center gap-1">
              <span>🍎 داگرتنی ئایفۆن (iOS)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              ڕاستەوخۆ: {liveIos} + زافە: {iosBase}
            </p>
          </div>
        </div>

        {/* Total Downloads Card */}
        <div className="bg-[#CC222F]/5 border border-[#CC222F]/20 rounded-[28px] p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#CC222F]/10 rounded-2xl flex items-center justify-center">
              <DownloadCloud className="w-6 h-6 text-[#CC222F]" />
            </div>
            <span className="px-3 py-1 bg-[#CC222F]/10 text-[#CC222F] rounded-full text-xs font-black">
              کۆی گشتی
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{grandTotal.toLocaleString()}</div>
            <div className="text-xs font-bold text-[#CC222F] mt-1">
              📱 کۆی هەردوو سیستەمەکە
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              لە Play Store و App Store و داتابێس
            </p>
          </div>
        </div>

        {/* Unique Devices Card */}
        <div className="bg-blue-50/50 border border-blue-200/50 rounded-[28px] p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-black">
              ئامێری تاقانە
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{uniqueDevices.size.toLocaleString()}</div>
            <div className="text-xs font-bold text-blue-700 mt-1">
              ⚡ هەموو مۆبایلە چالاکەکان
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              بەپێی Device ID ی خەزنکراو
            </p>
          </div>
        </div>

      </div>

      {/* Platform Comparison Bar */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">ڕێژەی بەکارهێنەران (Android vs iOS Share)</h2>
          </div>
          <div className="text-xs font-bold text-slate-500">
            {totalAndroid} Android · {totalIos} iOS
          </div>
        </div>

        {/* Visual Progress bar */}
        <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden flex p-1 border border-slate-200/60">
          <div 
            style={{ width: `${androidPercent}%` }} 
            className="h-full bg-emerald-500 rounded-full transition-all duration-700 flex items-center justify-center text-[10px] font-black text-white"
          >
            {androidPercent > 10 ? `${androidPercent}% Android` : ''}
          </div>
          <div 
            style={{ width: `${iosPercent}%` }} 
            className="h-full bg-slate-900 rounded-full transition-all duration-700 flex items-center justify-center text-[10px] font-black text-white"
          >
            {iosPercent > 10 ? `${iosPercent}% iOS` : ''}
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            ئەندرۆید: {totalAndroid.toLocaleString()} ({androidPercent}%)
          </span>
          <span className="flex items-center gap-1.5 text-slate-900 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            ئایفۆن: {totalIos.toLocaleString()} ({iosPercent}%)
          </span>
        </div>
      </div>

      {/* Store Offset Controller (Setting base counts from Play Store / App Store Connect) */}
      <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-md border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              تێکەڵکردنی داتای ستۆرەکان (Google Play & App Store Base Numbers)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              ئەگەر لە Play Store Console یان App Store Connect داگرتنی پێشووت هەیە، لێرە ژمارەکەی بنووسە تا سەرجەم بە دروستی حساب بێت.
            </p>
          </div>

          <button
            onClick={handleSaveBases}
            disabled={savingBase}
            className="bg-[#CC222F] hover:bg-[#b3191f] text-white px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm self-start sm:self-auto"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>خەزن کرا!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>سەیڤکردنی ژمارەکان</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-bold text-emerald-400 mb-2">
              🤖 داگرتنی زیادە بۆ Play Store (Android Base Offset)
            </label>
            <input
              type="number"
              value={androidBase}
              onChange={(e) => setAndroidBase(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-lg"
              placeholder="0"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              کۆی پۆستەرەکان دەبێتە: {liveAndroid} (داتابێس) + {androidBase} = {totalAndroid}
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              🍎 داگرتنی زیادە بۆ App Store (iOS Base Offset)
            </label>
            <input
              type="number"
              value={iosBase}
              onChange={(e) => setIosBase(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-lg"
              placeholder="0"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              کۆی پۆستەرەکان دەبێتە: {liveIos} (داتابێس) + {iosBase} = {totalIos}
            </p>
          </div>
        </div>
      </div>

      {/* Live Activity Records Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Table Filters & Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">لیستی چالاکی ئامێرەکان (Live Device Log)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              کۆی {filteredVisits.length} ئامێری چالاک نیشاندراوە
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Platform selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedPlatform('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                هەمووی
              </button>
              <button
                onClick={() => setSelectedPlatform('android')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'android' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                🤖 Android
              </button>
              <button
                onClick={() => setSelectedPlatform('ios')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'ios' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                🍎 iOS
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="گەڕان بۆ Device ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#CC222F]/20 w-44"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">سیستەم (Platform)</th>
                <th className="px-6 py-4">ناسنەی ئامێر (Device ID)</th>
                <th className="px-6 py-4">ناسنەی بەکارهێنەر (User ID)</th>
                <th className="px-6 py-4">کاتی سەردان (Timestamp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredVisits.slice(0, 50).map((visit, idx) => {
                const platform = getDevicePlatform(visit.device_id || '');
                return (
                  <tr key={visit.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-bold text-xs">{idx + 1}</td>
                    <td className="px-6 py-4">
                      {platform === 'ios' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold">
                          <Apple className="w-3.5 h-3.5" />
                          iOS (ئایفۆن)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          Android (ئەندرۆید)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600" dir="ltr">
                      {visit.device_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400" dir="ltr">
                      {visit.user_id ? (
                        <span className="text-blue-600 font-bold">{visit.user_id.slice(0, 12)}...</span>
                      ) : (
                        <span className="text-slate-300">میوان (Guest)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(visit.visited_at).toLocaleString('ku-IQ')}
                    </td>
                  </tr>
                );
              })}

              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    هیچ چالاکییەک نەدۆزرایەوە بەپێی ئەم فلتەرە
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredVisits.length > 50 && (
          <div className="p-4 bg-slate-50/50 text-center text-xs text-slate-400 font-medium border-t border-slate-50">
            ٥٠ لە کۆی {filteredVisits.length} تۆمار نیشاندراوە
          </div>
        )}
      </div>

    </div>
  );
}
