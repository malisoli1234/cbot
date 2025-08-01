
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.use(express.json());

// تنظیم لاگ‌گیری
const logger = {
  info: (msg) => console.log(`${new Date().toISOString()} - INFO - ${msg}`),
  error: (msg) => console.error(`${new Date().toISOString()} - ERROR - ${msg}`),
};

let browser = null;
let page = null;

async function setupBrowser() {
  try {
    logger.info('راه‌اندازی مرورگر...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-webgl',
        '--disable-accelerated-2d-canvas',
        '--blink-settings=imagesEnabled=false',
        '--disable-extensions',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      ],
    });
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('https://p.finance/en/cabinet/try-demo/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    logger.info(`عنوان صفحه: ${await page.title()}`);

    // بستن پاپ‌آپ
    logger.info('🔍 در حال پیدا کردن دکمه ضربدر پاپ‌آپ...');
    await page.waitForSelector('.tutorial-v1__close-icon', { timeout: 5000 });
    await page.click('.tutorial-v1__close-icon');
    logger.info('✅ پاپ‌آپ بسته شد.');

    // کلیک روی دکمه Litecoin OTC
    logger.info('🔍 در حال پیدا کردن دکمه Litecoin OTC...');
    await page.waitForSelector('.currencies-block__in .pair-number-wrap', { timeout: 5000 });
    await page.click('.currencies-block__in .pair-number-wrap');
    logger.info('✅ دکمه Litecoin OTC کلیک شد.');

    // صبر تا وقتی فیلد جستجو آماده بشه
    await page.waitForSelector('.search__field', { timeout: 5000 });
    return true;
  } catch (e) {
    logger.error(`❌ خطا در راه‌اندازی مرورگر: ${e.message}`);
    return false;
  }
}

async function searchCurrency(currencyName) {
  const startTime = Date.now();
  try {
    logger.info(`🔍 در حال جستجوی ارز: ${currencyName}`);
    await page.waitForSelector('.search__field', { timeout: 5000 });
    await page.evaluate(() => document.querySelector('.search__field').value = '');
    await page.type('.search__field', currencyName);

    // صبر تا وقتی حداقل یه آیتم لود بشه یا تایم‌اوت
    await page.waitForFunction(
      () => document.querySelector('.assets-block__alist .alist__item') !== null || document.querySelector('.assets-block__alist') !== null,
      { timeout: 5000 }
    );

    // استخراج و فرمت نتایج
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.assets-block__alist .alist__item');
      const results = [];
      items.forEach(item => {
        try {
          const link = item.querySelector('.alist__link');
          let label = link?.querySelector('.alist__label')?.textContent || 'N/A';
          let payout = link?.querySelector('.alist__payout')?.textContent || 'N/A';
          // حذف اسلش و فرمت نام ارز
          label = label.replace('/', '');
          if (label.includes(' OTC')) {
            label = label.replace(' OTC', '-OTC');
          }
          // حذف علامت + و % از payout
          payout = payout.replace('+', '').replace('%', '');
          results.push({ currency: label, payout });
        } catch (e) {
          console.error(`❌ خطا در استخراج آیتم: ${e.message}`);
        }
      });
      return results;
    });

    const duration = Date.now() - startTime;
    if (results.length === 0) {
      logger.info(`❌ ارز ${currencyName} پیدا نشد. (زمان: ${duration}ms)`);
      return { status: 'success', message: `Currency ${currencyName} not found`, results: [] };
    }

    logger.info(`✅ ارز ${currencyName} جستجو شد. نتایج: ${JSON.stringify(results)} (زمان: ${duration}ms)`);
    return { status: 'success', message: `Currency ${currencyName} searched`, results };
  } catch (e) {
    const duration = Date.now() - startTime;
    logger.error(`❌ خطا در جستجوی ارز ${currencyName}: ${e.message} (زمان: ${duration}ms)`);
    const html = await page.content();
    logger.error(`📜 HTML صفحه: ${html.slice(0, 3000)}`);
    return { status: 'error', message: `Search failed: ${e.message}`, results: [] };
  }
}

app.post('/api/search-currency', async (req, res) => {
  const { currency } = req.body;
  if (!currency) {
    return res.status(400).json({ status: 'error', message: 'No currency provided', results: [] });
  }
  const result = await searchCurrency(currency);
  res.json(result);
});

async function main() {
  if (!(await setupBrowser())) {
    logger.error('❌ راه‌اندازی مرورگر ناموفق بود. برنامه متوقف می‌شود.');
    process.exit(1);
  }

  // اجرای سرور Express
  app.listen(3002, '0.0.0.0', () => {
    logger.info('🚀 سرور Express در حال اجرا روی http://localhost:3002');
  });

  // مدیریت توقف برنامه
  process.on('SIGINT', async () => {
    logger.info('🛑 برنامه توسط کاربر متوقف شد.');
    if (browser) {
      logger.info('🚫 بستن مرورگر...');
      await browser.close();
    }
    process.exit(0);
  });
}

main().catch(e => {
  logger.error(`❌ خطای کلی در اجرای برنامه: ${e.message}`);
  process.exit(1);
});
