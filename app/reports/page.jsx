// app/reports/page.jsx
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { BarChart3, Building2, Briefcase, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [summary, setSummary] = useState({
    totalCompanies: 0,
    totalApplications: 0,
    completed: 0,
    inProgress: 0
  });

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);

      // Fetch all companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      // Fetch all applications with company details
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          *,
          companies (id, name)
        `);

      if (companiesData) {
        const apps = applicationsData || [];

        // Calculate summary
        const completed = apps.filter(a => a.status === 'completed').length;
        const inProgress = apps.filter(a => a.status === 'active').length;

        setSummary({
          totalCompanies: companiesData.length,
          totalApplications: apps.length,
          completed,
          inProgress
        });

        // Map applications to companies
        const companyReports = companiesData.map(company => {
          const companyApps = apps.filter(a => a.company_id === company.id);
          const completedApps = companyApps.filter(a => a.status === 'completed').length;
          const activeApps = companyApps.filter(a => a.status === 'active').length;
          const completionRate = companyApps.length > 0 
            ? Math.round((completedApps / companyApps.length) * 100) 
            : 0;

          return {
            ...company,
            totalApps: companyApps.length,
            completedApps,
            activeApps,
            completionRate
          };
        });

        setCompanies(companyReports);
      }

      setLoading(false);
    };

    loadReports();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[var(--primary)]" />
            Company Reports
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Summary of applications and performance by company
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total Companies</p>
                <p className="text-3xl font-bold text-[var(--text-main)] mt-2">{summary.totalCompanies}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total Applications</p>
                <p className="text-3xl font-bold text-[var(--text-main)] mt-2">{summary.totalApplications}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Completed</p>
                <p className="text-3xl font-bold text-emerald-500 mt-2">{summary.completed}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">In Progress</p>
                <p className="text-3xl font-bold text-amber-500 mt-2">{summary.inProgress}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Company Performance Table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-main)]">
              Company Performance
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading reports...</div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No companies found. Add companies to see reports.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Company Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Total Apps</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Completed</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">In Progress</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-main)]">{company.name}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-main)]">{company.totalApps}</td>
                      <td className="px-6 py-4 text-sm text-emerald-500">{company.completedApps}</td>
                      <td className="px-6 py-4 text-sm text-amber-500">{company.activeApps}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[var(--bg-main)] rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                              style={{ width: `${company.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-[var(--text-muted)] w-10">
                            {company.completionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}