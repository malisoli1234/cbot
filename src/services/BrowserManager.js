/**
 * مدیریت مرورگر Puppeteer
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

// استفاده از StealthPlugin برای مخفی کردن bot
puppeteer.use(StealthPlugin());

class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * پیدا کردن مسیر Chrome
   * @returns {string|null} - مسیر Chrome
   */
  findChromePath() {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
      process.env.CHROME_PATH
    ];

    for (const chromePath of possiblePaths) {
      if (chromePath && fs.existsSync(chromePath)) {
        console.log(`✅ Chrome پیدا شد در: ${chromePath}`);
        return chromePath;
      }
    }

    console.log('⚠️ Chrome در مسیرهای معمول پیدا نشد');
    return null;
  }

  /**
   * راه‌اندازی مرورگر
   * @returns {boolean} - نتیجه راه‌اندازی
   */
  async initialize() {
    try {
      console.log('راه‌اندازی مرورگر...');
      
      const chromePath = this.findChromePath();
                        const launchOptions = {
                    headless: 'new',
                    args: [
                      '--no-sandbox',
                      '--disable-dev-shm-usage',
                      '--enable-webgl',
                      '--ignore-gpu-blacklist',
                      '--disable-gpu-driver-bug-workarounds',
                      '--disable-accelerated-2d-canvas',
                      '--blink-settings=imagesEnabled=false',
                      '--disable-extensions',
                      '--disable-logging',
                      '--disable-default-apps',
                      '--disable-background-timer-throttling',
                      '--disable-backgrounding-occluded-windows',
                      '--disable-renderer-backgrounding',
                      '--disable-features=TranslateUI',
                      '--disable-ipc-flooding-protection',
                      '--log-level=3',
                      '--silent-launch',
                      '--disable-web-security',
                      '--disable-features=VizDisplayCompositor',
                      '--disable-dev-shm-usage',
                      '--disable-setuid-sandbox',
                      '--no-first-run',
                      '--no-default-browser-check',
                      '--disable-background-networking',
                      '--disable-sync',
                      '--disable-translate',
                      '--hide-scrollbars',
                      '--mute-audio',
                      '--no-zygote',
                      '--disable-background-timer-throttling',
                      '--disable-renderer-backgrounding',
                      '--disable-backgrounding-occluded-windows',
                      '--disable-ipc-flooding-protection',
                      '--disable-features=TranslateUI',
                      '--disable-logging',
                      '--log-level=3',
                      '--silent-launch',
                      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    ],
                  };

      // اگر Chrome پیدا شد، از اون استفاده کن
      if (chromePath) {
        launchOptions.executablePath = chromePath;
        console.log(`🌐 استفاده از Chrome در: ${chromePath}`);
      } else {
        console.log('🌐 استفاده از Chrome پیش‌فرض Puppeteer');
        // حذف executablePath تا از Chrome پیش‌فرض استفاده کنه
        delete launchOptions.executablePath;
      }

      this.browser = await puppeteer.launch(launchOptions);

      console.log('✅ مرورگر راه‌اندازی شد');
      return true;
    } catch (error) {
      console.error(`❌ خطا در راه‌اندازی مرورگر: ${error.message}`);
      
      // اگر Chrome پیدا نشد، سعی کن بدون headless اجرا کن
      if (error.message.includes('Could not find Chrome') || error.message.includes('Timed out')) {
        console.log('🔄 تلاش برای راه‌اندازی بدون headless...');
        try {
                                this.browser = await puppeteer.launch({
                        headless: false,
                        args: [
                          '--no-sandbox',
                          '--disable-gpu',
                          '--disable-dev-shm-usage',
                          '--disable-logging',
                          '--log-level=3',
                          '--silent-launch',
                        ],
                      });
          console.log('✅ مرورگر بدون headless راه‌اندازی شد');
          return true;
        } catch (retryError) {
          console.error(`❌ خطا در راه‌اندازی بدون headless: ${retryError.message}`);
          return false;
        }
      }
      
      return false;
    }
  }

  /**
   * ایجاد صفحه جدید
   * @returns {object} - صفحه Puppeteer
   */
  async createPage() {
    try {
      if (!this.browser) {
        throw new Error('مرورگر راه‌اندازی نشده است');
      }

      this.page = await this.browser.newPage();
      
      // تنظیم request interception
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // تنظیم viewport
      await this.page.setViewport({ width: 1280, height: 720 });
      
      console.log('✅ صفحه جدید ایجاد شد');
      return this.page;
    } catch (error) {
      console.error(`❌ خطا در ایجاد صفحه: ${error.message}`);
      throw error;
    }
  }

  /**
   * بستن مرورگر
   */
  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        console.log('✅ مرورگر بسته شد');
      }
    } catch (error) {
      console.error(`❌ خطا در بستن مرورگر: ${error.message}`);
    }
  }

  /**
   * دریافت صفحه فعلی
   * @returns {object} - صفحه Puppeteer
   */
  getPage() {
    return this.page;
  }

  /**
   * دریافت مرورگر فعلی
   * @returns {object} - مرورگر Puppeteer
   */
  getBrowser() {
    return this.browser;
  }

  /**
   * بررسی آماده بودن مرورگر
   * @returns {boolean} - آیا مرورگر آماده است
   */
  isReady() {
    return this.browser !== null && this.page !== null;
  }
}

module.exports = BrowserManager; 