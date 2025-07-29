/**
 * ماژول اسکرپینگ سایت P.Finance
 */

const BaseSite = require('./BaseSite');

class PFinanceSite extends BaseSite {
  constructor() {
    const selectors = {
      searchField: '.search__field',
      resultsContainer: '.assets-block__alist .alist__item',
      currencyLabel: '.alist__label',
      payoutLabel: '.alist__payout',
      closePopup: '.tutorial-v1__close-icon',
      litecoinButton: '.currencies-block__in .pair-number-wrap'
    };

    const setupSteps = [
      { action: 'waitForSelector', selector: '.tutorial-v1__close-icon', timeout: 5000 },
      { action: 'click', selector: '.tutorial-v1__close-icon' },
      { action: 'waitForSelector', selector: '.currencies-block__in .pair-number-wrap', timeout: 5000 },
      { action: 'click', selector: '.currencies-block__in .pair-number-wrap' },
      { action: 'waitForSelector', selector: '.search__field', timeout: 5000 }
    ];

    super('P.Finance', 'https://p.finance/en/cabinet/try-demo/', selectors, setupSteps);
  }



  /**
   * جستجوی ارز در سایت
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
            
            // فرمت کردن نام ارز
            let formattedLabel = label.replace('/', '');
            if (formattedLabel.includes(' OTC')) {
              formattedLabel = formattedLabel.replace(' OTC', '-OTC');
            }
            
            // فرمت کردن payout
            const formattedPayout = payout.replace('+', '').replace('%', '');
            
            results.push({
              currency: formattedLabel,
              payout: formattedPayout,
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

module.exports = PFinanceSite; 