'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Plus, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';

interface City {
  id: number;
  name: string;
  governorate_id: number;
}

interface Governorate {
  id: number;
  name: string;
  cities: City[];
}

export default function LocationsPage() {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGov, setExpandedGov] = useState<number | null>(null);
  const [newGovName, setNewGovName] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [addingCityFor, setAddingCityFor] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data: govs } = await supabase.from('governorates').select('*').order('id');
    const { data: cities } = await supabase.from('cities').select('*').order('id');
    
    if (govs) {
      const merged = govs.map(g => ({
        ...g,
        cities: (cities || []).filter(c => c.governorate_id === g.id)
      }));
      setGovernorates(merged);
    }
    setLoading(false);
  };

  const addGovernorate = async () => {
    if (!newGovName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('governorates').insert({ name: newGovName.trim() });
    if (!error) { setNewGovName(''); fetchAll(); }
    setSaving(false);
  };

  const deleteGovernorate = async (id: number) => {
    if (!confirm('دڵنیایی؟ هەموو شارەکانیشی دەسڕێتەوە')) return;
    await supabase.from('governorates').delete().eq('id', id);
    fetchAll();
  };

  const addCity = async (govId: number) => {
    if (!newCityName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('cities').insert({ name: newCityName.trim(), governorate_id: govId });
    if (!error) { setNewCityName(''); setAddingCityFor(null); fetchAll(); }
    setSaving(false);
  };

  const deleteCity = async (id: number) => {
    await supabase.from('cities').delete().eq('id', id);
    fetchAll();
  };

  if (loading) return <div className="p-8 text-white">چاوەڕوان بە...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <MapPin className="w-8 h-8 text-[#CC222F]" />
          شار و پارێزگاکان
        </h1>
        <p className="text-slate-400 mt-2">بەڕێوەبردنی پارێزگا و شار/قەزاکان</p>
      </div>

      {/* Add new governorate */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-6 flex gap-3">
        <button
          onClick={addGovernorate}
          disabled={saving}
          className="bg-[#CC222F] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#b3191f] transition flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> پارێزگای نوێ
        </button>
        <input
          type="text"
          value={newGovName}
          onChange={e => setNewGovName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGovernorate()}
          placeholder="ناوی پارێزگا..."
          className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-right"
        />
      </div>

      {/* Governorates list */}
      <div className="space-y-3">
        {governorates.map(gov => (
          <div key={gov.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            {/* Governorate header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteGovernorate(gov.id)}
                  className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setAddingCityFor(gov.id); setExpandedGov(gov.id); }}
                  className="text-emerald-400 hover:text-emerald-300 p-1 rounded-lg hover:bg-emerald-500/10"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-slate-400 text-sm">{gov.cities.length} شار</span>
              </div>
              <button
                onClick={() => setExpandedGov(expandedGov === gov.id ? null : gov.id)}
                className="flex items-center gap-2 text-white font-bold text-lg"
              >
                {expandedGov === gov.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                {gov.name}
              </button>
            </div>

            {/* Cities */}
            {expandedGov === gov.id && (
              <div className="border-t border-slate-700 px-5 pb-4 pt-3">
                {/* Add city input */}
                {addingCityFor === gov.id && (
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => setAddingCityFor(null)} className="text-slate-400 p-1">
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addCity(gov.id)}
                      disabled={saving}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                    >
                      زیادکردن
                    </button>
                    <input
                      autoFocus
                      type="text"
                      value={newCityName}
                      onChange={e => setNewCityName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCity(gov.id)}
                      placeholder="ناوی شار یان قەزا..."
                      className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-xl px-3 py-2 text-right text-sm"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {gov.cities.map(city => (
                    <div key={city.id} className="flex items-center gap-1 bg-slate-700 rounded-xl px-3 py-1.5">
                      <button onClick={() => deleteCity(city.id)} className="text-slate-500 hover:text-red-400 transition">
                        <X className="w-3 h-3" />
                      </button>
                      <span className="text-white text-sm font-medium">{city.name}</span>
                    </div>
                  ))}
                  {gov.cities.length === 0 && (
                    <p className="text-slate-500 text-sm">هیچ شارێک نییە، دەستی بکە بە زیادکردن</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
