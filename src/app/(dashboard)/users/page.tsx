"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users as UsersIcon, Phone, Calendar,
  Trash2, Loader2, Search, X, AlertTriangle, User
} from "lucide-react";

type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  created_at?: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    setDeletingId(user.id);
    try {
      // Call API route which uses service_role to fully delete auth user + all data
      const res = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Remove from local list
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setConfirmDelete(null);
    } catch (e: any) {
      console.error('Error deleting user:', e);
      alert('Error: ' + (e.message || 'Could not delete user'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name?.toLowerCase().includes(q)) ||
      (u.phone?.includes(q)) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Loading...' : (
              <span>
                <span className="font-bold text-slate-900">{users.length}</span> account{users.length !== 1 ? 's' : ''} registered
              </span>
            )}
          </p>
        </div>
        {/* Stats card */}
        <div className="bg-gradient-to-br from-[#CC222F] to-red-700 text-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-lg shadow-red-200">
          <UsersIcon className="w-8 h-8 opacity-80" />
          <div>
            <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Total Accounts</p>
            <p className="text-3xl font-black">{loading ? '...' : users.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white border border-slate-100 rounded-2xl px-5 h-14 shadow-sm gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, phone or ID..."
          className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}>
            <X className="w-4 h-4 text-slate-400 hover:text-slate-700" />
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#CC222F] animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-semibold">
              {searchQuery ? 'No users match your search' : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || ''}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {user.full_name || <span className="text-slate-400 italic">No name</span>}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{user.id.slice(0, 16)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm text-slate-700 font-medium">
                          {user.phone || <span className="text-slate-400 italic">—</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm text-slate-600">{formatDate(user.updated_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setConfirmDelete(user)}
                        className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                        title="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center">Delete Account?</h3>
            <p className="text-slate-500 text-center mt-2 text-sm leading-relaxed">
              This will permanently delete{' '}
              <span className="font-semibold text-slate-900">{confirmDelete.full_name || 'this user'}</span>
              's account and all their listings. This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deletingId === confirmDelete.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
