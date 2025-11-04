'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'Es gibt ein Problem mit der Server-Konfiguration.',
    AccessDenied: 'Zugriff verweigert. Deine Email-Adresse ist nicht für diese App autorisiert.',
    Verification: 'Das Verifizierungs-Token ist abgelaufen oder wurde bereits verwendet.',
    OAuthSignin: 'Fehler beim Erstellen der OAuth-Anfrage.',
    OAuthCallback: 'Fehler beim OAuth-Callback.',
    OAuthCreateAccount: 'Fehler beim Erstellen des OAuth-Kontos.',
    EmailCreateAccount: 'Fehler beim Erstellen des Email-Kontos.',
    Callback: 'Fehler beim Callback.',
    OAuthAccountNotLinked: 'Dieser Account ist bereits mit einem anderen Provider verknüpft.',
    EmailSignin: 'Fehler beim Email-Login.',
    CredentialsSignin: 'Login fehlgeschlagen. Überprüfe deine Anmeldedaten.',
    SessionRequired: 'Bitte melde dich an, um auf diese Seite zuzugreifen.',
    Default: 'Ein unbekannter Fehler ist aufgetreten.',
  };

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div style={{
      maxWidth: '600px',
      margin: '100px auto',
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>
        Anmeldung nicht möglich
      </h1>
      
      <p style={{ marginBottom: '30px', fontSize: '16px', color: '#555' }}>
        {message}
      </p>

      {error === 'AccessDenied' && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <strong>Hinweis:</strong> Diese App erlaubt nur Email-Adressen, die mit <code>@thegoodwins.de</code> enden.
          <br /><br />
          Du hast versucht dich anzumelden mit: <code>{searchParams.get('email') || 'unbekannte Email'}</code>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '12px 24px',
          backgroundColor: '#3498db',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 500
        }}>
          Zur Startseite
        </Link>
        
        <Link href="/api/auth/signin" style={{
          padding: '12px 24px',
          backgroundColor: '#2ecc71',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 500
        }}>
          Erneut versuchen
        </Link>
      </div>

      <details style={{ marginTop: '40px', textAlign: 'left', fontSize: '12px', color: '#666' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
          Technische Details (für Entwickler)
        </summary>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          Error Code: {error || 'None'}
          {'\n'}URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}
        </pre>
      </details>
    </div>
  );
}

