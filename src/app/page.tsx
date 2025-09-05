"use client";
import { useState, useEffect } from "react";
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
    location.reload(); // Refresh calendar
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-brand-800">Welcome to MCC</h1>
        <p className="text-muted">Events hub — create and share.</p>
        
        <div className="flex justify-center gap-4">
          <a 
            href="/chatbot" 
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-brand-700 text-white hover:bg-brand-800 font-medium transition-colors"
          >
            🤖 Meeting Agenda Assistant
          </a>
          <a 
            href="/kiosk" 
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl border border-brand-700 text-brand-700 hover:bg-brand-50 font-medium transition-colors"
          >
            📺 Kiosk View
          </a>
        </div>
      </section>

      <div className="rounded-2xl border border-line bg-surface shadow-soft p-4 space-y-3">
        <div className="font-semibold text-brand-800">Quick Create Event</div>
        <form onSubmit={handleSubmit(createEvent)} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <input 
                {...register('title')}
                className="h-10 px-3 text-black rounded-xl border border-line w-full" 
                placeholder="Event title" 
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <input 
                {...register('starts_at')}
                className="h-10 px-3 text-black rounded-xl border border-line w-full" 
                type="datetime-local" 
              />
              {errors.starts_at && <p className="text-red-600 text-sm mt-1">{errors.starts_at.message}</p>}
            </div>
            
            <div>
              <input 
                {...register('ends_at')}
                className="h-10 px-3 text-black rounded-xl border border-line w-full" 
                type="datetime-local" 
              />
              {errors.ends_at && <p className="text-red-600 text-sm mt-1">{errors.ends_at.message}</p>}
            </div>
          </div>
          
          <button 
            type="submit"
            className="h-10 px-4 rounded-2xl bg-brand-700 text-white hover:bg-brand-800"
          >
            Create Event
          </button>
        </form>
      </div>

      <CalendarView />
    </main>
  );
}