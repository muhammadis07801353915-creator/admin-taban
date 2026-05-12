"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  Car, 
  Save, 
  X,
  Loader2,
  Zap,
  CheckCircle2,
  Database,
  Layers,
  Settings2
} from "lucide-react";

// Massive data for bulk import including Specs
const COMMON_DATA: any = {
  'Toyota': {
    models: ['Camry', 'Corolla', 'Avalon', 'Land Cruiser', 'Hilux', 'Prado', 'Rav4'],
    specs: ['LE', 'SE', 'XLE', 'XSE', 'TRD', 'Nightshade', 'Limited', 'Platinum', 'Adventure', 'TRD Pro', 'VXR', 'GXR', 'EXR']
  },
  'Hyundai': {
    models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent'],
    specs: ['SE', 'SEL', 'Limited', 'N Line', 'Ultimate', 'Luxury', 'Smart', 'Comfort']
  },
  'Kia': {
    models: ['Sportage', 'Sorento', 'Optima', 'Cerato', 'Rio'],
    specs: ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'GT Line', 'GT', 'X-Line']
  },
  'Nissan': [
    { name: 'Patrol', specs: ['XE', 'SE', 'LE', 'Platinum', 'Nismo', 'Titanium'] },
    { name: 'Altima', specs: ['S', 'SV', 'SR', 'SL', 'Platinum'] },
    { name: 'Sunny', specs: ['S', 'SV', 'SL'] },
    { name: 'Navara', specs: ['S', 'SE', 'LE', 'PRO-4X'] }
  ],
  // Add fallback for others
  'Default': ['Standard', 'Full Option', 'Half Option', 'Base']
};

export default function VehiclesPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [specs, setSpecs] = useState<any[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchQuery] = useState("");
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("brands").select("*").order("name");
    if (!error) setBrands(data || []);
    setLoading(false);
  };

  const fetchModels = async (brandId: string) => {
    const { data, error } = await supabase.from("models").select("*").eq("brand_id", brandId).order("name");
    if (!error) setModels(data || []);
  };

  const fetchSpecs = async (modelId: string) => {
    const { data, error } = await supabase.from("specs").select("*").eq("model_id", modelId).order("name");
    if (!error) setSpecs(data || []);
  };

  const handleBulkImportBrands = async () => {
    setIsBulkLoading(true);
    const brandNames = Object.keys(COMMON_DATA).filter(k => k !== 'Default').map(name => ({ name }));
    await supabase.from("brands").upsert(brandNames, { onConflict: 'name' });
    await fetchBrands();
    setIsBulkLoading(false);
  };

  const handleBulkImportModels = async () => {
    if (!selectedBrand) return;
    setIsBulkLoading(true);
    const brandData = COMMON_DATA[selectedBrand.name];
    let modelNames = [];
    
    if (Array.isArray(brandData)) {
      modelNames = brandData.map((m: any) => ({ brand_id: selectedBrand.id, name: m.name || m }));
    } else if (brandData?.models) {
      modelNames = brandData.models.map((m: any) => ({ brand_id: selectedBrand.id, name: m }));
    }

    await supabase.from("models").upsert(modelNames, { onConflict: 'brand_id, name' });
    await fetchModels(selectedBrand.id);
    setIsBulkLoading(false);
  };

  const handleBulkImportSpecs = async () => {
    if (!selectedModel) return;
    setIsBulkLoading(true);
    
    // Find specs for this brand/model
    let specsToInsert: string[] = COMMON_DATA.Default;
    const brandData = COMMON_DATA[selectedBrand.name];
    
    if (brandData?.specs) {
      specsToInsert = brandData.specs;
    } else if (Array.isArray(brandData)) {
      const modelData = brandData.find((m: any) => m.name === selectedModel.name);
      if (modelData?.specs) specsToInsert = modelData.specs;
    }

    const finalData = specsToInsert.map(name => ({ model_id: selectedModel.id, name }));
    await supabase.from("specs").upsert(finalData, { onConflict: 'model_id, name' });
    await fetchSpecs(selectedModel.id);
    setIsBulkLoading(false);
  };

  const handleAddItem = async (type: 'brand' | 'model' | 'spec') => {
    if (!newItemName) return;
    let table = type === 'brand' ? 'brands' : (type === 'model' ? 'models' : 'specs');
    let payload: any = { name: newItemName };
    if (type === 'model') payload.brand_id = selectedBrand.id;
    if (type === 'spec') payload.model_id = selectedModel.id;

    const { error } = await supabase.from(table).insert([payload]);
    if (!error) {
      setNewItemName("");
      setIsAddingBrand(false); setIsAddingModel(false); setIsAddingSpec(false);
      if (type === 'brand') fetchBrands();
      if (type === 'model') fetchModels(selectedBrand.id);
      if (type === 'spec') fetchSpecs(selectedModel.id);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (confirm("ئایا دڵنیایت؟ هەموو داتاکانی پەیوەست بەمە دەسڕێتەوە.")) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (!error) {
        if (table === 'brands') fetchBrands();
        if (table === 'models') fetchModels(selectedBrand.id);
        if (table === 'specs') fetchSpecs(selectedModel.id);
      }
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Database className="text-[#CC222F]" size={36} />
            Advanced Vehicle Configurator
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage Brands, Models, and Detailed Specifications</p>
        </div>
        <button onClick={handleBulkImportBrands} className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
          <Zap size={20} /> Import Global Brands
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Brands Column */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[800px]">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">1. Brands</h2>
            <button onClick={() => setIsAddingBrand(true)} className="p-2 bg-[#CC222F] text-white rounded-xl"><Plus size={20} /></button>
          </div>
          <div className="p-4"><input type="text" placeholder="Search..." className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold" value={searchTerm} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map((brand) => (
              <div key={brand.id} onClick={() => { setSelectedBrand(brand); setSelectedModel(null); fetchModels(brand.id); }} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${selectedBrand?.id === brand.id ? "bg-[#CC222F] text-white shadow-lg" : "hover:bg-slate-50"}`}>
                <span className="text-lg font-black">{brand.name}</span>
                <ChevronRight size={18} opacity={selectedBrand?.id === brand.id ? 1 : 0.3} />
              </div>
            ))}
          </div>
        </div>

        {/* Models Column */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[800px]">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">2. Models {selectedBrand && `(${selectedBrand.name})`}</h2>
            <div className="flex gap-2">
                {selectedBrand && <button onClick={handleBulkImportModels} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Zap size={20} /></button>}
                <button onClick={() => selectedBrand && setIsAddingModel(true)} className="p-2 bg-slate-900 text-white rounded-xl"><Plus size={20} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {selectedBrand ? models.map((model) => (
              <div key={model.id} onClick={() => { setSelectedModel(model); fetchSpecs(model.id); }} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${selectedModel?.id === model.id ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-50"}`}>
                <span className="text-lg font-black">{model.name}</span>
                <ChevronRight size={18} opacity={selectedModel?.id === model.id ? 1 : 0.3} />
              </div>
            )) : <div className="flex-1 flex items-center justify-center text-slate-300 font-bold">Select a brand first</div>}
          </div>
        </div>

        {/* Specs Column */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[800px]">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">3. Specifications</h2>
            <div className="flex gap-2">
                {selectedModel && <button onClick={handleBulkImportSpecs} className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Zap size={20} /></button>}
                <button onClick={() => selectedModel && setIsAddingSpec(true)} className="p-2 bg-[#CC222F] text-white rounded-xl"><Plus size={20} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {selectedModel ? specs.map((spec) => (
              <div key={spec.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group">
                <span className="text-lg font-black text-slate-700">{spec.name}</span>
                <button onClick={() => handleDelete('specs', spec.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
              </div>
            )) : <div className="flex-1 flex items-center justify-center text-slate-300 font-bold">Select a model first</div>}
          </div>
        </div>
      </div>

      {/* Dynamic Modal */}
      {(isAddingBrand || isAddingModel || isAddingSpec) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[45px] w-full max-w-md p-10 shadow-2xl">
            <h3 className="text-3xl font-black text-slate-900 mb-6">Add New {isAddingBrand ? "Brand" : (isAddingModel ? "Model" : "Specification")}</h3>
            <input autoFocus type="text" placeholder="Name..." className="w-full bg-slate-50 border-none rounded-[22px] py-6 px-8 font-black text-2xl mb-8 outline-none focus:ring-4 focus:ring-red-500/10" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => { setIsAddingBrand(false); setIsAddingModel(false); setIsAddingSpec(false); setNewItemName(""); }} className="flex-1 py-5 rounded-[22px] font-black text-slate-400">Cancel</button>
              <button onClick={() => handleAddItem(isAddingBrand ? 'brand' : (isAddingModel ? 'model' : 'spec'))} className="flex-1 bg-[#CC222F] text-white py-5 rounded-[22px] font-black shadow-xl shadow-red-500/30">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
