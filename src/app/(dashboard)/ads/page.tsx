'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, ExternalLink, 
  Image as ImageIcon, Loader2,
  Layout, Bookmark, CheckCircle2
} from 'lucide-react';

export default function AdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<'slider' | 'banner'>('slider');

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
    const { data } = await supabase
      .from('meta_ads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setAds(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!name || !imageUrl) {
      alert('تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('meta_ads')
        .insert([{ name, image_url: imageUrl, type, link }]);

      if (error) throw error;
      
      setName('');
      setImageUrl('');
      setLink('');
      fetchAds();
      alert('ڕیکڵامەکە بە سەرکەوتوویی بڵاوکرایەوە');
    } catch (error: any) {
      console.error(error);
      alert('هەڵەیەک ڕوویدا لە کاتی بڵاوکردنەوە: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ئایا دڵنیایت لە سڕینەوەی ئەم ڕیکڵامە؟')) return;
    const { error } = await supabase.from('meta_ads').delete().eq('id', id);
    if (!error) fetchAds();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">بەڕێوبەرایەتی ڕیکڵام و سلایدەر</h1>
          <p className="text-slate-500 mt-1">کۆنتڕۆڵی سلایدەری سەرەوە و بانەرەکانی ناو ئەپەکە بکە.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 h-fit">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-xl">
               <Plus className="w-5 h-5 text-[#CC222F]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">زیادکردنی ڕیکڵام</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">ناوی ڕیکڵام</label>
              <input 
                type="text" 
                placeholder="بۆ نموونە: ئۆفەری جەژن"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20 font-bold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">جۆری ڕیکڵام</label>
              <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                <button 
                  onClick={() => setType('slider')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${type === 'slider' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  سلایدەری سەرەوە
                </button>
                <button 
                  onClick={() => setType('banner')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${type === 'banner' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  بانەری ناو لیست
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">لینکی دەرەکی وێنە</label>
              <div className="relative">
                <ExternalLink className="absolute left-4 top-4 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#CC222F]/20 font-bold"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-slate-400 px-2 italic">* لینکی وێنەکە دەبێت ڕاستەوخۆ بێت و بە .jpg یان .png کۆتایی بێت</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">لینکی کرتەکردن (ئارەزوومەندانە)</label>
              <div className="relative">
                <ExternalLink className="absolute left-4 top-4 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="https://facebook.com/..."
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#CC222F]/20 font-bold"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-slate-400 px-2 italic">* کاتێک بەکارهێنەر کلیک لە ڕیکڵامەکە دەکات دەچێتە ئەم لینکە</p>
            </div>

            {imageUrl && (
              <div className="mt-4">
                <label className="text-sm font-bold text-slate-700 mb-2 block">پێشبینین</label>
                <img 
                  src={imageUrl} 
                  className="w-full h-32 object-cover rounded-2xl border border-slate-100" 
                  alt="Preview"
                  onError={(e: any) => e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'}
                />
              </div>
            )}

            <button 
              onClick={handleAdd}
              disabled={submitting}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
              بڵاوکردنەوەی ڕیکڵام
            </button>
          </div>
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900">ڕیکڵامە چالاکەکان ({ads.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span className="font-bold">باردەکرێت...</span>
              </div>
            ) : ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-40">
                  <img src={ad.image_url} className="w-full h-full object-cover" alt={ad.name} />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      ad.type === 'slider' ? 'bg-blue-500 text-white' : 'bg-[#CC222F] text-white'
                    }`}>
                      {ad.type === 'slider' ? 'Top Slider' : 'Banner'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(ad.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{ad.name}</h4>
                    {ad.link && (
                      <a href={ad.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-1 mt-1">
                        <ExternalLink size={12} />
                        کردنەوەی لینک
                      </a>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                      Created: {new Date(ad.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                </div>
              </div>
            ))}

            {!loading && ads.length === 0 && (
              <div className="col-span-2 py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p className="font-bold">هیچ ڕیکڵامێک نییە</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
