import React, { useState, useEffect, ChangeEvent } from 'react';
import { Save, Upload, Key, Eye, EyeOff, ShieldCheck, Trash } from 'lucide-react';

interface GorselSettingsProps {
  setActiveTab: (tab: string) => void;
}

interface ApiKeys {
  geminiKey: string;
  openaiKey: string;
  webhookUrl: string;
}

interface DefaultWatermark {
  position: string;
  size: number;
  opacity: number;
  margin: number;
}

interface ShowKeys {
  gemini: boolean;
  openai: boolean;
}

export default function GorselSettings({ setActiveTab }: GorselSettingsProps) {
  const [logo, setLogo] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    geminiKey: '',
    openaiKey: '',
    webhookUrl: ''
  });
  const [defaultWatermark, setDefaultWatermark] = useState<DefaultWatermark>({
    position: 'top-right',
    size: 15,
    opacity: 0.85,
    margin: 5
  });

  const [showKeys, setShowKeys] = useState<ShowKeys>({
    gemini: false,
    openai: false
  });

  const [saveStatus, setSaveStatus] = useState<boolean>(false);

  useEffect(() => {
    // Load logo from localStorage or use default
    const savedLogo = localStorage.getItem('company_logo_base64');
    if (savedLogo) {
      setLogo(savedLogo);
    } else {
      setLogo('/default_logo.png');
    }

    // Load keys
    setApiKeys({
      geminiKey: localStorage.getItem('api_key_gemini') || '',
      openaiKey: localStorage.getItem('api_key_openai') || '',
      webhookUrl: localStorage.getItem('api_webhook_url') || ''
    });

    // Load default watermark configurations
    const savedConfigs = localStorage.getItem('default_watermark_settings');
    if (savedConfigs) {
      try {
        setDefaultWatermark(prev => ({ ...prev, ...JSON.parse(savedConfigs) }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        if (base64Data) {
          setLogo(base64Data);
          localStorage.setItem('company_logo_base64', base64Data);
          // Dispatch custom event to notify GorselUreticiPanel to refresh logo immediately
          window.dispatchEvent(new Event('company_logo_updated'));
          triggerSaveSuccess();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogo = () => {
    localStorage.removeItem('company_logo_base64');
    setLogo('/default_logo.png');
    window.dispatchEvent(new Event('company_logo_updated'));
    triggerSaveSuccess();
  };

  const handleInputChange = (field: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field: keyof DefaultWatermark, value: string | number) => {
    setDefaultWatermark(prev => ({ ...prev, [field]: value }));
  };

  const triggerSaveSuccess = () => {
    setSaveStatus(true);
    setTimeout(() => {
      setSaveStatus(false);
    }, 2000);
  };

  const saveSettings = () => {
    localStorage.setItem('api_key_gemini', apiKeys.geminiKey);
    localStorage.setItem('api_key_openai', apiKeys.openaiKey);
    localStorage.setItem('api_webhook_url', apiKeys.webhookUrl);
    localStorage.setItem('default_watermark_settings', JSON.stringify(defaultWatermark));
    triggerSaveSuccess();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Şirket & Entegrasyon Ayarları</h1>
          <p className="page-subtitle">Şirket logosunu yükleyin, yapay zeka anahtarlarını tanımlayın ve varsayılan filigran ayarlarını yönetin.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Logo and Watermark settings */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            Şirket Logosu & Filigran Şablonu
          </h2>
          
          <div className="grid-cols-2" style={{ gap: '2rem' }}>
            {/* Logo Preview and Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--card-border)', paddingRight: '2rem' }}>
              <div style={{
                width: '180px',
                height: '180px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '2.5px dashed var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '1rem',
                position: 'relative'
              }}>
                <img 
                  src={logo} 
                  alt="Company Logo Watermark" 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2"%3E%3Cpath d="M21 12H3M12 3v18"/%3E%3C/svg%3E';
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <label className="btn btn-secondary" style={{ flexGrow: 1, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <Upload size={16} />
                  Yeni Logo Yükle
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    onChange={handleLogoUpload} 
                    style={{ display: 'none' }} 
                  />
                </label>
                {logo !== '/default_logo.png' && (
                  <button onClick={resetLogo} className="btn btn-danger" title="Varsayılana Sıfırla" style={{ padding: '0.8rem' }}>
                    <Trash size={16} />
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Öneri: Arka planı şeffaf (PNG) logolar filigran olarak daha estetik görünür.
              </p>
            </div>

            {/* Default Settings Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>VARSAYILAN FİLİGRAN KONUMU</h3>
              
              <div className="form-group">
                <select 
                  className="form-select"
                  value={defaultWatermark.position}
                  onChange={(e) => handleConfigChange('position', e.target.value)}
                >
                  <option value="bottom-right">Sağ Alt Köşe (Önerilen)</option>
                  <option value="bottom-left">Sol Alt Köşe</option>
                  <option value="top-right">Sağ Üst Köşe</option>
                  <option value="top-left">Sol Üst Köşe</option>
                  <option value="center">Orta / Merkez</option>
                  <option value="tile">Desen (Tüm Görseli Kapla)</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="form-label">Varsayılan Boyut ({defaultWatermark.size}%)</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  className="range-slider"
                  value={defaultWatermark.size}
                  onChange={(e) => handleConfigChange('size', parseInt(e.target.value))}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="form-label">Varsayılan Opaklık ({Math.round(defaultWatermark.opacity * 100)}%)</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  className="range-slider"
                  value={defaultWatermark.opacity * 100}
                  onChange={(e) => handleConfigChange('opacity', parseInt(e.target.value) / 100)}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="form-label">Kenar Boşluğu ({defaultWatermark.margin}%)</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  className="range-slider"
                  value={defaultWatermark.margin}
                  onChange={(e) => handleConfigChange('margin', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            API & Entegrasyon Ayarları
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Gemini API Key */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={14} /> Gemini API Key (İsteğe Bağlı)
              </label>
              <div style={{ position: 'relative', display: 'flex' }}>
                <input 
                  type={showKeys.gemini ? 'text' : 'password'}
                  className="form-control"
                  style={{ width: '100%', paddingRight: '3rem' }}
                  placeholder="AI prompt geliştirme ve görsel üretimi için Gemini API Key girin"
                  value={apiKeys.geminiKey}
                  onChange={(e) => handleInputChange('geminiKey', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(p => ({ ...p, gemini: !p.gemini }))}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {showKeys.gemini ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Doldurulmazsa, arayüzde prompt zenginleştirme yerel şablonlar ile, görsel üretimi ise ücretsiz Pollinations AI altyapısıyla yapılacaktır.
              </p>
            </div>

            {/* OpenAI API Key */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={14} /> OpenAI API Key (DALL-E 3 İçin İsteğe Bağlı)
              </label>
              <div style={{ position: 'relative', display: 'flex' }}>
                <input 
                  type={showKeys.openai ? 'text' : 'password'}
                  className="form-control"
                  style={{ width: '100%', paddingRight: '3rem' }}
                  placeholder="DALL-E 3 görsel üretimi entegrasyonu için OpenAI API Key girin"
                  value={apiKeys.openaiKey}
                  onChange={(e) => handleInputChange('openaiKey', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(p => ({ ...p, openai: !p.openai }))}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {showKeys.openai ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Webhook integration */}
            <div className="form-group">
              <label className="form-label">Otomatik Paylaşım Webhook Adresi (İsteğe Bağlı)</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Örn: https://make.com/incoming/webhook/xxxxxx"
                value={apiKeys.webhookUrl}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Görsel paylaş butonuna basıldığında bu URL'e POST isteği ile görsel dosyası (base64) ve sosyal medya açıklaması JSON olarak gönderilir (Zapier / Make / N8N otomasyonu için).
              </p>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          {saveStatus && (
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
              <ShieldCheck size={16} /> Ayarlar Tarayıcıya Kaydedildi!
            </span>
          )}
          <button 
            className="btn btn-primary"
            onClick={saveSettings}
            style={{ width: '200px' }}
          >
            <Save size={18} />
            Ayarları Kaydet
          </button>
        </div>

      </div>
    </div>
  );
}
