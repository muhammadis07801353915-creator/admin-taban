import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-slate-500 font-medium">Taban Cars — Management Panel</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#CC222F]/10 border border-[#CC222F]/20 flex items-center justify-center font-bold text-[#CC222F] text-xs">
              TC
            </div>
            <span className="font-bold text-slate-800 text-sm">Muhamad (Admin)</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
