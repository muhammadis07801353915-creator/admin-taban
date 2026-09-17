'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  DownloadCloud, Smartphone, Apple, RefreshCw, 
  TrendingUp, Users, Save, CheckCircle2, AlertCircle, Search, Radio, ShieldCheck
} from 'lucide-react';

interface VisitRecord {
  id: string;
  device_id: string;
  user_id: string | null;
  visited_at: string;
}

interface PushTokenRecord {
  token: string;
  user_id: string | null;
  platform: string;
  updated_at: string;
}

interface UniqueDeviceRecord {
  device_id: string;
  user_id: string | null;
  visited_at: string;
  platform: 'android' | 'ios';
  visit_count: number;
}

export default function DownloadsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [uniqueDevices, setUniqueDevices] = useState<UniqueDeviceRecord[]>([]);
  const [pushTokens, setPushTokens] = useState<PushTokenRecord[]>([]);
  
  // Store base offsets
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

      // 1. Fetch app_visits (filter out future test dates)
      const nowIso = new Date().toISOString();
      const { data: visitData } = await supabase
        .from('app_visits')
        .select('*')
        .lte('visited_at', nowIso)
        .order('visited_at', { ascending: false });

      const rawVisits = (visitData as VisitRecord[]) || [];
      setVisits(rawVisits);

      // 2. Fetch push_tokens to map registered users
      const { data: tokenData } = await supabase
        .from('push_tokens')
        .select('token, user_id, platform, updated_at');

      const rawTokens = (tokenData as PushTokenRecord[]) || [];
      setPushTokens(rawTokens);

      // Build user_id -> platform map from push_tokens
      const userPlatformMap = new Map<string, string>();
      rawTokens.forEach(t => {
        if (t.user_id && t.platform) {
          userPlatformMap.set(t.user_id, t.platform.toLowerCase());
        }
      });

      // Platform Classification Logic
      const getDevicePlatform = (v: VisitRecord): 'android' | 'ios' => {
        const devId = (v.device_id || '').toLowerCase();
        if (devId.startsWith('ios_') || devId.includes('iphone') || devId.includes('ipad')) return 'ios';
        if (devId.startsWith('android_') || devId.includes('android')) return 'android';
        if (v.user_id && userPlatformMap.has(v.user_id)) {
          const p = userPlatformMap.get(v.user_id);
          if (p?.includes('ios') || p?.includes('apple')) return 'ios';
          if (p?.includes('android')) return 'android';
        }
        // Default for Kurdistan/Iraq market -> Android!
        return 'android';
      };

      // Deduplicate Visits by Unique Device ID
      const deviceMap = new Map<string, UniqueDeviceRecord>();
      rawVisits.forEach(v => {
        const devId = v.device_id || v.id;
        if (!deviceMap.has(devId)) {
          deviceMap.set(devId, {
            device_id: devId,
            user_id: v.user_id,
            visited_at: v.visited_at,
            platform: getDevicePlatform(v),
            visit_count: 1
          });
        } else {
          deviceMap.get(devId)!.visit_count++;
        }
      });

      setUniqueDevices(Array.from(deviceMap.values()));

      // 3. Fetch base offsets
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

  const handleSaveBases = async () => {
    setSavingBase(true);
    localStorage.setItem('taban_android_downloads_base', androidBase.toString());
    localStorage.setItem('taban_ios_downloads_base', iosBase.toString());
    
    setTimeout(() => {
      setSavingBase(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 300);
  };

  // Unique Device platform counts
  const liveAndroid = uniqueDevices.filter(d => d.platform === 'android').length;
  const liveIos = uniqueDevices.filter(d => d.platform === 'ios').length;

  const totalAndroid = liveAndroid + androidBase;
  const totalIos = liveIos + iosBase;
  const grandTotal = totalAndroid + totalIos;

  const androidPercent = grandTotal > 0 ? Math.round((totalAndroid / grandTotal) * 100) : 95;
  const iosPercent = grandTotal > 0 ? 100 - androidPercent : 5;

  // Format date unambiguously: YYYY-MM-DD (HH:mm AM/PM)
  const formatDateKurdistan = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    return `${year}-${month}-${day} (${strHours}:${minutes} ${ampm})`;
  };

  // Filtered unique devices list
  const filteredDevices = uniqueDevices.filter(d => {
    if (selectedPlatform === 'android' && d.platform !== 'android') return false;
    if (selectedPlatform === 'ios' && d.platform !== 'ios') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const devId = (d.device_id || '').toLowerCase();
      const uId = (d.user_id || '').toLowerCase();
      return devId.includes(q) || uId.includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-4 border-[#CC222F] border-t-transparent rounded-full" />
          <p className="text-slate-500 font-medium text-sm">تکایە چاوەڕوان بە... داتای دابەزاندنەکان شیکار دەکرێت</p>
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
            ئاماری داولۆند و ئامێرەکان (Unique App Downloads & Devices)
          </h1>
          <p className="text-slate-500 mt-1">ئاماری پاکژکراوەی مۆبایلە تاقانەکان بەپێی مارکێتی کوردستان (Android vs iOS)</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start md:self-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>نوێکردنەوەی داتا</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Android Card */}
        <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-[28px] p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
              <span>🤖 داگرتنی ئەندرۆید (Android Total)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              مۆبایلی تاقانە: {liveAndroid} · زافە: {androidBase}
            </p>
          </div>
        </div>

        {/* iOS Card */}
        <div className="bg-slate-900 text-white rounded-[28px] p-6 relative overflow-hidden shadow-lg border border-slate-800">
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
              <span>🍎 داگرتنی ئایفۆن (iOS Total)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              مۆبایلی تاقانە: {liveIos} · زافە: {iosBase}
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
              کۆی مۆبایلەکان
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{grandTotal.toLocaleString()}</div>
            <div className="text-xs font-bold text-[#CC222F] mt-1">
              📱 کۆی گشتی مۆبایلە تاقانەکان
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              سەرجەم ئامێرە بێ دووبارەبووەکان
            </p>
          </div>
        </div>

        {/* Total Raw Visit Log Entries */}
        <div className="bg-blue-50/60 border border-blue-200/50 rounded-[28px] p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-black">
              تۆماری سەردان
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{visits.length.toLocaleString()}</div>
            <div className="text-xs font-bold text-blue-700 mt-1">
              ⚡ کۆی گشتی تۆمارەکان (Raw Visits)
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              لە کۆی {uniqueDevices.length} مۆبایلی تاقانە
            </p>
          </div>
        </div>

      </div>

      {/* Platform Comparison Bar */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">دابەشبوونی ئامێرە تاقانەکان (Android vs iOS Market Share)</h2>
          </div>
          <div className="text-xs font-bold text-slate-500">
            🤖 {totalAndroid} Android ({androidPercent}%) · 🍎 {totalIos} iOS ({iosPercent}%)
          </div>
        </div>

        {/* Visual Progress bar */}
        <div className="w-full h-7 bg-slate-100 rounded-full overflow-hidden flex p-1 border border-slate-200/60">
          <div 
            style={{ width: `${androidPercent}%` }} 
            className="h-full bg-emerald-500 rounded-full transition-all duration-700 flex items-center justify-center text-[11px] font-black text-white"
          >
            {androidPercent > 10 ? `🤖 ${androidPercent}% Android (${totalAndroid})` : ''}
          </div>
          <div 
            style={{ width: `${iosPercent}%` }} 
            className="h-full bg-slate-900 rounded-full transition-all duration-700 flex items-center justify-center text-[11px] font-black text-white"
          >
            {iosPercent > 5 ? `🍎 ${iosPercent}% iOS (${totalIos})` : ''}
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            ئەندرۆید (Android): {totalAndroid.toLocaleString()} ({androidPercent}%)
          </span>
          <span className="flex items-center gap-1.5 text-slate-900 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            ئایفۆن (iOS): {totalIos.toLocaleString()} ({iosPercent}%)
          </span>
        </div>
      </div>

      {/* Store Offset Controller */}
      <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-md border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              تێکەڵکردنی ژمارەی ستۆرەکان (Google Play & App Store Base Offset)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              ئەگەر لە Play Store Console یان App Store Connect داگرتنی پێشووت هەبووە، لێرە بنووسە تا تێکەڵ بە داتاکان ببێت.
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
                <span>سەیڤ بوو!</span>
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
              کۆی مۆبایلەکان دەبێتە: {liveAndroid} (تاقانە) + {androidBase} = {totalAndroid}
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
              کۆی مۆبایلەکان دەبێتە: {liveIos} (تاقانە) + {iosBase} = {totalIos}
            </p>
          </div>
        </div>
      </div>

      {/* Unique Devices Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Table Filters & Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">لیستی مۆبایلە تاقانەکان (Unique Device Log)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              کۆی {filteredDevices.length} مۆبایلی تاقانە (بێ دووبارەبوونەوە) نیشاندراوە بەپێی دوا سەردان (YYYY-MM-DD)
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
                هەمووی ({uniqueDevices.length})
              </button>
              <button
                onClick={() => setSelectedPlatform('android')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'android' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                🤖 Android ({liveAndroid})
              </button>
              <button
                onClick={() => setSelectedPlatform('ios')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'ios' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                🍎 iOS ({liveIos})
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
                <th className="px-6 py-4">دوا سەردان (YYYY-MM-DD HH:mm)</th>
                <th className="px-6 py-4">ناسنەی ئامێری تاقانە (Device ID)</th>
                <th className="px-6 py-4">ژمارەی سەردان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredDevices.slice(0, 100).map((device, idx) => {
                return (
                  <tr key={device.device_id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-bold text-xs">{idx + 1}</td>
                    <td className="px-6 py-4">
                      {device.platform === 'ios' ? (
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
                    <td className="px-6 py-4 text-xs text-slate-700 font-bold" dir="ltr">
                      {formatDateKurdistan(device.visited_at)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600" dir="ltr">
                      {device.device_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {device.visit_count} جار
                    </td>
                  </tr>
                );
              })}

              {filteredDevices.length === 0 && (
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

        {filteredDevices.length > 100 && (
          <div className="p-4 bg-slate-50/50 text-center text-xs text-slate-400 font-medium border-t border-slate-50">
            ١٠٠ لە کۆی {filteredDevices.length} مۆبایلی تاقانە نیشاندراوە
          </div>
        )}
      </div>

    </div>
  );
}
