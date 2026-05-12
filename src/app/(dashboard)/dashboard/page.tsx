"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Car, 
  Building2, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    cars: 0,
    showrooms: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [carsRes, showroomsRes] = await Promise.all([
      supabase.from('cars').select('*', { count: 'exact', head: true }),
      supabase.from('showrooms').select('*'),
    ]);

    setStats({
      cars: carsRes.count || 0,
      showrooms: showroomsRes.data?.filter(s => s.status === 'approved').length || 0,
      pending: showroomsRes.data?.filter(s => s.status === 'pending').length || 0,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#CC222F]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Real-time statistics from Supabase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] duration-200">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Car className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Cars</p>
            <p className="text-2xl font-bold text-slate-900">{stats.cars}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] duration-200">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Showrooms</p>
            <p className="text-2xl font-bold text-slate-900">{stats.showrooms}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] duration-200">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Quick Status Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">System Connected</h3>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          The Admin Panel is successfully connected to the Supabase database. All changes made here will reflect instantly in the mobile apps.
        </p>
      </div>
    </div>
  );
}
