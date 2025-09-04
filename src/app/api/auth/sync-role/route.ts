
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: true });

  const { data: allow } = await sb.from('admin_allowlist')
    .select('email').eq('email', user.email).maybeSingle();

  await sb.from('profiles')
    .upsert({ id: user.id, role: allow ? 'admin' : 'member' }, { onConflict: 'id' });

  return NextResponse.json({ ok: true });
}
