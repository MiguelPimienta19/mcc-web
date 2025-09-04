
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const sb = await supabaseServer();
  await sb.auth.getSession(); // ensure cookie
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/sync-role`, { cache: 'no-store' });
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL));
}
