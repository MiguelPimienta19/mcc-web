"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const CalendarView = dynamic(() => import("@/components/calendar/CalendarView"), { ssr: false });

// Validation schema for quick event creation
const quickEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
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

type QuickEventFormData = z.infer<typeof quickEventSchema>;

export default function Home() {
  const [showEventForm, setShowEventForm] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<QuickEventFormData>({
    resolver: zodResolver(quickEventSchema)
  });

  async function createEvent(data: QuickEventFormData) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: data.title, 
        starts_at: new Date(data.starts_at).toISOString(), 
        ends_at: new Date(data.ends_at).toISOString() 
      }),
    });
    
    const out = await res.json();
    if (!res.ok) { 
      alert(out.error || "Failed to create event"); 
      return; 
    }
    
    reset(); // Clear the form
    setShowEventForm(false); // Hide the form
    location.reload(); // Refresh calendar
  }

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="text-center py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold text-brand-800">Welcome to the MCC</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Your central hub for managing meetings, events, and collaborative 
            spaces. Stay organized!
          </p>
          
          <div className="flex justify-center gap-4 pt-4">
            <button 
              onClick={() => setShowEventForm(!showEventForm)}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-brand-700 text-white hover:bg-brand-800 font-medium transition-colors shadow-soft"
            >
              📅 Add to Calendar
            </button>
            <a 
              href="/chatbot"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl border border-line text-text hover:bg-brand-50 font-medium transition-colors"
            >
              📋 Make Meeting Agenda
            </a>
          </div>
        </div>
      </section>

      {/* Quick Event Creation Form */}
      {showEventForm && (
        <section className="max-w-4xl mx-auto px-6 pb-8">
          <div className="rounded-2xl border border-line bg-surface shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-brand-800">Create New Event</h3>
             
            </div>
            
            <form onSubmit={handleSubmit(createEvent)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Event Title</label>
                  <input 
                    {...register('title')}
                    className="h-11 px-4 text-black rounded-xl border border-line w-full focus:outline-none focus:ring-2 focus:ring-brand-500" 
                    placeholder="Enter event title" 
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Start Time</label>
                  <input 
                    {...register('starts_at')}
                    className="h-11 px-4 text-black rounded-xl border border-line w-full focus:outline-none focus:ring-2 focus:ring-brand-500" 
                    type="datetime-local" 
                  />
                  {errors.starts_at && <p className="text-red-600 text-sm mt-1">{errors.starts_at.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">End Time</label>
                  <input 
                    {...register('ends_at')}
                    className="h-11 px-4 text-black rounded-xl border border-line w-full focus:outline-none focus:ring-2 focus:ring-brand-500" 
                    type="datetime-local" 
                  />
                  {errors.ends_at && <p className="text-red-600 text-sm mt-1">{errors.ends_at.message}</p>}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="h-11 px-6 text-black rounded-xl border border-line hover:bg-brand-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-brand-700 text-white hover:bg-brand-800 font-medium transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Calendar Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-800 mb-2">Weekly Calendar</h2>
        </div>
        
        <CalendarView />
      </section>
    </main>
  );
}