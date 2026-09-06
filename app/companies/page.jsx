// app/companies/page.jsx
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Building2, Plus, Trash2, X, Save } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    license_no: '',
    license_type: 'LLC',
    license_expiry: '',
    mohre_est_no: '',
    status: 'active'
  });

  // കമ്പനികളെ ലോഡ് ചെയ്യുക
  const loadCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setCompanies(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // ഫോം സബ്മിറ്റ് ചെയ്യുക (പുതിയ കമ്പനി ചേർക്കുക)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { data, error } = await supabase
      .from('companies')
      .insert([formData])
      .select();

    if (!error) {
      setCompanies([data[0], ...companies]);
      setShowModal(false);
      setFormData({
        name: '',
        license_no: '',
        license_type: 'LLC',
        license_expiry: '',
        mohre_est_no: '',
        status: 'active'
      });
    } else {
      alert('Error saving company: ' + error.message);
    }
    setSaving(false);
  };

  // കമ്പനി ിലീറ്റ് ചെയ്യുക
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (!error) {
      setCompanies(companies.filter(c => c.id !== id));
    } else {
      alert('Error deleting: ' + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* െഡർ */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Building2 className="w-7 h-7 text-[var(--primary)]" />
              Companies
            </h1>
            <p className="text-[var(--text-muted)] mt-1">Manage your registered companies</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Company
          </button>
        </div>

        {/* കമ്പനികളുടെ ലിസ്റ്റ് */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No companies found. Click "Add Company" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Company Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">License No</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">License Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">MOHRE Est. No</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-main)]">{company.name}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{company.license_no || '-'}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{company.license_type || '-'}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{company.mohre_est_no || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(company.id)}
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

        {/* Add Company Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-main)]">Add New Company</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-main)] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g., ABC Trading LLC"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">License No</label>
                    <input
                      type="text"
                      value={formData.license_no}
                      onChange={(e) => setFormData({...formData, license_no: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g., 123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">License Type</label>
                    <select
                      value={formData.license_type}
                      onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="LLC">LLC</option>
                      <option value="Sole Establishment">Sole Establishment</option>
                      <option value="Civil Company">Civil Company</option>
                      <option value="Branch">Branch</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">License Expiry</label>
                    <input
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">MOHRE Est. No</label>
                    <input
                      type="text"
                      value={formData.mohre_est_no}
                      onChange={(e) => setFormData({...formData, mohre_est_no: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g., MOHRE-123"
                    />
                  </div>
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
                    {saving ? 'Saving...' : 'Save Company'}
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