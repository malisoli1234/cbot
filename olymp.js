/**
 * ماژول اسکرپینگ سایت Olymp Trade با سرور API داخلی
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const express = require('express');

puppeteer.use(StealthPlugin());

class OlympTradeSite {
  constructor() {
    this.name = 'Olymp Trade';
    this.url = 'https://olymptrade.com/platform';
    this.apiPort = 3001;
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
    
    // راه‌اندازی سرور Express داخلی
    this.startApiServer();
  }

  /**
   * راه‌اندازی سرور API داخلی
   */
  startApiServer() {
    const app = express();
    app.use(express.json());

    // تنظیم لاگ‌گیری
    const logger = {
      info: (msg) => console.log(`${new Date().toISOString()} - Olymp Trade API - INFO - ${msg}`),
      error: (msg) => console.error(`${new Date().toISOString()} - Olymp Trade API - ERROR - ${msg}`),
    };

    // API endpoint برای جستجوی ارز
    app.post('/api/search-currency', async (req, res) => {
      try {
        const { currency } = req.body;
        if (!currency) {
          return res.status(400).json({ 
            status: 'error', 
            message: 'No currency provided', 
            results: [] 
          });
        }

        if (!this.isInitialized) {
          return res.status(503).json({ 
            status: 'error', 
            message: 'Olymp Trade not ready', 
            results: [] 
          });
        }

        const result = await this.searchCurrency(currency);
        logger.info(`Search request for ${currency}: ${JSON.stringify(result)}`);
        res.json(result);
      } catch (error) {
        logger.error(`API error: ${error.message}`);
        res.status(500).json({ 
          status: 'error', 
          message: error.message, 
          results: [] 
        });
      }
    });

    // API endpoint برای دریافت وضعیت
    app.get('/api/status', (req, res) => {
      res.json({ 
        status: 'success', 
        message: 'Olymp Trade API is running',
        ready: this.isInitialized
      });
    });

    // راه‌اندازی سرور
    this.apiServer = app.listen(this.apiPort, '0.0.0.0', () => {
      logger.info(`Olymp Trade API server started on port ${this.apiPort}`);
    });
  }

  /**
   * راه‌اندازی سایت
   */
  async setup() {
    try {
      console.log(`🌐 راه‌اندازی سایت ${this.name}...`);
      
      // راه‌اندازی مرورگر
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      this.browser = await puppeteer.launch({
        headless: 'new',
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });
      
      // رفتن به سایت
      await this.page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      console.log(`✅ صفحه ${this.name} لود شد`);
      console.log(`عنوان صفحه: ${await this.page.title()}`);

      // صبر تا وقتی صفحه کاملاً لود بشه
      await this.page.waitForTimeout(5000);
      
      // کلیک روی asset selector
      console.log('🔍 در حال پیدا کردن asset selector...');
      await this.page.waitForSelector('.asset-selector', { timeout: 15000 });
      await this.page.click('.asset-selector');
      console.log('✅ Asset selector کلیک شد.');

      // صبر تا وقتی فیلد جستجو آماده بشه
      await this.page.waitForSelector('.search-input', { timeout: 15000 });
      console.log('✅ فیلد جستجو آماده شد');

      this.isInitialized = true;
      console.log(`✅ سایت ${this.name} آماده شد`);
      return true;
    } catch (error) {
      console.error(`❌ خطا در راه‌اندازی سایت ${this.name}: ${error.message}`);
      return false;
    }
  }

  /**
   * جستجوی ارز در سایت
   * @param {string} currencyName - نام ارز
   * @returns {object} - نتیجه جستجو
   */
  async searchCurrency(currencyName) {
    const startTime = Date.now();
    try {
      console.log(`🔍 در حال جستجوی ارز: ${currencyName}`);
      
      // پاک کردن فیلد جستجو
      await this.page.waitForSelector('.search-input', { timeout: 10000 });
      await this.page.evaluate(() => document.querySelector('.search-input').value = '');
      await this.page.type('.search-input', currencyName);

      // صبر تا وقتی نتایج لود بشن
      await this.page.waitForFunction(
        () => document.querySelectorAll('.asset-item').length > 0,
        { timeout: 10000 }
      );

      // استخراج و فرمت نتایج
      const results = await this.page.evaluate(() => {
        const items = document.querySelectorAll('.asset-item');
        const results = [];
        items.forEach(item => {
          try {
            const name = item.querySelector('.asset-name')?.textContent || 'N/A';
            const payout = item.querySelector('.asset-payout')?.textContent || 'N/A';
            
            // فرمت کردن payout
            const cleanPayout = payout.replace('+', '').replace('%', '');
            
            results.push({
              currency: name,
              payout: cleanPayout,
              originalName: name,
              originalPayout: payout
            });
          } catch (e) {
            console.error(`❌ خطا در استخراج آیتم: ${e.message}`);
          }
        });
        return results;
      });

      const duration = Date.now() - startTime;
      if (results.length === 0) {
        console.log(`❌ ارز ${currencyName} پیدا نشد. (زمان: ${duration}ms)`);
        return {
          status: 'success',
          message: `Currency ${currencyName} not found`,
          results: []
        };
      }

      console.log(`✅ ارز ${currencyName} جستجو شد. نتایج: ${JSON.stringify(results)} (زمان: ${duration}ms)`);
      return {
        status: 'success',
        message: `Currency ${currencyName} searched`,
        results
      };
    } catch (e) {
      const duration = Date.now() - startTime;
      console.error(`❌ خطا در جستجوی ارز ${currencyName}: ${e.message} (زمان: ${duration}ms)`);
      return {
        status: 'error',
        message: `Search failed: ${e.message}`,
        results: []
      };
    }
  }

  /**
   * بستن سرور API و مرورگر
   */
  async close() {
    if (this.apiServer) {
      this.apiServer.close();
      console.log('Olymp Trade API server closed');
    }
    if (this.browser) {
      await this.browser.close();
      console.log('Olymp Trade browser closed');
    }
  }
}

// اجرای مستقیم
const olymp = new OlympTradeSite();

async function main() {
  try {
    console.log('🚀 راه‌اندازی Olymp Trade...');
    await olymp.setup();
    
    console.log('✅ Olymp Trade آماده شد!');
    console.log('🌐 API در حال اجرا روی http://localhost:3001');
    
    // نگه داشتن برنامه
    process.on('SIGINT', async () => {
      console.log('\n🛑 بستن Olymp Trade...');
      await olymp.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
    await olymp.close();
  }
}

main().catch(console.error); 
 * ماژول اسکرپینگ سایت Olymp Trade با سرور API داخلی
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const express = require('express');

puppeteer.use(StealthPlugin());

class OlympTradeSite {
  constructor() {
    this.name = 'Olymp Trade';
    this.url = 'https://olymptrade.com/platform';
    this.apiPort = 3001;
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
    
    // راه‌اندازی سرور Express داخلی
    this.startApiServer();
  }

  /**
   * راه‌اندازی سرور API داخلی
   */
  startApiServer() {
    const app = express();
    app.use(express.json());

    // تنظیم لاگ‌گیری
    const logger = {
      info: (msg) => console.log(`${new Date().toISOString()} - Olymp Trade API - INFO - ${msg}`),
      error: (msg) => console.error(`${new Date().toISOString()} - Olymp Trade API - ERROR - ${msg}`),
    };

    // API endpoint برای جستجوی ارز
    app.post('/api/search-currency', async (req, res) => {
      try {
        const { currency } = req.body;
        if (!currency) {
          return res.status(400).json({ 
            status: 'error', 
            message: 'No currency provided', 
            results: [] 
          });
        }

        if (!this.isInitialized) {
          return res.status(503).json({ 
            status: 'error', 
            message: 'Olymp Trade not ready', 
            results: [] 
          });
        }

        const result = await this.searchCurrency(currency);
        logger.info(`Search request for ${currency}: ${JSON.stringify(result)}`);
        res.json(result);
      } catch (error) {
        logger.error(`API error: ${error.message}`);
        res.status(500).json({ 
          status: 'error', 
          message: error.message, 
          results: [] 
        });
      }
    });

    // API endpoint برای دریافت وضعیت
    app.get('/api/status', (req, res) => {
      res.json({ 
        status: 'success', 
        message: 'Olymp Trade API is running',
        ready: this.isInitialized
      });
    });

    // راه‌اندازی سرور
    this.apiServer = app.listen(this.apiPort, '0.0.0.0', () => {
      logger.info(`Olymp Trade API server started on port ${this.apiPort}`);
    });
  }

  /**
   * راه‌اندازی سایت
   */
  async setup() {
    try {
      console.log(`🌐 راه‌اندازی سایت ${this.name}...`);
      
      // راه‌اندازی مرورگر
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      this.browser = await puppeteer.launch({
        headless: 'new',
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });
      
      // رفتن به سایت
      await this.page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      console.log(`✅ صفحه ${this.name} لود شد`);
      console.log(`عنوان صفحه: ${await this.page.title()}`);

      // صبر تا وقتی صفحه کاملاً لود بشه
      await this.page.waitForTimeout(5000);
      
      // کلیک روی asset selector
      console.log('🔍 در حال پیدا کردن asset selector...');
      await this.page.waitForSelector('.asset-selector', { timeout: 15000 });
      await this.page.click('.asset-selector');
      console.log('✅ Asset selector کلیک شد.');

      // صبر تا وقتی فیلد جستجو آماده بشه
      await this.page.waitForSelector('.search-input', { timeout: 15000 });
      console.log('✅ فیلد جستجو آماده شد');

      this.isInitialized = true;
      console.log(`✅ سایت ${this.name} آماده شد`);
      return true;
    } catch (error) {
      console.error(`❌ خطا در راه‌اندازی سایت ${this.name}: ${error.message}`);
      return false;
    }
  }

  /**
   * جستجوی ارز در سایت
   * @param {string} currencyName - نام ارز
   * @returns {object} - نتیجه جستجو
   */
  async searchCurrency(currencyName) {
    const startTime = Date.now();
    try {
      console.log(`🔍 در حال جستجوی ارز: ${currencyName}`);
      
      // پاک کردن فیلد جستجو
      await this.page.waitForSelector('.search-input', { timeout: 10000 });
      await this.page.evaluate(() => document.querySelector('.search-input').value = '');
      await this.page.type('.search-input', currencyName);

      // صبر تا وقتی نتایج لود بشن
      await this.page.waitForFunction(
        () => document.querySelectorAll('.asset-item').length > 0,
        { timeout: 10000 }
      );

      // استخراج و فرمت نتایج
      const results = await this.page.evaluate(() => {
        const items = document.querySelectorAll('.asset-item');
        const results = [];
        items.forEach(item => {
          try {
            const name = item.querySelector('.asset-name')?.textContent || 'N/A';
            const payout = item.querySelector('.asset-payout')?.textContent || 'N/A';
            
            // فرمت کردن payout
            const cleanPayout = payout.replace('+', '').replace('%', '');
            
            results.push({
              currency: name,
              payout: cleanPayout,
              originalName: name,
              originalPayout: payout
            });
          } catch (e) {
            console.error(`❌ خطا در استخراج آیتم: ${e.message}`);
          }
        });
        return results;
      });

      const duration = Date.now() - startTime;
      if (results.length === 0) {
        console.log(`❌ ارز ${currencyName} پیدا نشد. (زمان: ${duration}ms)`);
        return {
          status: 'success',
          message: `Currency ${currencyName} not found`,
          results: []
        };
      }

      console.log(`✅ ارز ${currencyName} جستجو شد. نتایج: ${JSON.stringify(results)} (زمان: ${duration}ms)`);
      return {
        status: 'success',
        message: `Currency ${currencyName} searched`,
        results
      };
    } catch (e) {
      const duration = Date.now() - startTime;
      console.error(`❌ خطا در جستجوی ارز ${currencyName}: ${e.message} (زمان: ${duration}ms)`);
      return {
        status: 'error',
        message: `Search failed: ${e.message}`,
        results: []
      };
    }
  }

  /**
   * بستن سرور API و مرورگر
   */
  async close() {
    if (this.apiServer) {
      this.apiServer.close();
      console.log('Olymp Trade API server closed');
    }
    if (this.browser) {
      await this.browser.close();
      console.log('Olymp Trade browser closed');
    }
  }
}

// اجرای مستقیم
const olymp = new OlympTradeSite();

async function main() {
  try {
    console.log('🚀 راه‌اندازی Olymp Trade...');
    await olymp.setup();
    
    console.log('✅ Olymp Trade آماده شد!');
    console.log('🌐 API در حال اجرا روی http://localhost:3001');
    
    // نگه داشتن برنامه
    process.on('SIGINT', async () => {
      console.log('\n🛑 بستن Olymp Trade...');
      await olymp.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
    await olymp.close();
  }
}

main().catch(console.error); 
 
 