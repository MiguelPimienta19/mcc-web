import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const patch = await req.json();
  const { data, error } = await sb.from('events').update(patch).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('Attempting to delete event with ID:', id);
    
    const sb = await supabaseServer();
    const { error } = await sb.from('events').delete().eq('id', id);
    
    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    console.log('Event deleted successfully:', id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete function error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}