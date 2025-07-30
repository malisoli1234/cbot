/**
 * ماژول اسکرپینگ سایت Olymp Trade
 */

const BaseSite = require('./BaseSite');

class OlympTradeSite extends BaseSite {
  constructor() {
    const selectors = {
      searchField: '.search-input, input[placeholder*="search"], input[placeholder*="جستجو"]',
      resultsContainer: '.assets-list, .instruments-list, .pairs-list',
      currencyLabel: '.asset-name, .pair-name, .instrument-name',
      payoutLabel: '.payout, .profit, .percentage',
      acceptCookies: '.accept-cookies, .cookie-accept, [data-testid="cookie-accept"]',
      closePopup: '.close-popup, .modal-close, [data-testid="close"]',
      demoButton: '.demo-button, .try-demo, [data-testid="demo"]'
    };

    const setupSteps = [
      { action: 'waitForSelector', selector: 'body', timeout: 10000 },
      { action: 'wait', delay: 2000 }, // صبر برای لود کامل صفحه
      { action: 'click', selector: '.accept-cookies, .cookie-accept', optional: true },
      { action: 'click', selector: '.close-popup, .modal-close', optional: true },
      { action: 'waitForSelector', selector: '.search-input, input[placeholder*="search"]', timeout: 10000 }
    ];

    super('Olymp Trade', 'https://olymptrade.com/', selectors, setupSteps);
  }

  /**
   * راه‌اندازی سایت
   * @param {object} page - صفحه Puppeteer
   * @returns {boolean} - نتیجه راه‌اندازی
   */
  async setup(page) {
    try {
      console.log(`🌐 راه‌اندازی سایت ${this.name}...`);
      console.log(`📍 URL: ${this.url}`);
      
      // اضافه کردن event listener برای response ها
      page.on('response', (response) => {
        console.log(`📡 Response: ${response.status()} ${response.url()}`);
      });

      page.on('requestfailed', (request) => {
        console.log(`❌ Request failed: ${request.url()} - ${request.failure().errorText}`);
      });

      // رفتن به صفحه اصلی
      console.log('🔄 در حال رفتن به صفحه اصلی...');
      const response = await page.goto(this.url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      console.log(`✅ صفحه ${this.name} لود شد`);
      console.log(`📄 عنوان صفحه: ${await page.title()}`);
      console.log(`🔗 URL نهایی: ${page.url()}`);
      console.log(`📊 Status Code: ${response?.status()}`);
      
      // چک کردن redirect
      if (page.url() !== this.url) {
        console.log(`⚠️ صفحه redirect شد از ${this.url} به ${page.url()}`);
      }

      // گرفتن screenshot برای debug
      try {
        await page.screenshot({ path: 'olymp-debug.png', fullPage: true });
        console.log('📸 Screenshot ذخیره شد: olymp-debug.png');
      } catch (e) {
        console.log('⚠️ خطا در گرفتن screenshot:', e.message);
      }

      // بستن popup ها و cookie ها
      try {
        await page.waitForSelector('.accept-cookies, .cookie-accept', { timeout: 5000 });
        await page.click('.accept-cookies, .cookie-accept');
        console.log('✅ Cookie banner بسته شد');
      } catch (e) {
        console.log('ℹ️ Cookie banner پیدا نشد');
      }

      try {
        await page.waitForSelector('.close-popup, .modal-close', { timeout: 3000 });
        await page.click('.close-popup, .modal-close');
        console.log('✅ Popup بسته شد');
      } catch (e) {
        console.log('ℹ️ Popup پیدا نشد');
      }

      // صبر برای لود کامل
      await new Promise(resolve => setTimeout(resolve, 3000));

      // چک کردن محتوای صفحه
      const pageContent = await page.content();
      console.log(`📄 طول محتوای صفحه: ${pageContent.length} کاراکتر`);
      console.log(`🔍 آیا کلمه "login" در صفحه هست: ${pageContent.toLowerCase().includes('login')}`);
      console.log(`🔍 آیا کلمه "sign" در صفحه هست: ${pageContent.toLowerCase().includes('sign')}`);
      console.log(`🔍 آیا کلمه "demo" در صفحه هست: ${pageContent.toLowerCase().includes('demo')}`);
      console.log(`🔍 آیا کلمه "trading" در صفحه هست: ${pageContent.toLowerCase().includes('trading')}`);

      this.isInitialized = true;
      console.log(`✅ سایت ${this.name} آماده شد`);
      return true;
    } catch (error) {
      console.error(`❌ خطا در راه‌اندازی سایت ${this.name}: ${error.message}`);
      console.error(`🔍 نوع خطا: ${error.name}`);
      console.error(`📍 URL مشکل‌دار: ${this.url}`);
      return false;
    }
  }

  /**
   * جستجوی ارز در سایت
   * @param {object} page - صفحه Puppeteer
   * @param {string} currencyName - نام ارز
   * @returns {object} - نتیجه جستجو
   */
  async searchCurrency(page, currencyName) {
    const startTime = Date.now();
    try {
      console.log(`🔍 در حال جستجوی ارز: ${currencyName}`);

      // فعلاً فقط لاگ می‌کنیم چون هنوز به صفحه trading نرفتیم
      console.log(`⚠️ هنوز در صفحه اصلی هستیم، نیاز به رفتن به صفحه trading داریم`);

      return {
        success: false,
        site: this.name,
        error: 'هنوز در صفحه اصلی هستیم، نیاز به رفتن به صفحه trading داریم',
        results: [],
        currencyName: currencyName,
        searchDuration: Date.now() - startTime,
        timestamp: new Date()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ خطا در جستجوی ارز ${currencyName} در ${this.name}: ${error.message}`);
      
      return {
        success: false,
        site: this.name,
        error: error.message,
        results: [],
        currencyName: currencyName,
        searchDuration: duration,
        timestamp: new Date()
      };
    }
  }
}

module.exports = OlympTradeSite; 