// app/works/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Briefcase, Plus, Search } from 'lucide-react';

export default function AllWorksPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          employees (name_en),
          companies (name)
        `)
        .order('created_at', { ascending: false });

      if (!error) {
        setApplications(data || []);
      }
      setLoading(false);
    };
    loadApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const query = searchQuery.toLowerCase();
    return (
      app.job_id?.toLowerCase().includes(query) ||
      app.employees?.name_en?.toLowerCase().includes(query) ||
      app.companies?.name?.toLowerCase().includes(query)
    );
  });

  const getStageName = (stage) => {
    const stages = [
      'File Received', 'Job Offer Typing', 'Labour Pre-Approval', 'Work Permit',
      'Entry Permit', 'Immigration Processing', 'Medical Fitness', 'Tawjeeh',
      'Insurance / ILOE', 'Emirates ID', 'Visa Stamping', 'Visa Delivered to HR'
    ];
    return stages[stage - 1] || 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-[var(--primary)]" />
              All Works
            </h1>
            <p className="text-[var(--text-muted)] mt-1">Master pipeline table for all applications</p>
          </div>
          <button
            onClick={() => router.push('/works/new')}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            New Application
          </button>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Work ID, Employee, or Company..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading applications...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No applications found. Click "New Application" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Work ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Employee</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Company</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Current Stage</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Progress</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr 
                      key={app.id} 
                      className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
                      onClick={() => router.push(`/works/${app.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[var(--primary)]">{app.job_id}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-main)]">{app.employees?.name_en || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{app.companies?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                        Stage {app.current_stage}: {getStageName(app.current_stage)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--bg-main)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--primary)] rounded-full"
                              style={{ width: `${app.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-[var(--text-muted)] w-8">{app.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                          app.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {app.status}
                        </span>
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