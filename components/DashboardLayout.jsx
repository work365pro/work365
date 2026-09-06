  // components/DashboardLayout.jsx
  'use client';

  import { useEffect, useState } from 'react';
  import { useRouter, usePathname } from 'next/navigation';
  import { supabase } from '@/lib/supabase';
  import Sidebar from '@/components/Sidebar';
  import Header from '@/components/Header';

  export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const check = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace('/login');
          return;
        }

        let { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          const { data: byEmail } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (byEmail) {
            const { data: updated } = await supabase
              .from('users')
              .update({ id: session.user.id })
              .eq('email', session.user.email)
              .select()
              .single();
            profile = updated;
          } else {
            const { data: created } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                full_name: 'Super Admin',
                email: session.user.email,
                role: 'super_admin',
                approval_status: 'approved',
              })
              .select()
              .single();
            profile = created;
          }
        }

        if (!profile) {
          router.replace('/login');
          return;
        }

        setUser(profile);

        if (profile.company_id) {
          const { data: comp } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profile.company_id)
            .single();
          setCompany(comp);
        }

        setLoading(false);
      };

      check();
    }, [router]);

    if (loading) {
      return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent"></div>
        </div>
      );
    }

    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={user} company={company} pathname={pathname} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    );
  }