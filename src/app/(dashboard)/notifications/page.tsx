'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Send, Loader2, CheckCircle2, Smartphone, Users, MessageSquareDashed, History } from 'lucide-react';

interface NotifLog {
  id: string;
  title: string;
  body: string;
  sent_count: number;
  failed_count: number;
  total_devices: number;
  created_at: string;
}

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<NotifLog[]>([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoadingLogs(true);
    const [{ data: tokens }, { data: notifLogs }] = await Promise.all([
      supabase.from('push_tokens').select('id'),
      supabase.from('notifications_log').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    setDeviceCount(tokens?.length || 0);
    setLogs(notifLogs || []);
    setLoadingLogs(false);
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      alert('تکایە ناوی پەیام و ناوەڕۆکەکەی پڕ بکەرەوە');
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) {
        setTitle('');
        setBody('');
        fetchData();
      }
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ناردنی ئاگادارکردنەوە</h1>
          <p className="text-slate-500 mt-1">پەیام بنێرە بۆ هەموو بەکارهێنەرانی ئەپ بە یەک کلیک.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl px-5 py-3">
          <Smartphone className="text-[#CC222F]" size={22} />
          <div>
            <p className="text-xs text-slate-400 font-bold">مۆبایلی تۆمار کراو</p>
            <p className="text-2xl font-black text-slate-900">{deviceCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose Panel */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 h-fit">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-xl">
              <Bell className="w-5 h-5 text-[#CC222F]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">دروستکردنی ئاگادارکردنەوە</h3>
          </div>

          {/* Preview */}
          <div className="bg-slate-900 rounded-3xl p-4 space-y-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">پێشبینینی ئاگادارکردنەوە</p>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex gap-3 items-start">
              <div className="w-10 h-10 bg-[#CC222F] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-black text-white text-lg">T</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-black truncate">
                  {title || 'پەیام لە تابان کارس'}
                </p>
                <p className="text-white/60 text-xs font-medium mt-0.5 line-clamp-2">
                  {body || 'ناوەڕۆکی ئاگادارکردنەوەکە لێرەدا دەردەکەوێت...'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">ناوی ئاگادارکردنەوە</label>
              <input
                type="text"
                placeholder="بۆ نموونە: ئۆفەری تایبەت"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20 font-bold text-right"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <p className="text-[10px] text-slate-400 px-2">{title.length}/100</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">ناوەڕۆکی پەیام</label>
              <textarea
                placeholder="پەیامی تەواوەکەت بنووسە لێرە..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#CC222F]/20 font-bold text-right resize-none"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={500}
              />
              <p className="text-[10px] text-slate-400 px-2">{body.length}/500</p>
            </div>

            {result && (
              <div className={`p-4 rounded-2xl ${result.error ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                {result.error ? (
                  <p className="font-bold text-sm">❌ هەڵە: {result.error}</p>
                ) : (
                  <div className="space-y-1">
                    <p className="font-black text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} /> ناردرا بە سەرکەوتوویی!
                    </p>
                    <p className="text-xs font-bold">نێردرا بۆ: {result.sent} مۆبایل</p>
                    {result.failed > 0 && <p className="text-xs text-red-500">شکستی هێنا: {result.failed}</p>}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !body.trim()}
              className="w-full bg-[#CC222F] text-white py-4 rounded-2xl font-black shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              {sending ? 'خەریکی ناردنە...' : `ناردنی ئاگادارکردنەوە بۆ ${deviceCount} مۆبایل`}
            </button>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 px-2">
            <History size={20} className="text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900">مێژووی ناردنەکان</h3>
          </div>

          {loadingLogs ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <MessageSquareDashed size={48} className="mb-4 opacity-20" />
              <p className="font-bold">هیچ ئاگادارکردنەوەیەک نەنێردراوە</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 text-right flex-1">
                      <p className="font-black text-slate-900 text-lg">{log.title}</p>
                      <p className="text-slate-500 text-sm font-medium line-clamp-2">{log.body}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <div className="text-center bg-emerald-50 rounded-2xl px-4 py-2">
                        <p className="text-2xl font-black text-emerald-600">{log.sent_count}</p>
                        <p className="text-[10px] text-emerald-500 font-bold">نێردرا</p>
                      </div>
                      {log.failed_count > 0 && (
                        <div className="text-center bg-red-50 rounded-2xl px-4 py-2">
                          <p className="text-2xl font-black text-red-500">{log.failed_count}</p>
                          <p className="text-[10px] text-red-400 font-bold">شکستی هێنا</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <p className="text-xs text-slate-400 font-bold">
                      {new Date(log.created_at).toLocaleString('ku')}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Users size={14} />
                      <p className="text-xs font-bold">{log.total_devices} مۆبایل</p>
                    </div>
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
