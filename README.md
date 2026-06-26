[🇹🇷 Türkçe](#türkçe) | [🇬🇧 English](#english)

---

<h1 id="türkçe">🇹🇷 Görsel Üretici Panel & Video Editor</h1>

Selamlar. Ben Yigit (vr0cks), MIS 2. sinif ogrencisiyim ve su anda bir sirkette Head of IT olarak calisiyorum.

Bu repo, sirket icerisinde yurutulen yonetim paneli operasyonlarinda gorsel ve video islemlerini hizlandirmak adina gelistirdigim acik kaynakli bir aractir. Ozellikle ozel gunlerde ve reklam kampanyalarinda gorsellere veya videolara hizlica sirket logomuzun eklenmesi gerekiyordu. Bu tur tekrar eden ve operasyonel hizi dusuren islemleri disaridan harici bir render programina ihtiyac duymadan tamamen tarayici uzerinden cozen bir otomasyon mekanizmasi kurdum.

Eger sizin projelerinizde de surekli olarak watermark (filigran) ekleme veya otomatik gorsel uretme ihtiyaci varsa bu projeyi rahatlikla kullanabilirsiniz.

## Neler Yapiyor?

- **Canli Onizleme:** Videoyu bastan asagi islemeye gerek kalmadan anlik olarak logonun videonun neresinde, nasil duracagini gosterir.
- **Otomatik Arka Plan Temizleyici:** Cogu kisi transparan PNG nedir bilmez, beyaz arka planli JPEG atar. Sistem bunu algilayip arkadaki beyazligi (R>230, G>230, B>230) JS Canvas uzerinde keser ve seffaf hale getirir.
- **OSYM Tarzi Watermark (Tumu):** Ekrana tek bir logo basmak yerine, logoyu -30 derece cevirip kuculterek ekrani bir ag gibi tamamen kaplar. Calinmaya karsi birebir.
- **Video Isleme:** Arka planda FFmpeg WASM (WebAssembly) kullanarak browser uzerinde, sunucuya hicbir yuk bindirmeden videoyu isler ve cikartir.

## Kurulum ve Kullanim

Bu kodlar Next.js / React projeleri icindir. FFmpeg.wasm kullandigimiz icin bazi tarayici gereksinimleri olabilir ancak genel yapiyi kendi projenize gore modifiye edebilirsiniz.

1. Ilgili bilesenleri projenize dahil edin. (Lucide-react ikonlari ve TailwindCSS kullanilmistir.)
2. `VideoEditor.tsx` icerisindeki ffmpeg core yollarini kendi CDN veya public klasorunuze gore ayarlayin. (Su an unpkg uzerinden cekiyor.)
3. Bileseni istediginiz bir sayfada cagirin: `<GorselUreticiPanel isDarkMode={true} />`

## Neden Acik Kaynak?

Sirket ici operasyonlarimizi hizlandirmak icin yazdigim bu modulu acik kaynak olarak paylasma sebebim cok net: Hem surekli tekrar eden islerden (repetitive tasks) vakit tasarrufu saglamak isteyen baska gelistiricilere destek olmak hem de browser gucunu (WASM) aktif kullanarak neler yapilabilecegini gostermek. Bir videoya logo basmak icin agir render programlariyla vakit kaybetmeye gerek yok, her sey browser icinde mumkun.

## Detayli Kullanim Rehberi (Gelistiriciler Icin)

Panel sadece bir video editorunden ibaret degildir. İcerisinde sosyal medya ve gorsel yonetimi icin gelismis ozellikler barindirir. İhtiyaciniz yoksa bu kisimlari koddan kaldirabilir veya kendi API'lariniza baglayarak kullanabilirsiniz:

### 1. Logo ve Varsayilan Ayarlar (GorselSettings)
"Logo & Ayarlar" sekmesinden sirketinizin logosunu tek bir kere yuklemeniz yeterlidir. Bu logo `localStorage` uzerinde `company_logo_base64` anahtariyla tutulur ve tum sayfalarda (Gorsel Uretici, Video Editor vb.) otomatik olarak cekilir. Ayrica filigranin varsayilan konumu, buyuklugu ve seffafligi da buradan ayarlanabilir.

### 2. AI Gorsel Uretici (OpenAI & Gemini API)
"Gorsel Uretici" sekmesinde belirli ozel gunlere (Bayramlar, resmi tatiller vs.) ozel prompt sablonlari bulunur. Eger sistemde API anahtarlariniz tanimliysa, stok gorsel kullanmak yerine direkt yapay zekaya (DALL-E veya Midjourney/Gemini altyapisi) o gune ozel gorsel urettirebilirsiniz.
- Ayarlar kismindan `OpenAI API Key` veya `Gemini API Key` girislerini yapin.
- Bu anahtarlar tamamen tarayici tarafinda (`localStorage`) tutulur.
- API cagrilarini `GorselGenerator.tsx` veya projenizin backend `api/` rotalarina baglayarak gerceklestirebilirsiniz.

### 3. Otomatik Sosyal Medya Paylasimi (Webhooks)
Urettiginiz gorselleri direkt olarak LinkedIn, Twitter veya Instagram gibi platformlara gondermek veya zamanlamak (Schedule) icin bir Webhook altyapisi hazirlanmistir.
- Ayarlar kismindan bir `Webhook URL` (Orn: Make.com, Zapier veya kendi backend endpoint'iniz) tanimlayin.
- Gorseli urettikten sonra "Paylas/Zamanla" butonuna bastiginizda, resim (Base64/URL formatinda) ve yazdiginiz aciklama metni (Caption) bu Webhook adresine POST edilir.

## Bilinmesi Gereken Kısıtlamalar (Eksiler)

Her seyi cok guzel yapiyor dedik ama uygulamanin bazi fiziksel sinirlari var. İnsanlari yaniltmamak adina onlari da listeliyorum:
- **Tarayici RAM Limitleri:** Sistem, agir video isleme adimini sunucuda degil sizin tarayicinizda (Client-Side) yapar. Bu yuzden 1-2 GB uzerindeki uzun sinema/vlog tarzinda videolar eklerseniz tarayici sekmeleri (Chrome/Safari vb.) cokecektir. Bu sistem spesifik olarak kisa sosyal medya videolari (Reels, Shorts, TikTok) islemek uzere optimize edilmistir.
- **COOP/COEP (SharedArrayBuffer) İhtiyaci:** WebAssembly'nin tarayicida "cok cekirdekli" hizda calisabilmesi icin projeyi barindirdiginiz sunucuda `Cross-Origin-Opener-Policy: same-origin` header'larinin donmesi gerekir. Aksi halde FFmpeg tek cekirdege duser ve video cikartma suresi 3-4 kat uzar.
- **Mobil Performansi:** Video isleme islemi cihazin kendi donanim gucune dayandigi icin eski bir cep telefonu tarayicisindan girmek sistemi inanilmaz yavaslatabilir.

## Lisans

**Ticari Amacla Kullanimi Yasaktir (Non-Commercial Use Only)**

Bu proje tamamen **ucretsiz** ve acik kaynak olarak, gelistiricilerin ve stajyerlerin hayatini kolaylastirmak amaciyla paylasilmistir. Kodlari istediginiz gibi alip inceleyebilir, kendi kisisel projelerinizde kullanabilir veya gelistirebilirsiniz. 

Ancak bu aracin veya kodlarinin **baska kisilere, kurumlara veya sirketlere satilmasi, ticari bir urun icerisine entegre edilerek uzerinden para kazanilmasi KESINLIKLE YASAKTIR.** Yoksa ben de bilirdim alip millete parayla satmayi. Lutfen emege saygi gosterin ve bu araci tamamen ucretsiz bir arac olarak yasamaya birakin.

Developed by [vr0cks](https://yigit.vr0cks.com)

---

<h1 id="english">🇬🇧 Visual Generator Panel & Video Editor</h1>

Greetings. I'm Yigit (vr0cks), a 2nd-year MIS student currently working as the Head of IT at a company.

This repository is an open-source tool I developed to speed up visual and video operations within our company's management panel. We frequently needed to add our company logo to images and videos, especially during special days or ad campaigns. I built this automation mechanism to handle these repetitive tasks entirely in the browser, eliminating the need for external heavy rendering software.

If your projects also require constant watermark addition or automated visual generation, feel free to use this project.

## Features

- **Live Preview:** Shows exactly where and how the logo will appear on the video instantly, without having to process the entire video.
- **Auto Background Remover:** Many users upload JPEGs with white backgrounds instead of transparent PNGs. The system automatically detects the white background (R>230, G>230, B>230) and makes the logo transparent using JS Canvas.
- **Grid Watermark (Tiled):** Instead of placing a single logo, it rotates the logo by -30 degrees, scales it down, and tiles it across the entire screen like a security grid. Highly effective against content theft.
- **Video Processing:** Uses FFmpeg WASM (WebAssembly) in the background to process and export the video directly in the browser, putting zero load on your servers.

## Installation & Usage

These codes are intended for Next.js / React projects. Since it uses FFmpeg.wasm, there are some browser security requirements, but you can modify the core structure to fit your project.

1. Include the relevant components in your project. (Uses Lucide-react icons and TailwindCSS).
2. Configure the ffmpeg core paths in `VideoEditor.tsx` according to your CDN or public folder. (Currently fetching from unpkg).
3. Call the component in any React page: `<GorselUreticiPanel isDarkMode={true} />`

## Why Open Source?

My reason for open-sourcing this internal operational module is clear: To support other developers who want to save time on repetitive tasks and to showcase what can be achieved by actively leveraging browser power (WASM). There is no need to waste time with heavy rendering software just to stamp a logo on a video—everything is possible inside the browser.

## Detailed Developer Guide

This panel is not just a video editor. It contains advanced features for social media and visual management. If you don't need these, you can remove them from the code or connect them to your own APIs:

### 1. Logo & Default Settings (GorselSettings)
Upload your company logo once from the "Logo & Settings" tab. This logo is stored in `localStorage` under `company_logo_base64` and is automatically fetched across all pages. Default watermark positions, sizes, and opacity can also be configured here.

### 2. AI Visual Generator (OpenAI & Gemini API)
The "Visual Generator" tab includes specific prompt templates for special days (Holidays, national events, etc.). If your API keys are configured, you can directly generate event-specific images using AI (DALL-E or Midjourney/Gemini architecture) instead of using stock images.
- Enter your `OpenAI API Key` or `Gemini API Key` in the settings.
- These keys are stored entirely on the client-side (`localStorage`).
- You can route API calls to `GorselGenerator.tsx` or your project's backend `api/` routes.

### 3. Automated Social Media Sharing (Webhooks)
A Webhook infrastructure is prepared to send or schedule generated visuals directly to platforms like LinkedIn, Twitter, or Instagram.
- Define a `Webhook URL` (e.g., Make.com, Zapier, or your own backend endpoint) in the settings.
- After generating a visual, clicking "Share/Schedule" will POST the image (Base64/URL format) and your caption to this Webhook address.

## Known Limitations (Cons)

To be fully transparent, the application has some physical limitations:
- **Browser RAM Limits:** The system performs heavy video processing on your browser (Client-Side), not on a server. Therefore, if you upload long cinema/vlog style videos over 1-2 GB, the browser tab will crash. This system is specifically optimized for short social media videos (Reels, Shorts, TikTok).
- **COOP/COEP (SharedArrayBuffer) Requirement:** For WebAssembly to run at "multi-core" speed in the browser, your hosting server must return `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers. Otherwise, FFmpeg falls back to a single core, increasing rendering time by 3-4x.
- **Mobile Performance:** Since video processing relies on the device's own hardware, running this from an older smartphone browser can significantly slow down the system.

## License

**Non-Commercial Use Only (CC BY-NC 4.0)**

This project is shared completely **free** and open-source to make life easier for developers and interns. You can take the codes, review them, use them in your personal projects, or improve them.

However, **selling this tool or its codes to other individuals, institutions, or companies, or integrating it into a commercial product to make money is STRICTLY PROHIBITED.** Please respect the effort and keep this as a completely free tool.

Developed by [vr0cks](https://yigit.vr0cks.com)
