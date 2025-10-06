'use client';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Report({ params }: { params: { id: string } }) {
  const { data, mutate } = useSWR(`/api/reports/${params.id}`, fetcher, { 
    refreshInterval: 5000 
  });
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [isUpvoting, setUpvoting] = useState(false);
  const [isCommenting, setCommenting] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  // Close modal on ESC
  useEffect(() => {
    if (!showScreenshotModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowScreenshotModal(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showScreenshotModal]);

  if (!data) return <div>…lädt</div>;

  const handleUpvote = async () => {
    if (isUpvoting) return;
    setUpvoting(true);
    try {
      await fetch(`/api/reports/${params.id}/upvote`, { method: 'POST' });
      mutate();
    } catch (error) {
      console.error('Upvote error:', error);
    } finally {
      setUpvoting(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || isCommenting) return;
    setCommenting(true);
    try {
      await fetch(`/api/reports/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: comment })
      });
      setComment('');
      mutate();
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setCommenting(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      await fetch(`/api/reports/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      mutate();
    } catch (error) {
      console.error('Status change error:', error);
    }
  };

  return (
    <div>
      <Link href="/" style={{ 
        color: '#007bff', 
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'color 0.2s ease',
        display: 'inline-block'
      }}
      onMouseEnter={(e) => e.target.style.color = '#0056b3'}
      onMouseLeave={(e) => e.target.style.color = '#007bff'}
      >
        ← Zurück zur Übersicht
      </Link>
      
      <div className="card" style={{ marginTop: '16px' }}>
        <h2 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '20px',
          lineHeight: '1.4'
        }}>
          {data.text}
        </h2>
        
        <div style={{ 
          color: '#666', 
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          <div><strong>URL:</strong> {data.url}</div>
          <div><strong>Erstellt:</strong> {new Date(data.createdAt).toLocaleString('de-DE')}</div>
          <div><strong>Von:</strong> {data.author.email}</div>
        </div>
        
        {data.screenshot && (
          <div style={{ marginBottom: '16px' }}>
            <img 
              src={data.screenshot} 
              alt="Screenshot" 
              onClick={() => setShowScreenshotModal(true)}
              style={{
                maxWidth: '100%',
                border: '1px solid #eee',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }} 
            />
          </div>
        )}

        {showScreenshotModal && (
          <div 
            onClick={() => setShowScreenshotModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'black',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <button 
              onClick={() => setShowScreenshotModal(false)}
              aria-label="Schließen"
              style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 10000
              }}
            >
              ×
            </button>
            <img 
              src={data.screenshot} 
              alt="Screenshot groß"
              onClick={e => e.stopPropagation()}
              style={{
                width: '100vw',
                height: '100vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleUpvote}
            disabled={isUpvoting}
            className="btn-primary"
            style={{ padding: '8px 16px' }}
          >
            👍 Upvote ({data.upvotes})
          </button>
          
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value="OPEN">Open</option>
            <option value="TRIAGED">Triaged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          
          <button 
            onClick={handleStatusChange}
            className="btn-success"
            style={{ padding: '8px 16px' }}
          >
            Status setzen
          </button>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ margin: '0 0 16px 0' }}>Kommentare</h3>
        
        {data.comments.length > 0 ? (
          <div style={{ marginBottom: '20px' }}>
            {data.comments.map((c: any) => (
              <div key={c.id} style={{ 
                borderTop: '1px solid #eee', 
                padding: '12px 0',
                borderBottom: data.comments.indexOf(c) === data.comments.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  {c.author.email} • {new Date(c.createdAt).toLocaleString('de-DE')}
                </div>
                <div style={{ fontSize: '14px' }}>{c.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            color: '#666', 
            fontStyle: 'italic',
            marginBottom: '20px'
          }}>
            Noch keine Kommentare.
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            placeholder="Kommentar hinzufügen…" 
            style={{ flex: 1 }}
            maxLength={500}
          />
          <button 
            onClick={handleComment}
            disabled={!comment.trim() || isCommenting}
            className="btn-primary"
            style={{ padding: '8px 16px' }}
          >
            {isCommenting ? 'Sende...' : 'Senden'}
          </button>
        </div>
      </div>
    </div>
  );
}