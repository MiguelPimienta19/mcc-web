"use client";
import Link from "next/link";
import { googleCalUrl } from "@/lib/google";

export function AddToCalendar({ event }: {
  event: {
    id: string; title: string; description?: string|null; location?: string|null;
    starts_at: string; ends_at: string;
  };
}) {
  const g = googleCalUrl({
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    startIsoUtc: event.starts_at,
    endIsoUtc: event.ends_at,
  });

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={g} target="_blank" rel="noopener noreferrer">
        <button className="h-9 px-3 rounded-2xl bg-brand-700 text-white hover:bg-brand-800">
          Add to Google
        </button>
      </Link>
      <Link href={`/api/events/${event.id}/ics`}>
        <button className="h-9 px-3 rounded-2xl border border-line hover:bg-brand-50 text-brand-800">
          Download .ics
        </button>
      </Link>
    </div>
  );
}
