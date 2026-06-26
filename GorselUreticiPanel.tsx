'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Image as ImageIcon, CalendarRange, Settings as SettingsIcon, Video as VideoIcon } from 'lucide-react';
import GorselDashboard from './GorselDashboard';
import GorselGenerator from './GorselGenerator';
import GorselScheduled from './GorselScheduled';
import GorselSettings from './GorselSettings';
import VideoEditor from './VideoEditor';

import './GorselUretici.css';

interface GorselUreticiPanelProps {
  isDarkMode: boolean;
}

export default function GorselUreticiPanel({ isDarkMode }: GorselUreticiPanelProps) {
  const [subTab, setSubTab] = useState<string>('dashboard');
  const [logo, setLogo] = useState<string>('/default_logo.png');

  useEffect(() => {
    console.log(
      "%c Developed by vr0cks - Pratik Görsel & Video Editörü \n https://vr0cks.com ",
      "color: #10b981; background: #080c14; font-size: 14px; font-weight: bold; padding: 10px; border-radius: 4px;"
    );

    // Initial logo check
    const savedLogo = localStorage.getItem('company_logo_base64');
    if (savedLogo) {
      setLogo(savedLogo);
    }

    const handleLogoUpdate = () => {
      const updatedLogo = localStorage.getItem('company_logo_base64');
      if (updatedLogo) {
        setLogo(updatedLogo);
      } else {
        setLogo('/default_logo.png');
      }
    };
    
    window.addEventListener('company_logo_updated', handleLogoUpdate);
    return () => {
      window.removeEventListener('company_logo_updated', handleLogoUpdate);
    };
  }, []);

  const renderContent = () => {
    switch (subTab) {
      case 'dashboard':
        return <GorselDashboard setActiveTab={setSubTab} />;
      case 'generator':
        return <GorselGenerator setActiveTab={setSubTab} />;
      case 'scheduled':
        return <GorselScheduled />;
      case 'video':
        return <VideoEditor setActiveTab={setSubTab} />;
      case 'settings':
        return <GorselSettings setActiveTab={setSubTab} />;
      default:
        return <GorselDashboard setActiveTab={setSubTab} />;
    }
  };

  return (
    <div className={`gorsel-tasarim-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Dynamic Aesthetic Glowing Spheres */}
      <div className="orb orb-primary"></div>
      <div className="orb orb-secondary"></div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-white/5 mb-8 pb-4 gap-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setSubTab('dashboard')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
            subTab === 'dashboard'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg'
              : 'text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-300 border-transparent'
          }`}
        >
          <LayoutDashboard size={14} className="mr-2" />
          Yönetim Paneli
        </button>

        <button
          onClick={() => setSubTab('generator')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
            subTab === 'generator'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg'
              : 'text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-300 border-transparent'
          }`}
        >
          <ImageIcon size={14} className="mr-2" />
          Görsel Üretici
        </button>

        <button
          onClick={() => setSubTab('scheduled')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
            subTab === 'scheduled'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg'
              : 'text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-300 border-transparent'
          }`}
        >
          <CalendarRange size={14} className="mr-2" />
          Zamanlamalar
        </button>

        <button
          onClick={() => setSubTab('video')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
            subTab === 'video'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg'
              : 'text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-300 border-transparent'
          }`}
        >
          <VideoIcon size={14} className="mr-2" />
          Video Düzenleyici
        </button>

        <button
          onClick={() => setSubTab('settings')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
            subTab === 'settings'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg'
              : 'text-slate-500 hover:bg-emerald-500/5 hover:text-emerald-300 border-transparent'
          }`}
        >
          <SettingsIcon size={14} className="mr-2" />
          Logo & Ayarlar
        </button>
      </div>

      {/* Main Sub Tab Content */}
      <div className="relative z-10">
        {renderContent()}
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        developed by <a href="https://yigit.vr0cks.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>yiğit ( vr0cks )</a>
      </div>
    </div>
  );
}
