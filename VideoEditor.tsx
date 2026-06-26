'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Upload, Video, Play, Download, Settings, Loader2, AlertCircle } from 'lucide-react';

interface VideoEditorProps {
  setActiveTab: (tab: string) => void;
}

export default function VideoEditor({ setActiveTab }: VideoEditorProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // FFmpeg State
  const [loaded, setLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  
  // File State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [logoBase64, setLogoBase64] = useState<string>('');
  
  // Output State
  const [outputVideo, setOutputVideo] = useState<string>('');

  // Settings State
  const [opacity, setOpacity] = useState(0.5); // Default to 50% for more watermark feel
  const [scale, setScale] = useState(0.2); // 20% of video width
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'tile'>('bottom-right');
  const [margin, setMargin] = useState(20); // px

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const isDark = document.body.classList.contains('dark') || document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    // Load Logo
    const loadDefaultLogo = async () => {
      try {
        const response = await fetch('/default_logo.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Default logo could not be loaded', err);
      }
    };

    const savedLogo = localStorage.getItem('company_logo_base64');
    if (savedLogo) {
      setLogoBase64(savedLogo);
    } else {
      loadDefaultLogo();
    }
  }, []);

  const loadFFmpeg = async () => {
    if (loaded) return;
    
    try {
      setMessage('Video işleme motoru yükleniyor (Bu işlem bir miktar zaman alabilir)...');
      const ffmpeg = new FFmpeg();
      // Using @ffmpeg/core instead of @ffmpeg/core-mt to avoid COOP/COEP SharedArrayBuffer requirements
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      ffmpeg.on('log', ({ message }: { message: string }) => {
        if (messageRef.current) messageRef.current.innerHTML = message;
        console.log(message);
      });
      
      ffmpeg.on('progress', ({ progress, time }: { progress: number; time: number }) => {
        setProgress(Math.round(progress * 100));
        setMessage(`İşleniyor: %${Math.round(progress * 100)}`);
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      ffmpegRef.current = ffmpeg;
      setLoaded(true);
      setMessage('Video işleme motoru hazır.');
    } catch (err) {
      console.error(err);
      setMessage('Hata: Video işleme motoru yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setOutputVideo(''); // Reset previous output
      
      // Try loading FFmpeg immediately if not loaded
      if (!loaded) {
        loadFFmpeg();
      }
    }
  };

  const base64ToUint8Array = (base64: string) => {
    const raw = window.atob(base64.split(',')[1]);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  };

  // Logodan beyaz arkaplanı temizleyen yardımcı fonksiyon
  const removeWhiteBackground = async (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Beyaz veya beyaza çok yakın pikselleri transparan yap
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 230 && data[i+1] > 230 && data[i+2] > 230) {
            data[i+3] = 0; // Alpha = 0
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64;
    });
  };

  const [previewLogoBase64, setPreviewLogoBase64] = useState<string>('');

  // Logo değişince önizlemeyi güncelle. Saniyede bir logo değişiyor zaten.
  useEffect(() => {
    if (logoBase64) {
      removeWhiteBackground(logoBase64).then(setPreviewLogoBase64);
    }
  }, [logoBase64]);

  // ÖSYM tarzı çapraz kaplama (Otomatik filigran yerleşimi için)
  const createTiledLogo = async (transparentLogoBase64: string, opacityValue: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // 2500x2500 dev bir canvas oluşturup ortalayacağız (çoğu videoyu kaplar)
        canvas.width = 2500;
        canvas.height = 2500;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');

        // Fix for WebKit Canvas composite rendering bug (forces GPU acceleration layer)
        ctx.fillStyle = 'rgba(118, 114, 48, 0.001)';
        ctx.fillRect(0, 0, 1, 1);
        ctx.fillStyle = 'rgba(99, 107, 115, 0.001)';
        ctx.fillRect(1, 1, 1, 1);
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6); // -30 derece eğim (ÖSYM tarzı)
        ctx.translate(-canvas.width, -canvas.height); // Geri al ki sol üstten çizmeye başlasın
        
        const logoW = 250; // Her bir logonun boyutu
        const logoH = (img.height / img.width) * logoW;
        
        ctx.globalAlpha = Math.min(opacityValue, 0.4); // Tümü kaplandığında max 0.4 opaklık daha iyi durur
        
        // Ekranı dolduracak şekilde logoyu bas
        for (let x = -1000; x < canvas.width * 2; x += logoW + 150) {
          for (let y = -1000; y < canvas.height * 2; y += logoH + 150) {
             ctx.drawImage(img, x, y, logoW, logoH);
          }
        }
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = transparentLogoBase64;
    });
  };

  const processVideo = async () => {
    if (!videoFile || !logoBase64 || !ffmpegRef.current) return;
    
    setIsProcessing(true);
    setProgress(0);
    setOutputVideo('');
    
    try {
      const ffmpeg = ffmpegRef.current;
      
      // Dosyaları ffmpeg'in sanal sistemine atıyoruz ki işleyebilsin
      setMessage('Logo arka planı temizleniyor ve hazırlanıyor...');
      // 1. Logodaki beyazlıkları temizle (JPEG formatında yüklenen logolar için uyumluluk)
      const transparentLogo = await removeWhiteBackground(logoBase64);
      
      let finalLogoBase64 = transparentLogo;
      
      // 2. Tümü seçeneği gelirse arka planda dev bir canvas üret
      if (position === 'tile') {
        setMessage('ÖSYM tarzı filigran deseni oluşturuluyor...');
        finalLogoBase64 = await createTiledLogo(transparentLogo, opacity);
      }

      setMessage('Dosyalar işleme alınıyor...');
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      
      const logoData = base64ToUint8Array(finalLogoBase64);
      await ffmpeg.writeFile('logo.png', logoData);
      
      // Nereye basılacağını hesaplama bölümü
      let positionStr = '';
      let filterComplex = '';

      if (position === 'tile') {
        // Tiled logo devasa bir imaj olduğu için merkeze oturtup bırakıyoruz.
        // Opacity zaten JS tarafında basıldı, burada kasmıyoruz.
        filterComplex = `[1:v]format=rgba[transparent_logo];[0:v][transparent_logo]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2`;
      } else {
        switch (position) {
          case 'bottom-right':
            positionStr = `main_w-overlay_w-${margin}:main_h-overlay_h-${margin}`;
            break;
          case 'bottom-left':
            positionStr = `${margin}:main_h-overlay_h-${margin}`;
            break;
          case 'top-right':
            positionStr = `main_w-overlay_w-${margin}:${margin}`;
            break;
          case 'top-left':
            positionStr = `${margin}:${margin}`;
            break;
          case 'center':
            positionStr = `(main_w-overlay_w)/2:(main_h-overlay_h)/2`;
            break;
        }
        const scaleStr = `scale=iw*${scale}:-1`;
        filterComplex = `[1:v]${scaleStr},format=rgba,colorchannelmixer=aa=${opacity}[transparent_logo];[0:v][transparent_logo]overlay=${positionStr}`;
      }

      setMessage('Video işleniyor... (Bu işlem cihazınızın hızına bağlı olarak sürebilir)');
      
      // Execute FFmpeg
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-i', 'logo.png',
        '-filter_complex', filterComplex,
        '-c:a', 'copy', // Copy audio directly
        'output.mp4'
      ]);

      setMessage('Video başarıyla oluşturuldu! Dosya okunuyor...');
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setOutputVideo(url);
      
      setMessage('İşlem tamamlandı.');
    } catch (err) {
      console.error(err);
      setMessage('İşlem sırasında bir hata oluştu. Loglara bakınız.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT: SETTINGS & UPLOAD */}
      <div className="lg:col-span-4 space-y-6">
        <div className={`p-6 rounded-[2.5rem] shadow-sm border transition-all ${isDarkMode ? 'bg-[#0D0D0E] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <Upload size={20} />
            </div>
            <div>
              <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Video Yükle</h3>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>.mp4, .mov, .webm</p>
            </div>
          </div>

          <label className={`block w-full p-6 text-center border-2 border-dashed rounded-3xl cursor-pointer transition-colors ${
              isDarkMode 
                ? 'border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5' 
                : 'border-purple-200 hover:border-purple-400 bg-purple-50/50'
            }`}>
            <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" onChange={handleVideoUpload} />
            <div className="flex flex-col items-center">
              <Video className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                {videoFile ? videoFile.name : 'Videonuzu Sürükleyin veya Seçin'}
              </span>
            </div>
          </label>
        </div>

        {/* SETTINGS PANEL */}
        <div className={`p-6 rounded-[2.5rem] shadow-sm border transition-all ${isDarkMode ? 'bg-[#0D0D0E] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Settings size={20} />
            </div>
            <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Filigran Ayarları</h3>
          </div>

          {!logoBase64 && (
            <div className={`mb-6 p-4 rounded-2xl flex items-start space-x-3 text-xs font-bold ${isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>Sistemde henüz bir şirket logosu tanımlanmamış. Lütfen 'Logo & Ayarlar' kısmından bir logo yükleyin.</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <label className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Konum</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'top-left', label: 'SOL ÜST' },
                  { id: 'top-right', label: 'SAĞ ÜST' },
                  { id: 'bottom-left', label: 'SOL ALT' },
                  { id: 'bottom-right', label: 'SAĞ ALT' },
                  { id: 'center', label: 'MERKEZ' },
                  { id: 'tile', label: 'TÜMÜNÜ KAPLA' }
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id as any)}
                    className={`p-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                      position === pos.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isDarkMode ? 'bg-black/20 text-slate-400 border-white/5 hover:border-emerald-500/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-500/30'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <label className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Şeffaflık (Opacity)</label>
                <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>{Math.round(opacity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <label className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Boyut (Videonun %'si)</label>
                <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>{Math.round(scale * 100)}%</span>
              </div>
              <input 
                type="range" min="0.05" max="1" step="0.05" 
                value={scale} onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <button
              onClick={processVideo}
              disabled={!videoFile || isProcessing || !logoBase64 || !loaded}
              className={`w-full py-4 rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-widest transition-all ${
                !videoFile || isProcessing || !logoBase64 || !loaded
                  ? isDarkMode ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : !loaded && videoFile ? (
                <>Motor Yükleniyor...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" fill="currentColor" /> 
                  Logo Ekle ve Üret
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: PREVIEW & OUTPUT */}
      <div className="lg:col-span-8 space-y-6">
        <div className={`p-6 rounded-[2.5rem] shadow-sm border transition-all flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0D0D0E] border-white/5' : 'bg-white border-slate-100'}`}>
          
          <div className="w-full relative aspect-video bg-black/5 rounded-[2rem] overflow-hidden flex items-center justify-center">
            {outputVideo ? (
              <video src={outputVideo} controls className="w-full h-full object-contain" />
            ) : videoUrl ? (
              <div className="relative w-full h-full">
                <video src={videoUrl} controls className="w-full h-full object-contain" />
                {/* CANLI ÖNİZLEME (PREVIEW) */}
                {previewLogoBase64 && (
                  <div 
                    className="absolute inset-0 pointer-events-none overflow-hidden flex"
                    style={{
                      justifyContent: position.includes('right') ? 'flex-end' : position.includes('left') ? 'flex-start' : 'center',
                      alignItems: position.includes('bottom') ? 'flex-end' : position.includes('top') ? 'flex-start' : 'center',
                      padding: position === 'tile' ? 0 : `${margin}px`
                    }}
                  >
                    {position === 'tile' ? (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '-100%', left: '-100%', right: '-100%', bottom: '-100%',
                          backgroundImage: `url(${previewLogoBase64})`,
                          backgroundSize: '150px',
                          backgroundRepeat: 'space',
                          opacity: Math.min(opacity, 0.4),
                          transform: 'rotate(-30deg)'
                        }}
                      />
                    ) : (
                      <img 
                        src={previewLogoBase64} 
                        style={{
                          width: `${scale * 100}%`,
                          opacity: opacity,
                          objectFit: 'contain'
                        }}
                        alt="Watermark Preview" 
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={`text-center space-y-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <Video className="w-16 h-16 mx-auto opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Önizleme Yok</p>
              </div>
            )}
          </div>

          <div className="mt-6 w-full px-4">
            <p ref={messageRef} className={`text-xs font-mono text-center h-4 line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {message}
            </p>
            {isProcessing && (
              <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>

          {outputVideo && (
            <div className="w-full mt-8 flex justify-end">
              <a 
                href={outputVideo} 
                download={`ByKaraca_Video_${new Date().getTime()}.mp4`}
                className={`px-8 py-4 rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-widest bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all`}
              >
                <Download className="w-4 h-4 mr-2" />
                Videoyu İndir
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
