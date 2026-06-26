import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, Settings, Clock, Image as ImageIcon, Share2, CheckCircle, ArrowRight, ChevronRight, TrendingUp } from 'lucide-react';
import { SPECIAL_DAYS, SpecialDay, getNextHolidayDate } from '../../../lib/promptTemplates';

interface GorselDashboardProps {
  setActiveTab: (tab: string) => void;
}

interface Stats {
  generatedCount: number;
  scheduledCount: number;
  sharedCount: number;
}

interface RecentPost {
  title: string;
  caption: string;
  image: string;
  platform?: string;
  date: string;
}

export default function GorselDashboard({ setActiveTab }: GorselDashboardProps) {
  const [stats, setStats] = useState<Stats>({
    generatedCount: 0,
    scheduledCount: 0,
    sharedCount: 0
  });
  
  const [upcomingDays, setUpcomingDays] = useState<SpecialDay[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);

  useEffect(() => {
    // Read local storage data for stats
    const history: RecentPost[] = JSON.parse(localStorage.getItem('sharing_history') || '[]');
    const scheduled = JSON.parse(localStorage.getItem('scheduled_posts') || '[]');
    const generatedCount = parseInt(localStorage.getItem('generated_images_count') || '0', 10);

    setStats({
      generatedCount,
      scheduledCount: scheduled.length,
      sharedCount: history.length
    });

    setRecentPosts(history.slice(-3).reverse());

    // Compute upcoming special days dynamically based on calendar sorting
    const now = new Date();
    const sorted = [...SPECIAL_DAYS].sort((a, b) => {
      const dateA = getNextHolidayDate(a.id, now).getTime();
      const dateB = getNextHolidayDate(b.id, now).getTime();
      return dateA - dateB;
    });
    setUpcomingDays(sorted.slice(0, 4));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Yönetim Paneli</h1>
          <p className="page-subtitle">Şirketiniz için özel gün paylaşımlarını üretin, planlayın ve otomatikleştirin.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setActiveTab('generator')}
        >
          <PlusCircle size={18} />
          Yeni Görsel Oluştur
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid-cols-3 mb-8" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ImageIcon size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Oluşturulan Görsel</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.generatedCount}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Planlanan Paylaşım</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.scheduledCount}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Share2 size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Tamamlanan Paylaşım</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.sharedCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-cols-2">
        {/* Left Column: Upcoming Days */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} style={{ color: 'var(--primary)' }} />
              Yaklaşan Özel Günler
            </h2>
            <span className="badge badge-primary">Otomatik Hatırlatma</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingDays.map((day) => (
              <div 
                key={day.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--card-border)',
                  transition: '0.2s',
                  cursor: 'pointer'
                }}
                className="upcoming-row"
                onClick={() => {
                  localStorage.setItem('selected_day_id_shortcut', day.id);
                  setActiveTab('generator');
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{day.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Tarih: {day.date}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>Prompt Hazır</span>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activities */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--success)' }} />
              Son Paylaşım Raporu
            </h2>
            <button 
              onClick={() => setActiveTab('scheduled')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Tümünü Gör <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
            {recentPosts.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
                color: 'var(--text-secondary)',
                gap: '0.5rem',
                padding: '2rem 0'
              }}>
                <CheckCircle size={36} style={{ color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.9rem' }}>Henüz yapılmış bir paylaşım bulunmuyor.</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>İlk görselinizi oluşturarak başlayın.</p>
              </div>
            ) : (
              recentPosts.map((post, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#000',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <img 
                      src={post.image} 
                      alt="Shared content" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</h4>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '0.15rem'
                    }}>{post.caption}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem' }}>{post.date} - Paylaşıldı</p>
                  </div>
                  <div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                      {post.platform ? post.platform.toUpperCase() : 'WEBHOOK'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Info Card / Quick tutorial */}
      <div className="glass-card" style={{
        marginTop: '2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(139, 92, 246, 0.07) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2rem',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '100%', flex: '1 1 500px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nasıl Çalışır?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            1. <strong>Görsel Oluştur</strong> sekmesine geçin ve bayram veya özel günü seçin.<br />
            2. Prompt Sihirbazı ile kurumsal taslaklar oluşturun ya da kendi fikrinizi yazın / kendi fotoğrafınızı yükleyin.<br />
            3. Şirket logonuz (filigran) üzerine yerleşir. Opaklık, konum, boyut ve açı ayarlarını yapın.<br />
            4. Sosyal medya platformunu seçin ve gönderiyi anında paylaşın ya da gelecekteki bir tarihe zamanlayın.
          </p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setActiveTab('settings')}
          style={{ gap: '0.5rem', flexShrink: 0 }}
        >
          <Settings size={16} />
          Logo & Ayarlar
        </button>
      </div>
    </div>
  );
}
