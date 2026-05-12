"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Car as CarIcon, 
  DollarSign, 
  MapPin, 
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Info
} from "lucide-react";

export default function AddCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    city: 'Erbil',
    transmission: 'Automatic',
    fuel_type: 'Benzene',
    color: '',
    mileage: '',
    engine_size: '',
    description: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cars')
        .insert([
          {
            brand: formData.brand,
            model: formData.model,
            year: parseInt(formData.year),
            price: parseFloat(formData.price),
            city: formData.city,
            transmission: formData.transmission,
            fuel_type: formData.fuel_type,
            color: formData.color,
            mileage: formData.mileage,
            engine_size: formData.engine_size,
            description: formData.description,
            status: 'active'
          }
        ]);

      if (error) throw error;
      router.push('/cars');
    } catch (error) {
      console.error(error);
      alert('Error adding car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add New Vehicle</h1>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 px-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= s ? 'bg-[#CC222F] text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {s}
            </div>
            <div className={`flex-1 h-1 rounded-full ${step > s ? 'bg-[#CC222F]' : 'bg-slate-200'}`} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <CarIcon className="w-6 h-6 text-[#CC222F]" />
              <h3 className="text-xl font-bold text-slate-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Brand</label>
                <input 
                  type="text" placeholder="e.g. Mercedes-Benz" 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Model</label>
                <input 
                  type="text" placeholder="e.g. G-Class AMG" 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Year</label>
                <input 
                  type="number" placeholder="2024" 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Price ($)</label>
                <input 
                  type="number" placeholder="180000" 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-[#CC222F]" />
              <h3 className="text-xl font-bold text-slate-900">Technical Specs</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Transmission</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.transmission} onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                >
                  <option>Automatic</option>
                  <option>Manual</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Fuel Type</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.fuel_type} onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                >
                  <option>Benzene</option>
                  <option>Diesel</option>
                  <option>Hybrid</option>
                  <option>Electric</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Color</label>
                <input 
                  type="text" placeholder="Black / White / Red" 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Mileage (KM)</label>
                <input 
                  type="text" placeholder="0 or 15,000" 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-[#CC222F]" />
              <h3 className="text-xl font-bold text-slate-900">Final Details</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Location (City)</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                >
                  <option>Erbil</option>
                  <option>Sulaymaniyah</option>
                  <option>Duhok</option>
                  <option>Baghdad</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description (Optional)</label>
                <textarea 
                  rows={4} placeholder="Write something about the car condition..." 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-8 py-3 text-slate-500 font-bold hover:text-slate-900 transition-colors"
            >
              Previous
            </button>
          ) : <div />}
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#CC222F] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#b3191f] transition-all shadow-xl shadow-red-500/20 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              Publish Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
