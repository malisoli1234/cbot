# Olymp Trade Currency Bot

یک ربات هوشمند برای جستجو و تحلیل ارزهای دیجیتال در پلتفرم Olymp Trade با قابلیت تغییر خودکار یوزر ایجنت و مدیریت کپچا.

## 🚀 ویژگی‌ها

- **جستجوی خودکار ارزها**: جستجو و استخراج اطلاعات ارزهای مختلف
- **تغییر خودکار یوزر ایجنت**: 50+ یوزر ایجنت مختلف با رندوم‌سازی پیشرفته
- **مدیریت کپچا**: پشتیبانی از reCAPTCHA، hCaptcha و Turnstile
- **API RESTful**: ارائه API برای استفاده خارجی
- **Telegram Bot**: ربات تلگرام برای دسترسی آسان
- **پوشش تست کامل**: تست‌های جامع با Jest

## 📋 پیش‌نیازها

- Node.js (نسخه 16 یا بالاتر)
- npm یا yarn
- Google Chrome (برای Puppeteer)
- اتصال اینترنت پایدار

## 🛠️ نصب و راه‌اندازی

### 1. Clone پروژه
```bash
git clone https://github.com/yourusername/olymp-trade-bot.git
cd olymp-trade-bot
```

### 2. نصب وابستگی‌ها
```bash
npm install
```

### 3. تنظیم فایل config.json
```json
{
  "telegram": {
    "token": "YOUR_TELEGRAM_BOT_TOKEN"
  },
  "olymp": {
    "email": "your-email@example.com",
    "password": "your-password"
  }
}
```

### 4. اجرای برنامه
```bash
# اجرای ربات تلگرام
npm start

# اجرای Olymp Trade Bot
npm run olymp

# اجرای بدون پروکسی
npm run olymp-no-proxy
```

## 📁 ساختار پروژه

```
currencies/
├── olymp.js              # ربات اصلی Olymp Trade
├── telegram-bot.js       # ربات تلگرام
├── pfinance.js          # ماژول مالی
├── config.json          # تنظیمات
├── package.json         # وابستگی‌ها
├── test.js              # تست‌ها
├── jest.config.js       # تنظیمات Jest
├── jest.setup.js        # تنظیمات تست
├── .gitignore           # فایل‌های نادیده گرفته شده
└── README.md           # مستندات
```

## 🔧 API Endpoints

### جستجوی ارز
```bash
POST /api/search-currency
Content-Type: application/json

{
  "currency": "BTC"
}
```

### تغییر یوزر ایجنت
```bash
POST /api/change-user-agent
```

### شروع تغییر خودکار
```bash
POST /api/start-auto-user-agent
```

### توقف تغییر خودکار
```bash
POST /api/stop-auto-user-agent
```

### دریافت وضعیت
```bash
GET /api/user-agent-status
```

## 🧪 تست‌ها

### اجرای تست‌ها
```bash
# اجرای تمام تست‌ها
npm test

# اجرای با watch mode
npm run test:watch

# اجرای با coverage report
npm run test:coverage

# اجرای در CI/CD
npm run test:ci
```

### پوشش تست
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🔒 امنیت

- تغییر خودکار یوزر ایجنت برای جلوگیری از تشخیص ربات
- مدیریت خودکار کپچا
- پاکسازی ورودی‌های کاربر
- عدم لاگ اطلاعات حساس

## 📊 ویژگی‌های یوزر ایجنت

### مرورگرهای پشتیبانی شده:
- **Chrome**: Windows, Mac, Linux (نسخه‌های مختلف)
- **Firefox**: Windows, Mac, Linux (نسخه‌های مختلف)
- **Safari**: Mac (نسخه‌های مختلف)
- **Edge**: Windows, Mac (نسخه‌های مختلف)
- **Opera**: Windows, Mac (نسخه‌های مختلف)
- **Mobile**: Android Chrome, iOS Safari

### رزولوشن‌های پشتیبانی شده:
- **Desktop**: 1920x1080, 1366x768, 1440x900, 1536x864, 1280x720
- **Laptop**: 1600x900, 1680x1050, 1920x1200, 2560x1440, 3840x2160
- **Tablet**: 768x1024, 1024x768, 820x1180, 1180x820
- **Mobile**: 375x667, 414x896, 390x844, 428x926, 360x640, 412x915

## 🚨 عیب‌یابی

### خطاهای رایج

#### خطای "Cannot find module"
```bash
npm install
```

#### خطای Puppeteer
```bash
# اطمینان از نصب Chrome
# در Windows: C:\Program Files\Google\Chrome\Application\chrome.exe
```

#### خطای کپچا
- برنامه به صورت خودکار کپچا را حل می‌کند
- در صورت عدم موفقیت، 60 ثانیه صبر می‌کند

#### خطای شبکه
- برنامه 3 بار تلاش می‌کند
- در هر تلاش یوزر ایجنت تغییر می‌کند

## 📝 لاگ‌ها

برنامه لاگ‌های مفصلی تولید می‌کند:

```
2024-01-01T12:00:00.000Z - INFO - 🌐 در حال تغییر یوزر ایجنت...
2024-01-01T12:00:00.100Z - INFO - ✅ یوزر ایجنت تغییر کرد: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
2024-01-01T12:00:00.200Z - INFO - ✅ Viewport تنظیم شد: 1920x1080
2024-01-01T12:00:00.300Z - INFO - ✅ زبان تنظیم شد: en-US
```

## 🤝 مشارکت

1. Fork پروژه
2. ایجاد branch جدید (`git checkout -b feature/AmazingFeature`)
3. Commit تغییرات (`git commit -m 'Add some AmazingFeature'`)
4. Push به branch (`git push origin feature/AmazingFeature`)
5. ایجاد Pull Request

## 📄 لایسنس

این پروژه تحت لایسنس ISC منتشر شده است.

## 📞 پشتیبانی

برای گزارش باگ یا درخواست ویژگی جدید، لطفاً یک Issue ایجاد کنید.

## 🔄 تغییرات اخیر

### v1.0.0
- اضافه شدن تغییر خودکار یوزر ایجنت
- بهبود مدیریت کپچا
- اضافه شدن تست‌های جامع
- بهبود API endpoints
- اضافه شدن مستندات کامل

## ⚠️ هشدار

این پروژه فقط برای اهداف آموزشی و تحقیقاتی است. لطفاً از قوانین و شرایط استفاده از پلتفرم Olymp Trade پیروی کنید. 