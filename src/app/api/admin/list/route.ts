import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const sb = await supabaseServer();
    
    const { data: admins } = await sb
      .from('admin_allowlist')
      .select('email')
      .order('email');

    return NextResponse.json({ 
      admins: admins?.map(a => a.email) || [] 
    });
    
  } catch (error) {
    console.error('List admins error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
