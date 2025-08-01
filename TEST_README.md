# تست‌های Olymp Trade Bot

این فایل شامل تست‌های جامع برای پوشش کد `olymp.js` است.

## نصب وابستگی‌ها

```bash
npm install
```

## اجرای تست‌ها

### اجرای تمام تست‌ها
```bash
npm test
```

### اجرای تست‌ها با watch mode
```bash
npm run test:watch
```

### اجرای تست‌ها با coverage report
```bash
npm run test:coverage
```

### اجرای تست‌ها در CI/CD
```bash
npm run test:ci
```

## ساختار تست‌ها

### 1. تست‌های اصلی (Main Tests)
- **changeIP function**: تست تغییر یوزر ایجنت
- **searchCurrency function**: تست جستجوی ارز
- **solveCaptcha function**: تست حل کپچا
- **setupBrowser function**: تست راه‌اندازی مرورگر

### 2. تست‌های Auto User Agent Change
- **startAutoUserAgentChange**: تست شروع تغییر خودکار
- **stopAutoUserAgentChange**: تست توقف تغییر خودکار

### 3. تست‌های API Endpoints
- **searchCurrency endpoint**: تست endpoint جستجوی ارز
- **user agent endpoints**: تست endpoint های یوزر ایجنت

### 4. تست‌های Edge Cases
- **Network timeouts**: تست خطاهای شبکه
- **Element not found**: تست عدم یافتن المان‌ها
- **Browser close errors**: تست خطاهای بستن مرورگر

### 5. تست‌های عملکرد (Performance)
- **Setup time**: تست زمان راه‌اندازی
- **Rapid user agent changes**: تست تغییرات سریع یوزر ایجنت

### 6. تست‌های امنیت (Security)
- **Sensitive data logging**: تست عدم لاگ اطلاعات حساس
- **Input sanitization**: تست پاکسازی ورودی‌ها

## Coverage Report

پس از اجرای `npm run test:coverage`، گزارش‌های زیر تولید می‌شوند:

- **HTML Report**: در پوشه `coverage/lcov-report/index.html`
- **Text Report**: در کنسول نمایش داده می‌شود
- **LCOV Report**: در فایل `coverage/lcov.info`

## آستانه Coverage

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Mock Objects

### Puppeteer Mocks
```javascript
const mockPage = {
  setUserAgent: jest.fn(),
  setViewport: jest.fn(),
  setRequestInterception: jest.fn(),
  on: jest.fn(),
  setExtraHTTPHeaders: jest.fn(),
  goto: jest.fn(),
  waitForSelector: jest.fn(),
  click: jest.fn(),
  type: jest.fn(),
  waitForFunction: jest.fn(),
  $: jest.fn(),
  $$: jest.fn(),
  evaluate: jest.fn(),
  evaluateOnNewDocument: jest.fn(),
  screenshot: jest.fn(),
  frames: jest.fn(() => []),
  solveRecaptchas: jest.fn()
};
```

### Express Mocks
```javascript
const mockExpress = {
  use: jest.fn(),
  post: jest.fn(),
  get: jest.fn(),
  listen: jest.fn()
};
```

## تست‌های Integration

برای تست‌های integration با سرور واقعی:

```bash
# تست با سرور واقعی
npm run test:integration
```

## تست‌های E2E

برای تست‌های end-to-end:

```bash
# تست E2E
npm run test:e2e
```

## تنظیمات Jest

فایل `jest.config.js` شامل تنظیمات زیر است:

- **testEnvironment**: node
- **testTimeout**: 30 seconds
- **coverageThreshold**: 70% for all metrics
- **verbose**: true
- **setupFilesAfterEnv**: jest.setup.js

## Troubleshooting

### خطای "Cannot find module"
```bash
npm install
```

### خطای timeout
```bash
# افزایش timeout در jest.config.js
testTimeout: 60000
```

### خطای coverage
```bash
# بررسی آستانه coverage
npm run test:coverage
```

## Best Practices

1. **Mock External Dependencies**: تمام وابستگی‌های خارجی را mock کنید
2. **Test Error Cases**: تست‌های خطا را فراموش نکنید
3. **Use Descriptive Names**: نام‌های توصیفی برای تست‌ها استفاده کنید
4. **Keep Tests Fast**: تست‌ها را سریع نگه دارید
5. **Test One Thing**: هر تست فقط یک چیز را تست کند

## Contributing

برای اضافه کردن تست‌های جدید:

1. فایل تست جدید ایجاد کنید
2. تست‌ها را در `describe` block قرار دهید
3. از نام‌های توصیفی استفاده کنید
4. Mock های مناسب ایجاد کنید
5. Coverage را بررسی کنید 