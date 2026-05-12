"use client";

import { Settings as SettingsIcon, Shield, Bell, Database, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-1">Configure your platform and manage system-wide options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-5">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">General Config</h3>
            <p className="text-slate-500 text-sm mb-4">Manage app name, logos, and support links.</p>
            <button className="text-[#CC222F] font-bold text-sm">Edit General Info</button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-5">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
            <Database className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Database Sync</h3>
            <p className="text-slate-500 text-sm mb-4">Check connection with Supabase and sync data.</p>
            <button className="text-[#CC222F] font-bold text-sm">Check Connection</button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold">Admin Security</h2>
          <p className="text-slate-400 max-w-sm">Manage your admin password and multi-factor authentication settings.</p>
        </div>
        <button className="bg-[#CC222F] px-8 py-4 rounded-2xl font-bold hover:bg-[#b3191f] transition-all">
          Update Credentials
        </button>
      </div>
    </div>
  );
}
