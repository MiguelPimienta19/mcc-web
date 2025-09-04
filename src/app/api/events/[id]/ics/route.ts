import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createEvent } from "ics";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sb = await supabaseServer();
  const { data: ev, error } = await sb.from("events").select("*").eq("id", params.id).single();
  if (error || !ev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const toArr = (d: Date) => [d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()];
  const { value, error: icsErr } = createEvent({
    title: ev.title, description: ev.description ?? "", location: ev.location ?? "",
    start: toArr(new Date(ev.starts_at)), end: toArr(new Date(ev.ends_at)),
    rrule: ev.rrule || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/event/${ev.id}`,
    status: "CONFIRMED"
  });
  if (icsErr) return NextResponse.json({ error: String(icsErr) }, { status: 500 });

  const safe = ev.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return new NextResponse(value, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safe}.ics"`
    }
  });
}


//COME BACK TO THIS AND MAKE IT WORK.