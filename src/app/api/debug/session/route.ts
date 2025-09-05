import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ 
      authenticated: false, 
      message: "No user session found" 
    });
  }

  // Check if user has a profile with role
  const { data: profile } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  // Check if user is in admin allowlist
  const { data: allowlist } = await sb
    .from('admin_allowlist')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    userId: user.id,
    role: profile?.role || 'no_role_set',
    inAllowlist: !!allowlist,
    message: allowlist ? 
      `✅ ${user.email} is allowlisted and should have admin role` : 
      `❌ ${user.email} is NOT in admin allowlist`
  });
}
