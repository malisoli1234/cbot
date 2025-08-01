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
async function changeIP(page = null) {
  const targetPage = page || global.page;
  if (!targetPage) {
    throw new Error('Page object is required');
  }
  try {
    logger.info('🌐 در حال تغییر یوزر ایجنت...');
    
    // تغییر User-Agent - لیست گسترده‌تر با رندوم‌سازی بهتر
    const userAgents = [
      // Chrome Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      
      // Chrome Mac
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      
      // Chrome Linux
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      
      // Firefox Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:117.0) Gecko/20100101 Firefox/117.0',
      
      // Firefox Mac
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:118.0) Gecko/20100101 Firefox/118.0',
      
      // Firefox Linux
      'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0',
      
      // Safari Mac
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
      
      // Edge Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
      
      // Edge Mac
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      
      // Opera Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
      
      // Opera Mac
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
      
      // Mobile Chrome Android
      'Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 11; OnePlus 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      
      // Mobile Safari iOS
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    ];
    
    // رندوم‌سازی بهتر با استفاده از timestamp و Math.random
    const timestamp = Date.now();
    const randomSeed = (timestamp % 1000000) + Math.random();
    const randomIndex = Math.floor(randomSeed % userAgents.length);
    const randomUserAgent = userAgents[randomIndex];
    
    await targetPage.setUserAgent(randomUserAgent);
    
    // تغییر Viewport - گسترده‌تر با رندوم‌سازی بهتر
    const viewports = [
      // Desktop resolutions
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 },
      { width: 1600, height: 900 },
      { width: 1680, height: 1050 },
      { width: 1920, height: 1200 },
      { width: 2560, height: 1440 },
      { width: 3840, height: 2160 },
      
      // Laptop resolutions
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1600, height: 900 },
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
      
      // Tablet resolutions
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 820, height: 1180 },
      { width: 1180, height: 820 },
      
      // Mobile resolutions
      { width: 375, height: 667 },
      { width: 414, height: 896 },
      { width: 390, height: 844 },
      { width: 428, height: 926 },
      { width: 360, height: 640 },
      { width: 412, height: 915 },
    ];
    
    const viewportSeed = (timestamp % 1000000) + Math.random() * 1000;
    const viewportIndex = Math.floor(viewportSeed % viewports.length);
    const randomViewport = viewports[viewportIndex];
    
    await targetPage.setViewport(randomViewport);
    
    // تغییر زبان و locale به صورت رندوم
    const languages = ['en-US', 'en-GB', 'en-CA', 'en-AU', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN', 'ar-SA', 'ru-RU'];
    const randomLang = languages[Math.floor((timestamp % 1000000 + Math.random() * 1000) % languages.length)];
    
    await targetPage.setExtraHTTPHeaders({
      'Accept-Language': `${randomLang},${randomLang.split('-')[0]};q=0.9,en;q=0.8`,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    
    logger.info(`✅ یوزر ایجنت تغییر کرد: ${randomUserAgent.substring(0, 50)}...`);
    logger.info(`✅ Viewport تنظیم شد: ${randomViewport.width}x${randomViewport.height}`);
    logger.info(`✅ زبان تنظیم شد: ${randomLang}`);
  } catch (e) {
    logger.warn(`⚠️ خطا در تغییر یوزر ایجنت: ${e.message}`);
  }
}

// تابع شروع تغییر خودکار یوزر ایجنت
function startAutoUserAgentChange() {
  if (userAgentInterval) {
    clearInterval(userAgentInterval);
  }
  
  // تغییر یوزر ایجنت هر 5-15 دقیقه به صورت رندوم
  const minInterval = 5 * 60 * 1000; // 5 دقیقه
  const maxInterval = 15 * 60 * 1000; // 15 دقیقه
  
  const changeUserAgent = async () => {
    try {
      await changeIP();
      
      // تنظیم فاصله زمانی بعدی به صورت رندوم
      const nextInterval = Math.floor(Math.random() * (maxInterval - minInterval)) + minInterval;
      userAgentInterval = setTimeout(changeUserAgent, nextInterval);
      
      logger.info(`🔄 یوزر ایجنت بعدی در ${Math.round(nextInterval / 60000)} دقیقه تغییر خواهد کرد`);
    } catch (e) {
      logger.warn(`⚠️ خطا در تغییر خودکار یوزر ایجنت: ${e.message}`);
      // تلاش مجدد بعد از 2 دقیقه
      userAgentInterval = setTimeout(changeUserAgent, 2 * 60 * 1000);
    }
  };
  
  // شروع اولین تغییر
  const firstInterval = Math.floor(Math.random() * (maxInterval - minInterval)) + minInterval;
  userAgentInterval = setTimeout(changeUserAgent, firstInterval);
  logger.info(`🔄 تغییر خودکار یوزر ایجنت شروع شد. اولین تغییر در ${Math.round(firstInterval / 60000)} دقیقه`);
}

// تابع توقف تغییر خودکار یوزر ایجنت
function stopAutoUserAgentChange() {
  if (userAgentInterval) {
    clearInterval(userAgentInterval);
    userAgentInterval = null;
    logger.info('🛑 تغییر خودکار یوزر ایجنت متوقف شد');
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
let userAgentInterval = null; // برای تغییر خودکار یوزر ایجنت

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
    
    // شروع تغییر خودکار یوزر ایجنت
    startAutoUserAgentChange();
    
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

async function searchCurrency(currencyName, page = null) {
  const targetPage = page || global.page;
  if (!targetPage) {
    throw new Error('Page object is required');
  }
  const startTime = Date.now();
  try {
    logger.info(`🔍 در حال جستجوی ارز: ${currencyName}`);
    
    // صبر برای آماده شدن input search
    await targetPage.waitForSelector('input[data-test="Input"][name="asset-search-field"]', { timeout: 5000 });
    
    // پاک کردن فیلد search و وارد کردن نام ارز
    await targetPage.evaluate(() => document.querySelector('input[data-test="Input"][name="asset-search-field"]').value = '');
    await targetPage.type('input[data-test="Input"][name="asset-search-field"]', currencyName);
    logger.info('✅ نام ارز وارد شد');

    // صبر تا وقتی حداقل یه آیتم لود بشه یا تایم‌اوت
    await targetPage.waitForFunction(
      () => document.querySelector('[data-test="asset-item"]') !== null,
      { timeout: 5000 }
    );

    // استخراج و فرمت نتایج
    const results = await targetPage.evaluate(() => {
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

// endpoint برای تغییر دستی یوزر ایجنت
app.post('/api/change-user-agent', async (req, res) => {
  try {
    logger.info('🔄 درخواست تغییر دستی یوزر ایجنت...');
    await changeIP();
    res.json({ 
      status: 'success', 
      message: 'User agent changed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    logger.error(`❌ خطا در تغییر دستی یوزر ایجنت: ${e.message}`);
    res.status(500).json({ 
      status: 'error', 
      message: `Failed to change user agent: ${e.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// endpoint برای شروع تغییر خودکار یوزر ایجنت
app.post('/api/start-auto-user-agent', async (req, res) => {
  try {
    logger.info('🔄 درخواست شروع تغییر خودکار یوزر ایجنت...');
    startAutoUserAgentChange();
    res.json({ 
      status: 'success', 
      message: 'Auto user agent change started',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    logger.error(`❌ خطا در شروع تغییر خودکار یوزر ایجنت: ${e.message}`);
    res.status(500).json({ 
      status: 'error', 
      message: `Failed to start auto user agent change: ${e.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// endpoint برای توقف تغییر خودکار یوزر ایجنت
app.post('/api/stop-auto-user-agent', async (req, res) => {
  try {
    logger.info('🛑 درخواست توقف تغییر خودکار یوزر ایجنت...');
    stopAutoUserAgentChange();
    res.json({ 
      status: 'success', 
      message: 'Auto user agent change stopped',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    logger.error(`❌ خطا در توقف تغییر خودکار یوزر ایجنت: ${e.message}`);
    res.status(500).json({ 
      status: 'error', 
      message: `Failed to stop auto user agent change: ${e.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// endpoint برای دریافت وضعیت فعلی یوزر ایجنت
app.get('/api/user-agent-status', async (req, res) => {
  try {
    const userAgent = await page.evaluate(() => navigator.userAgent);
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    
    res.json({ 
      status: 'success', 
      userAgent: userAgent,
      viewport: viewport,
      autoChangeActive: userAgentInterval !== null,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    logger.error(`❌ خطا در دریافت وضعیت یوزر ایجنت: ${e.message}`);
    res.status(500).json({ 
      status: 'error', 
      message: `Failed to get user agent status: ${e.message}`,
      timestamp: new Date().toISOString()
    });
  }
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
    
    // توقف تغییر خودکار یوزر ایجنت
    stopAutoUserAgentChange();
    
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