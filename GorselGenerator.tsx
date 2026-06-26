import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Sparkles, Upload, Download, Share2, Calendar, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { SPECIAL_DAYS, VISUAL_STYLES, enhancePrompt, getNextHolidayDate } from '../../../lib/promptTemplates';
import { drawWatermarkedImage, WatermarkSettings } from '../../../lib/canvasHelper';

interface GorselGeneratorProps {
  setActiveTab: (tab: string) => void;
}

// Compute special days dynamically sorted by the upcoming calendar date
const getSortedSpecialDays = () => {
  const now = new Date();
  return [...SPECIAL_DAYS].sort((a, b) => {
    return getNextHolidayDate(a.id, now).getTime() - getNextHolidayDate(b.id, now).getTime();
  });
};

export default function GorselGenerator({ setActiveTab }: GorselGeneratorProps) {
  const sortedSpecialDays = getSortedSpecialDays();

  // Preset Selection States
  const [selectedDay, setSelectedDay] = useState(sortedSpecialDays[0]);
  const [selectedStyle, setSelectedStyle] = useState(VISUAL_STYLES[0]);
  const [userPrompt, setUserPrompt] = useState('');
  const [enhancedPromptText, setEnhancedPromptText] = useState('');

  // Image states
  const [baseImage, setBaseImage] = useState<string>(sortedSpecialDays[0].defaultStockImage); // base64 or URL
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null); // base64 dataUrl
  const [imageSource, setImageSource] = useState<'preset' | 'ai' | 'upload'>('preset'); // 'preset', 'ai', 'upload'
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Watermark Settings (loaded from localStorage or defaults)
  const [logoSrc, setLogoSrc] = useState('/default_logo.png');
  const [watermarkType, setWatermarkType] = useState<'image' | 'text'>('image'); // 'image' or 'text'
  const [watermarkText, setWatermarkText] = useState('© By Karaca');
  const [settings, setSettings] = useState<WatermarkSettings>({
    position: 'top-right',
    size: 15,
    opacity: 0.85,
    margin: 5,
    rotation: 0,
    textColor: '#ffffff',
    textBgColor: 'rgba(0,0,0,0.45)',
    textBgEnabled: true,
    fontSizeRatio: 3,
    fontFamily: 'Space Grotesk, sans-serif'
  });

  // Sharing states
  const [caption, setCaption] = useState(sortedSpecialDays[0].socialText);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'twitter']);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'share' | 'schedule'>('share'); // 'share' or 'schedule'

  // Load defaults
  useEffect(() => {
    const savedLogo = localStorage.getItem('company_logo_base64');
    if (savedLogo) {
      setLogoSrc(savedLogo);
    }

    const savedSettings = localStorage.getItem('default_watermark_settings');
    if (savedSettings) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (e) {
        console.error(e);
      }
    }

    // Check if there's a shortcut day from dashboard
    const shortcutDayId = localStorage.getItem('selected_day_id_shortcut');
    if (shortcutDayId) {
      localStorage.removeItem('selected_day_id_shortcut');
      handleDayChange(shortcutDayId);
    }

    // Listen to logo changes
    const handleLogoUpdate = () => {
      const updatedLogo = localStorage.getItem('company_logo_base64');
      if (updatedLogo) {
        setLogoSrc(updatedLogo);
      } else {
        setLogoSrc('/default_logo.png');
      }
    };
    window.addEventListener('company_logo_updated', handleLogoUpdate);
    return () => {
      window.removeEventListener('company_logo_updated', handleLogoUpdate);
    };
  }, []);

  // Update prompt and caption when special day changes
  const handleDayChange = (dayId: string) => {
    const day = sortedSpecialDays.find(d => d.id === dayId);
    if (day) {
      setSelectedDay(day);
      setCaption(day.socialText);
      // Set the default preloaded stock photo
      if (day.defaultStockImage) {
        setBaseImage(day.defaultStockImage);
        setImageSource('preset');
      }
      // Recalculate enhanced prompt preview
      const enhanced = enhancePrompt(day.id, userPrompt, selectedStyle.id);
      setEnhancedPromptText(enhanced);
    }
  };

  const handleStyleChange = (styleId: string) => {
    const style = VISUAL_STYLES.find(s => s.id === styleId);
    if (style) {
      setSelectedStyle(style);
      const enhanced = enhancePrompt(selectedDay.id, userPrompt, style.id);
      setEnhancedPromptText(enhanced);
    }
  };

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setUserPrompt(text);
    const enhanced = enhancePrompt(selectedDay.id, text, selectedStyle.id);
    setEnhancedPromptText(enhanced);
  };

  // Recalculate enhanced prompt on mount/change
  useEffect(() => {
    const enhanced = enhancePrompt(selectedDay.id, userPrompt, selectedStyle.id);
    setEnhancedPromptText(enhanced);
  }, [selectedDay, selectedStyle, userPrompt]);

  // Redraw watermarked image when baseImage, logoSrc, watermarkType, watermarkText or settings change
  useEffect(() => {
    if (baseImage) {
      applyWatermark();
    }
  }, [baseImage, logoSrc, watermarkType, watermarkText, settings]);

  const applyWatermark = async () => {
    try {
      const result = await drawWatermarkedImage({
        baseImageSrc: baseImage,
        watermarkSrc: logoSrc,
        watermarkType,
        watermarkText,
        settings
      });
      setWatermarkedImage(result);
    } catch (err) {
      console.error('Error applying watermark:', err);
    }
  };

  // Generate Image via Pollinations AI
  const generateAIImage = async () => {
    setLoading(true);
    setLoadingText('Yapay Zeka Görseli Oluşturuyor (Birkaç saniye sürebilir)...');
    
    // Increment generated count
    const count = parseInt(localStorage.getItem('generated_images_count') || '0', 10);
    localStorage.setItem('generated_images_count', (count + 1).toString());

    try {
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(enhancedPromptText);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&private=true`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBaseImage(imageUrl);
        setImageSource('ai');
        setLoading(false);
      };
      img.onerror = () => {
        alert('Görsel üretilirken hata oluştu: Yapay zeka servisi yanıt vermedi. Lütfen tekrar deneyin.');
        setLoading(false);
      };
      img.src = imageUrl;

    } catch (err: any) {
      alert('Görsel üretilirken hata oluştu: ' + err.message);
      setLoading(false);
    }
  };

  // Handle local image upload as base image
  const handleBaseImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setBaseImage(result);
          setImageSource('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle setting updates
  const updateSetting = (key: keyof WatermarkSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Download final image
  const downloadImage = () => {
    if (!watermarkedImage) return;
    const link = document.createElement('a');
    link.download = `${selectedDay.shortName.toLowerCase().replace(/\s+/g, '-')}-paylasim.png`;
    link.href = watermarkedImage;
    link.click();
  };

  // Handle platform checkbox changes
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  // Share Now simulation
  const handleShareNow = () => {
    if (!watermarkedImage) return;

    // Save to history
    const history = JSON.parse(localStorage.getItem('sharing_history') || '[]');
    const newShare = {
      title: selectedDay.name,
      caption: caption,
      image: watermarkedImage,
      platform: selectedPlatforms.join(', '),
      date: new Date().toLocaleString('tr-TR')
    };

    history.push(newShare);
    localStorage.setItem('sharing_history', JSON.stringify(history));

    // Trigger webhook if exists
    const webhookUrl = localStorage.getItem('api_webhook_url');
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShare)
      }).catch(err => console.error('Webhook error:', err));
    }

    setModalType('share');
    setIsModalOpen(true);
  };

  // Schedule Post simulation
  const handleSchedule = (e: FormEvent) => {
    e.preventDefault();
    if (!watermarkedImage || !scheduleDate || !scheduleTime) {
      alert('Lütfen zamanlama için tarih ve saat seçin.');
      return;
    }

    const scheduled = JSON.parse(localStorage.getItem('scheduled_posts') || '[]');
    const newSchedule = {
      title: selectedDay.name,
      caption: caption,
      image: watermarkedImage,
      platforms: selectedPlatforms,
      date: `${scheduleDate} ${scheduleTime}`
    };

    scheduled.push(newSchedule);
    localStorage.setItem('scheduled_posts', JSON.stringify(scheduled));

    setModalType('schedule');
    setIsModalOpen(true);
  };

  // Direct Social Share intents
  const openSocialShareIntent = (platform: string) => {
    let url = '';
    const text = encodeURIComponent(caption);
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?quote=${text}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/`;
        break;
      default:
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Görsel Üretici ve Editör</h1>
          <p className="page-subtitle">Özel gününüzü seçin, görseli yapay zeka ile üretin veya kendi fotoğrafınızı yükleyip filigranınızı ekleyin.</p>
        </div>
      </div>

      <div className="editor-layout">
        
        {/* Left Side: Creation and Canvas Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Preset Selector */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              1. Özel Gün Teması Seçin
            </h3>
            
            <div className="preset-grid">
              {sortedSpecialDays.map(day => (
                <div 
                  key={day.id}
                  className={`preset-card ${selectedDay.id === day.id ? 'active' : ''}`}
                  onClick={() => handleDayChange(day.id)}
                >
                  <div className="preset-title">{day.shortName}</div>
                  <div className="preset-subtitle">{day.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Generator Settings */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              2. Tasarım Fikirleri ve Yapay Zeka / Yükleme Paneli
            </h3>

            <div className="form-group">
              <label className="form-label">Tasarım Stili</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {VISUAL_STYLES.map(style => (
                  <button
                    key={style.id}
                    className={`btn ${selectedStyle.id === style.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    onClick={() => handleStyleChange(style.id)}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedDay.concepts && selectedDay.concepts.length > 0 && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Hazır Konsept Fikirleri (Yazmadan Seçin)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {selectedDay.concepts.map((concept, conceptIdx) => (
                    <button
                      key={conceptIdx}
                      className="btn btn-secondary"
                      style={{ 
                        justifyContent: 'flex-start', 
                        textAlign: 'left', 
                        padding: '0.65rem 0.85rem', 
                        fontSize: '0.8rem',
                        fontWeight: 'normal',
                        borderRadius: '8px',
                        background: userPrompt === concept ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.01)',
                        borderColor: userPrompt === concept ? 'var(--primary)' : 'var(--card-border)',
                        color: userPrompt === concept ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                      onClick={() => {
                        setUserPrompt(concept);
                        const enhanced = enhancePrompt(selectedDay.id, concept, selectedStyle.id);
                        setEnhancedPromptText(enhanced);
                      }}
                    >
                      💡 {concept}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Yapay Zeka İçin Görsel Fikri (Prompt)</label>
              <textarea 
                className="form-textarea"
                placeholder="Bir fikir yazın veya yukarıdaki hazır fikirlerden birine tıklayın..."
                value={userPrompt}
                onChange={handlePromptChange}
              />
            </div>

            <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--card-border)', padding: '1rem', borderRadius: '12px' }}>
              <span className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Geliştirilmiş Prompt Sihirbazı Önizlemesi</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.5rem', lineHeight: '1.5' }}>
                {enhancedPromptText}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary" 
                style={{ flexGrow: 3, flexBasis: '200px' }}
                onClick={generateAIImage}
                disabled={loading}
              >
                <Sparkles size={18} />
                Yapay Zeka ile Görsel Oluştur
              </button>

              <label className="btn btn-secondary" style={{ flexGrow: 1, flexBasis: '130px', cursor: 'pointer' }}>
                <Upload size={16} />
                Fotoğraf Yükle
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleBaseImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Image & Canvas Preview */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={18} style={{ color: 'var(--primary)' }} />
                Canlı Önizleme & Filigranlı Çıktı
              </h3>
              {imageSource === 'preset' && <span className="badge badge-secondary">Hazır Stok Görsel</span>}
              {imageSource === 'ai' && <span className="badge badge-primary">Yapay Zeka Görseli</span>}
              {imageSource === 'upload' && <span className="badge badge-success">Kendi Fotoğrafınız</span>}
            </div>

            <div className="canvas-wrapper">
              {loading && (
                <div className="canvas-loading">
                  <div className="spinner"></div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{loadingText}</p>
                </div>
              )}

              {watermarkedImage ? (
                <div className="canvas-container">
                  <img 
                    src={watermarkedImage} 
                    alt="Merged Watermarked Preview" 
                    className="canvas-preview"
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', gap: '0.5rem', padding: '2rem' }}>
                  <ImageIcon size={48} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>Önizlemek için bir görsel üretin, yukarıdan tema seçin veya cihazınızdan fotoğraf yükleyin.</p>
                </div>
              )}
            </div>

            {watermarkedImage && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={applyWatermark} style={{ gap: '0.25rem' }}>
                  <RefreshCw size={16} /> Yenile
                </button>
                <button className="btn btn-primary" onClick={downloadImage} style={{ gap: '0.25rem' }}>
                  <Download size={16} /> Cihaza İndir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Watermark Configuration & Scheduling Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Watermark Editor Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
              Filigran Ayrıntıları
            </h3>

            <div className="form-group">
              <label className="form-label">Filigran Türü</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn ${watermarkType === 'image' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                  onClick={() => setWatermarkType('image')}
                >
                  Şirket Logosu
                </button>
                <button 
                  className={`btn ${watermarkType === 'text' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                  onClick={() => setWatermarkType('text')}
                >
                  Metin (Yazı)
                </button>
              </div>
            </div>

            {watermarkType === 'text' ? (
              <div className="form-group">
                <label className="form-label">Filigran Yazısı</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={watermarkText} 
                  onChange={(e) => setWatermarkText(e.target.value)} 
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--card-border)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '4px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Aktif Şirket Logosu</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ayarlardan değiştirilebilir.</p>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => setActiveTab('settings')}>Değiştir</button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Filigran Konumu</label>
              <select 
                className="form-select"
                value={settings.position}
                onChange={(e) => updateSetting('position', e.target.value)}
              >
                <option value="bottom-right">Sağ Alt Köşe</option>
                <option value="bottom-left">Sol Alt Köşe</option>
                <option value="top-right">Sağ Üst Köşe</option>
                <option value="top-left">Sol Üst Köşe</option>
                <option value="center">Orta / Merkez</option>
                <option value="tile">Desen (Tüm Resmi Kapla)</option>
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="form-label">Boyut ({settings.size}%)</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="50" 
                className="range-slider"
                value={settings.size}
                onChange={(e) => updateSetting('size', parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="form-label">Saydamlık ({Math.round((settings.opacity ?? 0.8) * 100)}%)</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                className="range-slider"
                value={(settings.opacity ?? 0.8) * 100}
                onChange={(e) => updateSetting('opacity', parseInt(e.target.value) / 100)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="form-label">Kenar Boşluğu ({settings.margin}%)</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="15" 
                className="range-slider"
                value={settings.margin}
                onChange={(e) => updateSetting('margin', parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="form-label">Açı ({settings.rotation}°)</span>
              </div>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                className="range-slider"
                value={settings.rotation}
                onChange={(e) => updateSetting('rotation', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Social Sharing & Scheduling Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
              Paylaşım & Zamanlama Paneli
            </h3>

            <div className="form-group">
              <label className="form-label">Gönderi Açıklaması (Caption)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px', fontSize: '0.85rem' }}
                value={caption} 
                onChange={(e) => setCaption(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Paylaşılacak Mecralar</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['linkedin', 'twitter', 'instagram', 'facebook'].map(platform => (
                  <label 
                    key={platform} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      background: selectedPlatforms.includes(platform) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedPlatforms.includes(platform) ? 'var(--primary)' : 'var(--card-border)'}`,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                      transition: '0.2s'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedPlatforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {platform}
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={handleShareNow}
                disabled={!watermarkedImage}
                style={{ width: '100%' }}
              >
                <Share2 size={16} />
                Şimdi Sosyal Medyada Paylaş
              </button>

              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem' }}>
                <span className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>GÖNDERİYİ GELECEĞE PLANLA</span>
                
                <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input 
                      type="date" 
                      required
                      className="form-control" 
                      style={{ flexGrow: 1, flexBasis: '120px', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }} 
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    <input 
                      type="time" 
                      required
                      className="form-control" 
                      style={{ flexGrow: 1, flexBasis: '80px', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }} 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="btn btn-secondary"
                    disabled={!watermarkedImage}
                    style={{ width: '100%', fontSize: '0.9rem', padding: '0.7rem' }}
                  >
                    Planlama Listesine Ekle
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Success Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="sharing-success-icon">
              <CheckCircle size={32} style={{ color: 'var(--success)' }} />
            </div>
            
            {modalType === 'share' ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Görsel Paylaşıldı!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  Özel gün görseli başarıyla oluşturuldu ve seçtiğiniz kanallara gönderildi. Otomasyon başarıyla tamamlandı.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Hızlı Manuel Paylaşım Linkleri</span>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {selectedPlatforms.map(platform => (
                      <button 
                        key={platform}
                        onClick={() => openSocialShareIntent(platform)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', textTransform: 'uppercase' }}
                      >
                        {platform} Aç
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Gönderi Zamanlandı</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  Görseliniz ve sosyal medya metniniz <strong>{scheduleDate} {scheduleTime}</strong> tarihine başarıyla planlandı.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsModalOpen(false);
                  setActiveTab('dashboard');
                }}
              >
                Panele Dön
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                Yeni Tasarım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
