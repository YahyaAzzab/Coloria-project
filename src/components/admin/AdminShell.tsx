import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Package, Inbox, FileText, MessageSquareQuote, LogOut, Loader2, ShieldAlert, Menu, X, ChevronRight, FolderTree } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { ensureBucketsExist } from "@/lib/api/storage.functions";
import logo from "@/assets/logo-coloragy.png";

const NAV = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/livres", label: "Livres", icon: BookOpen, exact: false },
  { to: "/admin/categories", label: "Catégories", icon: FolderTree, exact: false },
  { to: "/admin/packs", label: "Packs", icon: Package, exact: false },
  { to: "/admin/avis", label: "Avis clients", icon: MessageSquareQuote, exact: false },
  { to: "/admin/devis", label: "Commandes", icon: Inbox, exact: false },
  { to: "/admin/contenu", label: "Contenu site", icon: FileText, exact: false },
] as const;

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const auth = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  useEffect(() => {
    if (auth.status === "authenticated") {
      ensureBucketsExist().catch(console.error);
    }
  }, [auth.status]);

  if (auth.status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (auth.status === "denied") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="max-w-md text-center rounded-2xl bg-white p-10 shadow-xl border border-slate-100">
          <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Accès refusé</h1>
          <p className="mt-3 text-sm text-slate-500">
            Le compte <span className="font-medium text-slate-900">{auth.email}</span> n'a pas les droits administrateur requis.
          </p>
          <Button onClick={handleLogout} variant="default" className="mt-8 w-full rounded-xl">
            Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans">
      {/* SIDEBAR DESKTOP - Premium Dark Theme */}
      <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 lg:flex shadow-2xl relative z-20 transition-all duration-300">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800/50 px-6 mt-2">
          <div className="bg-white p-1.5 rounded-lg shadow-sm">
             <img src={logo} alt="Coloragy" className="h-10 w-auto" />
          </div>
          <span className="font-serif text-xl text-white tracking-wide">Admin</span>
        </div>
        
        <nav className="flex-1 space-y-1.5 p-4 mt-4 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestion</div>
          {NAV.filter(item => auth.role === "manager" ? item.to === "/admin/devis" : true).map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-slate-500 group-hover:text-slate-300"}`} />
                  {item.label}
                </div>
                {active && <ChevronRight className="h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-slate-800/50 p-4 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-coral flex items-center justify-center text-white font-bold text-xs shadow-md">
              {auth.email?.[0].toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{auth.email}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{auth.role ?? "Administrateur"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col relative w-full overflow-hidden">
        {/* HEADER MOBILE & DESKTOP */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 sm:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-full"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-serif text-slate-900 tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" asChild className="hidden sm:flex rounded-full">
               <Link to="/" target="_blank">Voir le site</Link>
             </Button>
          </div>
        </header>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
               <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
                 <img src={logo} alt="Coloragy" className="h-12 w-auto" />
                 <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-full">
                   <X className="h-5 w-5" />
                 </Button>
               </div>
               <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                 {NAV.filter(item => auth.role === "manager" ? item.to === "/admin/devis" : true).map((item) => {
                  const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all ${
                        active 
                          ? "bg-primary text-white shadow-md" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
               </nav>
               <div className="p-6 border-t border-slate-100 bg-slate-50">
                 <Button variant="destructive" className="w-full rounded-xl" onClick={handleLogout}>
                   Déconnexion
                 </Button>
               </div>
            </div>
          </div>
        )}

        {/* MAIN BODY */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto animate-in fade-in duration-500">
          <div className="max-w-6xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
