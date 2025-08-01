# 🏆 Olymp Trade Site

ماژول Olymp Trade برای ربات تلگرام

## 📁 فایل‌ها

- `src/services/sites/OlympTradeSite.js` - ماژول کامل Olymp Trade (شامل سرور API و اسکرپینگ)

## 🚀 نحوه استفاده

### استفاده در ربات تلگرام
```javascript
const { OlympTradeSite } = require('./src/services/sites');
const olympSite = new OlympTradeSite();

// راه‌اندازی خودکار (شامل سرور API و مرورگر)
await olympSite.setup();

// جستجوی ارز
const result = await olympSite.search('EURUSD');

// دریافت همه ارزها
const currencies = await olympSite.getAllCurrencies();

// بستن سایت
await olympSite.close();
```

## 📡 API Endpoints

ماژول Olymp Trade خودش سرور API داخلی داره:

- `GET http://localhost:3001/api/currencies` - همه ارزها
- `POST http://localhost:3001/api/search-currency` - جستجوی ارز

## ⚙️ ویژگی‌ها

✅ **سرور API داخلی** - خودش سرور Express راه‌اندازی می‌کنه  
✅ **مرورگر خودکار** - Puppeteer با StealthPlugin  
✅ **لاگین خودکار** - ورود به حساب Olymp Trade  
✅ **جستجوی هوشمند** - در فیلد search و استخراج نتایج  
✅ **مدیریت CAPTCHA** - تشخیص و صبر برای حل دستی  
✅ **Error handling** - مدیریت خطاها و retry  

## 🔧 تنظیمات

در فایل `src/services/sites/OlympTradeSite.js`:
- مسیر Chrome
- اطلاعات لاگین
- پورت سرور (3001) 