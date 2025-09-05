import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const sb = await supabaseServer();
    
    // Insert email into admin_allowlist
    const { error } = await sb
      .from('admin_allowlist')
      .insert({ email: email.toLowerCase().trim() });

    if (error) {
      // Handle duplicate email
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email already in admin list' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Add admin error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
