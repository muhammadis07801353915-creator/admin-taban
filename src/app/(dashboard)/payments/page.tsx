'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, CheckCircle, XCircle, Phone, MessageSquare, Image as ImageIcon, ArrowLeft } from "lucide-react";

interface VipCar {
  id: string;
  created_at: string;
  brand: string;
  model: string;
  year: string;
  price: number;
  phone: string;
  phone2: string | null;
  images: string[];
  status: string;
  vip_plan: boolean;
  payment_type: string;
  payment_method: string;
  payment_proof_images: string[];
  payment_note: string | null;
  payment_phone: string | null;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [vipCars, setVipCars] = useState<VipCar[]>([]);
  const [selected, setSelected] = useState<VipCar | null>(null);
  const [actionLoading, setActionLoading] = useState('');
  const [vipEnabled, setVipEnabled] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch VIP settings
      const { data: settings } = await supabase.from('app_settings').select('vip_plan_enabled').eq('id', 1).single();
      if (settings) setVipEnabled(settings.vip_plan_enabled ?? true);

      // Fetch all pending + VIP cars
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .or('vip_plan.eq.true,status.eq.pending')
        .order('created_at', { ascending: false });

      if (!error && data) setVipCars(data as VipCar[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleToggleVip = async () => {
    setSavingToggle(true);
    const newVal = !vipEnabled;
    const { error } = await supabase.from('app_settings').update({ vip_plan_enabled: newVal }).eq('id', 1);
    if (!error) setVipEnabled(newVal);
    setSavingToggle(false);
  };

  const handleApprove = async (car: VipCar) => {
    setActionLoading(car.id + '-approve');
    const { error } = await supabase.from('cars').update({ status: 'active' }).eq('id', car.id);
    if (!error) {
      setVipCars(prev => prev.map(c => c.id === car.id ? { ...c, status: 'active' } : c));
      setSelected(prev => prev?.id === car.id ? { ...prev, status: 'active' } : prev);
    }
    setActionLoading('');
  };

  const handleReject = async (car: VipCar) => {
    if (!confirm('دڵنیایت کە ئەم ڕیکلامە ڕەفز بکەیتەوە؟')) return;
    setActionLoading(car.id + '-reject');
    const { error } = await supabase.from('cars').update({ status: 'rejected' }).eq('id', car.id);
    if (!error) {
      setVipCars(prev => prev.map(c => c.id === car.id ? { ...c, status: 'rejected' } : c));
      setSelected(prev => prev?.id === car.id ? { ...prev, status: 'rejected' } : prev);
    }
    setActionLoading('');
  };

  const filteredCars = vipCars.filter(c => {
    if (tab === 'pending') return c.status === 'pending';
    if (tab === 'approved') return c.status === 'active';
    if (tab === 'rejected') return c.status === 'rejected';
    return true;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-full">✓ وەرگیرا</span>;
    if (status === 'rejected') return <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-full">✗ ڕەفزکرا</span>;
    return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full">⏳ چاوەڕوان</span>;
  };

  if (loading) return <div className="p-8 text-white text-xl">چاوەڕوان بە...</div>;

  // Detail view
  if (selected) {
    const isBalance = selected.payment_type === 'balance';
    const isCard = selected.payment_type === 'card';
    const isUnknown = !selected.payment_type;
    const isPending = selected.status === 'pending';
    return (
      <div className="p-8 max-w-3xl mx-auto" dir="rtl">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 rotate-180" />
          <span>گەڕانەوە</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">{selected.brand} {selected.model} {selected.year}</h1>
            <p className="text-slate-400 mt-1">ڕیکلامی VIP - پێویستی بە پێداچوونەوە هەیە</p>
          </div>
          {getStatusBadge(selected.status)}
        </div>

        {/* Payment Info */}
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-black text-white mb-5 flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-yellow-400" />
            زانیاری پارەدان
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 rounded-2xl p-4">
              <p className="text-slate-400 text-sm mb-1">شێوازی پاڕەدان</p>
              <p className="text-white font-bold text-lg">
                {isBalance ? '📲 باڵانس' : isCard ? '🖼️ وێنەی کارت' : '⚠️ نازانرێت - پێشتر بزانە'}
              </p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-4">
              <p className="text-slate-400 text-sm mb-1">کۆمپانیا</p>
              <p className="text-white font-bold text-lg capitalize">
                {selected.payment_method === 'korek' ? '🔵 کۆرەک' : selected.payment_method === 'asiacell' ? '🔴 ئاسیاسێل' : selected.payment_method || '-'}
              </p>
            </div>
          </div>

          {isUnknown ? (
            <div className="bg-slate-700/50 border border-slate-600 rounded-2xl p-5 text-center">
              <p className="text-slate-300 font-bold text-lg mb-2">⚠️ زانیاریی پاڕەدان تۆمار نەکراوە</p>
              <p className="text-slate-400 text-sm">ئەم ۆتۆمبیڵە کاتێک ستوونەکانی VIP لە داتابەیس نەبوون تۆمار کرا. تکایە بە ژمارەی بەکارهێنەر پەیوەندیبکەرەوەیە وی لەگەڵ بزانیتە چۆن پاڕەکەی ناردووە.</p>
            </div>
          ) : isBalance ? (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
              <p className="text-blue-300 font-bold mb-2">پاڕەی باڵانس نێرا بۆ:</p>
              <p className="text-white font-black text-xl" dir="ltr">
                {selected.payment_method === 'korek' ? `*215*[ژمارەی تۆ]*10000#` : `*123*10000*[ژمارەی تۆ]#`}
              </p>
              <p className="text-slate-400 text-sm mt-2">لە ئەم ژمارەیەوە: <span className="text-white font-bold" dir="ltr">{selected.phone}</span></p>
            </div>
          ) : (
            <>
              {selected.payment_proof_images && selected.payment_proof_images.length > 0 ? (
                <div>
                  <p className="text-slate-400 font-bold mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> وێنەی کارتی پڕکردنەوە ({selected.payment_proof_images.length} وێنە)</p>
                  <div className="flex flex-wrap gap-3">
                    {selected.payment_proof_images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`proof-${i}`} className="w-32 h-32 object-cover rounded-2xl border-2 border-slate-600 hover:border-yellow-400 transition-all cursor-zoom-in" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 font-bold">
                  ⚠️ هیچ وێنەیەکی کارت نێردراو نییە
                </div>
              )}
            </>
          )}

          {selected.payment_note && (
            <div className="mt-4 bg-slate-900 rounded-2xl p-4">
              <p className="text-slate-400 text-sm mb-1 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> تێبینی بەکارهێنەر</p>
              <p className="text-white">{selected.payment_note}</p>
            </div>
          )}
        </div>

        {/* User Contact */}
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
            <Phone className="w-6 h-6 text-green-400" />
            پەیوەندی بە بەکارهێنەر
          </h2>
          <div className="flex flex-wrap gap-3">
            <a href={`https://wa.me/${selected.phone?.replace(/^0/, '964')}`} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl transition-all">
              <span>📱</span> وەتسئاپ: {selected.phone}
            </a>
            {selected.phone2 && (
              <a href={`https://wa.me/${selected.phone2?.replace(/^0/, '964')}`} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-3 rounded-2xl transition-all">
                📱 {selected.phone2}
              </a>
            )}
          </div>
        </div>

        {/* Car Images */}
        {selected.images && selected.images.length > 0 && (
          <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-black text-white mb-4">وێنەکانی ئۆتۆمبیلەکە</h2>
            <div className="flex flex-wrap gap-3">
              {selected.images.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`car-${i}`} className="w-28 h-28 object-cover rounded-2xl border-2 border-slate-600 hover:border-white transition-all" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex gap-4">
            <button
              onClick={() => handleApprove(selected)}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 rounded-2xl text-xl transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-6 h-6" />
              {actionLoading === selected.id + '-approve' ? 'چاوەڕوان...' : '✓ وەرگرتنی ڕیکلام'}
            </button>
            <button
              onClick={() => handleReject(selected)}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl text-xl transition-all disabled:opacity-50"
            >
              <XCircle className="w-6 h-6" />
              {actionLoading === selected.id + '-reject' ? 'چاوەڕوان...' : '✗ ڕەفزکردنەوە'}
            </button>
          </div>
        )}
        {!isPending && (
          <div className="text-center py-4 text-slate-400 text-lg">
            ئەم ڕیکلامە پێداچوونەوەی بۆ کراوە - {getStatusBadge(selected.status)}
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-yellow-400" />
            پارەدان و ڕیکلامی VIP
          </h1>
          <p className="text-slate-400 mt-2">سەیرکردن و پێداچوونەوەی داواکارییەکانی VIP</p>
        </div>
        {/* VIP Toggle */}
        <div className="flex items-center gap-3 bg-slate-800 px-5 py-3 rounded-2xl border border-slate-700">
          <span className="text-slate-300 font-bold text-sm">چالاككردنی VIP</span>
          <button onClick={handleToggleVip} disabled={savingToggle}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${vipEnabled ? 'bg-emerald-500' : 'bg-slate-600'} ${savingToggle ? 'opacity-50' : ''}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${vipEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${tab === t ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
            {t === 'pending' ? `⏳ چاوەڕوان (${vipCars.filter(c => c.status === 'pending').length})` :
             t === 'approved' ? `✓ وەرگیراو (${vipCars.filter(c => c.status === 'active').length})` :
             `✗ ڕەفزکراو (${vipCars.filter(c => c.status === 'rejected').length})`}
          </button>
        ))}
        <button onClick={fetchAll} className="mr-auto px-4 py-2 text-slate-400 hover:text-white text-sm border border-slate-700 rounded-full">↻ نوێکردنەوە</button>
      </div>

      {/* List */}
      {filteredCars.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-xl">هیچ ڕیکلامێکی VIP نییە لەم بەشەدا</div>
      ) : (
        <div className="space-y-4">
          {filteredCars.map(car => (
            <div key={car.id} onClick={() => setSelected(car)}
              className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex items-center gap-6 cursor-pointer hover:border-yellow-400/50 hover:bg-slate-750 transition-all group">
              {car.images?.[0] && (
                <img src={car.images[0]} alt={car.brand} className="w-20 h-20 object-cover rounded-2xl flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-black text-xl">{car.brand} {car.model} {car.year}</h3>
                  {getStatusBadge(car.status)}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span>💰 {car.price?.toLocaleString()} IQD</span>
                  <span>📱 {car.phone}</span>
                  <span className="flex items-center gap-1">
                    {car.payment_type === 'balance' ? '📲 باڵانس' : '🖼️ وێنەی کارت'}
                    {car.payment_method && <span className="capitalize">({car.payment_method})</span>}
                  </span>
                  <span>🕐 {new Date(car.created_at).toLocaleDateString('ar-IQ')}</span>
                </div>
              </div>
              <div className="text-slate-500 group-hover:text-yellow-400 transition-colors text-2xl">←</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
