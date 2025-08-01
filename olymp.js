const puppeteerExtra = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const express = require('express');
const app = express();
app.use(express.json());

// تنظیم plugins
puppeteerExtra.use(StealthPlugin());
puppeteerExtra.use(RecaptchaPlugin());

// تنظیم لاگ‌گیری
const logger = {
  info: (msg) => console.log(`${new Date().toISOString()} - INFO - ${msg}`),
  error: (msg) => console.error(`${new Date().toISOString()} - ERROR - ${msg}`),
  warn: (msg) => console.warn(`${new Date().toISOString()} - WARN - ${msg}`),
};

let browser = null;
let page = null;

// تابع تغییر یوزر ایجنت
async function changeUserAgent() {
  try {
    logger.info('🌐 در حال تغییر یوزر ایجنت...');
    
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);
    
    // تغییر Viewport
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 1600, height: 900 },
    ];
    
    const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
    await page.setViewport(randomViewport);
    
    logger.info(`✅ یوزر ایجنت تغییر کرد: ${randomUserAgent.substring(0, 50)}...`);
    logger.info(`✅ Viewport تنظیم شد: ${randomViewport.width}x${randomViewport.height}`);
  } catch (e) {
    logger.warn(`⚠️ خطا در تغییر یوزر ایجنت: ${e.message}`);
  }
}

async function setupBrowser() {
  try {
    logger.info('راه‌اندازی مرورگر...');
    
    browser = await puppeteerExtra.launch({
      headless: 'new',
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-webgl',
        '--disable-accelerated-2d-canvas',
        '--blink-settings=imagesEnabled=false',
        '--disable-extensions',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
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
    
    // تغییر یوزر ایجنت قبل از ورود به سایت
    await changeUserAgent();
    
    // رفتن به صفحه اولیمپ ترید
    logger.info('🌐 در حال رفتن به صفحه اولیمپ ترید...');
    await page.goto('https://olymptrade.com/platform', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    logger.info('✅ صفحه اولیمپ ترید لود شد');
    
    // صبر برای لود کامل صفحه
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // کلیک روی دکمه Login
    logger.info('🔍 در حال پیدا کردن دکمه Login...');
    await page.waitForSelector('button[data-test="auth-tab-item"]', { timeout: 30000 });
    await page.click('button[data-test="auth-tab-item"]');
    logger.info('✅ دکمه Login کلیک شد');
    
    // صبر برای لود فرم لاگین
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // وارد کردن یوزرنیم
    logger.info('📝 در حال وارد کردن یوزرنیم...');
    await page.waitForSelector('input[data-test="Input"][name="email"]', { timeout: 30000 });
    await page.type('input[data-test="Input"][name="email"]', 'mmrrssoollii@gmail10p.com');
    logger.info('✅ یوزرنیم وارد شد');
    
    // وارد کردن پسورد
    logger.info('🔐 در حال وارد کردن پسورد...');
    await page.waitForSelector('input[data-test="Input"][name="password"]', { timeout: 30000 });
    await page.type('input[data-test="Input"][name="password"]', 'mmm123456789');
    logger.info('✅ پسورد وارد شد');
    
    // صبر برای لود کامل فرم
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // کلیک روی دکمه Log In
    logger.info('🔍 در حال پیدا کردن دکمه Log In...');
    await page.waitForSelector('button[data-test="form-signin-button"]', { timeout: 30000 });
    await page.click('button[data-test="form-signin-button"]');
    logger.info('✅ دکمه Log In کلیک شد');
    
    // صبر برای پردازش لاگین
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // چک کردن کپچا
    const captchaExists = await page.$('iframe[src*="recaptcha"], .g-recaptcha, [data-test*="captcha"]');
    if (captchaExists) {
      logger.warn('⚠️ کپچا تشخیص داده شد! منتظر حل دستی...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // 60 ثانیه صبر
    }
    
    // صبر برای لاگین موفق
    logger.info('⏳ منتظر لاگین موفق...');
    await page.waitForFunction(() => {
      return window.location.href.includes('/platform') && 
             !document.querySelector('button[data-test="form-signin-button"]');
    }, { timeout: 30000 });
    logger.info('✅ لاگین موفق - وارد صفحه اصلی شدیم');
    
    // صبر برای لود کامل صفحه اصلی
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // کلیک روی دکمه Halal Market Axis
    logger.info('🔍 در حال پیدا کردن دکمه Halal Market Axis...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const selectors = [
      '[data-test="asset-select-button-HMA_X/ftt"]',
      '[data-test="assets-tabs-tab-selected"]',
      '.css-e5732h.e1r2g46w0',
      'div[role="button"][data-test="assets-tabs-tab-selected"]',
      '[data-test="pair-name-HMA_X"]',
      'img[data-test="pair-name-HMA_X"]',
      'div[data-asset-tab="true"]',
      '.css-1gbgf2c.e1su41ew0'
    ];
    
    let clicked = false;
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          logger.info(`✅ دکمه Halal Market Axis کلیک شد با selector: ${selector}`);
          clicked = true;
          break;
        }
      } catch (e) {
        logger.warn(`⚠️ selector ${selector} ناموفق: ${e.message}`);
      }
    }
    
    if (!clicked) {
      // تلاش با JavaScript
      try {
        await page.evaluate(() => {
          const elements = document.querySelectorAll('[data-test*="HMA_X"], [data-test*="assets-tabs"], [data-test*="asset-select"]');
          for (const element of elements) {
            if (element.clickable) {
              element.click();
              return true;
            }
          }
          return false;
        });
        logger.info('✅ دکمه Halal Market Axis کلیک شد با JavaScript');
        clicked = true;
      } catch (e) {
        logger.warn(`⚠️ تلاش با JavaScript ناموفق: ${e.message}`);
      }
    }
    
    if (!clicked) {
      logger.error('❌ دکمه Halal Market Axis پیدا نشد');
      throw new Error('دکمه Halal Market Axis پیدا نشد');
    }
    
    // صبر برای باز شدن dropdown
    await new Promise(resolve => setTimeout(resolve, 3000));
    logger.info('✅ آماده برای دریافت درخواست‌های API...');
    
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
    
    // صبر برای آماده شدن input search
    await page.waitForSelector('input[data-test="Input"][name="asset-search-field"]', { timeout: 10000 });
    
    // پاک کردن فیلد search و وارد کردن نام ارز
    await page.evaluate(() => {
      const input = document.querySelector('input[data-test="Input"][name="asset-search-field"]');
      if (input) {
        input.value = '';
        input.focus();
      }
    });
    
    await page.type('input[data-test="Input"][name="asset-search-field"]', currencyName);
    logger.info('✅ نام ارز وارد شد');

    // صبر برای لود نتایج
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // استخراج نتایج
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-test="asset-item"]');
      const results = [];
      
      items.forEach(item => {
        try {
          const ticker = item.getAttribute('data-ticker');
          const payoutElement = item.querySelector('[data-test="asset-item-value"]');
          const payout = payoutElement ? payoutElement.textContent.trim() : 'N/A';
          
          if (ticker) {
            results.push({ 
              currency: ticker, 
              payout: payout 
            });
          }
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
    return { status: 'error', message: `Search failed: ${e.message}`, results: [] };
  }
}

app.post('/api/search-currency', async (req, res) => {
  try {
    const { currency } = req.body;
    if (!currency) {
      return res.status(400).json({ status: 'error', message: 'No currency provided', results: [] });
    }
    
    logger.info(`🔍 درخواست جستجوی ارز: ${currency}`);
    const result = await searchCurrency(currency);
    
    logger.info(`✅ نتیجه جستجو: ${JSON.stringify(result)}`);
    res.json(result);
  } catch (e) {
    logger.error(`❌ خطا در API جستجو: ${e.message}`);
    res.status(500).json({ 
      status: 'error', 
      message: `API error: ${e.message}`, 
      results: [] 
    });
  }
});

// تست endpoint
app.post('/api/test', async (req, res) => {
  logger.info('🧪 تست API endpoint');
  res.json({ 
    status: 'success', 
    message: 'API is working!', 
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', async (req, res) => {
  logger.info('🧪 تست GET API endpoint');
  res.json({ 
    status: 'success', 
    message: 'GET API is working!', 
    timestamp: new Date().toISOString()
  });
});

async function main() {
  if (!(await setupBrowser())) {
    logger.error('❌ راه‌اندازی مرورگر ناموفق بود. برنامه متوقف می‌شود.');
    process.exit(1);
  }

  // اجرای سرور Express
  app.listen(3001, '0.0.0.0', () => {
    logger.info('🚀 سرور Express در حال اجرا روی http://localhost:3001');
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
