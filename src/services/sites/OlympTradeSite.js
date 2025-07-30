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
      
      // رفتن به صفحه اصلی
      console.log('🔄 در حال رفتن به صفحه اصلی...');
      await page.goto(this.url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      
      console.log(`✅ صفحه ${this.name} لود شد`);
      console.log(`📄 عنوان صفحه: ${await page.title()}`);
      console.log(`🔗 URL نهایی: ${page.url()}`);

      // صبر برای لود کامل
      await new Promise(resolve => setTimeout(resolve, 3000));

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