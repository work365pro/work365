// app/expiries/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Calendar, Building2, Users, Clock } from 'lucide-react';

export default function ExpiriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expiringVisas, setExpiringVisas] = useState([]);
  const [expiringLicenses, setExpiringLicenses] = useState([]);

  useEffect(() => {
    const loadExpiries = async () => {
      setLoading(true);

      // Get applications with visa expiry within next 90 days
      const today = new Date().toISOString().split('T')[0];
      const next90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: visasData } = await supabase
        .from('applications')
        .select(`
          *,
          employees (name_en, nationality),
          companies (name)
        `)
        .gte('current_visa_expiry', today)
        .lte('current_visa_expiry', next90Days)
        .neq('status', 'completed')
        .order('current_visa_expiry', { ascending: true });

      setExpiringVisas(visasData || []);

      // Get companies with license expiry within next 90 days
      const { data: licensesData } = await supabase
        .from('companies')
        .select('*')
        .gte('license_expiry', today)
        .lte('license_expiry', next90Days)
        .eq('status', 'active')
        .order('license_expiry', { ascending: true });

      setExpiringLicenses(licensesData || []);

      setLoading(false);
    };

    loadExpiries();
  }, []);

  // Calculate days remaining
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get color based on days remaining
  const getUrgencyColor = (days) => {
    if (days <= 15) return 'bg-red-500/10 text-red-500 border-red-500/30';
    if (days <= 30) return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-[var(--primary)]" />
            Expiry Watchlist
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            UAE Expiry Watchlist & Fine Prevention Center
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Visa Expiries Section */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold text-[var(--text-main)]">
                    Visa Expiries (Next 90 Days)
                  </h2>
                </div>
                <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-medium">
                  {expiringVisas.length} pending
                </span>
              </div>

              {expiringVisas.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  No visa expiries in the next 90 days.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Work ID</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Employee</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Company</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Expiry Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Days Left</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringVisas.map((visa) => {
                        const daysLeft = getDaysRemaining(visa.current_visa_expiry);
                        return (
                          <tr 
                            key={visa.id} 
                            className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
                            onClick={() => router.push(`/works/${visa.id}`)}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-[var(--primary)]">{visa.job_id}</td>
                            <td className="px-6 py-4 text-sm text-[var(--text-main)]">{visa.employees?.name_en || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{visa.companies?.name || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                              {new Date(visa.current_visa_expiry).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(daysLeft)}`}>
                                {daysLeft} days
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-sm text-[var(--primary)] hover:underline">
                                Renew Now
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* License Expiries Section */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold text-[var(--text-main)]">
                    Company License Expiries (Next 90 Days)
                  </h2>
                </div>
                <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-medium">
                  {expiringLicenses.length} pending
                </span>
              </div>

              {expiringLicenses.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  No license expiries in the next 90 days.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Company Name</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">License No</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Expiry Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Days Left</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringLicenses.map((license) => {
                        const daysLeft = getDaysRemaining(license.license_expiry);
                        return (
                          <tr 
                            key={license.id} 
                            className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
                            onClick={() => router.push(`/companies`)}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-[var(--text-main)]">{license.name}</td>
                            <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{license.license_no || '-'}</td>
                            <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                              {new Date(license.license_expiry).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(daysLeft)}`}>
                                {daysLeft} days
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-sm text-[var(--primary)] hover:underline">
                                Renew License
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}