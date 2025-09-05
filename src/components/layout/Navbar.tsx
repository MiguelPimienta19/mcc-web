// Placeholder for Navbar.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Navbar() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      setEmail(user?.email ?? null);
      if (user) {
        const { data } = await sb.from('profiles').select('role').eq('id', user.id).single();
        setRole(data?.role ?? null);
      }
    })();
  }, [sb]);

  return (
    <nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-brand-800">MCC</Link>
        <div className="flex items-center gap-3">
          {role === 'admin' && <Link href="/admin" className="text-sm hover:underline">Admin</Link>}
          {email ? (
            <button
              onClick={async ()=>{ await sb.auth.signOut(); location.href='/' }}
              className="h-9 px-3 rounded-xl border border-line hover:bg-brand-50"
            >
              Sign out
            </button>
          ) : (
            <Link href="/signin">
              <button className="h-9 px-3 rounded-xl bg-brand-700 text-white hover:bg-brand-800">
                Admin
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
