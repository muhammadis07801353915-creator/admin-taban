"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Send, User, MessageSquare, Clock, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type SupportChat = {
  id: string;
  user_id: string;
  last_message: string;
  last_message_at: string;
  admin_unread: number;
  user_profile?: {
    full_name: string;
    phone: string;
    avatar_url: string;
  };
};

type SupportMessage = {
  id: string;
  chat_id: string;
  sender_type: 'user' | 'admin';
  text: string;
  created_at: string;
};

export default function SupportChatsPage() {
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const realtimeRef = useRef<any>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    // Fetch all support chats
    const { data: chatsData, error: chatsError } = await supabase
      .from('support_chats')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (chatsData) {
      // Fetch user profiles for these chats
      const userIds = [...new Set(chatsData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .in('id', userIds);

      const profileMap = new Map();
      profilesData?.forEach(p => profileMap.set(p.id, p));

      const enrichedChats = chatsData.map(chat => ({
        ...chat,
        user_profile: profileMap.get(chat.user_id) || { full_name: 'Unknown User', phone: '' }
      }));
      setChats(enrichedChats);
    }
    setLoading(false);
  };

  const selectChat = async (chat: SupportChat) => {
    setSelectedChat(chat);
    setMessages([]);
    
    // Clear unread count locally
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, admin_unread: 0 } : c));
    
    // Mark as read in DB
    await supabase.from('support_chats').update({ admin_unread: 0 }).eq('id', chat.id);

    // Fetch messages
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      scrollToBottom();
    }

    // Realtime subscription
    if (realtimeRef.current) {
      supabase.removeChannel(realtimeRef.current);
    }

    realtimeRef.current = supabase
      .channel(`admin_support_${chat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `chat_id=eq.${chat.id}` },
        (payload: any) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          scrollToBottom();
          
          if (payload.new.sender_type === 'user') {
            supabase.from('support_chats').update({ admin_unread: 0 }).eq('id', chat.id);
          }
        }
      )
      .subscribe();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const text = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const tempMsg: SupportMessage = {
      id: `temp-${Date.now()}`,
      chat_id: selectedChat.id,
      sender_type: 'admin',
      text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          chat_id: selectedChat.id,
          sender_type: 'admin',
          text
        })
        .select()
        .single();

      if (!error && data) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support Chats</h1>
          <p className="text-slate-500">Manage user feedback and support requests</p>
        </div>
        <button onClick={fetchChats} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
          Refresh
        </button>
      </div>

      <div className="flex flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Left Sidebar: Chat List */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC222F]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading chats...</div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No support chats yet</p>
              </div>
            ) : (
              chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`w-full text-left p-4 border-b border-slate-100 flex gap-3 transition-colors ${selectedChat?.id === chat.id ? 'bg-red-50' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {chat.user_profile?.avatar_url ? (
                      <img src={chat.user_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-semibold truncate ${chat.admin_unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                        {chat.user_profile?.full_name || chat.user_profile?.phone || 'Unknown User'}
                      </h3>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                        {chat.last_message_at ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${chat.admin_unread > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                      {chat.last_message || 'New chat started'}
                    </p>
                  </div>
                  {chat.admin_unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#CC222F] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-[10px] font-bold">{chat.admin_unread}</span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Content: Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {selectedChat.user_profile?.avatar_url ? (
                       <img src={selectedChat.user_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                       <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 leading-tight">
                      {selectedChat.user_profile?.full_name || 'Unknown User'}
                    </h2>
                    <p className="text-xs text-slate-500">{selectedChat.user_profile?.phone || 'No phone number'}</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
                  const isAdmin = msg.sender_type === 'admin';
                  return (
                    <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                        isAdmin 
                          ? 'bg-[#CC222F] text-white rounded-tr-sm shadow-sm shadow-red-200' 
                          : 'bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1.5 justify-end ${isAdmin ? 'text-red-200' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px]">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isAdmin && <CheckCheck className="w-3 h-3 ml-1" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a reply to the user..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC222F] focus:bg-white transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-6 py-3 bg-[#CC222F] text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? 'Sending...' : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-600">Select a Conversation</h3>
              <p className="text-sm mt-1">Choose a user from the list to view and reply to their messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
