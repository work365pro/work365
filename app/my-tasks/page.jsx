// app/my-tasks/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { ClipboardList, Clock, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react';

export default function MyTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, urgent, normal

  // 12 Pipeline Stages
  const pipelineStages = [
    { number: 1, name: 'File Received', role: 'labour_pro' },
    { number: 2, name: 'Job Offer Typing', role: 'labour_pro' },
    { number: 3, name: 'Labour Pre-Approval', role: 'labour_pro' },
    { number: 4, name: 'Work Permit', role: 'labour_pro' },
    { number: 5, name: 'Entry Permit', role: 'immigration_pro' },
    { number: 6, name: 'Immigration Processing', role: 'immigration_pro' },
    { number: 7, name: 'Medical Fitness', role: 'medical_coordinator' },
    { number: 8, name: 'Tawjeeh', role: 'medical_coordinator' },
    { number: 9, name: 'Insurance / ILOE', role: 'eid_insurance_pro' },
    { number: 10, name: 'Emirates ID', role: 'eid_insurance_pro' },
    { number: 11, name: 'Visa Stamping', role: 'stamping_pro' },
    { number: 12, name: 'Visa Delivered to HR', role: 'pro_manager' }
  ];

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(user);

        // Get tasks assigned to current user
        const { data: tasksData, error } = await supabase
          .from('applications')
          .select(`
            *,
            employees (name_en, nationality),
            companies (name)
          `)
          .eq('assigned_to', user.id)
          .neq('status', 'completed')
          .order('created_at', { ascending: false });

        if (!error) {
          setTasks(tasksData || []);
        }
      }

      setLoading(false);
    };

    loadTasks();
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'urgent') return task.urgency === 'urgent' || task.urgency === 'critical';
    if (filter === 'normal') return task.urgency === 'normal';
    return true;
  });

  // Get stage name
  const getStageName = (stageNumber) => {
    const stage = pipelineStages.find(s => s.number === stageNumber);
    return stage?.name || 'Unknown';
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'urgent': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    }
  };

  // WhatsApp Status Update
  const handleWhatsAppStatus = (task) => {
    const stageName = getStageName(task.current_stage);
    const message = `WORK 365 Update:\n\nWork ID: ${task.job_id}\nEmployee: ${task.employees?.name_en || 'N/A'}\nCompany: ${task.companies?.name || 'N/A'}\nCurrent Stage: ${stageName}\nProgress: ${task.progress}%\n\nPlease check the system for more details.`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-[var(--primary)]" />
              My Tasks
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              {currentUser?.full_name} • {tasks.length} pending task(s)
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-[var(--primary)] text-white' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:bg-[var(--bg-main)]'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'urgent' 
                ? 'bg-amber-500 text-white' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:bg-[var(--bg-main)]'
            }`}
          >
            Urgent ({tasks.filter(t => t.urgency === 'urgent' || t.urgency === 'critical').length})
          </button>
          <button
            onClick={() => setFilter('normal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'normal' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:bg-[var(--bg-main)]'
            }`}
          >
            Normal ({tasks.filter(t => t.urgency === 'normal').length})
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent mx-auto"></div>
              <p className="text-[var(--text-muted)] mt-4">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-[var(--text-main)] font-medium">No pending tasks!</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">You're all caught up.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const stageName = getStageName(task.current_stage);
              return (
                <div
                  key={task.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 hover:border-[var(--primary)]/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/works/${task.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Top Row: Work ID & Urgency */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-[var(--primary)]">{task.job_id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(task.urgency)}`}>
                          {task.urgency}
                        </span>
                      </div>

                      {/* Middle Row: Employee & Company */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-[var(--text-muted)] mb-1">Employee</p>
                          <p className="text-sm font-medium text-[var(--text-main)]">
                            {task.employees?.name_en || 'Not assigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)] mb-1">Company</p>
                          <p className="text-sm font-medium text-[var(--text-main)]">
                            {task.companies?.name || 'Not assigned'}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Row: Stage & Progress */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="text-sm text-[var(--text-muted)]">
                            Stage {task.current_stage}: {stageName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-2 bg-[var(--bg-main)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--primary)] rounded-full"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-[var(--text-muted)] w-8">{task.progress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsAppStatus(task);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors ml-4"
                      title="Send WhatsApp Status Update"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total Tasks</p>
                <p className="text-2xl font-bold text-[var(--text-main)]">{tasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Urgent Tasks</p>
                <p className="text-2xl font-bold text-[var(--text-main)]">
                  {tasks.filter(t => t.urgency === 'urgent' || t.urgency === 'critical').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Normal Priority</p>
                <p className="text-2xl font-bold text-[var(--text-main)]">
                  {tasks.filter(t => t.urgency === 'normal').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}