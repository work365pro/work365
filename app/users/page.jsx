// app/admin/users/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Shield, Calendar, X, Save, Edit2, Trash2, Clock } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [userData, setUserData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'labour_pro',
    company_id: '',
    is_active: true
  });

  const [roleData, setRoleData] = useState({
    user_id: '',
    role: 'labour_pro',
    company_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reason: ''
  });

  const roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'pro_manager', label: 'PRO Manager' },
    { value: 'labour_pro', label: 'Labour PRO' },
    { value: 'immigration_pro', label: 'Immigration PRO' },
    { value: 'medical_coordinator', label: 'Medical Coordinator' },
    { value: 'eid_insurance_pro', label: 'EID & Insurance PRO' },
    { value: 'stamping_pro', label: 'Stamping PRO' }
  ];

  // Load data
  const loadData = async () => {
    setLoading(true);

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!user || user.role !== 'super_admin') {
      router.push('/');
      return;
    }

    setCurrentUser(user);

    // Get all users
    const { data: usersData } = await supabase
      .from('users')
      .select('*, companies(name)')
      .order('created_at', { ascending: false });

    if (usersData) setUsers(usersData);

    // Get all companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (companiesData) setCompanies(companiesData);

    // Get role assignments
    const { data: assignmentsData } = await supabase
      .from('role_assignments')
      .select('*, users(full_name, email), companies(name)')
      .order('created_at', { ascending: false });

    if (assignmentsData) setRoleAssignments(assignmentsData);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          company_id: userData.company_id || null,
          approval_status: 'approved',
          is_active: userData.is_active
        }])
        .select();

      if (userError) throw userError;

      // Create initial role assignment
      const { error: assignmentError } = await supabase
        .from('role_assignments')
        .insert([{
          user_id: authData.user.id,
          role: userData.role,
          company_id: userData.company_id || null,
          assigned_by: currentUser.id,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true,
          reason: 'Initial role assignment'
        }]);

      if (assignmentError) throw assignmentError;

      await loadData();
      setShowUserModal(false);
      setUserData({
        full_name: '',
        email: '',
        password: '',
        role: 'labour_pro',
        company_id: '',
        is_active: true
      });
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
    setSaving(false);
  };

  // Assign role with time period
  const handleAssignRole = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('role_assignments')
        .insert([{
          user_id: roleData.user_id,
          role: roleData.role,
          company_id: roleData.company_id || null,
          assigned_by: currentUser.id,
          start_date: roleData.start_date,
          end_date: roleData.end_date || null,
          is_active: true,
          reason: roleData.reason
        }]);

      if (error) throw error;

      // Update user's current role if no end date
      if (!roleData.end_date) {
        await supabase
          .from('users')
          .update({
            role: roleData.role,
            company_id: roleData.company_id || null
          })
          .eq('id', roleData.user_id);
      }

      await loadData();
      setShowRoleModal(false);
      setRoleData({
        user_id: '',
        role: 'labour_pro',
        company_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        reason: ''
      });
    } catch (error) {
      alert('Error assigning role: ' + error.message);
    }
    setSaving(false);
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await loadData();
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  // Deactivate role assignment
  const handleDeactivateAssignment = async (assignmentId) => {
    try {
      const { error } = await supabase
        .from('role_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      await loadData();
    } catch (error) {
      alert('Error deactivating assignment: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-500';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-amber-500/10 text-amber-500';
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-500/10 text-purple-500',
      pro_manager: 'bg-blue-500/10 text-blue-500',
      labour_pro: 'bg-green-500/10 text-green-500',
      immigration_pro: 'bg-cyan-500/10 text-cyan-500',
      medical_coordinator: 'bg-pink-500/10 text-pink-500',
      eid_insurance_pro: 'bg-orange-500/10 text-orange-500',
      stamping_pro: 'bg-indigo-500/10 text-indigo-500'
    };
    return colors[role] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
              <Shield className="w-8 h-8 text-[var(--primary)]" />
              User Management
            </h1>
            <p className="text-[var(--text-muted)] mt-1">Manage users, roles, and assignments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Shield className="w-5 h-5" />
              Assign Role
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Company</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-main)]">{user.full_name}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{user.companies?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.approval_status)}`}>
                          {user.approval_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleData({...roleData, user_id: user.id});
                            setShowRoleModal(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors mr-2"
                          title="Assign Role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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

        {/* Role Assignments Table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Role Assignments (With Time Periods)
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Company</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Period</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Reason</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roleAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-main)]">
                        {assignment.users?.full_name}
                        <p className="text-xs text-[var(--text-muted)]">{assignment.users?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(assignment.role)}`}>
                          {assignment.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{assignment.companies?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <div>
                            <p>{new Date(assignment.start_date).toLocaleDateString()}</p>
                            {assignment.end_date && (
                              <p className="text-xs">to {new Date(assignment.end_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{assignment.reason || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        {assignment.is_active && (
                          <button
                            onClick={() => handleDeactivateAssignment(assignment.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Deactivate"
                          >
                            <X className="w-4 h-4" />
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

        {/* Add User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-main)]">Add New User</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-main)] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userData.full_name}
                    onChange={(e) => setUserData({...userData, full_name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g., john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={userData.password}
                    onChange={(e) => setUserData({...userData, password: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Initial Role *</label>
                  <select
                    required
                    value={userData.role}
                    onChange={(e) => setUserData({...userData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Company</label>
                  <select
                    value={userData.company_id}
                    onChange={(e) => setUserData({...userData, company_id: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="">No Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={userData.is_active}
                    onChange={(e) => setUserData({...userData, is_active: e.target.checked})}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="is_active" className="text-sm text-[var(--text-main)]">Active User</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
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
                    {saving ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Role Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-main)]">Assign Role with Time Period</h2>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-main)] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignRole} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">User *</label>
                  <select
                    required
                    value={roleData.user_id}
                    onChange={(e) => setRoleData({...roleData, user_id: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Role *</label>
                  <select
                    required
                    value={roleData.role}
                    onChange={(e) => setRoleData({...roleData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Company</label>
                  <select
                    value={roleData.company_id}
                    onChange={(e) => setRoleData({...roleData, company_id: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="">No Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={roleData.start_date}
                      onChange={(e) => setRoleData({...roleData, start_date: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={roleData.end_date}
                      onChange={(e) => setRoleData({...roleData, end_date: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">Leave empty for permanent role</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Reason</label>
                  <textarea
                    value={roleData.reason}
                    onChange={(e) => setRoleData({...roleData, reason: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g., Vacation coverage, Temporary assignment..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-main)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Assigning...' : 'Assign Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}