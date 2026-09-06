// app/works/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, CheckCircle, Clock, AlertCircle, 
  Send, FileText, Activity, User, Building2,
  Calendar, Briefcase
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState(null);
  const [stages, setStages] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stageData, setStageData] = useState({});
  const [notes, setNotes] = useState('');

  // 12 Pipeline Stages
  const pipelineStages = [
    { number: 1, name: 'File Received', role: 'labour_pro', progress: 5 },
    { number: 2, name: 'Job Offer Typing', role: 'labour_pro', progress: 14 },
    { number: 3, name: 'Labour Pre-Approval', role: 'labour_pro', progress: 23 },
    { number: 4, name: 'Work Permit', role: 'labour_pro', progress: 32 },
    { number: 5, name: 'Entry Permit', role: 'immigration_pro', progress: 41 },
    { number: 6, name: 'Immigration Processing', role: 'immigration_pro', progress: 50 },
    { number: 7, name: 'Medical Fitness', role: 'medical_coordinator', progress: 59 },
    { number: 8, name: 'Tawjeeh', role: 'medical_coordinator', progress: 68 },
    { number: 9, name: 'Insurance / ILOE', role: 'eid_insurance_pro', progress: 77 },
    { number: 10, name: 'Emirates ID', role: 'eid_insurance_pro', progress: 91 },
    { number: 11, name: 'Visa Stamping', role: 'stamping_pro', progress: 96 },
    { number: 12, name: 'Visa Delivered to HR', role: 'pro_manager', progress: 100 }
  ];

  // Load application data
  useEffect(() => {
    const loadData = async () => {
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
      }

      // Get application
      const { data: appData } = await supabase
        .from('applications')
        .select(`
          *,
          employees (name_en, nationality),
          companies (name, license_no)
        `)
        .eq('id', params.id)
        .single();

      if (appData) {
        setApplication(appData);

        // Get all stages for this application
        const { data: stagesData } = await supabase
          .from('application_stages')
          .select('*')
          .eq('application_id', params.id)
          .order('stage_number');
        setStages(stagesData || []);

        // Get activity logs
        const { data: logsData } = await supabase
          .from('activity_logs')
          .select('*, users(full_name)')
          .eq('application_id', params.id)
          .order('created_at', { ascending: false });
        setActivityLogs(logsData || []);

        // Load stage data for current stage
        const currentStage = stagesData?.find(s => s.stage_number === appData.current_stage);
        if (currentStage?.stage_data) {
          setStageData(currentStage.stage_data);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [params.id]);

  // Handle "Done & Forward" - complete current stage and move to next
  const handleDoneAndForward = async () => {
    if (!application || !currentUser) return;

    setSaving(true);

    try {
      const currentStageNum = application.current_stage;
      const nextStageNum = currentStageNum + 1;

      // Update current stage to completed
      const { error: stageUpdateError } = await supabase
        .from('application_stages')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stage_data: stageData
        })
        .eq('application_id', params.id)
        .eq('stage_number', currentStageNum);

      if (stageUpdateError) throw stageUpdateError;

      // If not last stage, create next stage
      if (nextStageNum <= 12) {
        const nextStage = pipelineStages.find(s => s.number === nextStageNum);
        
        const { error: nextStageError } = await supabase
          .from('application_stages')
          .insert([{
            application_id: params.id,
            stage_number: nextStageNum,
            stage_name: nextStage.name,
            status: 'in_progress',
            assigned_to: application.assigned_to,
            assigned_at: new Date().toISOString()
          }]);

        if (nextStageError) throw nextStageError;

        // Update application to next stage
        const { error: appUpdateError } = await supabase
          .from('applications')
          .update({
            current_stage: nextStageNum,
            progress: nextStage.progress,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.id);

        if (appUpdateError) throw appUpdateError;

        // Create activity log
        const { error: logError } = await supabase
          .from('activity_logs')
          .insert([{
            application_id: params.id,
            user_id: currentUser.id,
            action: 'Stage Completed & Forwarded',
            from_stage: currentStageNum,
            to_stage: nextStageNum,
            notes: notes || `Moved from ${pipelineStages[currentStageNum - 1].name} to ${nextStage.name}`
          }]);

        if (logError) throw logError;

        // Create notification for assigned user
        if (application.assigned_to) {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert([{
              user_id: application.assigned_to,
              title: 'New Task Assigned',
              message: `Application ${application.job_id} moved to ${nextStage.name}`,
              is_read: false
            }]);

          if (notifError) throw notifError;
        }

        alert(`Stage ${currentStageNum} completed! Moved to Stage ${nextStageNum}: ${nextStage.name}`);
      } else {
        // Last stage - mark application as completed
        const { error: appUpdateError } = await supabase
          .from('applications')
          .update({
            status: 'completed',
            current_stage: 12,
            progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.id);

        if (appUpdateError) throw appUpdateError;

        // Update last stage
        const { error: stageUpdateError2 } = await supabase
          .from('application_stages')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('application_id', params.id)
          .eq('stage_number', 12);

        if (stageUpdateError2) throw stageUpdateError2;

        // Create activity log
        const { error: logError } = await supabase
          .from('activity_logs')
          .insert([{
            application_id: params.id,
            user_id: currentUser.id,
            action: 'Application Completed',
            from_stage: 12,
            to_stage: 12,
            notes: notes || 'Visa delivered to HR'
          }]);

        if (logError) throw logError;

        alert('Application completed successfully! Visa delivered to HR.');
      }

      // Reload data
      window.location.reload();

    } catch (error) {
      alert('Error: ' + error.message);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-[var(--text-muted)]">Application not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStage = pipelineStages.find(s => s.number === application.current_stage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/works')}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">
                {application.job_id}
              </h1>
              <p className="text-[var(--text-muted)] mt-1">
                {application.employees?.name_en || 'No Employee'} • {application.companies?.name || 'No Company'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              application.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
              application.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
              'bg-amber-500/10 text-amber-500'
            }`}>
              {application.status}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Overall Progress</span>
            <span className="text-sm font-medium text-[var(--text-main)]">{application.progress}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-main)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
              style={{ width: `${application.progress}%` }}
            ></div>
          </div>
          <div className="mt-3 text-sm text-[var(--text-muted)]">
            Current Stage: <span className="font-medium text-[var(--text-main)]">Stage {application.current_stage} - {currentStage?.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Info */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Application Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Work ID</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">{application.job_id}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Receiving Date</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">
                    {application.receiving_date ? new Date(application.receiving_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Received From</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">{application.received_from || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Urgency</p>
                  <p className="text-sm font-medium text-[var(--text-main)] capitalize">{application.urgency || 'normal'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Work Permit Type</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">{application.work_permit_type || '-'}</p>
                </div>
                {application.work_permit_sub_type && (
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Sub Type</p>
                    <p className="text-sm font-medium text-[var(--text-main)]">{application.work_permit_sub_type}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Profession</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">{application.profession || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Visa Status</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">{application.visa_status || '-'}</p>
                </div>
                {application.current_visa_expiry && (
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Current Visa Expiry</p>
                    <p className="text-sm font-medium text-[var(--text-main)]">
                      {new Date(application.current_visa_expiry).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Stages Tracker */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Pipeline Stages
              </h2>
              <div className="space-y-2">
                {pipelineStages.map((stage) => {
                  const stageRecord = stages.find(s => s.stage_number === stage.number);
                  const isCompleted = stageRecord?.status === 'completed';
                  const isCurrent = stage.number === application.current_stage;
                  const isPending = stage.number > application.current_stage;

                  return (
                    <div
                      key={stage.number}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isCurrent 
                          ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30' 
                          : isCompleted
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-[var(--bg-main)] border-[var(--border-color)]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : isCurrent
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isCurrent ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-medium">{stage.number}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          isCurrent ? 'text-[var(--primary)]' : 
                          isCompleted ? 'text-emerald-500' : 'text-[var(--text-muted)]'
                        }`}>
                          Stage {stage.number}: {stage.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] capitalize">
                          {stage.role.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : isCurrent
                            ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                            : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
                        }`}>
                          {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Data Form (for current stage) */}
            {currentStage && application.current_stage <= 12 && application.status !== 'completed' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Stage {application.current_stage}: {currentStage.name} - Data Entry
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">
                      Notes / Remarks
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="Enter any notes about this stage..."
                    />
                  </div>
                  <button
                    onClick={handleDoneAndForward}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {saving ? 'Processing...' : application.current_stage === 12 ? 'Mark as Completed' : 'Done & Forward to Next Stage'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Activity Log & Info */}
          <div className="space-y-6">
            {/* Employee & Company Info */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Employee
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Name</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">
                    {application.employees?.name_en || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Nationality</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">
                    {application.employees?.nationality || '-'}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3 mt-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Name</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">
                    {application.companies?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">License No</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">
                    {application.companies?.license_no || '-'}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3 mt-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Created</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">
                    {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Last Updated</p>
                  <p className="text-sm font-medium text-[var(--text-main)]">
                    {new Date(application.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity Log
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">No activity yet</p>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="border-l-2 border-[var(--primary)] pl-3">
                      <p className="text-xs font-medium text-[var(--text-main)]">{log.action}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {log.users?.full_name || 'System'} • {new Date(log.created_at).toLocaleDateString()}
                      </p>
                      {log.notes && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 italic">{log.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}