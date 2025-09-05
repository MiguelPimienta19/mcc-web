import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const sb = await supabaseServer();
    
    // Remove email from admin_allowlist
    const { error } = await sb
      .from('admin_allowlist')
      .delete()
      .eq('email', email.toLowerCase().trim());

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Remove admin error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
