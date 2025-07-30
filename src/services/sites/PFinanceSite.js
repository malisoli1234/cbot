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
      { action: 'waitForSelector', selector: '.tutorial-v1__close-icon', timeout: 10000 },
      { action: 'click', selector: '.tutorial-v1__close-icon' },
      { action: 'waitForSelector', selector: '.currencies-block__in .pair-number-wrap', timeout: 10000 },
      { action: 'click', selector: '.currencies-block__in .pair-number-wrap' },
      { action: 'waitForSelector', selector: '.search__field', timeout: 10000 }
    ];

    // اضافه کردن fallback selectors
    const fallbackSelectors = {
      searchField: ['.search__field', '.search-field', 'input[type="text"]', '.search-input'],
      resultsContainer: ['.assets-block__alist .alist__item', '.results-container', '.search-results', '.currency-list'],
      currencyLabel: ['.alist__label', '.currency-label', '.pair-name', '.currency-name'],
      payoutLabel: ['.alist__payout', '.payout-label', '.percentage', '.payout-value']
    };

    super('P.Finance', 'https://p.finance/en/cabinet/try-demo/', selectors, setupSteps, fallbackSelectors);
  }



  /**
   * راه‌اندازی سایت با روش جایگزین
   * @param {object} page - صفحه Puppeteer
   * @returns {boolean} - نتیجه راه‌اندازی
   */
  async setup(page) {
    try {
      console.log(`🌐 راه‌اندازی سایت ${this.name}...`);
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log(`✅ صفحه ${this.name} لود شد`);

      // انتظار برای لود شدن کامل صفحه
      await page.waitForTimeout(2000);

      // تلاش برای بستن popup اگر وجود داشته باشد
      try {
        await page.waitForSelector('.tutorial-v1__close-icon', { timeout: 5000 });
        await page.click('.tutorial-v1__close-icon');
        console.log('✅ Popup بسته شد');
      } catch (error) {
        console.log('⚠️ Popup پیدا نشد یا قبلاً بسته شده');
      }

      // تلاش برای کلیک روی دکمه currencies
      try {
        await page.waitForSelector('.currencies-block__in .pair-number-wrap', { timeout: 10000 });
        await page.click('.currencies-block__in .pair-number-wrap');
        console.log('✅ دکمه currencies کلیک شد');
      } catch (error) {
        console.log('⚠️ دکمه currencies پیدا نشد، تلاش با selector جایگزین');
        // تلاش با selector های جایگزین
        const alternativeSelectors = [
          '.currencies-block .pair-number-wrap',
          '.currencies .pair-number',
          '.currency-selector',
          '.pair-selector'
        ];

        for (const selector of alternativeSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.click(selector);
            console.log(`✅ دکمه با selector جایگزین کلیک شد: ${selector}`);
            break;
          } catch (e) {
            console.log(`❌ selector جایگزین کار نکرد: ${selector}`);
          }
        }
      }

      // انتظار برای آماده شدن فیلد جستجو
      try {
        await page.waitForSelector('.search__field', { timeout: 10000 });
        console.log('✅ فیلد جستجو آماده شد');
      } catch (error) {
        console.log('⚠️ فیلد جستجو پیدا نشد، تلاش با selector های جایگزین');
        // تلاش با selector های جایگزین
        const searchSelectors = [
          '.search-field',
          'input[type="text"]',
          '.search-input',
          '#search'
        ];

        for (const selector of searchSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            console.log(`✅ فیلد جستجو با selector جایگزین آماده شد: ${selector}`);
            // آپدیت selector اصلی
            this.selectors.searchField = selector;
            break;
          } catch (e) {
            console.log(`❌ selector جستجو کار نکرد: ${selector}`);
          }
        }
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