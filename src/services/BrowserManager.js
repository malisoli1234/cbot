/**
 * مدیریت مرورگر Puppeteer
 */

const puppeteer = require('puppeteer');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * راه‌اندازی مرورگر
   * @returns {boolean} - نتیجه راه‌اندازی
   */
  async initialize() {
    try {
      console.log('راه‌اندازی مرورگر...');
      
      this.browser = await puppeteer.launch({
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

      console.log('✅ مرورگر راه‌اندازی شد');
      return true;
    } catch (error) {
      console.error(`❌ خطا در راه‌اندازی مرورگر: ${error.message}`);
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