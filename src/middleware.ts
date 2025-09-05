import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Check if admin email is stored in cookies (set by client)
    const adminEmail = req.cookies.get('admin-email')?.value;
    
    if (!adminEmail) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }

    // Verify the email is still in admin allowlist
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: admin } = await supabase
      .from('admin_allowlist')
      .select('email')
      .eq('email', adminEmail)
      .maybeSingle();

    if (!admin) {
      // Remove invalid cookie and redirect
      res.cookies.delete('admin-email');
      return NextResponse.redirect(new URL('/signin', req.url));
    }
  }

  return res;
}

export const config = { matcher: ['/admin/:path*'] };