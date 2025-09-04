'use client';
import { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import{enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type E = { id:string; title:string; start:Date; end:Date; resource?:any };

export default function CalendarView() {
  const [events, setEvents] = useState<E[]>([]);

  // fetch current month
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end   = new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59).toISOString();
    fetch(`/api/events?start=${start}&end=${end}`).then(r=>r.json()).then((rows)=>{
      const mapped = rows.map((r:any)=>({ id:r.id, title:r.title, start:new Date(r.starts_at), end:new Date(r.ends_at) }));
      setEvents(mapped);
    });
  }, []);

  const style = useMemo(()=>(
    <style>{`
      /* Force solid text for ALL column headers (week/day/month) */
      .rbc-time-header .rbc-header,
      .rbc-time-header .rbc-row .rbc-header,
      .rbc-time-header .rbc-header > a,
      .rbc-time-header .rbc-header > span,
      .rbc-time-header-gutter .rbc-header,
      .rbc-time-header-content .rbc-header,
      .rbc-time-view .rbc-time-header .rbc-label,
      .rbc-month-view .rbc-header,
      .rbc-month-view .rbc-date-cell,
      .rbc-month-view .rbc-date-cell > a,
      .rbc-month-view .rbc-date-cell > button {
        color: #111 !important;
        font-weight: 700 !important;
        opacity: 1 !important;
        text-shadow: none !important;
        -webkit-text-stroke: 0 !important;
      }

      /* Grid clarity */
      .rbc-time-content .rbc-day-slot .rbc-time-slot { border-top-color: var(--line) !important; }
      .rbc-time-content > * + * { border-left-color: #111 !important; }

      /* Gutter labels (rows) */
      .rbc-time-gutter .rbc-label { color: #111 !important; font-weight: 600; }

      /* Today highlight */
      .rbc-today { background: var(--brand-50); }
      .rbc-toolbar-label-text { background: #111; }
      .rbc-toolbar .rbc-toolbar-label {
  color: #111 !important;
  font-weight: 700;
}
    `}</style>
  ), []);

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-soft p-4">
      {style}
      <Calendar
        localizer={localizer}
        events={events}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.WEEK}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
      />
    </div>
  );
}
