/**
 * مثال برای اضافه کردن سایت جدید
 * این فایل نشان می‌دهد که چگونه سایت جدید اضافه کنید
 */

const BaseSite = require('./BaseSite');

class ExampleSite extends BaseSite {
  constructor() {
    const selectors = {
      searchField: '.search-input',
      resultsContainer: '.results .item',
      currencyLabel: '.currency-name',
      payoutLabel: '.payout-value',
      acceptCookies: '.accept-cookies'
    };

    const setupSteps = [
      { action: 'waitForSelector', selector: '.search-input', timeout: 5000 },
      { action: 'click', selector: '.accept-cookies' },
      { action: 'wait', delay: 1000 }
    ];

    super('Example Site', 'https://example.com', selectors, setupSteps);
  }

  /**
   * جستجوی ارز در سایت (مثال)
   * @param {object} page - صفحه Puppeteer
   * @param {string} currencyName - نام ارز
   * @returns {object} - نتیجه جستجو
   */
  async searchCurrency(page, currencyName) {
    try {
      console.log(`🔍 جستجو در ${this.name} برای: ${currencyName}`);

      // پاک کردن فیلد جستجو
      await page.evaluate(() => document.querySelector(this.selectors.searchField).value = '');
      
      // تایپ کردن نام ارز
      await page.type(this.selectors.searchField, currencyName);

      // انتظار برای لود شدن نتایج
      await page.waitForFunction(
        () => document.querySelector(this.selectors.resultsContainer) !== null,
        { timeout: 5000 }
      );

      // استخراج نتایج
      const results = await page.evaluate((selectors) => {
        const items = document.querySelectorAll(selectors.resultsContainer);
        const results = [];
        
        items.forEach(item => {
          try {
            const label = item.querySelector(selectors.currencyLabel)?.textContent?.trim() || 'N/A';
            const payout = item.querySelector(selectors.payoutLabel)?.textContent?.trim() || 'N/A';
            
            results.push({
              currency: label,
              payout: payout,
              originalLabel: label,
              originalPayout: payout
            });
          } catch (e) {
            console.error(`❌ خطا در استخراج آیتم: ${e.message}`);
          }
        });
        
        return results;
      }, this.selectors);

      return {
        success: true,
        site: this.name,
        results: results,
        currencyName: currencyName,
        timestamp: new Date()
      };

    } catch (error) {
      console.error(`❌ خطا در جستجو در ${this.name}: ${error.message}`);
      return {
        success: false,
        site: this.name,
        error: error.message,
        results: [],
        currencyName: currencyName,
        timestamp: new Date()
      };
    }
  }
}

module.exports = ExampleSite; 