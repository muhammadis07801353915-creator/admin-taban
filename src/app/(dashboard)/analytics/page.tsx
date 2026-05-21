'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Eye, Search, Car, Award } from 'lucide-react';
import Image from 'next/image';

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
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [mostSold, setMostSold] = useState<{name: string, count: number}[]>([]);
  const [mostPosted, setMostPosted] = useState<{name: string, count: number}[]>([]);
  const [topViewed, setTopViewed] = useState<CarData[]>([]);

  // Mock data for searches
  const topSearches = [
    { name: 'Toyota Corolla', percentage: 35 },
    { name: 'Hyundai Elantra', percentage: 22 },
    { name: 'Nissan Sentra', percentage: 18 },
    { name: 'Kia Optima', percentage: 15 },
    { name: 'Chevrolet Camaro', percentage: 10 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: cars, error } = await supabase
        .from('cars')
        .select('*');

      if (error) throw error;
      if (!cars) return;

      // Group by Brand + Model
      const salesCount: Record<string, number> = {};
      const postsCount: Record<string, number> = {};

      cars.forEach(car => {
        const name = `${car.brand} ${car.model}`;
        
        // Count all posts
        postsCount[name] = (postsCount[name] || 0) + 1;
        
        // Count sold
        if (car.status === 'sold') {
          salesCount[name] = (salesCount[name] || 0) + 1;
        }
      });

      // Sort and set Most Sold
      const sortedSales = Object.entries(salesCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setMostSold(sortedSales);

      // Sort and set Most Posted
      const sortedPosts = Object.entries(postsCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setMostPosted(sortedPosts);

      // Top Viewed
      const sortedViews = [...cars]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
      setTopViewed(sortedViews);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">چاوەڕوان بە...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-[#CC222F]" />
          ئامارەکان و داتا
        </h1>
        <p className="text-slate-400 mt-2">شیکردنەوەی داتاکانی فرۆش، گەڕان و بینەرانی ئەپەکە</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Most Searched (Mock) */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">زۆرترین گەڕان (سێرچ)</h2>
          </div>
          <div className="space-y-4">
            {topSearches.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1 text-slate-300">
                  <span className="font-bold">{item.name}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">ئەم داتایە تاقیکارییە تا بەستنەوەی سیستەمی گەڕان</p>
        </div>

        {/* Most Sold */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">زۆرترین فرۆش</h2>
          </div>
          <div className="space-y-4">
            {mostSold.length > 0 ? mostSold.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                    {i + 1}
                  </div>
                  <span className="text-white font-bold">{item.name}</span>
                </div>
                <div className="text-emerald-400 font-black">{item.count} فرۆشراو</div>
              </div>
            )) : <p className="text-slate-400 text-center py-4">هیچ داتایەک نییە</p>}
          </div>
        </div>

        {/* Most Posted */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">زۆرترین بڵاوکراوە</h2>
          </div>
          <div className="space-y-4">
            {mostPosted.length > 0 ? mostPosted.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">
                    {i + 1}
                  </div>
                  <span className="text-white font-bold">{item.name}</span>
                </div>
                <div className="text-purple-400 font-black">{item.count} پۆست</div>
              </div>
            )) : <p className="text-slate-400 text-center py-4">هیچ داتایەک نییە</p>}
          </div>
        </div>

        {/* Top Viewed Posts */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">زۆرترین بینەر</h2>
          </div>
          <div className="space-y-4">
            {topViewed.length > 0 ? topViewed.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.images?.[0] || item.image_urls?.[0] || 'https://via.placeholder.com/150'} 
                    alt={item.model}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div>
                    <span className="text-white font-bold block">{item.brand} {item.model}</span>
                    <span className="text-slate-400 text-xs">{item.year}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg">
                  <span className="text-orange-400 font-black">{item.views || 0}</span>
                  <Eye className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            )) : <p className="text-slate-400 text-center py-4">هیچ داتایەک نییە</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
