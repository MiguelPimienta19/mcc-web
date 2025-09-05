// src/components/calendar/CalendarView.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import {
  format, parse, startOfWeek as dfStartOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfDay, endOfDay, getDay
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AddToCalendar } from '@/components/events/AddToCalendar';

/* Localizer */
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d: Date) => dfStartOfWeek(d, { locale: enUS }),
  getDay,
  locales: { 'en-US': enUS },
});

/* Helpers for work-hour window */
const atHour = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};
const WORK_START = atHour(9);   // 9:00 AM
const WORK_END   = atHour(20);  // 8:00 PM
const SCROLL_TO  = atHour(9);   // initial scroll anchor

type Row = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  starts_at: string; // ISO
  ends_at: string;   // ISO
};
type EventUI = { id: string; title: string; start: Date; end: Date; row: Row };

export default function CalendarView() {
  const [events, setEvents] = useState<EventUI[]>([]);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<EventUI | null>(null);

  function currentRange(v: View, d: Date) {
    if (v === Views.DAY)  return { start: startOfDay(d), end: endOfDay(d) };
    if (v === Views.WEEK) return { start: dfStartOfWeek(d), end: endOfWeek(d) };
    return { start: startOfMonth(d), end: endOfMonth(d) };
  }

  useEffect(() => {
    const { start, end } = currentRange(view, date);
    const startIso = start.toISOString();
    const endIso = end.toISOString();
    let cancelled = false;

    (async () => {
      const res = await fetch(`/api/events?start=${startIso}&end=${endIso}`);
      const rows: Row[] = await res.json();
      if (!res.ok || cancelled) return;
      setEvents(rows.map(r => ({
        id: r.id,
        title: r.title,
        start: new Date(r.starts_at),
        end: new Date(r.ends_at),
        row: r,
      })));
    })();

    return () => { cancelled = true; };
  }, [view, date]);

  const style = useMemo(() => (
    <style>{`
      .rbc-time-header .rbc-header, .rbc-month-view .rbc-header { color:#111!important; font-weight:700!important; }
      .rbc-time-gutter .rbc-label { color:#111!important; font-weight:600!important; }
      .rbc-time-view .rbc-time-slot { border-top-color: var(--line)!important; }
      .rbc-day-bg + .rbc-day-bg { border-left-color: var(--brand-100)!important; }
      .rbc-today { background: var(--brand-50)!important; }
      .rbc-toolbar { gap:.5rem; }
      .rbc-toolbar button { border-radius:9999px; padding:6px 12px; }
      .rbc-toolbar button.rbc-active { background: var(--brand-700)!important; color:#fff!important; }
      .rbc-event, .rbc-day-slot .rbc-event, .rbc-month-view .rbc-event {
        background: var(--brand-700)!important; border:1px solid var(--brand-700)!important; color:#fff!important;
      }
      .rbc-event.rbc-selected, .rbc-event:hover, .rbc-event:focus {
        background: var(--brand-800)!important; border-color: var(--brand-800)!important;
      }
      .rbc-event-label, .rbc-event-content { color:#fff!important; }

      .rbc-toolbar .rbc-toolbar-label {
        color: #000 !important;
        font-weight: 700;
      }

      .rbc-date-cell {
        color: #000 !important;
        font-weight: 700;
      }
    `}</style>
  ), []);

  return (
    <>
      <div className="rounded-2xl border border-line bg-surface shadow-soft p-4">
        {style}
        <Calendar
          localizer={localizer}
          events={events}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 1000 }}
          onSelectEvent={(e) => setSelected(e as EventUI)}

          /* 👇 focus the visible hours */
          min={WORK_START}
          max={WORK_END}
          scrollToTime={SCROLL_TO}
          step={30}       // minutes per slot
          timeslots={2}   // 2 slots per hour (30min blocks)
          showMultiDayTimes
        />
      </div>

      {selected && (
        <div className="mt-4 rounded-2xl border border-line bg-surface shadow-soft p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-brand-800">{selected.title}</h3>
              <p className="text-sm text-muted">
                {selected.start.toLocaleString()} – {selected.end.toLocaleString()}
              </p>
              {selected.row.location && (
                <p className="text-sm mt-1"><span className="text-muted">Where:</span> {selected.row.location}</p>
              )}
              {selected.row.description && <p className="text-sm mt-2">{selected.row.description}</p>}
            </div>
            <button
              onClick={() => setSelected(null)}
              className="h-9 px-3 rounded-xl border border-line hover:bg-brand-50"
            >
              Close
            </button>
          </div>

          <div className="mt-4">
            <AddToCalendar event={{
              id: selected.id,
              title: selected.title,
              description: selected.row.description ?? undefined,
              location: selected.row.location ?? undefined,
              starts_at: selected.row.starts_at,
              ends_at: selected.row.ends_at,
            }}/>
          </div>
        </div>
      )}
    </>
  );
}
