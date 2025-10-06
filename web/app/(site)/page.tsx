'use client';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Page() {
  const { data, error } = useSWR('/api/reports?sort=new', fetcher, { 
    refreshInterval: 5000 
  });
  
  if (error) return <div>Fehler beim Laden</div>;
  if (!data) return <div>…lädt</div>;
  
  return (
    <div>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>
        Neueste Ärgernisse
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }}>
        {data.map((r: any) => (
          <div key={r.id} className="card">
            <Link href={`/report/${r.id}`} style={{ 
              textDecoration: 'none', 
              color: 'inherit' 
            }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '16px',
                lineHeight: '1.4'
              }}>
                {r.text.length > 120 ? r.text.slice(0, 120) + '…' : r.text}
              </h3>
              
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '8px' 
              }}>
                {new URL(r.url).hostname} • {new Date(r.createdAt).toLocaleString('de-DE')} • {(r.author?.name || r.author?.email || 'Unbekannt')}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center',
                fontSize: '12px'
              }}>
                <span>👍 {r._count.upvotes}</span>
                <span>💬 {r._count.comments}</span>
                <span className={`status-badge status-${r.status.toLowerCase()}`}>
                  {r.status}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666' 
        }}>
          Noch keine Ärgernisse erfasst. Installiere die Chrome Extension und 
          beginne mit dem Sammeln!
        </div>
      )}
    </div>
  );
}