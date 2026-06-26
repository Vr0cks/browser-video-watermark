import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Share2, Clock, CheckCircle2, Globe } from 'lucide-react';

interface ScheduledPost {
  title: string;
  caption: string;
  image: string;
  platforms: string[];
  date: string;
}

interface SharedPost {
  title: string;
  caption: string;
  image: string;
  platform: string;
  date: string;
}

export default function GorselScheduled() {
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [history, setHistory] = useState<SharedPost[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setScheduled(JSON.parse(localStorage.getItem('scheduled_posts') || '[]'));
    setHistory(JSON.parse(localStorage.getItem('sharing_history') || '[]'));
  };

  const removeScheduled = (index: number) => {
    const updated = [...scheduled];
    updated.splice(index, 1);
    localStorage.setItem('scheduled_posts', JSON.stringify(updated));
    setScheduled(updated);
  };

  const shareNow = (post: ScheduledPost, index: number) => {
    // Move from scheduled to history
    const newHistoryItem: SharedPost = {
      title: post.title,
      caption: post.caption,
      image: post.image,
      platform: post.platforms ? post.platforms.join(', ') : 'Tümü',
      date: new Date().toLocaleString('tr-TR')
    };

    const updatedHistory = [...history, newHistoryItem];
    localStorage.setItem('sharing_history', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);

    // Remove from scheduled
    removeScheduled(index);

    // Trigger webhook if exists
    const webhookUrl = localStorage.getItem('api_webhook_url');
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHistoryItem)
      }).catch(err => console.error('Webhook error:', err));
    }
  };

  const clearHistory = () => {
    if (window.confirm('Tüm paylaşım geçmişini silmek istediğinize emin misiniz?')) {
      localStorage.setItem('sharing_history', '[]');
      setHistory([]);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Zamanlama & Paylaşım Kuyruğu</h1>
          <p className="page-subtitle">Gelecekte paylaşılması planlanan görselleri yönetin ve geçmiş gönderi raporlarını inceleyin.</p>
        </div>
      </div>

      <div className="grid-cols-2" style={{ alignItems: 'flex-start' }}>
        
        {/* Left Column: Scheduled Posts */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: 'var(--secondary)' }} />
            Aktif Planlanan Gönderiler ({scheduled.length})
          </h2>

          {scheduled.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 0',
              color: 'var(--text-secondary)',
              gap: '1rem',
              textAlign: 'center'
            }}>
              <Calendar size={48} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontWeight: 600 }}>Planlanmış Gönderi Yok</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Görsel Oluşturucu sayfasından yeni bir özel gün resmi oluşturup zamanlayabilirsiniz.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {scheduled.map((post, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--card-border)',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#000',
                      border: '1px solid var(--card-border)',
                      flexShrink: 0
                    }}>
                      <img src={post.image} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flexGrow: 1, minWidth: '200px' }}>
                      <span className="badge badge-secondary" style={{ marginBottom: '0.4rem', fontSize: '0.7rem' }}>
                        {post.date}
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{post.title}</h4>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        marginTop: '0.25rem',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>{post.caption}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {post.platforms && post.platforms.map((p, pidx) => (
                        <span key={pidx} className="badge badge-primary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => removeScheduled(idx)} 
                        className="btn btn-secondary" 
                        title="İptal Et / Sil"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                      </button>
                      <button 
                        onClick={() => shareNow(post, idx)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', gap: '0.25rem' }}
                      >
                        <Share2 size={14} />
                        Şimdi Paylaş
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: History Log */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
              Paylaşım Geçmişi ({history.length})
            </h2>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Trash2 size={12} /> Temizle
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 0',
              color: 'var(--text-secondary)',
              gap: '1rem',
              textAlign: 'center'
            }}>
              <Globe size={48} style={{ color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '0.85rem' }}>Henüz yapılmış paylaşım kaydı bulunmamıyor.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((post, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--card-border)',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#000',
                    border: '1px solid var(--card-border)',
                    flexShrink: 0
                  }}>
                    <img src={post.image} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title}
                    </h4>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '0.15rem'
                    }}>{post.caption}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                      {post.date} - Paylaşıldı
                    </p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      {post.platform}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
