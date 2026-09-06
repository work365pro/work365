// app/settings/pipeline/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { 
  Settings, Save, AlertCircle, CheckCircle, 
  Plus, Trash2, ArrowUp, ArrowDown, GripVertical 
} from 'lucide-react';

export default function PipelineSettingsPage() {
  const router = useRouter();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUser, setCurrentUser] = useState(null);

  const roles = [
    { value: 'labour_pro', label: 'Labour PRO' },
    { value: 'immigration_pro', label: 'Immigration PRO' },
    { value: 'medical_coordinator', label: 'Medical Coordinator' },
    { value: 'eid_insurance_pro', label: 'EID & Insurance PRO' },
    { value: 'stamping_pro', label: 'Stamping PRO' },
    { value: 'pro_manager', label: 'PRO Manager' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Check if user is super admin
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (user?.role !== 'super_admin') {
          setMessage({ type: 'error', text: 'Access Denied: Super Admin only.' });
        }
        setCurrentUser(user);
      }

      // Fetch pipeline stages
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('stage_order', { ascending: true });

      if (!error) {
        setStages(data || []);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // Handle input change
  const handleChange = (id, field, value) => {
    setStages(stages.map(stage => 
      stage.id === id ? { ...stage, [field]: value } : stage
    ));
  };

  // Move stage UP
  const handleMoveUp = (index) => {
    if (index === 0) return; // Already at top
    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[index - 1];
    newStages[index - 1] = temp;
    // Update stage_order
    newStages.forEach((stage, i) => {
      stage.stage_order = i + 1;
    });
    setStages(newStages);
  };

  // Move stage DOWN
  const handleMoveDown = (index) => {
    if (index === stages.length - 1) return; // Already at bottom
    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[index + 1];
    newStages[index + 1] = temp;
    // Update stage_order
    newStages.forEach((stage, i) => {
      stage.stage_order = i + 1;
    });
    setStages(newStages);
  };

  // Add new stage
  const handleAddStage = () => {
    const newStage = {
      id: crypto.randomUUID(),
      stage_name: 'New Stage',
      stage_order: stages.length + 1,
      assigned_role: 'labour_pro',
      sla_hours: 24,
      is_active: true
    };
    setStages([...stages, newStage]);
  };

  // Delete stage
  const handleDeleteStage = (index) => {
    if (!confirm('Are you sure you want to delete this stage?')) return;
    
    const newStages = stages.filter((_, i) => i !== index);
    // Update stage_order
    newStages.forEach((stage, i) => {
      stage.stage_order = i + 1;
    });
    setStages(newStages);
  };

  // Save all changes
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Separate existing stages (with real UUIDs) and new stages
      const existingStages = stages.filter(s => 
        s.id && !s.id.includes('-') === false && s.id.length === 36
      );
      const newStages = stages.filter(s => 
        !s.id || s.id.length !== 36
      );

      // Update existing stages
      if (existingStages.length > 0) {
        const updates = existingStages.map(stage => ({
          id: stage.id,
          stage_name: stage.stage_name,
          stage_order: stage.stage_order,
          assigned_role: stage.assigned_role,
          sla_hours: parseInt(stage.sla_hours) || 24,
          is_active: stage.is_active
        }));

        const { error: updateError } = await supabase
          .from('pipeline_stages')
          .upsert(updates);

        if (updateError) throw updateError;
      }

      // Insert new stages
      if (newStages.length > 0) {
        const inserts = newStages.map(stage => ({
          stage_name: stage.stage_name,
          stage_order: stage.stage_order,
          assigned_role: stage.assigned_role,
          sla_hours: parseInt(stage.sla_hours) || 24,
          is_active: stage.is_active
        }));

        const { error: insertError } = await supabase
          .from('pipeline_stages')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      // Delete removed stages (if any were deleted from DB)
      // For simplicity, we'll reload after save

      setMessage({ type: 'success', text: 'Pipeline settings saved successfully!' });
      
      // Reload data after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving: ' + err.message });
    }

    setSaving(false);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Settings className="w-7 h-7 text-[var(--primary)]" />
              Pipeline Settings
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Configure the PRO workflow stages
            </p>
          </div>
          <div className="flex gap-3">
            {isSuperAdmin && (
              <button
                onClick={handleAddStage}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add Stage
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !isSuperAdmin}
              className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`p-4 rounded-lg border flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Stages Table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading pipeline stages...</div>
          ) : stages.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No stages found. Click "Add Stage" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase w-20">Order</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Stage Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Assigned Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase w-32">SLA (Hours)</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase w-20">Active</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage, index) => (
                    <tr key={stage.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)]/50 transition-colors">
                      {/* Order Number with Move Buttons */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-bold text-[var(--primary)]">
                            {stage.stage_order}
                          </span>
                          {isSuperAdmin && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === stages.length - 1}
                                className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stage Name */}
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={stage.stage_name}
                          onChange={(e) => handleChange(stage.id, 'stage_name', e.target.value)}
                          disabled={!isSuperAdmin}
                          className="w-full px-3 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
                        />
                      </td>

                      {/* Assigned Role */}
                      <td className="px-6 py-4">
                        <select
                          value={stage.assigned_role}
                          onChange={(e) => handleChange(stage.id, 'assigned_role', e.target.value)}
                          disabled={!isSuperAdmin}
                          className="w-full px-3 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
                        >
                          {roles.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* SLA Hours */}
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={stage.sla_hours}
                          onChange={(e) => handleChange(stage.id, 'sla_hours', e.target.value)}
                          disabled={!isSuperAdmin}
                          className="w-full px-3 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
                        />
                      </td>

                      {/* Active Checkbox */}
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={stage.is_active}
                          onChange={(e) => handleChange(stage.id, 'is_active', e.target.checked)}
                          disabled={!isSuperAdmin}
                          className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                      </td>

                      {/* Delete Button */}
                      <td className="px-6 py-4 text-center">
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteStage(index)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Stage"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-4">
          <p className="font-medium mb-1">Note:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use ↑ ↓ arrows to reorder stages. Order affects the workflow sequence.</li>
            <li>Click "Add Stage" to create a new stage at the end.</li>
            <li>Click the trash icon to delete a stage.</li>
            <li>SLA Hours define the deadline for each stage. Exceeding this will trigger alerts.</li>
            <li>Only Super Admin can modify these settings.</li>
            <li>Remember to click "Save Changes" after making modifications.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}