"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Car, 
  Building2, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Layers,
  Image as ImageIcon,
  CreditCard,
  BarChart3,
  MapPin,
  MessageSquare,
  Bell,
  Smartphone,
  ShieldCheck,
  UserCheck,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const allMenuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ['superadmin'] },
  { name: "Data & Analytics", href: "/analytics", icon: BarChart3, roles: ['superadmin'] },
  { name: "Car Listings", href: "/cars", icon: Car, roles: ['superadmin', 'assistant'] },
  { name: "Ads & Banners", href: "/ads", icon: ImageIcon, roles: ['superadmin'] },
  { name: "Vehicle Configurator", href: "/vehicles", icon: Layers, roles: ['superadmin'] },
  { name: "App Content (CMS)", href: "/content", icon: Layers, roles: ['superadmin'] },
  { name: "Payments & Ads", href: "/payments", icon: CreditCard, roles: ['superadmin'] },
  { name: "Locations", href: "/locations", icon: MapPin, roles: ['superadmin'] },
  { name: "Showrooms", href: "/companies", icon: Building2, roles: ['superadmin'] },
  { name: "Users", href: "/users", icon: Users, roles: ['superadmin'] },
  { name: "Support Chats", href: "/support", icon: MessageSquare, roles: ['superadmin'] },
  { name: "Notifications", href: "/notifications", icon: Bell, roles: ['superadmin'] },
  { name: "App Updates", href: "/app-updates", icon: Smartphone, roles: ['superadmin'] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ['superadmin'] },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'superadmin' | 'assistant' | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.role) {
          setRole(data.role);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const visibleMenuItems = allMenuItems.filter(item => 
    !role || item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" 
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={cn(
          "flex flex-col bg-slate-900 text-white h-screen border-r border-slate-800 z-50 transition-transform duration-300 ease-in-out",
          "fixed inset-y-0 left-0 w-72 md:static md:w-64 md:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CC222F] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Taban Admin</h1>
              <div className="flex items-center gap-1 mt-0.5">
                {role === 'assistant' ? (
                  <>
                    <UserCheck className="w-3 h-3 text-amber-400" />
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">ئادەمینی پۆستەکان (1000)</p>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">ئادمینی سەرەکی</p>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-[#CC222F] text-white shadow-md shadow-red-950/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">دەربازبوون (Logout)</span>
          </button>
        </div>
      </div>
    </>
  );
}
