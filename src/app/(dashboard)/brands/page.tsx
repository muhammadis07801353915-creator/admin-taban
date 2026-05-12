"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Edit2, Loader2, 
  Image as ImageIcon, Check, X, 
  ChevronRight, ChevronLeft, Layers, 
  CheckCircle2, Download, Search
} from "lucide-react";

const COMMON_BRANDS = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Kia", "Hyundai", "Volkswagen", "Audi", "Lexus", "Land Rover", "Jeep", "GMC", "Dodge", "Mazda", "Subaru", "Volvo", "Mitsubishi"].slice(0, 50);

const COMMON_MODELS: Record<string, string[]> = {
  "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra", "Prius", "Avalon", "Sienna", "4Runner", "Sequoia", "Land Cruiser", "Supra", "GR86", "Venza", "C-HR", "Crown", "Yaris"],
  "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "Ridgeline", "HR-V", "Passport", "Insight"],
  "BMW": ["3 Series", "5 Series", "X3", "X5", "7 Series", "X1", "X7", "4 Series", "M3", "M5", "Z4", "i4", "iX", "i7"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "R8", "TT", "e-tron", "e-tron GT"],
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "CLA", "CLS", "SL", "AMG GT", "EQE", "EQS"],
  "Volkswagen": ["Golf", "Polo", "Passat", "Tiguan", "Touareg", "Jetta", "Arteon", "ID.3", "ID.4", "T-Roc", "T-Cross"],
  "Ford": ["Fiesta", "Focus", "Mustang", "Ranger", "F-150", "Explorer", "Escape", "Edge", "Mach-E", "Bronco", "Expedition"],
  "Chevrolet": ["Spark", "Malibu", "Camaro", "Corvette", "Equinox", "Tahoe", "Suburban", "Silverado", "Traverse", "Blazer"],
  "Nissan": ["Micra", "Altima", "Maxima", "Sentra", "370Z", "GT-R", "Juke", "Qashqai", "X-Trail", "Patrol", "Pathfinder", "Frontier"],
  "Kia": ["Picanto", "Rio", "Ceed", "Stinger", "Sportage", "Sorento", "Carnival", "EV6", "Telluride", "Seltos", "K5"],
  "Hyundai": ["i10", "i20", "i30", "Elantra", "Sonata", "Kona", "Tucson", "Santa Fe", "Ioniq 5", "Palisade", "Venue"],
  "Lexus": ["IS", "ES", "LS", "NX", "RX", "GX", "LX", "LC", "UX"],
  "Land Rover": ["Defender", "Discovery", "Range Rover", "Range Rover Sport", "Velar", "Evoque"],
  "Jeep": ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator"],
  "GMC": ["Terrain", "Acadia", "Yukon", "Sierra", "Canyon"],
  "Dodge": ["Charger", "Challenger", "Durango", "Ram 1500", "Ram 2500"],
  "Mazda": ["2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-9", "MX-5"],
  "Subaru": ["Impreza", "Legacy", "Forester", "Outback", "XV", "WRX", "BRZ"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
  "Mitsubishi": ["Mirage", "Lancer", "ASX", "Outlander", "Pajero", "L200"]
};

const COMMON_SPECS = ["Standard", "Full Option", "Half Option", "Base", "Premium", "Limited", "Sport", "Touring", "Platinum"];

const MODEL_SPECS: Record<string, string[]> = {
  "Land Cruiser": ["GXR", "VXR", "GX", "VX", "EXR", "Safari", "GR Sport", "V6", "V8"],
  "Patrol": ["XE", "SE", "LE", "Platinum", "Nismo", "Titanium", "Super Safari"],
  "Camry": ["LE", "SE", "XLE", "XSE", "TRD", "Hybrid"],
  "Corolla": ["L", "LE", "SE", "XLE", "XSE"],
  "Hilux": ["GL", "GLX", "Adventure", "Invincible"],
  "Prado": ["TX", "TXL", "VXL"],
  "Tucson": ["Smart", "Comfort", "Executive", "Premium", "Ultimate", "N Line"],
  "Santa Fe": ["SE", "SEL", "Limited", "Calligraphy"],
  "Elantra": ["SE", "SEL", "Limited", "N Line"],
  "Sportage": ["LX", "S", "EX", "SX", "SX Prestige"],
  "Sorento": ["LX", "S", "EX", "SX", "SX Prestige"],
  "Tahoe": ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
  "Silverado": ["WT", "Custom", "LT", "RST", "LTZ", "High Country"],
  "F-150": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Raptor"],
  "Mustang": ["EcoBoost", "GT", "Mach 1", "Shelby GT500"],
  "Range Rover": ["HSE", "Autobiography", "SV"],
  "G-Class": ["G500", "G63 AMG"],
  "C-Class": ["C200", "C300", "C43 AMG", "C63 AMG"],
  "E-Class": ["E200", "E300", "E350", "E450", "E53 AMG", "E63 AMG"],
  "S-Class": ["S450", "S500", "S580", "S680 Maybach"],
  "A4": ["Premium", "Premium Plus", "Prestige"],
  "A6": ["Premium", "Premium Plus", "Prestige"],
  "Q5": ["Premium", "Premium Plus", "Prestige"],
  "Q7": ["Premium", "Premium Plus", "Prestige"]
};

type ViewState = 'brands' | 'models' | 'specs';

export default function BrandsPage() {
  const [view, setView] = useState<ViewState>('brands');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [specs, setSpecs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingLogo, setIsEditingLogo] = useState<any>(null);
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    if (view === 'brands') fetchBrands();
    else if (view === 'models' && selectedBrand) fetchModels(selectedBrand.id);
    else if (view === 'specs' && selectedModel) fetchSpecs(selectedModel.id);
  }, [view, selectedBrand, selectedModel]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error) throw error;
      setBrands(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchModels = async (brandId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('models').select('*').eq('brand_id', brandId).order('name');
      if (error) throw error;
      setModels(data || []);
      
      // Auto-bulk if empty and common models exist
      if (data && data.length === 0 && selectedBrand) {
        const list = COMMON_MODELS[selectedBrand.name] || COMMON_MODELS[Object.keys(COMMON_MODELS).find(k => k.toLowerCase() === selectedBrand.name.toLowerCase()) || ''] || [];
        if (list.length > 0) {
          handleBulk(true);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSpecs = async (modelId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('specs').select('*').eq('model_id', modelId).order('name');
      if (error) throw error;
      setSpecs(data || []);

      // Auto-bulk if empty
      if (data && data.length === 0 && selectedModel) {
        const list = MODEL_SPECS[selectedModel.name] || MODEL_SPECS[Object.keys(MODEL_SPECS).find(k => k.toLowerCase() === selectedModel.name.toLowerCase()) || ''] || COMMON_SPECS;
        if (list.length > 0) {
          handleBulk(true);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleBulk = async (silent = false) => {
    if (!silent && !confirm('Proceed with bulk import?')) return;
    setLoading(true);
    try {
      if (view === 'brands') {
        const existing = brands.map(b => b.name.toLowerCase());
        const toAdd = COMMON_BRANDS.filter(b => !existing.includes(b.toLowerCase())).map(name => ({ name }));
        if (toAdd.length > 0) await supabase.from('brands').insert(toAdd);
        await fetchBrands();
      } else if (view === 'models' && selectedBrand) {
        const list = COMMON_MODELS[selectedBrand.name] || COMMON_MODELS[Object.keys(COMMON_MODELS).find(k => k.toLowerCase() === selectedBrand.name.toLowerCase()) || ''] || [];
        const existing = models.map(m => m.name.toLowerCase());
        const toAdd = list.filter(m => !existing.includes(m.toLowerCase())).map(name => ({ name, brand_id: selectedBrand.id }));
        if (toAdd.length > 0) await supabase.from('models').insert(toAdd);
        await fetchModels(selectedBrand.id);
      } else if (view === 'specs' && selectedModel) {
        const list = MODEL_SPECS[selectedModel.name] || MODEL_SPECS[Object.keys(MODEL_SPECS).find(k => k.toLowerCase() === selectedModel.name.toLowerCase()) || ''] || COMMON_SPECS;
        const existing = specs.map(s => s.name.toLowerCase());
        const toAdd = list.filter(s => !existing.includes(s.toLowerCase())).map(name => ({ name, model_id: selectedModel.id }));
        if (toAdd.length > 0) await supabase.from('specs').insert(toAdd);
        await fetchSpecs(selectedModel.id);
      }
    } catch (e) { if (!silent) alert('Error during bulk import'); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newItemName) return;
    setLoading(true);
    try {
      let res;
      if (view === 'brands') res = await supabase.from('brands').insert([{ name: newItemName }]);
      else if (view === 'models') res = await supabase.from('models').insert([{ name: newItemName, brand_id: selectedBrand.id }]);
      else if (view === 'specs') res = await supabase.from('specs').insert([{ name: newItemName, model_id: selectedModel.id }]);
      
      if (res?.error) throw res.error;
      setNewItemName('');
      setIsAdding(false);
      if (view === 'brands') await fetchBrands();
      else if (view === 'models') await fetchModels(selectedBrand.id);
      else await fetchSpecs(selectedModel.id);
    } catch (e) { alert('Error adding item'); }
    finally { setLoading(false); }
  };

  const updateLogo = async () => {
    if (!isEditingLogo) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('brands').update({ image_url: newLogoUrl }).eq('id', isEditingLogo.id);
      if (error) {
        if (error.message.includes('image_url')) {
          alert("Error: The 'brands' table does not have an 'image_url' column. Please add it in Supabase dashboard first.");
        } else throw error;
      } else {
        setBrands(brands.map(b => b.id === isEditingLogo.id ? { ...b, image_url: newLogoUrl } : b));
        setIsEditingLogo(null);
        setNewLogoUrl('');
      }
    } catch (e) { alert('Error updating logo'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const table = view === 'brands' ? 'brands' : view === 'models' ? 'models' : 'specs';
    await supabase.from(table).delete().eq('id', id);
    if (view === 'brands') fetchBrands();
    else if (view === 'models') fetchModels(selectedBrand.id);
    else fetchSpecs(selectedModel.id);
  };

  const filteredItems = (view === 'brands' ? brands : view === 'models' ? models : specs).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestions = (view === 'models' && selectedBrand) ? (
    (COMMON_MODELS[selectedBrand.name] || COMMON_MODELS[Object.keys(COMMON_MODELS).find(k => k.toLowerCase() === selectedBrand.name.toLowerCase()) || ''] || [])
    .filter(name => !models.some(m => m.name.toLowerCase() === name.toLowerCase()))
  ) : (view === 'specs' && selectedModel) ? (
    (MODEL_SPECS[selectedModel.name] || MODEL_SPECS[Object.keys(MODEL_SPECS).find(k => k.toLowerCase() === selectedModel.name.toLowerCase()) || ''] || COMMON_SPECS)
    .filter(name => !specs.some(s => s.name.toLowerCase() === name.toLowerCase()))
  ) : [];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {view !== 'brands' && (
            <button onClick={() => { setView(view === 'specs' ? 'models' : 'brands'); setSearchQuery(''); }} className="bg-slate-100 p-3 rounded-2xl"><ChevronLeft size={24} /></button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {view === 'brands' ? 'Brands' : view === 'models' ? `${selectedBrand?.name} Models` : `${selectedModel?.name} Specs`}
            </h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input placeholder="Search..." className="w-full bg-slate-50 border border-slate-100 h-12 rounded-2xl pl-12 pr-4 font-bold outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => handleBulk(false)} className="flex-1 bg-slate-900 text-white h-12 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-500/20"><Download size={18} /> Bulk</button>
            <button onClick={() => setIsAdding(true)} className="flex-1 bg-[#CC222F] text-white h-12 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"><Plus size={18} /> Add</button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {view !== 'brands' && (
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="text-slate-400 cursor-pointer" onClick={() => { setView('brands'); setSearchQuery(''); }}>Brands</span>
          <ChevronRight size={14} className="text-slate-300" />
          {view === 'specs' ? (
            <>
              <span className="text-slate-400 cursor-pointer" onClick={() => { setView('models'); setSearchQuery(''); }}>{selectedBrand?.name}</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-[#CC222F]">{selectedModel?.name}</span>
            </>
          ) : <span className="text-[#CC222F]">{selectedBrand?.name}</span>}
        </div>
      )}

      {/* Suggestions */}
      {(view === 'models' || view === 'specs') && suggestions.length > 0 && !loading && (
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Suggested {view === 'models' ? 'Models' : 'Specs'}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 15).map(name => (
              <button 
                key={name} 
                onClick={async () => {
                  setLoading(true);
                  try {
                    if (view === 'models') {
                      await supabase.from('models').insert([{ name, brand_id: selectedBrand.id }]);
                      await fetchModels(selectedBrand.id);
                    } else {
                      await supabase.from('specs').insert([{ name, model_id: selectedModel.id }]);
                      await fetchSpecs(selectedModel.id);
                    }
                  } catch (e) { console.error(e); }
                  finally { setLoading(false); }
                }}
                className="bg-white px-5 py-2.5 rounded-2xl text-sm font-bold border border-slate-200 hover:border-[#CC222F] hover:text-[#CC222F] hover:shadow-lg hover:shadow-red-500/5 transition-all"
              >
                + {name}
              </button>
            ))}
            {suggestions.length > 15 && <span className="text-xs text-slate-400 flex items-center ml-2">and {suggestions.length - 15} more...</span>}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-[#CC222F]" size={40} /></div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group cursor-pointer hover:border-[#CC222F] transition-all" onClick={() => {
              if (view === 'brands') { setSelectedBrand(item); setView('models'); }
              else if (view === 'models') { setSelectedModel(item); setView('specs'); }
            }}>
              <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                {view === 'brands' && item.image_url ? (
                  <img src={item.image_url} className="w-16 h-16 object-contain" />
                ) : (
                  view === 'brands' ? <ImageIcon size={32} className="text-slate-200" /> : 
                  view === 'models' ? <Layers size={32} className="text-slate-200" /> : <CheckCircle2 size={32} className="text-slate-200" />
                )}
              </div>
              <p className="text-center font-bold text-slate-900">{item.name}</p>
              
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                {view === 'brands' && (
                  <button onClick={(e) => { e.stopPropagation(); setIsEditingLogo(item); setNewLogoUrl(item.image_url || ''); }} className="p-2 text-slate-200 hover:text-blue-500 bg-white/80 rounded-full shadow-sm"><Edit2 size={16} /></button>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-slate-200 hover:text-red-500 bg-white/80 rounded-full shadow-sm"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {(isAdding || isEditingLogo) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-6">{isEditingLogo ? 'Edit Logo' : 'Add New'}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-2">{isEditingLogo ? 'External Image URL' : 'Name'}</label>
                <input 
                  autoFocus 
                  value={isEditingLogo ? newLogoUrl : newItemName} 
                  onChange={e => isEditingLogo ? setNewLogoUrl(e.target.value) : setNewItemName(e.target.value)} 
                  className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 font-bold outline-none" 
                  placeholder={isEditingLogo ? "https://..." : "Name..."} 
                />
              </div>
              <div className="flex gap-4">
                <button onClick={isEditingLogo ? updateLogo : handleAdd} className="flex-1 bg-[#CC222F] text-white h-14 rounded-2xl font-black">Save</button>
                <button onClick={() => { setIsAdding(false); setIsEditingLogo(null); setNewItemName(''); }} className="flex-1 bg-slate-100 text-slate-400 h-14 rounded-2xl font-black">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
