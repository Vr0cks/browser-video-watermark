Bugun, operasyonel sureclerimizde zaman yonetimini nasil hizlandirdigimizdan ve bu cozumu nasil acik kaynaga (Open Source) donusturdugumden bahsetmek istiyorum.

MIS 2. sinif ogrencisi ve sirketimizin Head of IT'si olarak sirketin finansindan siparislerine kadar tum is akisini tek bir yonetim panelinde birlestirdim. Ancak sistemin guzel calismasinin yani sira surekli karsilastigimiz kucuk ama zaman alan bazi rutin ihtiyaclar doguyordu: Ozel gunlerde ve reklam kampanyalarinda videolara veya resimlere sirket logosunu yerlestirmek.

Her yeni kampanya veya bayram kutlamasinda bu tur gorsel ve video isleme adimlari, harici bir tasarim veya render programi acilmasini gerektiriyordu ve bu da operasyonel hizi ciddi oranda yavaslatiyordu. Bu sureci daha hizli ve sorunsuz hale getirmek icin kollari sivayarak tamamen browser uzerinden (FFmpeg WebAssembly teknolojisiyle) calisan bir otomasyon araci gelistirdim.

Sistemin sundugu bazi pratik cozumler:
- "Canli Onizleme" ozelligi ile logonun ekrandaki konumunu ve seffafligini video islenmeden once aninda gosterebiliyor.
- Kullanici hatalarinin onune gecmek icin yuklenen JPEG logolarin arkasindaki beyazliklari JS Canvas uzerinde kesip siliyor ve otomatik olarak seffaf (PNG) hale getiriyor.
- Istenirse tek bir tusla OSYM kitapciklarindaki guvenlik filigranlari gibi logoyu acili sekilde kuculterek videonun ustune seffaf bir ag olarak kaplayabiliyor.

Bugun, ayni surec yonetimi problemlerini yasayan ve benzer ihtiyaclar duyan baska gelistiricilere katki saglamasi adina bu araci tamamen acik kaynak olarak yayinlamaya karar verdim.

Siz de projelerinizde agir render programlari olmadan, tamamen tarayici gucunu kullanarak benzer bir sistemi kolayca ayaga kaldirabilirsiniz. Kodlara uzerinde istediginiz gibi degisiklik yapip projelerinize entegre edebilirsiniz.

Github Repo Linki: [Buraya Link Gelecek]

Iyi calismalar dilerim.

#opensource #react #nextjs #ffmpeg #webassembly #developer #javascript #automation #mis
