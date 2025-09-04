import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');

  const sb = await supabaseServer();
  let q = sb.from('events').select('*').order('starts_at', { ascending: true });
  if (start) q = q.gte('starts_at', start);
  if (end)   q = q.lte('ends_at', end);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const payload = await req.json();

  // minimal validation
  if (!payload?.title || !payload?.starts_at || !payload?.ends_at) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // created_by will be null for anon; Supabase will set if user session exists
  const { data, error } = await sb.from('events').insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
