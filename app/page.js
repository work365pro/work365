  // app/page.js
  'use client';

  import { useEffect, useState } from 'react';
  import DashboardLayout from '@/components/DashboardLayout';
  import { supabase } from '@/lib/supabase';
  import { Briefcase, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

  export default function DashboardPage() {
    const [stats, setStats] = useState({ total: 0, active: 0, mine: 0, expiring: 0 });
    const [recent, setRecent] = useState([]);

    useEffect(() => {
      const load = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;

        const [total, active, mine, expiring, recentApps] = await Promise.all([
          supabase.from('applications').select('*', { count: 'exact', head: true }),
          supabase.from('applications').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
          supabase.from('applications').select('*', { count: 'exact', head: true }).eq('assigned_to', uid),
          supabase.from('applications').select('*', { count: 'exact', head: true })
            .gte('current_visa_expiry', new Date().toISOString())
            .lte('current_visa_expiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('applications')
            .select('*, employees(name_en, nationality), companies(name)')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        setStats({
          total: total.count || 0,
          active: active.count || 0,
          mine: mine.count || 0,
          expiring: expiring.count || 0,
        });
        setRecent(recentApps.data || []);
      };
      load();
    }, []);

    const statsCards = [
      { title: 'Total Applications', value: stats.total, icon: Briefcase, color: 'bg-blue-500/10 text-blue-500' },
      { title: 'Active Applications', value: stats.active, icon: Clock, color: 'bg-emerald-500/10 text-emerald-500' },
      { title: 'My Pending Tasks', value: stats.mine, icon: AlertTriangle, color: 'bg-amber-500/10 text-amber-500' },
      { title: 'Expiring Soon', value: stats.expiring, icon: CheckCircle, color: 'bg-rose-500/10 text-rose-500' },
    ];

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Dashboard</h1>
            <p className="text-[var(--text-muted)] mt-1">Welcome to WORK 365!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">{card.title}</p>
                      <p className="text-3xl font-bold text-[var(--text-main)] mt-2">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${card.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <div className="p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-semibold text-[var(--text-main)]">Recent Applications</h2>
            </div>
            <div className="p-6">
              {recent.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center">No applications yet. Create your first application soon!</p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">{recent.length} recent application(s)</p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }