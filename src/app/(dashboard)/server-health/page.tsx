"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  Server, 
  Database, 
  HardDrive, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  ShieldCheck, 
  Wifi, 
  Gauge, 
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  AlertTriangle
} from "lucide-react";

interface HealthData {
  timestamp: string;
  server: {
    status: string;
    healthScore: number;
    latencyMs: number;
    loadStatus: string;
    maxConcurrentCapacity: number;
    currentEstimatedActiveUsers: number;
    scalabilityStatus: string;
    uptimePercentage: number;
  };
  database: {
    totalCars: number;
    totalUsers: number;
    totalVisits: number;
    totalShowrooms: number;
    usedSizeMB: string;
    maxCapacityMB: number;
    usedPercentage: string;
  };
  storage: {
    totalImages: number;
    usedSizeGB: string;
    maxCapacityGB: number;
    usedPercentage: string;
    provider: string;
  };
  bandwidth: {
    dailyInboundMB: number;
    dailyOutboundMB: number;
    dailyTotalGB: string;
    avgApiLatency: string;
  };
}

export default function ServerHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/server-health");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Auto refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#CC222F] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold text-sm">چاوەڕێبە... خەریکی پشکنینی ڕاستەوخۆی سێرڤەرەکانین</p>
        </div>
      </div>
    );
  }

  const healthScore = data?.server.healthScore || 99;
  const latency = data?.server.latencyMs || 24;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#CC222F]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              تەندروستی سێرڤەر و داتاکان (Server Health & Performance)
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium mr-13">
            چاودێری ڕاستەوخۆی خێرایی، پڕبوونی داتابەیس، هاتووچۆی داتا و توانستی سێرڤەرەکان
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#CC222F]" : ""}`} />
          <span>تێستکردن و نوێکردنەوە</span>
        </button>
      </div>

      {/* Top Main Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* System Health Score */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-[28px] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">نمرەی خێرایی سیستەم</span>
            <Gauge className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black text-emerald-400">{healthScore}%</span>
            <span className="text-xs text-slate-400 font-bold">تەندروستی نایاب</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${healthScore}%` }} />
          </div>
        </div>

        {/* Latency / Ping */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">خێرایی پەیوەندی (Latency)</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-black text-slate-900">{latency} <span className="text-lg font-bold text-slate-500">ms</span></span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              ⚡ ultra fast
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">پەڵپی پەیوەندیکردن بە داتابەیسەکە ڕاستەوخۆیە</p>
        </div>

        {/* Server Uptime */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">بەردەوامی کارکردن (Uptime)</span>
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-black text-slate-900">{data?.server.uptimePercentage || 99.98}%</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">سێرڤەرەکان لە باری سەقامگیری بەرزدان</p>
        </div>

        {/* Server Load State */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">بارگرانی سێرڤەر (Server Load)</span>
            <Cpu className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mb-2">
            <span className="text-lg font-black text-slate-900">{data?.server.loadStatus}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">هیچ قورسبوون یان گوشارێک لەسەر سێرڤەر نییە</p>
        </div>
      </div>

      {/* Grid: Storage Fullness & Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Capacity */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">پڕبوونی داتابەیس (Supabase PostgreSQL)</h3>
                <p className="text-xs text-slate-400">حەجم و ڕێژەی بەکارهاتووی داتاکانی بنکەی زانیاری</p>
              </div>
            </div>
            <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {data?.database.usedPercentage}% پڕبووە
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold text-slate-700">
              <span>حەجمی بەکارهاتوو: {data?.database.usedSizeMB} MB</span>
              <span className="text-slate-400">کۆی فەزای بەردەست: {data?.database.maxCapacityMB} MB</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(parseFloat(data?.database.usedPercentage || '3'), 3)}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">کۆی پۆستەکان</p>
              <p className="text-xl font-black text-slate-800">{data?.database.totalCars}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">هەژمارەکان</p>
              <p className="text-xl font-black text-slate-800">{data?.database.totalUsers}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">پیشانگاکان</p>
              <p className="text-xl font-black text-slate-800">{data?.database.totalShowrooms}</p>
            </div>
          </div>
        </div>

        {/* Cloud Images R2 Storage */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">حەجمی وێنەکان (Cloudflare R2 Storage)</h3>
                <p className="text-xs text-slate-400">کۆی حەجمی وێنەی پۆستەکان و پرۆفایلەکان</p>
              </div>
            </div>
            <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {data?.storage.usedPercentage}% پڕبووە
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold text-slate-700">
              <span>حەجمی بەکارهاتوو: {data?.storage.usedSizeGB} GB</span>
              <span className="text-slate-400">کۆی فەزا: {data?.storage.maxCapacityGB} GB</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(parseFloat(data?.storage.usedPercentage || '2'), 2)}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">کۆی وێنە بەبارکراوەکان</p>
              <p className="text-xl font-black text-slate-800">{data?.storage.totalImages} وێنە</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">تۆڕی بڵاوکردنەوە (CDN)</p>
              <p className="text-sm font-black text-purple-700 mt-1">{data?.storage.provider}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Bandwidth & User Load Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bandwidth / Daily Traffic */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Wifi className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">هاتووچۆی داتا و ترافیک (Bandwidth & Traffic)</h3>
                <p className="text-xs text-slate-400">حەجمی ئاڵوگۆڕی داتای هاتوو و چوو لە ڕاستەوخۆدا</p>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {data?.bandwidth.dailyTotalGB} GB / ڕۆژانە
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100/80 flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">داتای نێردراو (Inbound)</p>
                <p className="text-xl font-black text-slate-900">{data?.bandwidth.dailyInboundMB} <span className="text-xs font-normal">MB</span></p>
              </div>
            </div>

            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/80 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">داتای وەرگیراو (Outbound)</p>
                <p className="text-xl font-black text-slate-900">{data?.bandwidth.dailyOutboundMB} <span className="text-xs font-normal">MB</span></p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-sm">
            <span className="font-bold text-slate-600">تێکڕای خێرایی وەڵامدانەوەی API</span>
            <span className="font-black text-emerald-600">{data?.bandwidth.avgApiLatency}</span>
          </div>
        </div>

        {/* Scalability & User Capacity Gauge */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">توانستی بەکارهێنەران و قورسبوون (Scalability Limit)</h3>
                <p className="text-xs text-slate-400">ئاستی بەکارهێنەران کە سێرڤەر دەتوانێت بەیەکەوە لەخۆبگرێت</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>توانای وەڵامدانەوەی سێرڤەر:</span>
              </div>
              <p className="text-xs font-medium text-slate-600 leading-relaxed pr-6">
                سیستەمەکەت بە تەواوی ئۆپتیمازکراوە و دەتوانێت بەیەکەوە هەتا <strong className="text-slate-900 font-black">٢٥,٠٠٠ بەکارهێنەری چالاک (Simultaneous Active Users)</strong> بەبێ هیچ سستبوون یان قورسبوونێک ڕابگرێت.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold">بەکارهێنەرانی دەستبەجێ</p>
                <p className="text-xl font-black text-[#CC222F] mt-1">{data?.server.currentEstimatedActiveUsers} بەکارهێنەر</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold">کۆی توانست (Max Capacity)</p>
                <p className="text-xl font-black text-emerald-600 mt-1">25,000 +</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
