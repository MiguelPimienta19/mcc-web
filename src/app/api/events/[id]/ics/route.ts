import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createEvent } from "ics";

// If you're using Next's file-based dynamic routes, this is the correct signature.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await supabaseServer(); // IMPORTANT: await

  const { data: ev, error } = await sb
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ev) {
    return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
  }

  const toArr = (d: Date): [number, number, number, number, number] => [
    d.getFullYear(),      // Local year instead of getUTCFullYear()
    d.getMonth() + 1,     // Local month instead of getUTCMonth()
    d.getDate(),          // Local date instead of getUTCDate()
    d.getHours(),         // Local hours instead of getUTCHours()
    d.getMinutes(),       // Local minutes instead of getUTCMinutes()
  ];
  
  const { value, error: icsErr } = createEvent({
    title: ev.title,
    description: ev.description ?? "",
    location: ev.location ?? "",
    start: toArr(new Date(ev.starts_at)),
    end: toArr(new Date(ev.ends_at)),
    recurrenceRule: ev.rrule || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/event/${id}`,
    status: "CONFIRMED",
  });

  if (icsErr) {
    return NextResponse.json({ error: String(icsErr) }, { status: 500 });
  }

  const safe = String(ev.title || "event").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return new NextResponse(value, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safe}.ics"`,
    },
  });
}
