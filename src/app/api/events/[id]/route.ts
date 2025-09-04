
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const sb = await supabaseServer();
  const patch = await req.json();
  const { data, error } = await sb.from('events').update(patch).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const sb = await supabaseServer();
  const { error } = await sb.from('events').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
