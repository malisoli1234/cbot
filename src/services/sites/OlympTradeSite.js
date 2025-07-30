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

    super('Olymp Trade', 'https://olymptrade.com/platform?project=bo', selectors, setupSteps);
  }

  /**
   * راه‌اندازی سایت
   * @param {object} page - صفحه Puppeteer
   * @returns {boolean} - نتیجه راه‌اندازی
   */
  async setup(page) {
    try {
      console.log(`🌐 راه‌اندازی سایت ${this.name}...`);
      
      // رفتن به صفحه
      await page.goto(this.url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      console.log(`✅ صفحه ${this.name} لود شد`);
      console.log(`عنوان صفحه: ${await page.title()}`);

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

      // پیدا کردن فیلد جستجو
      const searchField = await page.$('.search-input, input[placeholder*="search"], input[placeholder*="جستجو"]');
      if (searchField) {
        console.log('✅ فیلد جستجو پیدا شد');
      } else {
        console.log('⚠️ فیلد جستجو پیدا نشد، ممکنه نیاز به لاگین باشه');
      }

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

      // پیدا کردن فیلد جستجو
      const searchSelectors = [
        '.search-input',
        'input[placeholder*="search"]',
        'input[placeholder*="جستجو"]',
        '.search-field',
        'input[type="text"]'
      ];

      let searchField = null;
      for (const selector of searchSelectors) {
        try {
          searchField = await page.$(selector);
          if (searchField) break;
        } catch (e) {
          continue;
        }
      }

      if (!searchField) {
        console.log('⚠️ فیلد جستجو پیدا نشد، تلاش برای پیدا کردن ارز در لیست...');
        return await this.searchInList(page, currencyName);
      }

      // پاک کردن فیلد جستجو
      await page.evaluate(() => {
        const field = document.querySelector('.search-input, input[placeholder*="search"], input[placeholder*="جستجو"]');
        if (field) field.value = '';
      });

      // تایپ کردن نام ارز
      await page.type('.search-input, input[placeholder*="search"], input[placeholder*="جستجو"]', currencyName);

      // صبر برای لود شدن نتایج
      await page.waitForFunction(
        () => {
          const results = document.querySelectorAll('.assets-list .item, .instruments-list .item, .pairs-list .item');
          return results.length > 0;
        },
        { timeout: 10000 }
      );

      // استخراج نتایج
      const results = await page.evaluate(() => {
        const items = document.querySelectorAll('.assets-list .item, .instruments-list .item, .pairs-list .item');
        const results = [];
        
        items.forEach(item => {
          try {
            const label = item.querySelector('.asset-name, .pair-name, .instrument-name')?.textContent?.trim() || 'N/A';
            const payout = item.querySelector('.payout, .profit, .percentage')?.textContent?.trim() || 'N/A';
            
            // پاک کردن کاراکترهای اضافی
            const cleanPayout = payout.replace(/[^\d.-]/g, '');
            
            results.push({
              currency: label,
              payout: cleanPayout || 'N/A',
              originalLabel: label,
              originalPayout: payout
            });
          } catch (e) {
            console.error(`❌ خطا در استخراج آیتم: ${e.message}`);
          }
        });
        
        return results;
      });

      const duration = Date.now() - startTime;
      console.log(`✅ جستجو در ${this.name} تمام شد. نتایج: ${results.length} (زمان: ${duration}ms)`);

      return {
        success: true,
        site: this.name,
        results: results,
        currencyName: currencyName,
        searchDuration: duration,
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

  /**
   * جستجو در لیست ارزها (اگر فیلد جستجو نباشه)
   * @param {object} page - صفحه Puppeteer
   * @param {string} currencyName - نام ارز
   * @returns {object} - نتیجه جستجو
   */
  async searchInList(page, currencyName) {
    try {
      console.log(`🔍 جستجو در لیست ارزها برای: ${currencyName}`);
      
      // اسکرول کردن صفحه برای لود شدن همه ارزها
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      // استخراج همه ارزها از صفحه
      const allCurrencies = await page.evaluate(() => {
        const items = document.querySelectorAll('.asset-item, .instrument-item, .pair-item, [data-asset]');
        const currencies = [];
        
        items.forEach(item => {
          try {
            const label = item.querySelector('.asset-name, .pair-name, .instrument-name')?.textContent?.trim() || 
                         item.getAttribute('data-asset') || 'N/A';
            const payout = item.querySelector('.payout, .profit, .percentage')?.textContent?.trim() || 'N/A';
            
            currencies.push({
              currency: label,
              payout: payout.replace(/[^\d.-]/g, '') || 'N/A',
              originalLabel: label,
              originalPayout: payout
            });
          } catch (e) {
            // ignore
          }
        });
        
        return currencies;
      });

      // پیدا کردن ارز مورد نظر
      const matchedCurrency = allCurrencies.find(item => 
        item.currency.toLowerCase().includes(currencyName.toLowerCase()) ||
        currencyName.toLowerCase().includes(item.currency.toLowerCase())
      );

      if (matchedCurrency) {
        console.log(`✅ ارز ${currencyName} در لیست پیدا شد`);
        return {
          success: true,
          site: this.name,
          results: [matchedCurrency],
          currencyName: currencyName,
          searchDuration: Date.now() - startTime,
          timestamp: new Date()
        };
      } else {
        console.log(`❌ ارز ${currencyName} در لیست پیدا نشد`);
        return {
          success: false,
          site: this.name,
          error: 'ارز در لیست پیدا نشد',
          results: [],
          currencyName: currencyName,
          searchDuration: Date.now() - startTime,
          timestamp: new Date()
        };
      }

    } catch (error) {
      console.error(`❌ خطا در جستجو در لیست: ${error.message}`);
      return {
        success: false,
        site: this.name,
        error: error.message,
        results: [],
        currencyName: currencyName,
        searchDuration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }
}

module.exports = OlympTradeSite; 