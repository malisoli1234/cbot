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
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // پروکسی (اختیاری - اگر پروکسی دارید)
        // '--proxy-server=http://your-proxy:port',
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
    
    // مرحله 1: رفتن به صفحه اولیمپ ترید
    logger.info('🌐 در حال رفتن به صفحه اولیمپ ترید...');
    await page.goto('https://olymptrade.com/platform', { waitUntil: 'domcontentloaded', timeout: 30000 });
    logger.info('✅ صفحه اولیمپ ترید لود شد');
    
    // صبر کردن برای لود کامل صفحه
    await new Promise(resolve => setTimeout(resolve, 3000));
    logger.info('⏳ صبر برای لود کامل صفحه...');
    
    // مرحله 2: کلیک روی دکمه Login
    logger.info('🔍 در حال پیدا کردن دکمه Login...');
    await page.waitForSelector('button[data-test="auth-tab-item"]', { timeout: 15000 });
    await page.click('button[data-test="auth-tab-item"]');
    logger.info('✅ دکمه Login کلیک شد');
    
    // صبر برای لود فرم لاگین
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info('⏳ صبر برای لود فرم لاگین...');
    
    // مرحله 3: وارد کردن یوزرنیم
    logger.info('📝 در حال وارد کردن یوزرنیم...');
    await page.waitForSelector('input[data-test="Input"][name="email"]', { timeout: 15000 });
    await page.type('input[data-test="Input"][name="email"]', 'mmrrssoollii@gmail10p.com');
    logger.info('✅ یوزرنیم وارد شد');
    
    // مرحله 4: وارد کردن پسورد
    logger.info('🔐 در حال وارد کردن پسورد...');
    await page.waitForSelector('input[data-test="Input"][name="password"]', { timeout: 15000 });
    await page.type('input[data-test="Input"][name="password"]', 'mmm123456789');
    logger.info('✅ پسورد وارد شد');
    
    // صبر برای لود کامل فرم
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // مرحله 5: کلیک روی دکمه Log In
    logger.info('🔍 در حال پیدا کردن دکمه Log In...');
    await page.waitForSelector('button[data-test="form-signin-button"]', { timeout: 15000 });
    await page.click('button[data-test="form-signin-button"]');
    logger.info('✅ دکمه Log In کلیک شد');
    
    // صبر برای پردازش لاگین
    await new Promise(resolve => setTimeout(resolve, 3000));
    logger.info('⏳ صبر برای پردازش لاگین...');
    
    // چک کردن کپچا
    const captchaExists = await page.$('iframe[src*="recaptcha"], .g-recaptcha, [data-test*="captcha"]');
    if (captchaExists) {
      logger.warn('⚠️ کپچا تشخیص داده شد! تلاش برای حل...');
      await solveCaptcha();
    }
    
    // صبر برای لاگین موفق و رفتن به صفحه اصلی
    logger.info('⏳ منتظر لاگین موفق...');
    await page.waitForFunction(() => {
      return window.location.href.includes('/platform') && 
             !document.querySelector('button[data-test="form-signin-button"]');
    }, { timeout: 30000 });
    logger.info('✅ لاگین موفق - وارد صفحه اصلی شدیم');
    
    // صبر برای لود کامل صفحه اصلی
    await new Promise(resolve => setTimeout(resolve, 3000));
    logger.info('⏳ صبر برای لود کامل صفحه اصلی...');
    
    // مرحله 6: کلیک روی دکمه Halal Market Axis
    logger.info('🔍 در حال پیدا کردن دکمه Halal Market Axis...');
    await page.waitForSelector('[data-test="asset-select-button-HMA_X/ftt"], [data-test="assets-tabs-tab-selected"]', { timeout: 15000 });
    
    // تلاش با selector های مختلف
    const selectors = [
      '[data-test="asset-select-button-HMA_X/ftt"]',
      '[data-test="assets-tabs-tab-selected"]',
      '.css-e5732h.e1r2g46w0',
      'div[role="button"][data-test="assets-tabs-tab-selected"]'
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
        logger.warn(`⚠️ تلاش با selector ${selector} ناموفق: ${e.message}`);
      }
    }
    
    if (!clicked) {
      throw new Error('دکمه Halal Market Axis پیدا نشد');
    }
    
    // صبر برای باز شدن dropdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info('⏳ صبر برای باز شدن dropdown...');
    
    // مرحله 7: صبر برای لود dropdown و پیدا کردن input search
    logger.info('🔍 در حال پیدا کردن dropdown و input search...');
    await page.waitForSelector('[data-test="assets-tabs-dropdown"]', { timeout: 15000 });
    logger.info('✅ dropdown باز شد');
    
    return true;
  } catch (e) {
    logger.error(`❌ خطا در راه‌اندازی مرورگر: ${e.message}`);
    return false;
  }
}

// تابع حل کپچا
async function solveCaptcha() {
  try {
    logger.info('🔍 در حال حل کپچا...');
    
    // پنهان کردن webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    
    // استفاده از puppeteer-extra-plugin-recaptcha
    const recaptchaExists = await page.$('iframe[src*="recaptcha"], .g-recaptcha');
    const hcaptchaExists = await page.$('iframe[src*="hcaptcha"], .h-captcha');
    const turnstileExists = await page.$('iframe[src*="turnstile"], .cf-turnstile');
    
    if (recaptchaExists) {
      logger.info('🔍 تشخیص reCAPTCHA - تلاش برای حل خودکار...');
      try {
        // تلاش برای حل reCAPTCHA با روش‌های مختلف
        await page.solveRecaptchas();
        logger.info('✅ reCAPTCHA حل شد');
      } catch (e) {
        logger.warn('⚠️ حل خودکار reCAPTCHA ناموفق - تلاش با روش دستی...');
        
        // تلاش برای حل دستی با کلیک روی checkbox
        try {
          const frame = page.frames().find(frame => frame.url().includes('recaptcha'));
          if (frame) {
            const checkbox = await frame.$('.recaptcha-checkbox-border');
            if (checkbox) {
              await checkbox.click();
              logger.info('✅ reCAPTCHA checkbox کلیک شد');
            }
          }
        } catch (clickError) {
          logger.warn('⚠️ کلیک روی checkbox ناموفق');
        }
        
        // صبر برای حل
        await page.waitForFunction(() => {
          return !document.querySelector('iframe[src*="recaptcha"]') || 
                 document.querySelector('.g-recaptcha-response')?.value;
        }, { timeout: 90000 }); // 90 ثانیه صبر
      }
    } else if (hcaptchaExists) {
      logger.info('🔍 تشخیص hCaptcha - منتظر حل دستی...');
      await page.waitForFunction(() => {
        return !document.querySelector('iframe[src*="hcaptcha"]') || 
               document.querySelector('.h-captcha-response')?.value;
      }, { timeout: 90000 });
    } else if (turnstileExists) {
      logger.info('🔍 تشخیص Turnstile - منتظر حل دستی...');
      await page.waitForFunction(() => {
        return !document.querySelector('iframe[src*="turnstile"]') || 
               document.querySelector('.cf-turnstile-response')?.value;
      }, { timeout: 90000 });
    } else {
      logger.info('⏳ منتظر حل دستی کپچا...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // 60 ثانیه صبر
    }
    
    logger.info('✅ کپچا حل شد');
    
    // کلیک مجدد روی دکمه لاگین
    await page.click('button[data-test="form-signin-button"]');
    logger.info('✅ دکمه لاگین مجدداً کلیک شد');
    
  } catch (e) {
    logger.error(`❌ خطا در حل کپچا: ${e.message}`);
    throw e;
  }
}

async function searchCurrency(currencyName) {
  const startTime = Date.now();
  try {
    logger.info(`🔍 در حال جستجوی ارز: ${currencyName}`);
    
    // مرحله 1: پیدا کردن input search
    logger.info('🔍 در حال پیدا کردن input search...');
    await page.waitForSelector('input[data-test="Input"][name="asset-search-field"]', { timeout: 15000 });
    
    // مرحله 2: پاک کردن فیلد search و وارد کردن نام ارز
    logger.info('📝 در حال وارد کردن نام ارز در فیلد search...');
    await page.evaluate(() => document.querySelector('input[data-test="Input"][name="asset-search-field"]').value = '');
    await page.type('input[data-test="Input"][name="asset-search-field"]', currencyName);
    logger.info('✅ نام ارز وارد شد');
    
    // مرحله 3: صبر برای نتایج جستجو
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info('⏳ صبر برای نتایج جستجو...');
    
    // مرحله 4: استخراج نتایج جستجو
    logger.info('📊 در حال استخراج نتایج جستجو...');
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-test="asset-item"]');
      const results = [];
      
      items.forEach(item => {
        try {
          const ticker = item.getAttribute('data-ticker');
          const icon = item.querySelector('img[data-test^="asset-item-icon-"]')?.src;
          
          // پیدا کردن درصد payout (اگر وجود داشته باشد)
          const payoutElement = item.querySelector('[data-test*="payout"], [data-test*="percentage"]');
          const payout = payoutElement ? payoutElement.textContent.trim() : 'N/A';
          
          if (ticker) {
            results.push({
              currency: ticker,
              payout: payout,
              icon: icon
            });
          }
        } catch (e) {
          console.error(`❌ خطا در استخراج آیتم: ${e.message}`);
        }
      });
      
      return results;
    });
    
    const duration = Date.now() - startTime;
    logger.info(`✅ ارز ${currencyName} جستجو شد. نتایج: ${JSON.stringify(results)} (زمان: ${duration}ms)`);
    return { status: 'success', message: `Currency ${currencyName} searched`, results };
  } catch (e) {
    const duration = Date.now() - startTime;
    logger.error(`❌ خطا در جستجوی ارز ${currencyName}: ${e.message} (زمان: ${duration}ms)`);
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