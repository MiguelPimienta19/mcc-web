import CalendarView from '@/components/calendar/CalendarView';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-brand-800">Welcome to MCC</h1>
        <p className="text-muted">Events hub — create and share.</p>
      </section>
      <CalendarView />
    </main>
  );
}

