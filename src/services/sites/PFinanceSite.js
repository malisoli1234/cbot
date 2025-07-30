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

      // پاک کردن فیلد جستجو با سرعت بیشتر
      await page.evaluate((selector) => {
        const field = document.querySelector(selector);
        if (field) {
          field.value = '';
          field.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, this.selectors.searchField);
      
      // تایپ کردن نام ارز با سرعت بیشتر
      await page.type(this.selectors.searchField, currencyName, { delay: 50 });

      // انتظار کوتاه‌تر برای لود شدن نتایج
      await page.waitForFunction(
        (selector) => {
          const container = document.querySelector(selector);
          return container && container.children.length > 0;
        },
        { timeout: 3000 },
        this.selectors.resultsContainer
      );

      // استخراج نتایج با بهینه‌سازی
      const results = await page.evaluate((selectors) => {
        const items = document.querySelectorAll(selectors.resultsContainer);
        const results = [];
        
        // محدود کردن تعداد نتایج برای سرعت بیشتر
        const maxResults = 10;
        const limitedItems = Array.from(items).slice(0, maxResults);
        
        limitedItems.forEach(item => {
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
            // خطاهای جزئی را نادیده بگیر
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