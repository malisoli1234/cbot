const puppeteerExtra = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const express = require('express');
const app = express();
app.use(express.json());

// تنظیم plugins
puppeteerExtra.use(StealthPlugin());
puppeteerExtra.use(RecaptchaPlugin());

// تنظیمات پروکسی - غیرفعال
const USE_PROXY = false; // process.env.USE_PROXY !== 'false'; // می‌تونید با USE_PROXY=false اجرا کنید
// const proxyList = [
//   // پروکسی‌های HTTP از UAE
//   'http://83.111.75.116:8080',
//   'http://91.73.223.206:8080',
//   'http://86.98.212.37:8080',
//   'http://94.200.195.220:8080',
//   'http://86.98.138.40:8080',
//   'http://89.36.162.121:8080',
//   'http://94.204.235.128:8080',
//   'http://151.243.213.130:8080',
//   'http://2.49.191.123:8080',
//   'http://212.23.217.71:8080',
//   'http://86.98.222.224:8080',
//   'http://31.57.228.216:8080',
//   'http://89.36.162.76:8080',
//   'http://2.50.20.72:8080',
//   'http://2.49.54.61:8080',
//   'http://89.36.162.75:8080',
//   'http://2.49.68.140:8080',
//   'http://139.185.42.86:8080',
//   'http://2.50.143.164:8080',
//   
//   // پروکسی‌های HTTPS از UAE
//   'https://129.151.130.247:8080',
//   'https://93.127.180.78:8080',
//   'https://31.58.51.90:8080',
//   
//   // پروکسی‌های SOCKS5 از UAE
//   'socks5://165.154.241.205:1080',
//   'socks5://85.8.184.212:1080',
//   'socks5://185.198.59.237:1080',
//   'socks5://185.45.194.124:1080',
//   'socks5://85.209.9.247:1080',
//   'socks5://38.180.27.230:1080',
// ];

// let currentProxyIndex = 0;

// تابع تغییر یوزر ایجنت (بدون پروکسی)
async function changeIP() {
  try {
    logger.info('🌐 در حال تغییر یوزر ایجنت...');
    
    // تغییر User-Agent
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);
    
    // تغییر Viewport
    const viewports = [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 1280, height: 720 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
    ];
    
    const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
    await page.setViewport(randomViewport);
    
    logger.info(`✅ یوزر ایجنت تغییر کرد: ${randomUserAgent.substring(0, 50)}...`);
  } catch (e) {
    logger.warn(`⚠️ خطا در تغییر یوزر ایجنت: ${e.message}`);
  }
}

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
        // '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    
    // مرحله 1: تغییر یوزر ایجنت قبل از شروع
    logger.info('🔄 در حال تغییر یوزر ایجنت...');
    try {
      await changeIP();
      logger.info('✅ یوزر ایجنت تغییر کرد');
    } catch (e) {
      logger.warn('⚠️ خطا در تغییر یوزر ایجنت، ادامه می‌دهیم...');
    }
    
    // مرحله 2: رفتن به صفحه اولیمپ ترید
    logger.info('🌐 در حال رفتن به صفحه اولیمپ ترید...');
    
    // تلاش چندین بار برای لود صفحه
    let pageLoaded = false;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!pageLoaded && attempts < maxAttempts) {
      attempts++;
      try {
        logger.info(`🔄 تلاش ${attempts}/${maxAttempts} برای لود صفحه...`);
        await page.goto('https://olymptrade.com/platform', { 
          waitUntil: 'domcontentloaded', 
          timeout: 60000 // افزایش timeout به 60 ثانیه
        });
        logger.info('✅ صفحه اولیمپ ترید لود شد');
        pageLoaded = true;
      } catch (e) {
        logger.warn(`⚠️ تلاش ${attempts} ناموفق: ${e.message}`);
        if (attempts < maxAttempts) {
          logger.info('🔄 تغییر یوزر ایجنت و تلاش مجدد...');
          try {
            await changeIP();
          } catch (e) {
            logger.warn('⚠️ خطا در تغییر یوزر ایجنت، تلاش می‌کنیم...');
          }
          await new Promise(resolve => setTimeout(resolve, 5000)); // صبر 5 ثانیه
        }
      }
    }
    
    if (!pageLoaded) {
      throw new Error(`صفحه بعد از ${maxAttempts} تلاش لود نشد`);
    }
    
    // صبر کردن برای لود کامل صفحه
    await new Promise(resolve => setTimeout(resolve, 3000));
    logger.info('⏳ صبر برای لود کامل صفحه...');
    
    // مرحله 3: کلیک روی دکمه Login
    logger.info('🔍 در حال پیدا کردن دکمه Login...');
    await page.waitForSelector('button[data-test="auth-tab-item"]', { timeout: 30000 });
    await page.click('button[data-test="auth-tab-item"]');
    logger.info('✅ دکمه Login کلیک شد');
    
    // صبر برای لود فرم لاگین
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info('⏳ صبر برای لود فرم لاگین...');
    
    // مرحله 4: وارد کردن یوزرنیم
    logger.info('📝 در حال وارد کردن یوزرنیم...');
    await page.waitForSelector('input[data-test="Input"][name="email"]', { timeout: 30000 });
    await page.type('input[data-test="Input"][name="email"]', 'mmrrssoollii@gmail10p.com');
    logger.info('✅ یوزرنیم وارد شد');
    
    // مرحله 5: وارد کردن پسورد
    logger.info('🔐 در حال وارد کردن پسورد...');
    await page.waitForSelector('input[data-test="Input"][name="password"]', { timeout: 30000 });
    await page.type('input[data-test="Input"][name="password"]', 'mmm123456789');
    logger.info('✅ پسورد وارد شد');
    
    // صبر برای لود کامل فرم
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // مرحله 6: کلیک روی دکمه Log In
    logger.info('🔍 در حال پیدا کردن دکمه Log In...');
    await page.waitForSelector('button[data-test="form-signin-button"]', { timeout: 30000 });
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
    
    // صبر بیشتر برای لود کامل صفحه
    await new Promise(resolve => setTimeout(resolve, 5000));
    logger.info('⏳ صبر اضافی برای لود کامل صفحه...');
    
    // تلاش با selector های مختلف
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
        logger.info(`🔍 تلاش با selector: ${selector}`);
        const element = await page.$(selector);
        if (element) {
          await element.click();
          logger.info(`✅ دکمه Halal Market Axis کلیک شد با selector: ${selector}`);
          clicked = true;
          break;
        } else {
          logger.warn(`⚠️ Element با selector ${selector} پیدا نشد`);
        }
      } catch (e) {
        logger.warn(`⚠️ تلاش با selector ${selector} ناموفق: ${e.message}`);
      }
    }
    
    if (!clicked) {
      // تلاش با JavaScript
      try {
        logger.info('🔍 تلاش با JavaScript...');
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
      // تلاش با کلیک روی هر دکمه‌ای که پیدا بشه
      try {
        logger.info('🔍 تلاش با کلیک روی هر دکمه موجود...');
        const buttons = await page.$$('div[role="button"], button, [data-test*="button"]');
        for (const button of buttons) {
          try {
            await button.click();
            logger.info('✅ دکمه کلیک شد');
            clicked = true;
            break;
          } catch (e) {
            // ادامه
          }
        }
      } catch (e) {
        logger.warn(`⚠️ تلاش با کلیک عمومی ناموفق: ${e.message}`);
      }
    }
    
    if (!clicked) {
      // اسکرین‌شات برای دیباگ
      try {
        await page.screenshot({ path: 'debug-page.png', fullPage: true });
        logger.info('📸 اسکرین‌شات ذخیره شد: debug-page.png');
      } catch (e) {
        logger.warn('⚠️ خطا در اسکرین‌شات');
      }
      
      logger.error('❌ هیچ دکمه‌ای پیدا نشد');
      throw new Error('دکمه Halal Market Axis پیدا نشد');
    }
    
    // صبر برای باز شدن dropdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info('⏳ صبر برای باز شدن dropdown...');
    
    // مرحله 7: صبر برای لود dropdown و پیدا کردن input search
    logger.info('🔍 در حال پیدا کردن dropdown و input search...');
    
    // تلاش با selector های مختلف برای dropdown
    const dropdownSelectors = [
      '[data-test="assets-tabs-dropdown"]',
      '[data-test="asset-select-dropdown"]',
      '.css-1gbgf2c.e1su41ew0',
      '[data-test="asset-select-button"]',
      '[data-test="assets-tabs-tab"]',
      '.css-e5732h.e1r2g46w0',
      'div[role="button"]',
      '[data-test*="dropdown"]',
      '[data-test*="asset"]'
    ];
    
    let dropdownFound = false;
    for (const selector of dropdownSelectors) {
      try {
        logger.info(`🔍 تلاش برای dropdown با selector: ${selector}`);
        const element = await page.$(selector);
        if (element) {
          logger.info(`✅ dropdown پیدا شد با selector: ${selector}`);
          dropdownFound = true;
          break;
        }
      } catch (e) {
        logger.warn(`⚠️ selector ${selector} ناموفق: ${e.message}`);
      }
    }
    
    if (!dropdownFound) {
      logger.warn('⚠️ dropdown پیدا نشد، ادامه می‌دهیم...');
    }
    
    // صبر برای لود کامل صفحه
    await new Promise(resolve => setTimeout(resolve, 3000));
    logger.info('⏳ صبر برای لود کامل صفحه...');
    
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
    
    // تغییر IP برای دور زدن کپچا
    await changeIP();
    
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
    
    // مرحله 1: پیدا کردن input search با selector های مختلف
    logger.info('🔍 در حال پیدا کردن input search...');
    
    const searchSelectors = [
      'input[data-test="Input"][name="asset-search-field"]',
      'input[name="asset-search-field"]',
      'input[data-test="Input"]',
      'input[placeholder="Search"]',
      '.eyxVtLklPL._0-iVLEdBew._1ZFlsEbrKt',
      'input[autocomplete="off"]',
      'input[type="text"]',
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[placeholder*="جستجو"]',
      '.search__field',
      'input.search__field',
      'input[class*="search"]',
      'input[class*="Search"]',
      'input[data-test*="search"]',
      'input[data-test*="Search"]',
      'input[name*="search"]',
      'input[name*="Search"]'
    ];
    
    let searchInput = null;
    for (const selector of searchSelectors) {
      try {
        logger.info(`🔍 تلاش برای input search با selector: ${selector}`);
        searchInput = await page.$(selector);
        if (searchInput) {
          logger.info(`✅ input search پیدا شد با selector: ${selector}`);
          break;
        }
      } catch (e) {
        logger.warn(`⚠️ selector ${selector} ناموفق: ${e.message}`);
      }
    }
    
    if (!searchInput) {
      logger.error('❌ input search پیدا نشد');
      
      // Debug: گرفتن تمام input ها
      const allInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        return Array.from(inputs).map(input => ({
          tagName: input.tagName,
          type: input.type,
          name: input.name,
          placeholder: input.placeholder,
          className: input.className,
          id: input.id,
          'data-test': input.getAttribute('data-test'),
          'data-name': input.getAttribute('data-name')
        }));
      });
      
      logger.error(`🔍 تمام input های موجود: ${JSON.stringify(allInputs, null, 2)}`);
      
      return { 
        status: 'error', 
        message: 'Search input not found', 
        results: [],
        debug: {
          allInputs: allInputs,
          pageTitle: await page.title(),
          url: page.url()
        }
      };
    }
    
    // مرحله 2: پاک کردن فیلد search و وارد کردن نام ارز
    logger.info('📝 در حال وارد کردن نام ارز در فیلد search...');
    
    // کلیک روی input و پاک کردن محتوا
    await searchInput.click();
    await page.evaluate(() => {
      const input = document.querySelector('input[data-test="Input"][name="asset-search-field"], input[name="asset-search-field"], input[placeholder="Search"]');
      if (input) input.value = '';
    });
    
    // تایپ کردن نام ارز
    await page.type('input[data-test="Input"][name="asset-search-field"], input[name="asset-search-field"], input[placeholder="Search"]', currencyName);
    logger.info('✅ نام ارز وارد شد');
    
    // مرحله 3: صبر برای نتایج جستجو
    await new Promise(resolve => setTimeout(resolve, 3000));
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
          
          // پیدا کردن درصد payout از data-test="asset-item-value"
          const payoutElement = item.querySelector('[data-test="asset-item-value"]');
          const payout = payoutElement ? payoutElement.textContent.trim() : 'N/A';
          
          // پیدا کردن عنوان ارز
          const titleElement = item.querySelector('[data-test^="asset-item-title-"]');
          const title = titleElement ? titleElement.textContent.trim() : ticker;
          
          if (ticker) {
            results.push({
              currency: ticker,
              title: title,
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

// تست endpoint
app.post('/api/test', async (req, res) => {
  logger.info('🧪 تست API endpoint');
  res.json({ 
    status: 'success', 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    data: {
      test: 'This is a test response',
      server: 'Olymp Trade API',
      version: '1.0.0'
    }
  });
});

// تست endpoint با GET
app.get('/api/test', async (req, res) => {
  logger.info('🧪 تست GET API endpoint');
  res.json({ 
    status: 'success', 
    message: 'GET API is working!', 
    timestamp: new Date().toISOString(),
    method: 'GET'
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