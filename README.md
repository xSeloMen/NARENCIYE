# Narenciye Kaptanı 🍋🍊

Mersin'in eşsiz narenciye bahçelerinden dünyaya açılan, modern ve şık bir "Eşleştirme" (Match-3) web oyunu.

![Narenciye Kaptanı](assets/images/lemon.png)

## 🌟 Özellikler
- **Modern Arayüz:** Tamamen Glassmorphism (Buzlu Cam) stili ile tasarlandı. Canlı renkler, yumuşak geçişler ve akıcı animasyonlar.
- **Modüler Mimari:** Vanilla JavaScript, HTML5 ve CSS3 kullanılarak, hiçbir kütüphane veya paket yöneticisine (NPM vs.) ihtiyaç duymadan temiz ve anlaşılır şekilde yazıldı.
- **Yapay Zeka Destekli Görseller:** Meyveler yüksek kaliteli 2D grafikler olarak hazırlandı.
- **Gelişmiş Oyun Mekanikleri:** Patlayıcı bombalar, roketler, yatay/dikey silici füzeler ve tüm tahtayı temizleyen Gökkuşağı!
- **17 Benzersiz Seviye:** Mersin'in Fidanlığından başlayıp Dünya Liderliğine kadar uzanan uzun soluklu bir serüven.
- **Boss Savaşları:** Uçkurutan Böceği, Don Zararlısı ve Kuraklık gibi doğa koşullarıyla mücadele edin.

## 🚀 Kurulum & Oynanış
Oyun tamamen tarayıcı tabanlıdır ve sunucu gerektirmez.

1. Projeyi bilgisayarınıza indirin.
2. `NARENCİYE` klasörü içindeki `index.html` dosyasına çift tıklayın.
3. Tarayıcınızda açılan oyunda "Oyuna Başla" butonuna tıklayarak keyfini çıkarın!

## 📁 Proje Yapısı
```text
NARENCİYE/
│
├── assets/
│   └── images/          # Oyundaki tüm görsel dosyaları (Limon, Portakal vb.)
│
├── css/
│   └── style.css        # Glassmorphism ve tüm stil dosyaları
│
├── js/
│   ├── config.js        # Sabitler, Seviye ayarları, Boss özellikleri
│   ├── engine.js        # Eşleştirme algoritması, grid sistemi
│   ├── graphics.js      # Canvas çizimleri, partiküller ve efektler
│   ├── state.js         # Global oyun durum yönetimi (Score, Level vb.)
│   ├── ui.js            # HTML DOM manipülasyonları ve ekran geçişleri
│   └── main.js          # Oyun döngüsü (Game Loop) ve Event Listener'lar
│
└── index.html           # Ana oyun iskeleti
```

## 🎮 Kontroller
- **Fare (Masaüstü):** Meyvelerin üzerine tıklayıp komşu meyveyle yer değiştirmek için sürükleyin.
- **Dokunmatik (Mobil):** Meyveye dokunun ve değiştirmek istediğiniz yöne kaydırın.

## 🛠️ Geliştirici
Bu proje, tamamen açık kaynaklı ve geliştirmeye açıktır. Dilediğiniz gibi fork edebilir, kendi seviyelerinizi `config.js` içerisine ekleyebilirsiniz.
