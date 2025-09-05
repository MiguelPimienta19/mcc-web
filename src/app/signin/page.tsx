// src/app/signin/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  async function checkAdmin() {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo('');
    
    try {
      console.log('Checking admin for email:', email);
      
      const res = await fetch('/api/auth/check-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      console.log('API response:', data);
      
      if (!res.ok) {
        setError(`API Error: ${data.error || 'Unknown error'}`);
        setDebugInfo(`Status: ${res.status}`);
        return;
      }
      
      if (data.isAdmin) {
        console.log('User is admin, setting cookie and redirecting...');
        
        // Store email in cookie for middleware
        const cookieValue = `admin-email=${email.toLowerCase().trim()}; path=/; max-age=${60 * 60 * 24 * 7}`;
        document.cookie = cookieValue;
        console.log('Cookie set:', cookieValue);
        
        setDebugInfo('Redirecting to admin panel...');
        
        // Small delay to ensure cookie is set
        setTimeout(() => {
          router.push('/admin');
        }, 100);
      } else {
        setError('Email not found in admin list. Contact an existing admin to add you.');
        setDebugInfo(`Email checked: ${email.toLowerCase().trim()}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again.');
      setDebugInfo(`Error: ${err}`);
    }
    
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-brand-800">MCC</h1>
          </Link>
          <h2 className="text-2xl font-bold text-brand-800 mb-2">Admin Access</h2>
          <p className="text-muted">
            Enter your admin email to access the management panel
          </p>
        </div>

        {/* Sign In Form */}
        <div className="rounded-2xl border border-line bg-surface shadow-soft p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Admin Email
              </label>
              <input 
                className="w-full h-12 px-4 text-black rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                type="email" 
                placeholder="admin@yourdomain.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAdmin()}
              />
            </div>
            
            <button 
              onClick={checkAdmin}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-soft"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Access Admin Panel'
              )}
            </button>
            
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {debugInfo && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-700">{debugInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="text-sm text-muted hover:text-brand-700 transition-colors"
          >
            ← Back to Calendar
          </Link>
        </div>
      </div>
    </main>
  );
}