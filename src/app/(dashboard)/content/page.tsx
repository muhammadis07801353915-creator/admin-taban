'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Search, Edit2, Trash2, Save, X, 
  ChevronRight, LayoutGrid, Car, MapPin, 
  Palette, ShieldCheck, Settings2, Globe, Image as ImageIcon
} from 'lucide-react';

const CATEGORIES = [
  { id: 'brands', name: 'براندەکان', table: 'meta_brands', icon: Car },
  { id: 'models', name: 'مۆدێلەکان', table: 'meta_models', icon: LayoutGrid },
  { id: 'governorates', name: 'پارێزگاکان', table: 'meta_governorates', icon: MapPin },
  { id: 'plate_types', name: 'جۆری تابلۆ', table: 'meta_plate_types', icon: ShieldCheck },
  { id: 'plate_cities', name: 'شاری تابلۆ', table: 'meta_plate_cities', icon: MapPin },
  { id: 'paint_parts', name: 'پارچەکانی بۆیە', table: 'meta_paint_parts', icon: Palette },
  { id: 'colors', name: 'ڕەنگەکان', table: 'meta_colors', icon: Palette },
  { id: 'import_countries', name: 'وڵاتی هاوردە', table: 'meta_import_countries', icon: Globe },
  { id: 'extra_features', name: 'مواسەفاتی زیادە', table: 'meta_extra_features', icon: Plus },
  { id: 'ads', name: 'ڕیکڵامەکان (Slider)', table: 'meta_ads', icon: ImageIcon },
];

export default function ContentManager() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Form state
  const [isEditing, setIsEditing] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [extraField, setExtraField] = useState(''); // for hex colors or parent IDs

  useEffect(() => {
    fetchItems();
  }, [activeCategory]);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from(activeCategory.table)
      .select('*')
      .order('name', { ascending: true });
    
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newItemName) return;
    
    const payload: any = { name: newItemName };
    if (activeCategory.id === 'colors') payload.hex = extraField || '#CCCCCC';
    if (activeCategory.id === 'ads') payload.image_url = extraField;
    
    const { error } = await supabase.from(activeCategory.table).insert([payload]);
    if (!error) {
      setNewItemName('');
      setExtraField('');
      fetchItems();
    }
  }

  async function handleUpdate(id: any) {
    const { error } = await supabase
      .from(activeCategory.table)
      .update({ 
        name: newItemName, 
        hex: activeCategory.id === 'colors' ? extraField : undefined,
        image_url: activeCategory.id === 'ads' ? extraField : undefined
      })
      .eq('id', id);
    
    if (!error) {
      setIsEditing(null);
      setNewItemName('');
      setExtraField('');
      fetchItems();
    }
  }

  async function handleDelete(id: any) {
    if (!confirm('ئایا دڵنیای لە ڕەشکردنەوەی ئەم بڕگەیە؟')) return;
    const { error } = await supabase.from(activeCategory.table).delete().eq('id', id);
    if (!error) fetchItems();
  }

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Categories */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-black text-slate-900 mb-2">بەڕێوبەری داتا</h1>
          <p className="text-slate-400 text-sm font-medium">کۆنتڕۆڵی لیستەکانی ئەپەکە</p>
        </div>
        
        <div className="flex-1 px-4">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={`flex flex-row items-center justify-between p-4 mb-2 rounded-2xl transition-all ${
                activeCategory.id === cat.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <cat.icon size={20} color={activeCategory.id === cat.id ? 'white' : '#64748b'} />
                <span className="font-bold">{cat.name}</span>
              </div>
              <ChevronRight size={16} />
            </TouchableOpacity>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Search and Add */}
        <div className="p-8 bg-white border-b border-gray-50 flex flex-row items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder={`گەڕان لەناو ${activeCategory.name}...`}
              className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-right font-bold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            {activeCategory.id === 'colors' && (
              <input 
                type="text"
                placeholder="کۆدی ڕەنگ #FFF"
                className="bg-gray-50 border-none rounded-2xl py-3.5 px-6 text-right font-bold w-40"
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
              />
            )}
            {activeCategory.id === 'ads' && (
              <input 
                type="text"
                placeholder="لینکی وێنەی ڕیکڵام"
                className="bg-gray-50 border-none rounded-2xl py-3.5 px-6 text-right font-bold w-64"
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
              />
            )}
            <input 
              type="text"
              placeholder={`ناوی نوێ بۆ ${activeCategory.name}`}
              className="bg-gray-50 border-none rounded-2xl py-3.5 px-6 text-right font-bold w-64"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <button 
              onClick={isEditing ? () => handleUpdate(isEditing.id) : handleAdd}
              className="bg-green-500 text-white h-12 px-8 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-green-500/20 hover:scale-105 transition-transform"
            >
              {isEditing ? <Save size={20} /> : <Plus size={20} />}
              {isEditing ? 'پاشەکەوت' : 'زیادکردن'}
            </button>
            {isEditing && (
              <button onClick={() => { setIsEditing(null); setNewItemName(''); }} className="bg-gray-100 p-3 rounded-2xl text-slate-500"><X /></button>
            )}
          </div>
        </div>

        {/* Grid of Items */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 font-bold">چاوەڕێ بکە...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 p-6 rounded-[30px] flex items-center justify-between group hover:border-slate-900 transition-all shadow-sm hover:shadow-xl">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setIsEditing(item); setNewItemName(item.name); setExtraField(item.hex || ''); }} className="p-2 text-slate-400 hover:text-blue-500"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-slate-800">{item.name}</span>
                    {activeCategory.id === 'colors' && (
                      <div className="w-6 h-6 rounded-full border border-gray-100" style={{ backgroundColor: item.hex }} />
                    )}
                    {activeCategory.id === 'ads' && (
                      <img 
                        src={item.image_url} 
                        className="w-16 h-10 rounded-lg object-cover" 
                        alt="Ad"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TouchableOpacity({ children, onClick, className }: any) {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
