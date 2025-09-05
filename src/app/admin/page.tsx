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

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-800">Admin Panel</h1>
        <div className="flex gap-2">
          <button onClick={createQuick} className="h-10 px-4 rounded-2xl bg-brand-700 text-white hover:bg-brand-800">
            + Add Event
          </button>
          <button onClick={() => setShowAdminManager(!showAdminManager)} 
                  className="h-10 px-4 rounded-2xl border border-brand-700 text-brand-700 hover:bg-brand-50">
            Manage Admins
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface shadow-soft p-4">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted uppercase text-xs">
                <th className="text-left py-2">Title</th>
                <th className="text-left">Starts</th>
                <th className="text-left">Ends</th>
                <th className="text-left">Location</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-line">
                  <td className="py-2 text-gray-900 font-medium">{r.title}</td>
                  <td className="text-gray-900">{new Date(r.starts_at).toLocaleString()}</td>
                  <td className="text-gray-900">{new Date(r.ends_at).toLocaleString()}</td>
                  <td className="text-gray-900">{r.location ?? ''}</td>
                  <td className="text-right">
                    <button
                      onClick={() => startEdit(r)}
                      className="h-8 px-3 rounded-xl border border-line hover:bg-brand-50 mr-2">
                      Edit
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="h-8 px-3 rounded-xl bg-red-600 text-white hover:bg-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted">No events yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Validated Edit Form */}
      {edit && (
        <div className="rounded-2xl border border-line bg-surface shadow-soft p-4 space-y-3">
          <h2 className="text-lg font-semibold text-brand-800">Edit Event</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input 
                  {...register('title')}
                  className="h-10 px-3 rounded-xl border border-line text-gray-900 bg-white w-full"
                  placeholder="Event title"
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
              </div>
              
              <div>
                <input 
                  {...register('location')}
                  className="h-10 px-3 rounded-xl border border-line text-gray-900 bg-white w-full"
                  placeholder="Location"
                />
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>}
              </div>
              
              <div>
                <input 
                  {...register('starts_at')}
                  type="datetime-local"
                  className="h-10 px-3 rounded-xl border border-line text-gray-900 bg-white w-full"
                />
                {errors.starts_at && <p className="text-red-600 text-sm mt-1">{errors.starts_at.message}</p>}
              </div>
              
              <div>
                <input 
                  {...register('ends_at')}
                  type="datetime-local"
                  className="h-10 px-3 rounded-xl border border-line text-gray-900 bg-white w-full"
                />
                {errors.ends_at && <p className="text-red-600 text-sm mt-1">{errors.ends_at.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <textarea 
                  {...register('description')}
                  className="min-h-[80px] px-3 py-2 rounded-xl border border-line text-gray-900 bg-white w-full"
                  placeholder="Description"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button type="submit" className="h-10 px-4 rounded-2xl bg-brand-700 text-white hover:bg-brand-800">
                Save
              </button>
              <button type="button" onClick={cancelEdit} className="h-10 px-4 rounded-2xl border border-line hover:bg-brand-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Manager */}
      {showAdminManager && (
        <div className="rounded-2xl border border-line bg-surface shadow-soft p-4 space-y-4">
          <h2 className="text-lg font-semibold text-brand-800">Admin Management</h2>
          
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 px-3 rounded-xl border border-line text-gray-900 bg-white"
              type="email"
              placeholder="admin@domain.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAdmin()}
            />
            <button
              onClick={addAdmin}
              className="h-10 px-4 rounded-2xl bg-brand-700 text-white hover:bg-brand-800">
              Add Admin
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-brand-800">Current Admins:</h3>
            {admins.length === 0 ? (
              <p className="text-muted">No admins found</p>
            ) : (
              <div className="space-y-1">
                {admins.map((email) => (
                  <div key={email} className="flex items-center text-gray-900 justify-between p-2 rounded-lg bg-brand-50">
                    <span>{email}</span>
                    <button
                      onClick={() => removeAdmin(email)}
                      className="h-8 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
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