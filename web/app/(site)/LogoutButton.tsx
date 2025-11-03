"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';

type LogoutButtonProps = {
  label?: string;
};

export function LogoutButton({ label = 'Logout' }: LogoutButtonProps) {
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSignOut = async () => {
    try {
      setSubmitting(true);
      await signOut({ callbackUrl: '/' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSubmitting}
      style={{ fontSize: '14px', opacity: isSubmitting ? 0.7 : 1 }}
    >
      {isSubmitting ? 'Wird abgemeldet…' : label}
    </button>
  );
}
