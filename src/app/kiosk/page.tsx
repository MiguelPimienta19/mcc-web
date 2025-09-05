'use client';

import { useEffect, useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';

type Event = {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    starts_at: string;
    ends_at: string;
  };
  
  export default function KioskPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
  
    // Update current time every minute
    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
    }, []);
  
    // Fetch today's events
    useEffect(() => {
      const today = new Date();
      const start = startOfDay(today).toISOString();
      const end = endOfDay(today).toISOString();
  
      fetch(`/api/events?start=${start}&end=${end}`)
        .then(res => res.json())
        .then(data => setEvents(Array.isArray(data) ? data : []))
        .catch(err => console.error('Failed to load events:', err));
    }, []);
  
    const formatTime = (dateStr: string) => {
      return format(new Date(dateStr), 'h:mm a');
    };
  
    const formatTimeRange = (start: string, end: string) => {
      return `${formatTime(start)} - ${formatTime(end)}`;
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-brand-800 mb-4">
              MCC Events Today
            </h1>
            <p className="text-2xl text-brand-600">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-xl text-brand-500 mt-2">
              {format(currentTime, 'h:mm a')}
            </p>
          </div>
  
          {/* Events List */}
          <div className="space-y-6">
            {events.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl text-brand-600">No events scheduled for today</p>
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="bg-white rounded-3xl shadow-lift p-8 border border-brand-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-3xl font-semibold text-brand-800 mb-3">
                        {event.title}
                      </h2>
                      <p className="text-2xl text-brand-600 mb-3">
                        {formatTimeRange(event.starts_at, event.ends_at)}
                      </p>
                      {event.location && (
                        <p className="text-xl text-brand-500 mb-3">
                          📍 {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-lg text-gray-700">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }