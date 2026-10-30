'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  CarFront,
  ChevronLeft,
  ClipboardList,
  FileText,
  Gauge,
  Images,
  Menu,
  Search,
  Settings,
  Users,
  Wrench,
  LogOut,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const navigation = [
  { name: 'Workshop', href: '/admin', icon: Gauge },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
  { name: 'Quotes', href: '/admin/quotes', icon: FileText },
  { name: 'Job Cards', href: '/admin/job-cards', icon: ClipboardList },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Vehicles', href: '/admin/vehicles', icon: CarFront },
  { name: 'Greasy Album', href: '/admin/greasy-album', icon: Images },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [staffName, setStaffName] = useState('Staff');
  const [staffRole, setStaffRole] = useState('staff');
  const [staffInitials, setStaffInitials] = useState('ST');

  useEffect(() => {
    let active = true;

    async function checkStaff() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!active) return;

      if (!session?.user) {
        router.replace('/staff');
        return;
      }

      const { data: profile, error } = await supabase
        .from('staff_profiles')
        .select('full_name, role, active')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active) return;

      if (error || !profile || !profile.active) {
        await supabase.auth.signOut();
        router.replace('/staff');
        return;
      }

      const name = profile.full_name || session.user.email || 'Staff';
      setStaffName(name);
      setStaffRole(profile.role || 'staff');
      setStaffInitials(
        name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part: string) => part[0]?.toUpperCase())
          .join('') || 'ST'
      );
      setAuthLoading(false);
    }

    checkStaff();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/staff');
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/staff');
    router.refresh();
  }

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08090b] text-white">
        <div className="text-center">
          <Wrench className="mx-auto h-8 w-8 animate-pulse text-red-500" />
          <p className="mt-4 text-sm text-white/40">Checking staff access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/8 bg-[#0d0f12] transition-all duration-300 ${
          collapsed ? 'w-[88px]' : 'w-[272px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-20 items-center border-b border-white/8 px-5">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-[0_10px_35px_rgba(220,38,38,.28)]">
              <Wrench size={21} strokeWidth={2.3} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-lg font-black tracking-tight">J1 Motors</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">Workshop OS</p>
              </div>
            )}
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="ml-auto rounded-xl p-2 text-white/50 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {!collapsed && <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/25">Workspace</p>}
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                onClick={() => setMobileOpen(false)}
                className={`group flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${
                  active
                    ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,.18)]'
                    : 'text-white/55 hover:bg-white/[0.055] hover:text-white'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.name}</span>}
                {active && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-3">
          <Link
            href="/admin/settings"
            title={collapsed ? 'Settings' : undefined}
            className={`flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${
              pathname.startsWith('/admin/settings')
                ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,.18)]'
                : 'text-white/50 hover:bg-white/[0.055] hover:text-white'
            }`}
          >
            <Settings size={20} />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="mt-2 hidden h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.025] text-xs font-semibold text-white/40 transition hover:bg-white/5 hover:text-white lg:flex"
          >
            <ChevronLeft size={17} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && 'Collapse menu'}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[88px]' : 'lg:pl-[272px]'}`}>
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-white/8 bg-[#08090b]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            className="mr-3 rounded-xl border border-white/8 bg-white/[0.03] p-2.5 text-white/70 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="relative hidden w-full max-w-md md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              className="h-11 w-full rounded-2xl border border-white/8 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-red-500/60 focus:bg-white/[0.05]"
              placeholder="Search customer, registration or job card…"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">{staffName}</p>
              <p className="text-xs capitalize text-white/35">{staffRole}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10 text-sm font-black text-red-400">{staffInitials}</div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/8 bg-white/[0.03] text-white/45 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}