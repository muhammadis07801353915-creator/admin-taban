"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users as UsersIcon, Mail, Phone, Calendar, Loader2, Trash2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch from auth.users or a custom users table
    // For now, we'll show a placeholder or fetch if you have a users table
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 mt-1">View and manage registered users on the platform.</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-12 items-center justify-center flex flex-col text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <UsersIcon className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Users List Coming Soon</h3>
        <p className="text-slate-500 max-w-sm mt-2">
          This section will list all regular users who have registered through the Taban main app.
        </p>
      </div>
    </div>
  );
}
