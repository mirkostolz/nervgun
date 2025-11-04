'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function LogoutButton() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <span style={{ fontSize: '14px', color: '#666' }}>...</span>;
  }
  
  if (session) {
    return (
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        style={{ fontSize: '14px', cursor: 'pointer' }}
      >
        Logout
      </button>
    );
  }
  
  return (
    <button 
      onClick={() => signIn('google')}
      style={{ fontSize: '14px', cursor: 'pointer' }}
    >
      Login
    </button>
  );
}

