// Placeholder for signin/page.tsx
'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function SignIn() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState('');
  return (
    <div className="max-w-md mx-auto rounded-2xl border border-line bg-surface p-6 space-y-4">
      <h1 className="text-xl font-semibold text-brand-800">Sign in</h1>
      <input
        className="w-full h-10 px-3 rounded-xl text-black border border-line"
        type="email" placeholder="your@email.edu"
        value={email} onChange={(e)=>setEmail(e.target.value)}
      />
      <button
        className="w-full h-10 rounded-2xl bg-brand-700 text-white hover:bg-brand-800"
        onClick={async ()=>{
          await sb.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${location.origin}/auth/callback` }
          });
          alert('Check your email for a magic link.');
        }}>
        Send magic link
      </button>
    </div>
  );
}
