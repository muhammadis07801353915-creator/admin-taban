"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  Search,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  Trash2
} from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";

interface Showroom {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: string;
  is_verified: boolean;
  verified_until: string | null;
  created_at: string;
}

export default function CompaniesPage() {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [days, setDays] = useState("30");

  useEffect(() => {
    fetchShowrooms();
  }, []);

  async function fetchShowrooms() {
    setLoading(true);
    const { data, error } = await supabase
      .from("showrooms")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching showrooms:", error);
    } else {
      setShowrooms(data || []);
    }
    setLoading(false);
  }

  async function toggleVerify(id: string, currentStatus: boolean, durationDays: number) {
    try {
      let expiryDate: string | null = null;
      
      if (!currentStatus) {
        const date = new Date();
        date.setDate(date.getDate() + durationDays);
        expiryDate = date.toISOString();
      }

      const { error } = await supabase
        .from("showrooms")
        .update({ 
          is_verified: !currentStatus,
          verified_until: expiryDate 
        })
        .eq("id", id);

      if (error) throw error;
      
      fetchShowrooms();
      setEditingId(null);
    } catch (e) {
      alert("Error updating verification status");
    }
  }

  async function deleteShowroom(id: string) {
    if (!confirm("Are you sure you want to delete this account?")) return;
    
    const { error } = await supabase.from("showrooms").delete().eq("id", id);
    if (!error) fetchShowrooms();
  }

  const filtered = showrooms.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Showrooms Network</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage verification, subscription, and account security</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name or phone..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <TextLabel label="Total Showrooms" value={showrooms.length.toString()} color="text-slate-900" />
           </div>
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <TextLabel label="Verified" value={showrooms.filter(s => s.is_verified).length.toString()} color="text-blue-600" />
           </div>
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <TextLabel label="Pending Approval" value={showrooms.filter(s => s.status !== 'approved').length.toString()} color="text-orange-500" />
           </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-[35px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-slate-400 font-bold uppercase text-xs tracking-widest">Showroom Details</th>
                  <th className="px-8 py-5 text-slate-400 font-bold uppercase text-xs tracking-widest">Account Status</th>
                  <th className="px-8 py-5 text-slate-400 font-bold uppercase text-xs tracking-widest">Verification</th>
                  <th className="px-8 py-5 text-slate-400 font-bold uppercase text-xs tracking-widest">Expiry Date</th>
                  <th className="px-8 py-5 text-slate-400 font-bold uppercase text-xs tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">Loading showrooms...</td></tr>
                ) : filtered.map((s) => {
                  const expiryDate = s.verified_until ? parseISO(s.verified_until) : null;
                  const isExpired = expiryDate ? !isAfter(expiryDate, new Date()) : true;
                  const isActive = s.is_verified && !isExpired;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-900 text-lg">{s.name || "Unnamed"}</div>
                        <div className="text-slate-400 font-medium mt-0.5">{s.phone}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${
                          s.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {s.status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {isActive ? (
                          <div className="flex items-center text-blue-600 gap-2 font-black">
                            <ShieldCheck size={20} fill="rgba(37, 99, 235, 0.1)" />
                            <span>VERIFIED</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-slate-300 gap-2 font-black">
                            <XCircle size={20} />
                            <span>UNVERIFIED</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {s.verified_until ? (
                          <div className={`flex items-center gap-2 font-bold ${isExpired ? 'text-red-500' : 'text-slate-600'}`}>
                            <Calendar size={16} />
                            {format(parseISO(s.verified_until), "MMM dd, yyyy")}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">No expiry set</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {editingId === s.id ? (
                          <div className="flex items-center justify-end gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Set Days</span>
                              <input 
                                type="number"
                                className="w-20 px-3 py-2 border-2 border-blue-500 rounded-xl text-center font-black focus:outline-none"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                              />
                            </div>
                            <button 
                              onClick={() => toggleVerify(s.id, false, parseInt(days))}
                              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
                            >
                              CONFIRM
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-3 text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-4">
                            <button 
                              onClick={() => isActive ? toggleVerify(s.id, true, 0) : setEditingId(s.id)}
                              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                                isActive 
                                ? 'bg-white border-red-100 text-red-500 hover:bg-red-50' 
                                : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              {isActive ? "REVOKE ACCESS" : "GRANT ACCESS"}
                            </button>
                            <button onClick={() => deleteShowroom(s.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextLabel({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{label}</span>
      <span className={`text-3xl font-black ${color}`}>{value}</span>
    </div>
  );
}
