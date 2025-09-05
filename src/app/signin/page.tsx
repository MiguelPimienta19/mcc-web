// src/app/signin/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function checkAdmin() {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/check-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (data.isAdmin) {
        // Store email in cookie for middleware
        document.cookie = `admin-email=${email}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        router.push('/admin');
      } else {
        setError('Email not found in admin list. Contact an existing admin to add you.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <div className="rounded-2xl border border-line bg-surface shadow-soft p-6 space-y-4">
        <h1 className="text-xl font-semibold text-brand-800">Admin Sign In</h1>
        <p className="text-sm text-muted">Enter your admin email to access the admin panel</p>
        
        <input 
          className="w-full h-10 px-3 rounded-xl border border-line"
          type="email" 
          placeholder="admin@yourdomain.com"
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAdmin()}
        />
        
        <button 
          onClick={checkAdmin}
          disabled={loading}
          className="w-full h-10 rounded-2xl bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50">
          {loading ? 'Checking...' : 'Sign In'}
        </button>
        
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
