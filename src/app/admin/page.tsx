'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema for events
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
  location: z.string().max(100, 'Location too long').optional().or(z.literal('')),
  starts_at: z.string().min(1, 'Start time is required'),
  ends_at: z.string().min(1, 'End time is required'),
}).refine((data) => {
  const start = new Date(data.starts_at);
  const end = new Date(data.ends_at);
  return end > start;
}, {
  message: 'End time must be after start time',
  path: ['ends_at'],
});

type EventFormData = z.infer<typeof eventSchema>;

type Row = {
  id: string;
  title: string;
  description?: string|null;
  location?: string|null;
  starts_at: string; // ISO
  ends_at: string;   // ISO
};

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Row | null>(null);
  const [showAdminManager, setShowAdminManager] = useState(false);
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Form for editing events
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema)
  });

  async function load() {
    setLoading(true);
    const start = new Date(new Date().getFullYear() - 1, 0, 1).toISOString();
    const end   = new Date(new Date().getFullYear() + 1, 11, 31, 23, 59).toISOString();
    const r = await fetch(`/api/events?start=${start}&end=${end}`);
    const data = await r.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { 
    load(); 
    if (showAdminManager) loadAdmins();
  }, [showAdminManager]);

  async function loadAdmins() {
    try {
      const res = await fetch('/api/admin/list');
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
    }
  }

  async function addAdmin() {
    if (!newAdminEmail.trim()) return;
    
    try {
      const res = await fetch('/api/admin/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail.trim().toLowerCase() }),
      });
      
      if (res.ok) {
        setNewAdminEmail('');
        loadAdmins();
      } else {
        alert('Failed to add admin');
      }
    } catch (err) {
      console.error('Failed to add admin:', err);
      alert('Failed to add admin');
    }
  }

  async function removeAdmin(email: string) {
    if (!confirm(`Remove ${email} from admin list?`)) return;
    
    try {
      const res = await fetch('/api/admin/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        loadAdmins();
      } else {
        alert('Failed to remove admin');
      }
    } catch (err) {
      console.error('Failed to remove admin:', err);
      alert('Failed to remove admin');
    }
  }

  async function createQuick() {
    const now = new Date();
    const in1h = new Date(now.getTime() + 60*60*1000);
    const res = await fetch('/api/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Admin Event',
        starts_at: now.toISOString(),
        ends_at: in1h.toISOString(),
      }),
    });
    if (!res.ok) { alert('Create failed'); return; }
    await load();
  }

  // Handle form submission for editing
  async function onSubmit(data: EventFormData) {
    if (!edit) return;
    
    const res = await fetch(`/api/events/${edit.id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        starts_at: new Date(data.starts_at).toISOString(),
        ends_at: new Date(data.ends_at).toISOString(),
      }),
    });
    
    if (!res.ok) { 
      alert('Update failed'); 
      return; 
    }
    
    setEdit(null);
    reset();
    await load();
  }

  // Start editing an event
  function startEdit(row: Row) {
    setEdit(row);
    setValue('title', row.title);
    setValue('description', row.description || '');
    setValue('location', row.location || '');
    setValue('starts_at', toLocal(row.starts_at));
    setValue('ends_at', toLocal(row.ends_at));
  }

  function cancelEdit() {
    setEdit(null);
    reset();
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return;
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Delete failed'); return; }
    await load();
  }

  // Calculate stats
  const totalEvents = rows.length;
  const upcomingEvents = rows.filter(r => new Date(r.starts_at) > new Date()).length;
  const thisWeekEvents = rows.filter(r => {
    const start = new Date(r.starts_at);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return start >= now && start <= weekFromNow;
  }).length;
  const thisMonthEvents = rows.filter(r => {
    const start = new Date(r.starts_at);
    const now = new Date();
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-line bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-800">Admin Dashboard</h1>
              <p className="text-muted mt-1">Manage events and system settings</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAdminManager(!showAdminManager)}
                className="h-11 px-6 rounded-xl border border-line text-text hover:bg-brand-50 font-medium transition-colors"
              >
                User Permissions
              </button>
              <button 
                onClick={createQuick}
                className="h-11 px-6 rounded-xl bg-brand-700 text-white hover:bg-brand-800 font-medium transition-colors shadow-soft"
              >
                + Add Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-line bg-surface shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Total Events</p>
                <p className="text-3xl font-bold text-brand-800 mt-2">{totalEvents}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Upcoming Events</p>
                <p className="text-3xl font-bold text-brand-800 mt-2">{upcomingEvents}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">This Week</p>
                <p className="text-3xl font-bold text-brand-800 mt-2">{thisWeekEvents}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">This Month</p>
                <p className="text-3xl font-bold text-brand-800 mt-2">{thisMonthEvents}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Events Management */}
        <div className="rounded-2xl border border-line bg-surface shadow-soft">
          <div className="p-6 border-b border-line">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-brand-800">Events Management</h2>
                <p className="text-muted mt-1">Create, edit, and manage all events</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Total: {totalEvents}</span>
                <button 
                  onClick={load}
                  className="h-9 px-4 rounded-xl border border-line text-brand-800 hover:bg-brand-50 text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                <span className="ml-3 text-muted">Loading events...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-line">
                      <th className="pb-3 text-sm font-medium text-muted uppercase tracking-wider">Event</th>
                      <th className="pb-3 text-sm font-medium text-muted uppercase tracking-wider">Date</th>
                      <th className="pb-3 text-sm font-medium text-muted uppercase tracking-wider">Time</th>
                      <th className="pb-3 text-sm font-medium text-muted uppercase tracking-wider">Location</th>
                      <th className="pb-3 text-sm font-medium text-muted uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-sm font-medium text-muted uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((r) => {
                      const startDate = new Date(r.starts_at);
                      const endDate = new Date(r.ends_at);
                      const isUpcoming = startDate > new Date();
                      const isPast = endDate < new Date();
                      
                      return (
                        <tr key={r.id} className="hover:bg-brand-50/50 transition-colors">
                          <td className="py-4">
                            <div>
                              <p className="font-medium text-brand-800">{r.title}</p>
                              {r.description && (
                                <p className="text-sm text-muted mt-1 line-clamp-1">{r.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-text">
                            {startDate.toLocaleDateString()}
                          </td>
                          <td className="py-4 text-text">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4 text-text">
                            {r.location || '—'}
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              isPast ? 'bg-gray-100 text-gray-700' :
                              isUpcoming ? 'bg-brand-100 text-brand-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {isPast ? 'Past' : isUpcoming ? 'Upcoming' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(r)}
                                className="h-8 px-3 rounded-lg border border-line text-brand-800 hover:bg-brand-50 text-sm font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => remove(r.id)}
                                className="h-8 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="text-muted">
                            <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium">No events yet</p>
                            <p className="mt-1">Get started by creating your first event</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {edit && (
          <div className="rounded-2xl border border-line bg-surface shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-brand-800">Edit Event</h3>
              <button
                onClick={cancelEdit}
                className="h-9 px-4 rounded-xl border border-line text-brand-800 hover:bg-brand-50 text-sm"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Event Title</label>
                  <input 
                    {...register('title')}
                    className="w-full h-11 px-4 rounded-xl border border-line bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Enter event title"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Location</label>
                  <input 
                    {...register('location')}
                    className="w-full h-11 px-4 rounded-xl border border-line bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                  {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Start Time</label>
                  <input 
                    {...register('starts_at')}
                    type="datetime-local"
                    className="w-full h-11 px-4 rounded-xl border border-line bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  {errors.starts_at && <p className="text-red-600 text-sm mt-1">{errors.starts_at.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">End Time</label>
                  <input 
                    {...register('ends_at')}
                    type="datetime-local"
                    className="w-full h-11 px-4 rounded-xl border border-line bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  {errors.ends_at && <p className="text-red-600 text-sm mt-1">{errors.ends_at.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text mb-2">Description</label>
                  <textarea 
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-line bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    placeholder="Enter event description"
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-brand-700 text-white hover:bg-brand-800 font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="h-11 px-6 rounded-xl border border-line text-brand-800 hover:bg-brand-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admin Management */}
        {showAdminManager && (
          <div className="rounded-2xl border border-line bg-surface shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-brand-800">User Permissions</h3>
                <p className="text-muted mt-1">Manage admin access to the system</p>
              </div>
              <button
                onClick={() => setShowAdminManager(false)}
                className="h-9 px-4 rounded-xl border border-line text-brand-800 hover:bg-brand-50 text-sm"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Add New Admin</label>
                <div className="flex gap-3">
                  <input
                    className="flex-1 h-11 px-4 rounded-xl border border-line bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    type="email"
                    placeholder="admin@domain.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAdmin()}
                  />
                  <button
                    onClick={addAdmin}
                    className="h-11 px-6 rounded-xl bg-brand-700 text-white hover:bg-brand-800 font-medium transition-colors"
                  >
                    Add Admin
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-text mb-3">Current Admins ({admins.length})</h4>
                {admins.length === 0 ? (
                  <p className="text-muted py-4">No admins found</p>
                ) : (
                  <div className="space-y-2">
                    {admins.map((email) => (
                      <div key={email} className="flex items-center justify-between p-4 rounded-xl bg-brand-50 border border-brand-100">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand-200 flex items-center justify-center">
                            <svg className="h-4 w-4 text-brand-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-medium text-brand-800">{email}</span>
                        </div>
                        <button
                          onClick={() => removeAdmin(email)}
                          className="h-8 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function toLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth()+1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}