# Currency Scraping Bot

این پروژه برای اسکرپ کردن اطلاعات ارزها از سایت‌های مختلف طراحی شده است.

## نصب

1. **Node.js نصب کنید** (نسخه 14 یا بالاتر)
2. **پروژه را کلون کنید:**
   ```bash
   git clone https://github.com/malisoli1234/cbot.git
   cd cbot
   ```
3. **پکیج‌ها را نصب کنید:**
   ```bash
   npm install
   ```

## تنظیمات

فایل `config.json` را ویرایش کنید:

```json
{
  "telegramBotToken": "YOUR_BOT_TOKEN",
  "inputChannelId": "YOUR_INPUT_CHANNEL_ID",
  "outputChannelId": "YOUR_OUTPUT_CHANNEL_ID",
  "minPayout": 80
}
```

## اجرا

### Olymp Trade (با پروکسی)
```bash
npm run olymp
```

### Olymp Trade (بدون پروکسی)
```bash
npm run olymp-no-proxy
```

### P.Finance
```bash
npm run pfinance
```

### Telegram Bot
```bash
npm start
```

## نحوه استفاده

1. ابتدا یکی از سرورهای سایت را اجرا کنید (olymp یا pfinance)
2. سپس تلگرام بات را اجرا کنید
3. در کانال ورودی پیام بفرستید:
   - `OL: EURUSD` - برای جستجو در Olymp Trade
   - `PO: EURUSD` - برای جستجو در P.Finance
   - `ORG: EURUSD` - برای جستجو در همه سایت‌ها

## فایل‌های مهم

- `olymp.js` - سرور Olymp Trade
- `pfinance.js` - سرور P.Finance  
- `telegram-bot.js` - تلگرام بات
- `config.json` - تنظیمات
- `package.json` - وابستگی‌ها

## نکات مهم

- مطمئن شوید که Chrome نصب شده باشد
- برای استفاده از پروکسی، فایل `olymp.js` را ویرایش کنید
- در صورت مشکل، ابتدا `npm run olymp-no-proxy` را امتحان کنید 