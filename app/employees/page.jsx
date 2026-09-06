// app/employees/page.jsx
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Trash2, X, Save, Building2 } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    nationality: '',
    company_id: ''
  });

  // Load employees and companies
  const loadData = async () => {
    setLoading(true);

    const { data: empData } = await supabase
      .from('employees')
      .select('*, companies(name)')
      .order('created_at', { ascending: false });

    if (empData) setEmployees(empData);

    const { data: compData } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (compData) setCompanies(compData);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add new employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { data, error } = await supabase
      .from('employees')
      .insert([{
        name_en: formData.name_en.toUpperCase(),
        nationality: formData.nationality,
        company_id: formData.company_id || null
      }])
      .select('*, companies(name)');

    if (!error && data) {
      setEmployees([data[0], ...employees]);
      setShowModal(false);
      setFormData({ name_en: '', nationality: '', company_id: '' });
    } else {
      alert('Error saving employee: ' + (error?.message || 'Unknown error'));
    }
    setSaving(false);
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (!error) {
      setEmployees(employees.filter(e => e.id !== id));
    } else {
      alert('Error deleting: ' + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Users className="w-7 h-7 text-[var(--primary)]" />
              Employees
            </h1>
            <p className="text-[var(--text-muted)] mt-1">Manage employee records</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Employees List */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No employees found. Click "Add Employee" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Employee Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Nationality</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Company</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-main)]">{emp.name_en}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{emp.nationality || '-'}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                        {emp.companies?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Employee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-main)]">Add New Employee</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-main)] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Employee Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g., MUHAMMED"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g., Indian"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Company</label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="">Select Company (Optional)</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-main)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}