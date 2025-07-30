# 🤖 Currency Bot - ربات ارز

یک سیستم کامل برای جستجوی ارزها در سایت‌های مختلف با پنل ادمین مدرن

## 🚀 ویژگی‌ها

- **Web Scraping**: جستجوی ارزها در سایت‌های مختلف
- **Telegram Bot**: ربات تلگرام برای پردازش پیام‌ها
- **Admin Panel**: پنل ادمین مدرن با React
- **Database**: ذخیره نتایج در MongoDB
- **Multi-Site Support**: پشتیبانی از چندین سایت
- **Message Parsing**: پردازش هوشمند پیام‌های تلگرام

## 📋 پیش‌نیازها

- **Node.js** (نسخه 16 یا بالاتر)
- **npm** یا **yarn**
- **MongoDB** (اختیاری - سرور بدون دیتابیس هم کار می‌کند)
- **Git**

## 🛠️ نصب و راه‌اندازی

### 1. کلون کردن پروژه
```bash
git clone https://github.com/malisoli1234/cbot.git
cd cbot
```

### 2. نصب Dependencies
```bash
# نصب dependencies اصلی
npm install

# نصب React frontend dependencies
cd admin-frontend
npm install
cd ..
```

### 3. Build کردن React App
```bash
cd admin-frontend
npm run build
cd ..
```

### 4. تنظیمات
فایل `config.json` را ویرایش کنید:

```json
{
  "minPayout": 70,
  "telegram": {
    "botToken": "YOUR_BOT_TOKEN_HERE",
    "channelId": "@YOUR_CHANNEL_ID_HERE",
    "enabled": false
  },
  "database": {
    "uri": "mongodb://localhost:27017/currencies"
  },
  "server": {
    "port": 5000,
    "autoOpenBrowser": true
  }
}
```

## 🚀 اجرای پروژه

### روش 1: استفاده از Batch Files (Windows)
```bash
# نصب کامل
setup.bat

# اجرای سرور
start.bat
```

### روش 2: دستی
```bash
# اجرای سرور
npm start

# اجرای ربات تلگرام (در ترمینال جداگانه)
npm run bot
```

## 🌐 دسترسی‌ها

- **Admin Panel**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **API Documentation**: http://localhost:5000/api

## 📱 پنل ادمین

پنل ادمین شامل بخش‌های زیر است:

### 🏠 Dashboard
- آمار کلی سیستم
- نمودارهای عملکرد
- آخرین جستجوها

### 📊 Records
- مشاهده تمام جستجوها
- فیلتر و جستجو
- جزئیات کامل هر رکورد

### 🌐 Sites
- مدیریت سایت‌های فعال
- تنظیمات هر سایت
- وضعیت اتصال

### ⚙️ Settings
- تنظیمات تلگرام
- تنظیمات سرور
- تنظیمات دیتابیس

## 🤖 ربات تلگرام

### فرمت پیام‌ها:
- `PO: EURRUB-OTCp 1min BUY trc` - جستجو در P.Finance
- `QU: EURRUB-OTCp 1min BUY trc` - جستجو در سایت QU
- `OL: EURRUB-OTCp 1min BUY trc` - جستجو در سایت OL
- `ORG: EURRUB-OTCp 1min BUY trc` - جستجو در همه سایت‌ها

### تنظیمات:
1. فایل `config.json` را باز کنید
2. `botToken` و `channelId` را وارد کنید
3. `enabled` را `true` کنید
4. سرور را restart کنید

## 🔧 API Endpoints

### جستجوی ارز
```bash
POST /api/search
{
  "currency": "EURUSD",
  "message": "PO: EURUSD-OTCp 1min BUY trc"
}
```

### تاریخچه جستجو
```bash
GET /api/history
```

### تنظیمات
```bash
GET /api/config
POST /api/config
```

## 🏗️ ساختار پروژه

```
currencies/
├── src/
│   ├── controllers/     # کنترلرهای API
│   ├── models/         # مدل‌های دیتابیس
│   ├── services/       # سرویس‌های اصلی
│   ├── utils/          # ابزارهای کمکی
│   └── config/         # تنظیمات
├── admin-frontend/     # React Admin Panel
├── config.json         # تنظیمات اصلی
└── package.json        # Dependencies
```

## 🐛 عیب‌یابی

### مشکل: "خطای داخلی سرور"
1. MongoDB نصب و اجرا کنید
2. یا `config.json` را بررسی کنید
3. Log های سرور را چک کنید

### مشکل: React App بارگذاری نمی‌شود
```bash
cd admin-frontend
npm run build
cd ..
```

### مشکل: ربات تلگرام کار نمی‌کند
1. `botToken` و `channelId` را در `config.json` وارد کنید
2. `enabled` را `true` کنید
3. سرور را restart کنید

## 📝 تغییرات اخیر

- ✅ بهبود error handling
- ✅ پشتیبانی از کار بدون دیتابیس
- ✅ React Admin Panel
- ✅ تنظیمات قابل تغییر
- ✅ Auto-open browser

## 🤝 مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. Branch جدید بسازید
3. تغییرات را commit کنید
4. Pull Request ارسال کنید

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

---

**نکته**: برای استفاده کامل از قابلیت‌های دیتابیس، MongoDB را نصب و اجرا کنید. 