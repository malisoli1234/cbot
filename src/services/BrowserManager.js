const puppeteer = require('puppeteer');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.pages = new Map();
  }

  async initialize() {
    try {
      console.log('🚀 راه‌اندازی مرورگر...');
      
      // تلاش برای استفاده از Chrome موجود
      const chromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.CHROME_PATH
      ].filter(Boolean);

      let browser = null;
      let lastError = null;

      for (const chromePath of chromePaths) {
        try {
          browser = await puppeteer.launch({
            headless: 'new',
            executablePath: chromePath,
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
          console.log(`✅ مرورگر با استفاده از ${chromePath} راه‌اندازی شد`);
          break;
        } catch (error) {
          lastError = error;
          console.log(`❌ خطا در استفاده از ${chromePath}: ${error.message}`);
        }
      }

      if (!browser) {
        // تلاش بدون executablePath
        try {
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
          console.log('✅ مرورگر با موفقیت راه‌اندازی شد');
        } catch (error) {
          console.error('❌ خطا در راه‌اندازی مرورگر:', error.message);
          throw lastError || error;
        }
      }

      this.browser = browser;
      return true;
    } catch (error) {
      console.error(`❌ خطا در راه‌اندازی مرورگر: ${error.message}`);
      return false;
    }
  }

  async createPage(siteKey) {
    try {
      const page = await this.browser.newPage();
      
      // تنظیم request interception
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.setViewport({ width: 1280, height: 720 });
      this.pages.set(siteKey, page);
      return page;
    } catch (error) {
      console.error(`❌ خطا در ایجاد صفحه برای ${siteKey}: ${error.message}`);
      return null;
    }
  }

  async getPage(siteKey) {
    if (!this.pages.has(siteKey)) {
      return await this.createPage(siteKey);
    }
    return this.pages.get(siteKey);
  }

  async closePage(siteKey) {
    const page = this.pages.get(siteKey);
    if (page) {
      await page.close();
      this.pages.delete(siteKey);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.pages.clear();
    }
  }
}

module.exports = BrowserManager; 