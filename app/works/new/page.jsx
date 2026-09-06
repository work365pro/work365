// app/works/new/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { FilePlus, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    job_id: '',
    employee_name: '',
    nationality: '',
    company_id: '',
    profession: '',
    receiving_date: today,
    received_from: '',
    urgency: 'Normal',
    work_permit_type: 'Company Visa',
    work_permit_sub_type: '',
    visa_status: 'OUTSIDE',
    current_visa_expiry: '',
    assigned_to: ''
  });

  // Nationalities list
  const nationalities = [
    'Indian', 'Pakistani', 'Bangladeshi', 'Filipino', 'Egyptian', 
    'Jordanian', 'Lebanese', 'Syrian', 'Sudanese', 'Yemeni', 
    'Omani', 'Saudi', 'Qatari', 'Bahraini', 'Kuwaiti', 'Iranian', 
    'Afghan', 'Sri Lankan', 'Nepali', 'Ethiopian', 'Kenyan', 
    'Tanzanian', 'Ugandan', 'Nigerian', 'Ghanaian', 'South African',
    'British', 'American', 'Canadian', 'Australian', 'French', 
    'German', 'Italian', 'Spanish', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Other'
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setCurrentUser(user);
      }

      const { data: companiesData } = await supabase.from('companies').select('*').order('name');
      setCompanies(companiesData || []);

      const { data: usersData } = await supabase.from('users').select('*').eq('approval_status', 'approved');
      setUsers(usersData || []);

      setLoading(false);
    };
    loadData();
  }, []);

  // Auto-generate Work ID when company is selected
  useEffect(() => {
    if (formData.company_id) {
      const todayDate = new Date();
      const dd = String(todayDate.getDate()).padStart(2, '0');
      const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
      const yy = String(todayDate.getFullYear()).slice(-2);
      const randomNum = Math.floor(Math.random() * 900) + 100;
      setFormData(prev => ({ ...prev, job_id: `W365-${randomNum}-${dd}${mm}${yy}` }));
      
      // Auto-assign based on company concern_person_id if exists
      const selectedCompany = companies.find(c => c.id === formData.company_id);
      if (selectedCompany?.concern_person_id) {
        setFormData(prev => ({ ...prev, assigned_to: selectedCompany.concern_person_id }));
      }
    }
  }, [formData.company_id, companies]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUppercaseChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value.toUpperCase() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!formData.company_id) throw new Error('Please select a company');
      if (!formData.employee_name) throw new Error('Please enter employee name');
      if (!formData.profession) throw new Error('Please enter profession');

      const { data, error: insertError } = await supabase
        .from('applications')
        .insert([{
          job_id: formData.job_id,
          company_id: formData.company_id,
          receiving_date: formData.receiving_date,
          received_from: formData.received_from,
          urgency: formData.urgency,
          work_permit_type: formData.work_permit_type,
          work_permit_sub_type: formData.work_permit_type === 'Work Permit' ? formData.work_permit_sub_type : null,
          profession: formData.profession,
          visa_status: formData.visa_status,
          current_visa_expiry: formData.visa_status === 'INSIDE' ? formData.current_visa_expiry : null,
          status: 'active',
          current_stage: 1,
          progress: 5,
          assigned_to: formData.assigned_to || null,
          created_by: currentUser?.id
        }])
        .select();

      if (insertError) throw insertError;

      await supabase.from('application_stages').insert([{
        application_id: data[0].id,
        stage_number: 1,
        stage_name: 'File Received',
        status: 'in_progress',
        assigned_to: formData.assigned_to || null,
        assigned_at: new Date().toISOString()
      }]);

      await supabase.from('activity_logs').insert([{
        application_id: data[0].id,
        user_id: currentUser?.id,
        action: 'Application Created',
        from_stage: 0,
        to_stage: 1,
        notes: `New application created: ${formData.job_id}`
      }]);

      setSuccess('Application created successfully!');
      setTimeout(() => router.push('/works'), 2000);

    } catch (err) {
      setError(err.message);
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FilePlus className="w-8 h-8 text-[var(--primary)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">New Application</h1>
            <p className="text-[var(--text-muted)] mt-1">Stage 1: File Received</p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <p className="text-emerald-500 text-sm font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-color)]">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Work ID <span className="text-xs text-[var(--text-muted)]">(Auto)</span></label>
                <input type="text" value={formData.job_id} readOnly className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-muted)] cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Receiving Date</label>
                <input type="date" value={formData.receiving_date} onChange={(e) => handleChange('receiving_date', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Received From (HR Staff)</label>
                <input type="text" value={formData.received_from} onChange={(e) => handleChange('received_from', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]" placeholder="e.g., John HR" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Urgency</label>
                <select value={formData.urgency} onChange={(e) => handleChange('urgency', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]">
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Company <span className="text-red-500">*</span></label>
                <select required value={formData.company_id} onChange={(e) => handleChange('company_id', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]">
                  <option value="">Select Company</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Assigned User</label>
                <select value={formData.assigned_to} onChange={(e) => handleChange('assigned_to', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]">
                  <option value="">Select User</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Employee Details */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-color)]">
              Employee Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Employee Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.employee_name} onChange={(e) => handleUppercaseChange('employee_name', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] uppercase" placeholder="e.g., MUHAMMED" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Nationality <span className="text-red-500">*</span></label>
                <select required value={formData.nationality} onChange={(e) => handleChange('nationality', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]">
                  <option value="">Select Nationality</option>
                  {nationalities.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Profession / Designation <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.profession} onChange={(e) => handleUppercaseChange('profession', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] uppercase" placeholder="e.g., ACCOUNTANT" />
              </div>
            </div>
          </div>

          {/* Section 3: Work Permit & Visa Status */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-color)]">
              Work Permit & Visa Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Work Permit Type</label>
                <select value={formData.work_permit_type} onChange={(e) => handleChange('work_permit_type', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]">
                  <option value="Company Visa">Company Visa</option>
                  <option value="Work Permit">Work Permit</option>
                </select>
              </div>

              {formData.work_permit_type === 'Work Permit' && (
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Sub Type</label>
                  <select value={formData.work_permit_sub_type} onChange={(e) => handleChange('work_permit_sub_type', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]">
                    <option value="">Select Sub Type</option>
                    <option value="Relative">Relative</option>
                    <option value="Partial">Partial</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Current Visa Status</label>
                <select value={formData.visa_status} onChange={(e) => handleChange('visa_status', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]">
                  <option value="OUTSIDE">OUTSIDE UAE</option>
                  <option value="INSIDE">INSIDE UAE</option>
                </select>
              </div>

              {formData.visa_status === 'INSIDE' && (
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Current Visa Expiry Date</label>
                  <input type="date" value={formData.current_visa_expiry} onChange={(e) => handleChange('current_visa_expiry', e.target.value)} className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-main)] transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}