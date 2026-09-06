// app/works/new/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { FilePlus, Save, X, AlertCircle } from 'lucide-react';

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    job_id: '',
    employee_id: '',
    company_id: '',
    receiving_date: new Date().toISOString().split('T')[0],
    received_from: '',
    urgency: 'normal',
    work_permit_type: 'Company Visa',
    work_permit_sub_type: '',
    profession: '',
    visa_status: 'Outside UAE',
    current_visa_expiry: '',
    status: 'active',
    current_stage: 1,
    progress: 5,
    assigned_to: ''
  });

  // Load data
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

      // Get all companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      setCompanies(companiesData || []);

      // Get all employees
      const { data: employeesData } = await supabase
        .from('employees')
        .select('*')
        .order('name_en');
      setEmployees(employeesData || []);

      setLoading(false);
    };

    loadData();
  }, []);

  // Auto-generate Work ID when company is selected
  useEffect(() => {
    if (formData.company_id) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yy = String(today.getFullYear()).slice(-2);
      const dateStr = `${dd}${mm}${yy}`;
      
      // Get next number (simplified - in production, query max job_id)
      const nextNum = String(Math.floor(Math.random() * 900) + 100);
      setFormData(prev => ({
        ...prev,
        job_id: `W365-${nextNum}-${dateStr}`
      }));
    }
  }, [formData.company_id]);

  // Auto-assign to company's concern person
  useEffect(() => {
    if (formData.company_id) {
      const selectedCompany = companies.find(c => c.id === formData.company_id);
      if (selectedCompany?.concern_person_id) {
        setFormData(prev => ({
          ...prev,
          assigned_to: selectedCompany.concern_person_id
        }));
      }
    }
  }, [formData.company_id, companies]);

  // Handle uppercase for employee name and profession
  const handleUppercaseChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.toUpperCase()
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.company_id) {
        throw new Error('Please select a company');
      }
      if (!formData.profession) {
        throw new Error('Please enter profession');
      }

      // Insert application
      const { data, error: insertError } = await supabase
        .from('applications')
        .insert([{
          job_id: formData.job_id,
          employee_id: formData.employee_id || null,
          company_id: formData.company_id,
          receiving_date: formData.receiving_date,
          received_from: formData.received_from,
          urgency: formData.urgency,
          work_permit_type: formData.work_permit_type,
          work_permit_sub_type: formData.work_permit_type === 'Work Permit' ? formData.work_permit_sub_type : null,
          profession: formData.profession,
          visa_status: formData.visa_status,
          current_visa_expiry: formData.visa_status === 'Inside UAE' ? formData.current_visa_expiry : null,
          status: 'active',
          current_stage: 1,
          progress: 5,
          assigned_to: formData.assigned_to || null,
          created_by: currentUser?.id
        }])
        .select();

      if (insertError) throw insertError;

      // Create first stage record
      const { error: stageError } = await supabase
        .from('application_stages')
        .insert([{
          application_id: data[0].id,
          stage_number: 1,
          stage_name: 'File Received',
          status: 'in_progress',
          assigned_to: formData.assigned_to || null,
          assigned_at: new Date().toISOString()
        }]);

      if (stageError) throw stageError;

      // Create activity log
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert([{
          application_id: data[0].id,
          user_id: currentUser?.id,
          action: 'Application Created',
          from_stage: 0,
          to_stage: 1,
          notes: `New application created: ${formData.job_id}`
        }]);

      if (logError) throw logError;

      setSuccess('Application created successfully!');
      
      // Reset form
      setFormData({
        job_id: '',
        employee_id: '',
        company_id: '',
        receiving_date: new Date().toISOString().split('T')[0],
        received_from: '',
        urgency: 'normal',
        work_permit_type: 'Company Visa',
        work_permit_sub_type: '',
        profession: '',
        visa_status: 'Outside UAE',
        current_visa_expiry: '',
        status: 'active',
        current_stage: 1,
        progress: 5,
        assigned_to: ''
      });

      // Redirect to works list after 2 seconds
      setTimeout(() => {
        router.push('/works');
      }, 2000);

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
        {/* Header */}
        <div className="flex items-center gap-3">
          <FilePlus className="w-8 h-8 text-[var(--primary)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">New Application</h1>
            <p className="text-[var(--text-muted)] mt-1">Create a new visa processing application</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <p className="text-emerald-500 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-color)]">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Work ID (Auto-generated) */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Work ID <span className="text-xs text-[var(--text-muted)]">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={formData.job_id}
                  readOnly
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-muted)] cursor-not-allowed"
                  placeholder="Select company to generate"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.company_id}
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              {/* Employee */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Employee</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Select Employee (Optional)</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name_en}</option>
                  ))}
                </select>
              </div>

              {/* Receiving Date */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Receiving Date</label>
                <input
                  type="date"
                  value={formData.receiving_date}
                  onChange={(e) => setFormData({...formData, receiving_date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Received From */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Received From</label>
                <input
                  type="text"
                  value={formData.received_from}
                  onChange={(e) => setFormData({...formData, received_from: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g., HR Department"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Urgency</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Work Permit Details */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-color)]">
              Work Permit Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Work Permit Type */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Work Permit Type</label>
                <select
                  value={formData.work_permit_type}
                  onChange={(e) => setFormData({...formData, work_permit_type: e.target.value, work_permit_sub_type: ''})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="Company Visa">Company Visa</option>
                  <option value="Work Permit">Work Permit</option>
                </select>
              </div>

              {/* Work Permit Sub Type (Conditional) */}
              {formData.work_permit_type === 'Work Permit' && (
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Sub Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.work_permit_sub_type}
                    onChange={(e) => setFormData({...formData, work_permit_sub_type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="">Select Sub Type</option>
                    <option value="Relative">Relative</option>
                    <option value="Partial">Partial</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              )}

              {/* Profession (Auto Uppercase) */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Profession <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.profession}
                  onChange={(e) => handleUppercaseChange('profession', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g., ACCOUNTANT"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Visa Status */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-color)]">
              Visa Status
            </h2>
            <div className="space-y-4">
              
              {/* Visa Status Radio Buttons */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-3">Current Visa Status</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visa_status"
                      value="Outside UAE"
                      checked={formData.visa_status === 'Outside UAE'}
                      onChange={(e) => setFormData({...formData, visa_status: e.target.value, current_visa_expiry: ''})}
                      className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm text-[var(--text-main)]">Outside UAE</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visa_status"
                      value="Inside UAE"
                      checked={formData.visa_status === 'Inside UAE'}
                      onChange={(e) => setFormData({...formData, visa_status: e.target.value})}
                      className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm text-[var(--text-main)]">Inside UAE</span>
                  </label>
                </div>
              </div>

              {/* Current Visa Expiry (Conditional) */}
              {formData.visa_status === 'Inside UAE' && (
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Current Visa Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.current_visa_expiry}
                    onChange={(e) => setFormData({...formData, current_visa_expiry: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-main)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}