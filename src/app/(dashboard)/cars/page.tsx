"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import { 
  Plus, 
  Eye, 
  Edit2, 
  Trash2,
  Loader2,
  Car as CarIcon,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";

interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  city: string;
  status: string;
  created_at: string;
  year: number;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setCars(data);
    }
    setLoading(false);
  };

  const approveCar = async (id: string) => {
    const { error } = await supabase
      .from('cars')
      .update({ status: 'active' })
      .eq('id', id);
    
    if (!error) {
      setCars(cars.map(c => c.id === id ? { ...c, status: 'active' } : c));
    }
  };

  const deleteCar = async (id: string) => {
    if (!confirm('ئایا دڵنیایت لە سڕینەوەی ئەم سەیارەیە؟')) return;
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (!error) {
      setCars(cars.filter(c => c.id !== id));
      alert('سەیارەکە بە سەرکەوتوویی سڕایەوە');
    } else {
      alert('هەڵەیەک ڕوویدا لە کاتی سڕینەوە: ' + error.message);
    }
  };

  const filteredCars = cars.filter(car => {
    if (filter === 'all') return true;
    return car.status === filter;
  });

  if (loading && cars.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#CC222F]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Car Listings</h1>
          <p className="text-slate-500 mt-1">Manage and monitor all vehicle listings across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-2xl border border-slate-100 flex items-center shadow-sm">
            {(['all', 'pending', 'active'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Link href="/cars/add" className="bg-[#CC222F] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 hover:bg-[#b3191f] transition-all duration-200">
            <Plus className="w-5 h-5" />
            Add New Car
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCars.map((car) => (
              <tr key={car.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <CarIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{car.brand} {car.model}</p>
                      <p className="text-xs text-slate-500">{car.year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-[#CC222F] text-lg">${car.price.toLocaleString()}</td>
                <td className="px-6 py-5 text-slate-600 font-medium">{car.city}</td>
                <td className="px-6 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center w-fit gap-1.5 ${
                    car.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {car.status === 'active' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {car.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {car.status === 'pending' && (
                      <button 
                        onClick={() => approveCar(car.id)}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Eye size={20} /></button>
                    <button 
                      onClick={() => deleteCar(car.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCars.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No cars found matching the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
