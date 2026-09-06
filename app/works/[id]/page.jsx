// app/works/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, CheckCircle, Clock, AlertCircle, 
  Send, FileText, Activity, User, Building2,
  Calendar, Briefcase, IndianRupee, Shield, Factory, Plane, IdCard, Stethoscope, BookOpen, ShieldCheck, CreditCard, FileCheck, Handshake
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
  const [notes, setNotes] = useState('');

  // Stage 2 Form Data
  const [stage2Data, setStage2Data] = useState({
    typing_date: new Date().toISOString().split('T')[0],
    application_number: '',
    amount: '',
    approval_status: '',
    pre_approval_labour_card: '',
    pre_approval_expiry: '',
    rejection_reason: '',
    remark: ''
  });

  // Stage 3 Form Data
  const [stage3Data, setStage3Data] = useState({
    dubai_insurance_date: '',
    amount: '',
    fees_payment_date: '',
    fees_amount: ''
  });

  // Stage 4 Form Data
  const [stage4Data, setStage4Data] = useState({
    wp_status: '',
    wp_application_no: '',
    wp_payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    wp_expiry: '',
    remarks: ''
  });

  // Stage 5 Form Data
  const [stage5Data, setStage5Data] = useState({
    ep_status: '',
    ep_application_no: '',
    ep_number: '',
    ep_issue_date: new Date().toISOString().split('T')[0],
    ep_expiry_date: '',
    ep_amount: '',
    ep_remarks: ''
  });

  // Stage 6 Form Data
  const [stage6Data, setStage6Data] = useState({
    im_status: '',
    im_application_no: '',
    im_issue_date: new Date().toISOString().split('T')[0],
    im_expiry_date: '',
    im_amount: '',
    im_remarks: ''
  });

  // Stage 7 Form Data
  const [stage7Data, setStage7Data] = useState({
    medical_center: '',
    typing_date: new Date().toISOString().split('T')[0],
    appointment_date: '',
    result_status: '',
    result_date: '',
    amount: ''
  });

  // Stage 8 Form Data
  const [stage8Data, setStage8Data] = useState({
    tawjeeh_center: '',
    session_date: '',
    certificate_number: '',
    amount: ''
  });

  // Stage 9 Form Data
  const [stage9Data, setStage9Data] = useState({
    insurance_provider: '',
    policy_number: '',
    policy_start_date: '',
    policy_expiry_date: '',
    iloe_registered: '',
    amount: ''
  });

  // Stage 10 Form Data
  const [stage10Data, setStage10Data] = useState({
    eid_application_no: '',
    typing_date: new Date().toISOString().split('T')[0],
    biometric_status: '',
    amount: ''
  });

  // Stage 11 Form Data
  const [stage11Data, setStage11Data] = useState({
    stamping_status: '',
    residence_visa_no: '',
    visa_issue_date: '',
    visa_expiry_date: '',
    amount: ''
  });

  // Stage 12 Form Data
  const [stage12Data, setStage12Data] = useState({
    handover_date: new Date().toISOString().split('T')[0],
    received_hr_staff: '',
    final_status: '',
    final_remarks: ''
  });

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
    { number: 10, name: 'Emirates ID', role: 'eid_insurance_pro', progress: 86 },
    { number: 11, name: 'Visa Stamping', role: 'stamping_pro', progress: 95 },
    { number: 12, name: 'Visa Delivered to HR', role: 'pro_manager', progress: 100 }
  ];

  // Load application data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(user);
      }

      const { data: appData } = await supabase
        .from('applications')
        .select(`*, employees (name_en, nationality), companies (name, license_no)`)
        .eq('id', params.id)
        .single();

      if (appData) {
        setApplication(appData);

        const { data: stagesData } = await supabase
          .from('application_stages')
          .select('*')
          .eq('application_id', params.id)
          .order('stage_number');
        setStages(stagesData || []);

        const { data: logsData } = await supabase
          .from('activity_logs')
          .select('*, users(full_name)')
          .eq('application_id', params.id)
          .order('created_at', { ascending: false });
        setActivityLogs(logsData || []);

        // Load Stage 2 data
        const stage2 = stagesData?.find(s => s.stage_number === 2);
        if (stage2?.stage_data) setStage2Data({
          typing_date: stage2.stage_data.typing_date || new Date().toISOString().split('T')[0],
          application_number: stage2.stage_data.application_number || '',
          amount: stage2.stage_data.amount || '',
          approval_status: stage2.stage_data.approval_status || '',
          pre_approval_labour_card: stage2.stage_data.pre_approval_labour_card || '',
          pre_approval_expiry: stage2.stage_data.pre_approval_expiry || '',
          rejection_reason: stage2.stage_data.rejection_reason || '',
          remark: stage2.stage_data.remark || ''
        });

        // Load Stage 3 data
        const stage3 = stagesData?.find(s => s.stage_number === 3);
        if (stage3?.stage_data) setStage3Data({
          dubai_insurance_date: stage3.stage_data.dubai_insurance_date || '',
          amount: stage3.stage_data.amount || '',
          fees_payment_date: stage3.stage_data.fees_payment_date || '',
          fees_amount: stage3.stage_data.fees_amount || ''
        });

        // Load Stage 4 data
        const stage4 = stagesData?.find(s => s.stage_number === 4);
        if (stage4?.stage_data) setStage4Data({
          wp_status: stage4.stage_data.wp_status || '',
          wp_application_no: stage4.stage_data.wp_application_no || '',
          wp_payment_date: stage4.stage_data.wp_payment_date || new Date().toISOString().split('T')[0],
          amount: stage4.stage_data.amount || '',
          wp_expiry: stage4.stage_data.wp_expiry || '',
          remarks: stage4.stage_data.remarks || ''
        });

        // Load Stage 5 data
        const stage5 = stagesData?.find(s => s.stage_number === 5);
        if (stage5?.stage_data) setStage5Data({
          ep_status: stage5.stage_data.ep_status || '',
          ep_application_no: stage5.stage_data.ep_application_no || '',
          ep_number: stage5.stage_data.ep_number || '',
          ep_issue_date: stage5.stage_data.ep_issue_date || new Date().toISOString().split('T')[0],
          ep_expiry_date: stage5.stage_data.ep_expiry_date || '',
          ep_amount: stage5.stage_data.ep_amount || '',
          ep_remarks: stage5.stage_data.ep_remarks || ''
        });

        // Load Stage 6 data
        const stage6 = stagesData?.find(s => s.stage_number === 6);
        if (stage6?.stage_data) setStage6Data({
          im_status: stage6.stage_data.im_status || '',
          im_application_no: stage6.stage_data.im_application_no || '',
          im_issue_date: stage6.stage_data.im_issue_date || new Date().toISOString().split('T')[0],
          im_expiry_date: stage6.stage_data.im_expiry_date || '',
          im_amount: stage6.stage_data.im_amount || '',
          im_remarks: stage6.stage_data.im_remarks || ''
        });

        // Load Stage 7 data
        const stage7 = stagesData?.find(s => s.stage_number === 7);
        if (stage7?.stage_data) setStage7Data({
          medical_center: stage7.stage_data.medical_center || '',
          typing_date: stage7.stage_data.typing_date || new Date().toISOString().split('T')[0],
          appointment_date: stage7.stage_data.appointment_date || '',
          result_status: stage7.stage_data.result_status || '',
          result_date: stage7.stage_data.result_date || '',
          amount: stage7.stage_data.amount || ''
        });

        // Load Stage 8 data
        const stage8 = stagesData?.find(s => s.stage_number === 8);
        if (stage8?.stage_data) setStage8Data({
          tawjeeh_center: stage8.stage_data.tawjeeh_center || '',
          session_date: stage8.stage_data.session_date || '',
          certificate_number: stage8.stage_data.certificate_number || '',
          amount: stage8.stage_data.amount || ''
        });

        // Load Stage 9 data
        const stage9 = stagesData?.find(s => s.stage_number === 9);
        if (stage9?.stage_data) setStage9Data({
          insurance_provider: stage9.stage_data.insurance_provider || '',
          policy_number: stage9.stage_data.policy_number || '',
          policy_start_date: stage9.stage_data.policy_start_date || '',
          policy_expiry_date: stage9.stage_data.policy_expiry_date || '',
          iloe_registered: stage9.stage_data.iloe_registered || '',
          amount: stage9.stage_data.amount || ''
        });

        // Load Stage 10 data
        const stage10 = stagesData?.find(s => s.stage_number === 10);
        if (stage10?.stage_data) setStage10Data({
          eid_application_no: stage10.stage_data.eid_application_no || '',
          typing_date: stage10.stage_data.typing_date || new Date().toISOString().split('T')[0],
          biometric_status: stage10.stage_data.biometric_status || '',
          amount: stage10.stage_data.amount || ''
        });

        // Load Stage 11 data
        const stage11 = stagesData?.find(s => s.stage_number === 11);
        if (stage11?.stage_data) setStage11Data({
          stamping_status: stage11.stage_data.stamping_status || '',
          residence_visa_no: stage11.stage_data.residence_visa_no || '',
          visa_issue_date: stage11.stage_data.visa_issue_date || '',
          visa_expiry_date: stage11.stage_data.visa_expiry_date || '',
          amount: stage11.stage_data.amount || ''
        });

        // Load Stage 12 data
        const stage12 = stagesData?.find(s => s.stage_number === 12);
        if (stage12?.stage_data) setStage12Data({
          handover_date: stage12.stage_data.handover_date || new Date().toISOString().split('T')[0],
          received_hr_staff: stage12.stage_data.received_hr_staff || '',
          final_status: stage12.stage_data.final_status || '',
          final_remarks: stage12.stage_data.final_remarks || ''
        });
      }

      setLoading(false);
    };

    loadData();
  }, [params.id]);

  const handleStage2Change = (field, value) => setStage2Data(prev => ({ ...prev, [field]: value }));
  const handleStage3Change = (field, value) => setStage3Data(prev => ({ ...prev, [field]: value }));
  const handleStage4Change = (field, value) => setStage4Data(prev => ({ ...prev, [field]: value }));
  const handleStage5Change = (field, value) => setStage5Data(prev => ({ ...prev, [field]: value }));
  const handleStage6Change = (field, value) => setStage6Data(prev => ({ ...prev, [field]: value }));
  const handleStage7Change = (field, value) => setStage7Data(prev => ({ ...prev, [field]: value }));
  const handleStage8Change = (field, value) => setStage8Data(prev => ({ ...prev, [field]: value }));
  const handleStage9Change = (field, value) => setStage9Data(prev => ({ ...prev, [field]: value }));
  const handleStage10Change = (field, value) => setStage10Data(prev => ({ ...prev, [field]: value }));
  const handleStage11Change = (field, value) => setStage11Data(prev => ({ ...prev, [field]: value }));
  const handleStage12Change = (field, value) => setStage12Data(prev => ({ ...prev, [field]: value }));

  const handleUppercaseChange = (field, value) => setStage2Data(prev => ({ ...prev, [field]: value.toUpperCase() }));
  const handleStage4UppercaseChange = (field, value) => setStage4Data(prev => ({ ...prev, [field]: value.toUpperCase() }));
  const handleStage5UppercaseChange = (field, value) => setStage5Data(prev => ({ ...prev, [field]: value.toUpperCase() }));
  const handleStage6UppercaseChange = (field, value) => setStage6Data(prev => ({ ...prev, [field]: value.toUpperCase() }));
  const handleStage8UppercaseChange = (field, value) => setStage8Data(prev => ({ ...prev, [field]: value.toUpperCase() }));
  const handleStage9UppercaseChange = (field, value) => setStage9Data(prev => ({ ...prev, [field]: value.toUpperCase() }));
  const handleStage10UppercaseChange = (field, value) => setStage10Data(prev => ({ ...prev, [field]: value.toUpperCase() }));
  const handleStage11UppercaseChange = (field, value) => setStage11Data(prev => ({ ...prev, [field]: value.toUpperCase() }));
  const handleStage12UppercaseChange = (field, value) => setStage12Data(prev => ({ ...prev, [field]: value.toUpperCase() }));

  // Handle "Done & Forward"
  const handleDoneAndForward = async () => {
    if (!application || !currentUser) return;
    setSaving(true);

    try {
      const currentStageNum = application.current_stage;
      const nextStageNum = currentStageNum + 1;
      let stageDataToSave = {};
      
      if (currentStageNum === 2) {
        if (!stage2Data.typing_date) throw new Error('Typing Date is required');
        if (!stage2Data.application_number) throw new Error('Application Number is required');
        if (!stage2Data.amount) throw new Error('Amount is required');
        if (!stage2Data.approval_status) throw new Error('Approval Status is required');
        stageDataToSave = { ...stage2Data };
      } else if (currentStageNum === 3) {
        if (!stage3Data.dubai_insurance_date) throw new Error('Dubai Insurance Date is required');
        if (!stage3Data.amount) throw new Error('Amount is required');
        stageDataToSave = { ...stage3Data };
      } else if (currentStageNum === 4) {
        if (!stage4Data.wp_status) throw new Error('Work Permit Status is required');
        if (!stage4Data.wp_application_no) throw new Error('WP Application No. is required');
        if (!stage4Data.wp_payment_date) throw new Error('WP Payment Date is required');
        if (!stage4Data.amount) throw new Error('Amount is required');
        if (!stage4Data.wp_expiry) throw new Error('Work Permit Expiry is required');
        stageDataToSave = { ...stage4Data };
      } else if (currentStageNum === 5) {
        if (!stage5Data.ep_status) throw new Error('Entry Permit Status is required');
        if (!stage5Data.ep_application_no) throw new Error('EP Application No. is required');
        if (!stage5Data.ep_number) throw new Error('Entry Permit No. is required');
        if (!stage5Data.ep_issue_date) throw new Error('Issue Date is required');
        if (!stage5Data.ep_expiry_date) throw new Error('Expiry Date is required');
        if (!stage5Data.ep_amount) throw new Error('Amount is required');
        stageDataToSave = { ...stage5Data };
      } else if (currentStageNum === 6) {
        if (!stage6Data.im_status) throw new Error('Immigration Status is required');
        if (!stage6Data.im_application_no) throw new Error('Immigration Application No. is required');
        if (!stage6Data.im_issue_date) throw new Error('Issue Date is required');
        if (!stage6Data.im_expiry_date) throw new Error('Expiry Date is required');
        if (!stage6Data.im_amount) throw new Error('Amount is required');
        stageDataToSave = { ...stage6Data };
      } else if (currentStageNum === 7) {
        if (!stage7Data.medical_center) throw new Error('Medical Center is required');
        if (!stage7Data.typing_date) throw new Error('Typing Date is required');
        if (!stage7Data.appointment_date) throw new Error('Appointment Date is required');
        if (!stage7Data.result_status) throw new Error('Result Status is required');
        if (!stage7Data.result_date) throw new Error('Result Date is required');
        if (!stage7Data.amount) throw new Error('Amount is required');
        stageDataToSave = { ...stage7Data };
      } else if (currentStageNum === 8) {
        if (!stage8Data.tawjeeh_center) throw new Error('Tawjeeh Center is required');
        if (!stage8Data.session_date) throw new Error('Session Date is required');
        if (!stage8Data.certificate_number) throw new Error('Certificate Number is required');
        if (!stage8Data.amount) throw new Error('Amount is required');
        stageDataToSave = { ...stage8Data };
      } else if (currentStageNum === 9) {
        if (!stage9Data.insurance_provider) throw new Error('Insurance Provider is required');
        if (!stage9Data.policy_number) throw new Error('Policy Number is required');
        if (!stage9Data.policy_start_date) throw new Error('Policy Start Date is required');
        if (!stage9Data.policy_expiry_date) throw new Error('Policy Expiry Date is required');
        if (!stage9Data.iloe_registered) throw new Error('ILOE Registered is required');
        if (!stage9Data.amount) throw new Error('Amount is required');
        stageDataToSave = { ...stage9Data };
      } else if (currentStageNum === 10) {
        if (!stage10Data.eid_application_no) throw new Error('EID Application No. is required');
        if (!stage10Data.typing_date) throw new Error('Typing Date is required');
        if (!stage10Data.biometric_status) throw new Error('Biometric Status is required');
        if (!stage10Data.amount) throw new Error('Amount is required');
        stageDataToSave = { ...stage10Data };
      } else if (currentStageNum === 11) {
        if (!stage11Data.stamping_status) throw new Error('Stamping Status is required');
        if (!stage11Data.residence_visa_no) throw new Error('Residence Visa No. is required');
        if (!stage11Data.visa_issue_date) throw new Error('Visa Issue Date is required');
        if (!stage11Data.visa_expiry_date) throw new Error('Visa Expiry Date is required');
        if (!stage11Data.amount) throw new Error('Amount is required');
        stageDataToSave = { ...stage11Data };
      } else if (currentStageNum === 12) {
        if (!stage12Data.handover_date) throw new Error('Handover Date is required');
        if (!stage12Data.received_hr_staff) throw new Error('Received HR Staff is required');
        if (!stage12Data.final_status) throw new Error('Final Status is required');
        stageDataToSave = { ...stage12Data };
      }

      const { error: stageUpdateError } = await supabase
        .from('application_stages')
        .update({ status: 'completed', completed_at: new Date().toISOString(), stage_data: stageDataToSave })
        .eq('application_id', params.id)
        .eq('stage_number', currentStageNum);
      if (stageUpdateError) throw stageUpdateError;

      if (nextStageNum <= 12) {
        const nextStage = pipelineStages.find(s => s.number === nextStageNum);
        const { error: nextStageError } = await supabase
          .from('application_stages')
          .insert([{ application_id: params.id, stage_number: nextStageNum, stage_name: nextStage.name, status: 'in_progress', assigned_to: application.assigned_to, assigned_at: new Date().toISOString() }]);
        if (nextStageError) throw nextStageError;

        const { error: appUpdateError } = await supabase
          .from('applications')
          .update({ current_stage: nextStageNum, progress: nextStage.progress, updated_at: new Date().toISOString() })
          .eq('id', params.id);
        if (appUpdateError) throw appUpdateError;

        const { error: logError } = await supabase
          .from('activity_logs')
          .insert([{ application_id: params.id, user_id: currentUser.id, action: 'Stage Completed & Forwarded', from_stage: currentStageNum, to_stage: nextStageNum, notes: notes || `Moved from ${pipelineStages[currentStageNum - 1].name} to ${nextStage.name}` }]);
        if (logError) throw logError;

        if (application.assigned_to) {
          await supabase.from('notifications').insert([{ user_id: application.assigned_to, title: 'New Task Assigned', message: `Application ${application.job_id} moved to ${nextStage.name}`, is_read: false }]);
        }

        alert(`Stage ${currentStageNum} completed! Moved to Stage ${nextStageNum}: ${nextStage.name}`);
      } else {
        const { error: appUpdateError } = await supabase
          .from('applications')
          .update({ status: 'completed', current_stage: 12, progress: 100, updated_at: new Date().toISOString() })
          .eq('id', params.id);
        if (appUpdateError) throw appUpdateError;

        await supabase.from('application_stages').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('application_id', params.id).eq('stage_number', 12);
        await supabase.from('activity_logs').insert([{ application_id: params.id, user_id: currentUser.id, action: 'Application Completed', from_stage: 12, to_stage: 12, notes: notes || 'Visa delivered to HR' }]);
        alert('Application completed successfully! Visa delivered to HR.');
      }

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
            <button onClick={() => router.push('/works')} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">{application.job_id}</h1>
              <p className="text-[var(--text-muted)] mt-1">{application.employees?.name_en || 'No Employee'} • {application.companies?.name || 'No Company'}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${application.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : application.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
            {application.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Overall Progress</span>
            <span className="text-sm font-medium text-[var(--text-main)]">{application.progress}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-main)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-500" style={{ width: `${application.progress}%` }}></div>
          </div>
          <div className="mt-3 text-sm text-[var(--text-muted)]">
            Current Stage: <span className="font-medium text-[var(--text-main)]">Stage {application.current_stage} - {currentStage?.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Info */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Application Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[var(--text-muted)] mb-1">Work ID</p><p className="text-sm font-medium text-[var(--text-main)]">{application.job_id}</p></div>
                <div><p className="text-xs text-[var(--text-muted)] mb-1">Receiving Date</p><p className="text-sm font-medium text-[var(--text-main)]">{application.receiving_date ? new Date(application.receiving_date).toLocaleDateString() : '-'}</p></div>
                <div><p className="text-xs text-[var(--text-muted)] mb-1">Received From</p><p className="text-sm font-medium text-[var(--text-main)]">{application.received_from || '-'}</p></div>
                <div><p className="text-xs text-[var(--text-muted)] mb-1">Urgency</p><p className="text-sm font-medium text-[var(--text-main)] capitalize">{application.urgency || 'normal'}</p></div>
                <div><p className="text-xs text-[var(--text-muted)] mb-1">Work Permit Type</p><p className="text-sm font-medium text-[var(--text-main)]">{application.work_permit_type || '-'}</p></div>
                {application.work_permit_sub_type && <div><p className="text-xs text-[var(--text-muted)] mb-1">Sub Type</p><p className="text-sm font-medium text-[var(--text-main)]">{application.work_permit_sub_type}</p></div>}
                <div><p className="text-xs text-[var(--text-muted)] mb-1">Profession</p><p className="text-sm font-medium text-[var(--text-main)]">{application.profession || '-'}</p></div>
                <div><p className="text-xs text-[var(--text-muted)] mb-1">Visa Status</p><p className="text-sm font-medium text-[var(--text-main)]">{application.visa_status || '-'}</p></div>
              </div>
            </div>

            {/* Pipeline Stages Tracker */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" /> Pipeline Stages
              </h2>
              <div className="space-y-2">
                {pipelineStages.map((stage) => {
                  const stageRecord = stages.find(s => s.stage_number === stage.number);
                  const isCompleted = stageRecord?.status === 'completed';
                  const isCurrent = stage.number === application.current_stage;
                  return (
                    <div key={stage.number} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isCurrent ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30' : isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[var(--bg-main)] border-[var(--border-color)]'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : isCurrent ? <Clock className="w-5 h-5" /> : <span className="text-xs font-medium">{stage.number}</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isCurrent ? 'text-[var(--primary)]' : isCompleted ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>Stage {stage.number}: {stage.name}</p>
                        <p className="text-xs text-[var(--text-muted)] capitalize">{stage.role.replace('_', ' ')}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : isCurrent ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>
                        {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STAGE 2: Job Offer Typing */}
            {application.current_stage === 2 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-[var(--primary)]" /> Stage 2: Job Offer Typing</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Typing Date *</label><input type="date" value={stage2Data.typing_date} onChange={(e) => handleStage2Change('typing_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Application Number *</label><input type="text" value={stage2Data.application_number} onChange={(e) => handleUppercaseChange('application_number', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., APP-12345" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage2Data.amount} onChange={(e) => handleStage2Change('amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Approval Status *</label><select value={stage2Data.approval_status} onChange={(e) => handleStage2Change('approval_status', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Status</option><option value="Approved by MOHRE">Approved by MOHRE</option><option value="Rejected by MOHRE">Rejected by MOHRE</option></select></div>
                  </div>
                  {stage2Data.approval_status === 'Approved by MOHRE' && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-4">
                      <p className="text-sm font-medium text-emerald-500 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Pre-Approval Details</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm text-[var(--text-muted)] mb-2">Pre-approval Labour Card Number</label><input type="text" value={stage2Data.pre_approval_labour_card} onChange={(e) => handleUppercaseChange('pre_approval_labour_card', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" /></div>
                        <div><label className="block text-sm text-[var(--text-muted)] mb-2">Pre-approval Expiry Date</label><input type="date" value={stage2Data.pre_approval_expiry} onChange={(e) => handleStage2Change('pre_approval_expiry', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                      </div>
                    </div>
                  )}
                  {stage2Data.approval_status === 'Rejected by MOHRE' && (
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <p className="text-sm font-medium text-red-500 flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4" /> Rejection Details</p>
                      <label className="block text-sm text-[var(--text-muted)] mb-2">Reason for Rejection *</label>
                      <textarea value={stage2Data.rejection_reason} onChange={(e) => handleStage2Change('rejection_reason', e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" />
                    </div>
                  )}
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Remark</label><textarea value={stage2Data.remark} onChange={(e) => handleStage2Change('remark', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 3'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3: Labour Pre-Approval */}
            {application.current_stage === 3 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[var(--primary)]" /> Stage 3: Labour Pre-Approval</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Dubai Insurance Date *</label><input type="date" value={stage3Data.dubai_insurance_date} onChange={(e) => handleStage3Change('dubai_insurance_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage3Data.amount} onChange={(e) => handleStage3Change('amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  </div>
                  {stage3Data.dubai_insurance_date && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-4">
                      <p className="text-sm font-medium text-emerald-500 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Fees Payment Details</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm text-[var(--text-muted)] mb-2">Fees Payment Date *</label><input type="date" value={stage3Data.fees_payment_date} onChange={(e) => handleStage3Change('fees_payment_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                        <div><label className="block text-sm text-[var(--text-muted)] mb-2">Fees Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage3Data.fees_amount} onChange={(e) => handleStage3Change('fees_amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                      </div>
                    </div>
                  )}
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 4'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: Work Permit */}
            {application.current_stage === 4 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><Factory className="w-5 h-5 text-[var(--primary)]" /> Stage 4: Work Permit</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Work Permit Status *</label><select value={stage4Data.wp_status} onChange={(e) => handleStage4Change('wp_status', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Status</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">WP Application No. *</label><input type="text" value={stage4Data.wp_application_no} onChange={(e) => handleStage4UppercaseChange('wp_application_no', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., WP-12345" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">WP Payment Date *</label><input type="date" value={stage4Data.wp_payment_date} onChange={(e) => handleStage4Change('wp_payment_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage4Data.amount} onChange={(e) => handleStage4Change('amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  </div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Work Permit Expiry *</label><input type="date" value={stage4Data.wp_expiry} onChange={(e) => handleStage4Change('wp_expiry', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Remarks</label><textarea value={stage4Data.remarks} onChange={(e) => handleStage4Change('remarks', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 5'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 5: Entry Permit */}
            {application.current_stage === 5 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><Plane className="w-5 h-5 text-[var(--primary)]" /> Stage 5: Entry Permit</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Entry Permit Status *</label><select value={stage5Data.ep_status} onChange={(e) => handleStage5Change('ep_status', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Status</option><option value="Issued">Issued</option><option value="Pending">Pending</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">EP Application No. *</label><input type="text" value={stage5Data.ep_application_no} onChange={(e) => handleStage5UppercaseChange('ep_application_no', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., EP-APP-12345" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Entry Permit No. *</label><input type="text" value={stage5Data.ep_number} onChange={(e) => handleStage5UppercaseChange('ep_number', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., EP-12345" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Issue Date *</label><input type="date" value={stage5Data.ep_issue_date} onChange={(e) => handleStage5Change('ep_issue_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Expiry Date *</label><input type="date" value={stage5Data.ep_expiry_date} onChange={(e) => handleStage5Change('ep_expiry_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage5Data.ep_amount} onChange={(e) => handleStage5Change('ep_amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  </div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Remarks</label><textarea value={stage5Data.ep_remarks} onChange={(e) => handleStage5Change('ep_remarks', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 6'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 6: Immigration Processing */}
            {application.current_stage === 6 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><IdCard className="w-5 h-5 text-[var(--primary)]" /> Stage 6: Immigration Processing</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Immigration Status *</label><select value={stage6Data.im_status} onChange={(e) => handleStage6Change('im_status', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Status</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Immigration Application No. *</label><input type="text" value={stage6Data.im_application_no} onChange={(e) => handleStage6UppercaseChange('im_application_no', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., IM-APP-12345" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Issue Date *</label><input type="date" value={stage6Data.im_issue_date} onChange={(e) => handleStage6Change('im_issue_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Expiry Date *</label><input type="date" value={stage6Data.im_expiry_date} onChange={(e) => handleStage6Change('im_expiry_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  </div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative max-w-md"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage6Data.im_amount} onChange={(e) => handleStage6Change('im_amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Remarks</label><textarea value={stage6Data.im_remarks} onChange={(e) => handleStage6Change('im_remarks', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 7'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 7: Medical Fitness Test */}
            {application.current_stage === 7 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><Stethoscope className="w-5 h-5 text-[var(--primary)]" /> Stage 7: Medical Fitness Test</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Medical Center *</label><select value={stage7Data.medical_center} onChange={(e) => handleStage7Change('medical_center', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Center</option><option value="DHA">DHA</option><option value="MOHAP">MOHAP</option><option value="EHS">EHS</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Typing Date *</label><input type="date" value={stage7Data.typing_date} onChange={(e) => handleStage7Change('typing_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Appointment Date *</label><input type="date" value={stage7Data.appointment_date} onChange={(e) => handleStage7Change('appointment_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Result Status *</label><select value={stage7Data.result_status} onChange={(e) => handleStage7Change('result_status', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Status</option><option value="Fit">Fit</option><option value="Unfit">Unfit</option><option value="Pending">Pending</option></select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Result Date *</label><input type="date" value={stage7Data.result_date} onChange={(e) => handleStage7Change('result_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage7Data.amount} onChange={(e) => handleStage7Change('amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  </div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 8'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 8: Tawjeeh Class */}
            {application.current_stage === 8 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[var(--primary)]" /> Stage 8: Tawjeeh Class</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Tawjeeh Center *</label><select value={stage8Data.tawjeeh_center} onChange={(e) => handleStage8Change('tawjeeh_center', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Center</option><option value="Tawjeeh Center Dubai">Tawjeeh Center Dubai</option><option value="Tawjeeh Center Abu Dhabi">Tawjeeh Center Abu Dhabi</option><option value="Tawjeeh Center Sharjah">Tawjeeh Center Sharjah</option><option value="Tawjeeh Center Ajman">Tawjeeh Center Ajman</option><option value="Tawjeeh Center RAK">Tawjeeh Center RAK</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Session Date *</label><input type="date" value={stage8Data.session_date} onChange={(e) => handleStage8Change('session_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Certificate Number *</label><input type="text" value={stage8Data.certificate_number} onChange={(e) => handleStage8UppercaseChange('certificate_number', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., TAW-12345" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage8Data.amount} onChange={(e) => handleStage8Change('amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  </div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 9'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 9: Insurance & ILOE */}
            {application.current_stage === 9 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[var(--primary)]" /> Stage 9: Insurance & ILOE</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Insurance Provider *</label><select value={stage9Data.insurance_provider} onChange={(e) => handleStage9Change('insurance_provider', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Provider</option><option value="Daman">Daman</option><option value="AXA Gulf">AXA Gulf</option><option value="Orient Insurance">Orient Insurance</option><option value="GIG (Gulf Insurance Group)">GIG (Gulf Insurance Group)</option><option value="Salama">Salama</option><option value="Al Ahlia">Al Ahlia</option><option value="Oman Insurance">Oman Insurance</option><option value="Other">Other</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Policy Number *</label><input type="text" value={stage9Data.policy_number} onChange={(e) => handleStage9UppercaseChange('policy_number', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., POL-12345" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Policy Start Date *</label><input type="date" value={stage9Data.policy_start_date} onChange={(e) => handleStage9Change('policy_start_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Policy Expiry Date *</label><input type="date" value={stage9Data.policy_expiry_date} onChange={(e) => handleStage9Change('policy_expiry_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">ILOE Registered *</label><select value={stage9Data.iloe_registered} onChange={(e) => handleStage9Change('iloe_registered', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Option</option><option value="Yes">Yes</option><option value="No">No</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage9Data.amount} onChange={(e) => handleStage9Change('amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  </div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 10'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 10: Emirates ID Typing */}
            {application.current_stage === 10 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[var(--primary)]" /> Stage 10: Emirates ID Typing</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">EID Application No. *</label><input type="text" value={stage10Data.eid_application_no} onChange={(e) => handleStage10UppercaseChange('eid_application_no', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., EID-12345" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Typing Date *</label><input type="date" value={stage10Data.typing_date} onChange={(e) => handleStage10Change('typing_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Biometric Status *</label><select value={stage10Data.biometric_status} onChange={(e) => handleStage10Change('biometric_status', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Status</option><option value="Completed">Completed</option><option value="Exempted">Exempted</option><option value="Pending">Pending</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage10Data.amount} onChange={(e) => handleStage10Change('amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  </div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 11'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 11: Visa Stamping */}
            {application.current_stage === 11 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><FileCheck className="w-5 h-5 text-[var(--primary)]" /> Stage 11: Visa Stamping</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Stamping Status *</label><select value={stage11Data.stamping_status} onChange={(e) => handleStage11Change('stamping_status', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]"><option value="">Select Status</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Residence Visa No. *</label><input type="text" value={stage11Data.residence_visa_no} onChange={(e) => handleStage11UppercaseChange('residence_visa_no', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] uppercase" placeholder="e.g., RV-12345" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Visa Issue Date *</label><input type="date" value={stage11Data.visa_issue_date} onChange={(e) => handleStage11Change('visa_issue_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Visa Expiry Date *</label><input type="date" value={stage11Data.visa_expiry_date} onChange={(e) => handleStage11Change('visa_expiry_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  </div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Amount (AED) *</label><div className="relative max-w-md"><IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input type="number" value={stage11Data.amount} onChange={(e) => handleStage11Change('amount', e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" placeholder="0.00" /></div></div>
                  <div><label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" /></div>
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Stage 12'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 12: Visa Delivered to HR */}
            {application.current_stage === 12 && (
              <div className="bg-[var(--bg-card)] border border-[var(--primary)]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-[var(--primary)]" />
                  Stage 12: Visa Delivered to HR - Final Handover
                </h2>
                
                <div className="space-y-4">
                  {/* Row 1: Handover Date + Final Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--text-muted)] mb-2">
                        Handover Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={stage12Data.handover_date}
                        onChange={(e) => handleStage12Change('handover_date', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--text-muted)] mb-2">
                        Final Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={stage12Data.final_status}
                        onChange={(e) => handleStage12Change('final_status', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      >
                        <option value="">Select Status</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Received HR Staff */}
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">
                      Received HR Staff <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={stage12Data.received_hr_staff}
                      onChange={(e) => handleStage12UppercaseChange('received_hr_staff', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] uppercase"
                      placeholder="e.g., JOHN DOE (HR Manager)"
                    />
                  </div>

                  {/* Row 3: Final Remarks */}
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">
                      Final Remarks
                    </label>
                    <textarea
                      value={stage12Data.final_remarks}
                      onChange={(e) => handleStage12Change('final_remarks', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="Enter final remarks about the visa handover..."
                    />
                  </div>

                  {/* Notes for Activity Log */}
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">Notes (for Activity Log)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="Enter notes about this final stage completion..."
                    />
                  </div>

                  {/* Done & Complete Button */}
                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button
                      onClick={handleDoneAndForward}
                      disabled={saving}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {saving ? 'Processing...' : 'Complete Application & Mark as Delivered'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Generic stage handler for other stages */}
            {application.current_stage !== 2 && application.current_stage !== 3 && application.current_stage !== 4 && application.current_stage !== 5 && application.current_stage !== 6 && application.current_stage !== 7 && application.current_stage !== 8 && application.current_stage !== 9 && application.current_stage !== 10 && application.current_stage !== 11 && application.current_stage !== 12 && application.status !== 'completed' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Current Stage: {currentStage?.name}</h2>
                <p className="text-sm text-[var(--text-muted)]">This stage's data entry form will be available soon.</p>
                <div className="mt-4">
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)]" />
                </div>
                <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                  <button onClick={handleDoneAndForward} disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4" /> {saving ? 'Processing...' : 'Done & Forward to Next Stage'}</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Employee</h3>
              <div className="space-y-2">
                <div><p className="text-xs text-[var(--text-muted)]">Name</p><p className="text-sm font-medium text-[var(--text-main)]">{application.employees?.name_en || 'Not assigned'}</p></div>
                <div><p className="text-xs text-[var(--text-muted)]">Nationality</p><p className="text-sm font-medium text-[var(--text-main)]">{application.employees?.nationality || '-'}</p></div>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3 mt-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> Company</h3>
              <div className="space-y-2">
                <div><p className="text-xs text-[var(--text-muted)]">Name</p><p className="text-sm font-medium text-[var(--text-main)]">{application.companies?.name || '-'}</p></div>
                <div><p className="text-xs text-[var(--text-muted)]">License No</p><p className="text-sm font-medium text-[var(--text-main)]">{application.companies?.license_no || '-'}</p></div>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3 mt-4 flex items-center gap-2"><Calendar className="w-4 h-4" /> Timeline</h3>
              <div className="space-y-2">
                <div><p className="text-xs text-[var(--text-muted)]">Created</p><p className="text-sm font-medium text-[var(--text-main)]">{new Date(application.created_at).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-[var(--text-muted)]">Last Updated</p><p className="text-sm font-medium text-[var(--text-main)]">{new Date(application.updated_at).toLocaleDateString()}</p></div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Activity Log</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityLogs.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No activity yet</p> : activityLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-[var(--primary)] pl-3">
                    <p className="text-xs font-medium text-[var(--text-main)]">{log.action}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{log.users?.full_name || 'System'} • {new Date(log.created_at).toLocaleDateString()}</p>
                    {log.notes && <p className="text-xs text-[var(--text-muted)] mt-1 italic">{log.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}