'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, Eye, Car, Users, 
  Activity, Clock, ChevronLeft, ChevronRight, Search
} from 'lucide-react';

interface CarData {
  id: string;
  brand: string;
  model: string;
  year: string;
  price: number;
  status: string;
  views: number;
  images: string[];
  image_urls: string[];
  created_at: string;
  city: string;
}

interface AppVisit {
  id: string;
  visited_at: string;
  device_id: string;
  user_id: string | null;
}

interface DailyVisit {
  date: string;
  count: number;
  label: string;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<CarData[]>([]);
  const [allVisits, setAllVisits] = useState<DailyVisit[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedDateCount, setSelectedDateCount] = useState(0);
  const [totalUniqueToday, setTotalUniqueToday] = useState(0);
  const [carSearch, setCarSearch] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'created_at'>('views');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const found = allVisits.find(v => v.date === selectedDate);
    setSelectedDateCount(found?.count || 0);
  }, [selectedDate, allVisits]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('id, brand, model, year, price, status, views, images, image_urls, created_at, city')
        .order('views', { ascending: false });

      if (carError) {
        console.error("Supabase Error fetching cars:", carError.message);
      } else if (carData) {
        setCars(carData);
      }

      // Fetch app visits
      const { data: visitData } = await supabase
        .from('app_visits')
        .select('id, visited_at, device_id, user_id')
        .order('visited_at', { ascending: true });

      if (visitData) processVisits(visitData as AppVisit[]);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const processVisits = (visitData: AppVisit[]) => {
    const byDate: Record<string, Set<string>> = {};

    visitData.forEach(v => {
      const date = v.visited_at.split('T')[0];
      if (!byDate[date]) byDate[date] = new Set();
      byDate[date].add(v.user_id || v.device_id);
    });

    const dailyArr: DailyVisit[] = Object.entries(byDate).map(([date, users]) => {
      const d = new Date(date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let label = date;
      if (d.toDateString() === today.toDateString()) label = 'ئەمڕۆ';
      else if (d.toDateString() === yesterday.toDateString()) label = 'دوێنێ';
      else label = d.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' });

      return { date, count: users.size, label };
    }).sort((a, b) => a.date.localeCompare(b.date));

    setAllVisits(dailyArr);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntry = dailyArr.find(d => d.date === todayStr);
    setTotalUniqueToday(todayEntry?.count || 0);

    // Set today as default selected
    const today = todayEntry?.count || 0;
    setSelectedDateCount(today);
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    // Don't go into the future
    if (d > new Date()) return;
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'ئەمڕۆ';
    if (d.toDateString() === yesterday.toDateString()) return 'دوێنێ';
    return d.toLocaleDateString('ku-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const totalViews = cars.reduce((sum, c) => sum + (c.views || 0), 0);

  const filteredCars = cars
    .filter(c =>
      carSearch === '' ||
      `${c.brand} ${c.model}`.toLowerCase().includes(carSearch.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === 'views'
        ? (b.views || 0) - (a.views || 0)
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const maxVisits = Math.max(...allVisits.map(v => v.count), 1);
  const last14Days = allVisits.slice(-14);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#CC222F] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-[#CC222F]" />
          داتا و ئامارەکان
        </h1>
        <p className="text-slate-500 mt-1">شیکردنەوەی پۆستەکان، بینەران و سەردانی ڕۆژانەی بەکارهێنەران</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'کۆی پۆستەکان', value: cars.length, icon: Car, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'کۆی بینەران', value: totalViews.toLocaleString(), icon: Eye, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'سەردانی ئەمڕۆ', value: totalUniqueToday, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'کۆی ڕۆژەکان', value: allVisits.length, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-900">{card.value}</div>
            <div className="text-sm text-slate-500 font-medium mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ===== SECTION 1: Daily Visit Picker ===== */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">سەردانی ڕۆژانە</h2>
            <p className="text-xs text-slate-400 mt-0.5">هەر بەکارهێنەر/مۆبایل رۆژانە تەنها یەکجار دەژمێردرێت</p>
          </div>
        </div>

        {/* Big date picker with count */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={() => changeDate(-1)}
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>

          <div className="text-center">
            <div className="text-base font-bold text-slate-500 mb-1">{formatDateLabel(selectedDate)}</div>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="text-6xl font-black text-emerald-500">{selectedDateCount}</span>
              <span className="text-lg text-slate-400 font-medium">بەکارهێنەر</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {selectedDate}
            </div>
          </div>

          <button
            onClick={() => changeDate(1)}
            disabled={selectedDate >= new Date().toISOString().split('T')[0]}
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Bar chart for last 14 days */}
        {last14Days.length > 0 ? (
          <div>
            <p className="text-xs text-slate-400 font-medium mb-3 text-center">١٤ ڕۆژی ڕابردوو</p>
            <div className="flex items-end gap-1.5 h-24">
              {last14Days.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                  onClick={() => setSelectedDate(v.date)}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {v.count}
                  </div>
                  <div
                    className={`w-full rounded-lg transition-all ${
                      v.date === selectedDate
                        ? 'bg-emerald-500 ring-2 ring-emerald-300'
                        : 'bg-emerald-200 hover:bg-emerald-400'
                    }`}
                    style={{ height: `${Math.max((v.count / maxVisits) * 100, 8)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[10px] text-slate-400">{last14Days[0]?.label}</span>
              <span className="text-[10px] text-slate-400">ئەمڕۆ</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-24 text-slate-400">
            <Clock className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">هیچ داتایەک نییە هێشتا</p>
            <p className="text-xs mt-1">تکایە SQL کۆدەکە لە Supabase بخەرەوە</p>
          </div>
        )}

        {/* Date list */}
        {allVisits.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-50">
            <p className="text-xs font-bold text-slate-400 mb-3">تەواوی ڕۆژەکان</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {[...allVisits].reverse().map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDate(v.date)}
                  className={`flex justify-between items-center px-3 py-2 rounded-xl text-xs transition-all ${
                    v.date === selectedDate
                      ? 'bg-emerald-500 text-white font-black'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>{v.label}</span>
                  <span className="font-black">{v.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== SECTION 2: ALL Posts with Views ===== */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">هەموو پۆستەکان و بینەریان</h2>
              <p className="text-xs text-slate-400 mt-0.5">{cars.length} پۆست · کۆی بینەران: {totalViews.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="گەڕان..."
                value={carSearch}
                onChange={e => setCarSearch(e.target.value)}
                className="border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC222F]/20 w-40"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'views' | 'created_at')}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC222F]/20"
            >
              <option value="views">زۆرترین بینەر</option>
              <option value="created_at">نوێترین</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">پۆست</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">شار</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">نرخ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">بارودۆخ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">بینەران 👁</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">بەروار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCars.map((car, idx) => (
                <tr key={car.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-medium text-sm">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {(car.images?.[0] || car.image_urls?.[0]) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={car.images?.[0] || car.image_urls?.[0]}
                          alt={car.model}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Car className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{car.brand} {car.model}</p>
                        <p className="text-xs text-slate-400">{car.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{car.city || '—'}</td>
                  <td className="px-6 py-4 font-bold text-[#CC222F] text-sm">
                    {car.price?.toLocaleString()} <span className="text-xs font-normal text-slate-400">IQD</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      car.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                      car.status === 'sold' ? 'bg-slate-100 text-slate-500' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {car.status === 'active' ? 'چالاک' : car.status === 'sold' ? 'فرۆشراو' : 'چاوەڕوانی'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-orange-400" />
                      <span className={`font-black text-lg ${
                        (car.views || 0) > 10 ? 'text-orange-500' :
                        (car.views || 0) > 0 ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {(car.views || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(car.created_at).toLocaleDateString('ku-IQ')}
                  </td>
                </tr>
              ))}
              {filteredCars.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">هیچ پۆستێک نەدۆزرایەوە</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50">
          <p className="text-xs text-slate-400 text-center">
            کۆی {filteredCars.length} پۆست نیشاندرا · کۆی بینەران: {filteredCars.reduce((s, c) => s + (c.views || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

    </div>
  );
}
