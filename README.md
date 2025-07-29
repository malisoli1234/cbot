# 🤖 سیستم اتوماسیون ارزهای دیجیتال

این پروژه یک سیستم اتوماسیون کامل برای مدیریت پیام‌های ارزهای دیجیتال در تلگرام است که شامل وب‌اسکرپینگ، ذخیره‌سازی در دیتابیس و مدیریت خودکار پیام‌ها می‌باشد.

## 🏗️ ساختار پروژه

```
currencies/
├── src/
│   ├── config/
│   │   ├── database.js      # تنظیمات دیتابیس
│   │   └── sites.js         # تنظیمات سایت‌های مختلف
│   ├── models/
│   │   └── Currency.js      # مدل دیتابیس
│   ├── services/
│   │   ├── BrowserManager.js # مدیریت مرورگر
│   │   └── ScrapingService.js # سرویس اسکرپینگ
│   ├── controllers/
│   │   └── SearchController.js # کنترلر API
│   ├── server.js            # سرور اصلی
│   └── telegram-bot.js      # ربات تلگرام
├── config.json              # تنظیمات عمومی
├── package.json
└── README.md
```

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js (نسخه 14 یا بالاتر)
- MongoDB
- npm یا yarn

### نصب dependencies
```bash
npm install
```

### تنظیم دیتابیس
1. MongoDB رو نصب و اجرا کنید
2. دیتابیس `currencies` رو ایجاد کنید

### تنظیم فایل config.json
```json
{
  "minPayout": 70
}
```

## 🎯 ویژگی‌ها

### ✅ ویژگی‌های فعلی
- **وب‌اسکرپینگ چندسایته**: پشتیبانی از سایت‌های مختلف
- **ذخیره‌سازی در دیتابیس**: تمام جستجوها در MongoDB ذخیره می‌شوند
- **ربات تلگرام هوشمند**: مدیریت خودکار پیام‌های کانال
- **فیلتر کردن خودکار**: حذف پیام‌های با payout پایین
- **API کامل**: امکان جستجو و دریافت تاریخچه
- **ساختار ماژولار**: قابلیت اضافه کردن سایت‌های جدید

### 🔧 قابلیت‌های فنی
- **مدیریت مرورگر**: استفاده از Puppeteer برای اسکرپینگ
- **صف پردازش**: مدیریت همزمان درخواست‌ها
- **لاگ‌گیری**: ثبت تمام عملیات
- **مدیریت خطا**: handling خطاهای مختلف
- **Graceful Shutdown**: بستن صحیح برنامه

## 📡 API Endpoints

### جستجوی ارز
```http
POST /api/search
Content-Type: application/json

{
  "currency": "BTC",
  "telegramMessageId": 123,
  "telegramChannelId": "-1002498428726"
}
```

### دریافت تاریخچه
```http
GET /api/history?limit=50&offset=0
```

### دریافت جستجوی خاص
```http
GET /api/search/:id
```

### بررسی وضعیت سرور
```http
GET /health
```

## 🤖 ربات تلگرام

ربات به صورت خودکار:
- پیام‌های جدید کانال رو مانیتور می‌کنه
- نوع پیام رو تشخیص می‌ده (PO, QU, OL, ORG, etc.)
- بر اساس نوع پیام، سایت‌های مناسب رو انتخاب می‌کنه
- در سایت‌های مربوطه جستجو می‌کنه
- پیام‌های با payout پایین رو حذف می‌کنه
- پیام‌های مناسب رو ویرایش می‌کنه

### 📨 فرمت‌های پیام پشتیبانی شده:
- `PO: EURRUB-OTCp 1min BUY trc` - فقط در P.Finance
- `QU: EURRUB-OTCp 1min BUY trc` - فقط در P.Finance  
- `OL: EURRUB-OTCp 1min BUY trc` - فقط در P.Finance
- `ORG: EURRUB-OTCp 1min BUY trc` - در همه سایت‌ها
- `BTC-OTC` - پیام ساده
- `ETH` - ارز ساده

## 🌐 اضافه کردن سایت جدید

برای اضافه کردن سایت جدید، یک فایل جدید در `src/services/sites/` ایجاد کنید:

### 1. ایجاد فایل سایت جدید
```javascript
// src/services/sites/NewSite.js
const BaseSite = require('./BaseSite');

class NewSite extends BaseSite {
  constructor() {
    const selectors = {
      searchField: '.search-input',
      resultsContainer: '.results .item',
      currencyLabel: '.currency-name',
      payoutLabel: '.payout-value'
    };

    const setupSteps = [
      { action: 'waitForSelector', selector: '.search-input', timeout: 5000 },
      { action: 'click', selector: '.accept-cookies' },
      { action: 'wait', delay: 1000 }
    ];

    super('New Site', 'https://newsite.com', selectors, setupSteps);
  }

  async searchCurrency(page, currencyName) {
    // پیاده‌سازی جستجو در سایت جدید
    // این متد باید در هر کلاس فرزند override شود
  }
}

module.exports = NewSite;
```

### 2. اضافه کردن به index
```javascript
// src/services/sites/index.js
const NewSite = require('./NewSite');

const availableSites = {
  // سایت‌های موجود...
  newsite: NewSite
};
```

### 3. فعال کردن در ScrapingService
```javascript
// src/services/ScrapingService.js
this.sites = [
  new PFinanceSite(),
  new NewSite(), // اضافه کردن سایت جدید
];
```

## 🚀 اجرای پروژه

### اجرای سرور API
```bash
npm start
# یا
npm run dev
```

### اجرای ربات تلگرام
```bash
npm run bot
# یا
npm run dev:bot
```

### اجرای همزمان
```bash
# در ترمینال اول
npm start

# در ترمینال دوم
npm run bot
```

## 📊 دیتابیس

### مدل Currency
```javascript
{
  currencyName: String,      // نام ارز
  searchTerm: String,        // عبارت جستجو
  results: [{               // نتایج از سایت‌های مختلف
    site: String,
    currency: String,
    payout: String,
    timestamp: Date
  }],
  telegramMessageId: Number, // آیدی پیام تلگرام
  telegramChannelId: String, // آیدی کانال تلگرام
  status: String,           // وضعیت: pending, processed, deleted, edited
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 تنظیمات

### متغیرهای محیطی
- `PORT`: پورت سرور (پیش‌فرض: 5000)
- `MONGODB_URI`: آدرس دیتابیس (پیش‌فرض: mongodb://localhost:27017/currencies)

### تنظیمات تلگرام
- `TELEGRAM_BOT_TOKEN`: توکن ربات تلگرام
- `CHANNEL_ID`: آیدی کانال تلگرام

## 📝 لاگ‌ها

- لاگ‌های سرور در console نمایش داده می‌شوند
- لاگ‌های ربات در فایل `bot.log` ذخیره می‌شوند

## 🛠️ توسعه

### اضافه کردن ویژگی جدید
1. سرویس جدید در `src/services/` ایجاد کنید
2. کنترلر مربوطه در `src/controllers/` اضافه کنید
3. مسیر API در `src/server.js` تعریف کنید

### تست کردن
```bash
# تست API
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"currency": "BTC"}'

# بررسی وضعیت
curl http://localhost:5000/health
```

## 📞 پشتیبانی

برای گزارش مشکل یا پیشنهاد ویژگی جدید، لطفاً issue ایجاد کنید.

## 📄 لایسنس

این پروژه تحت لایسنس ISC منتشر شده است. 