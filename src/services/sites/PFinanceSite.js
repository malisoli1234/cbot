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
   * راه‌اندازی سایت
   * @param {object} page - صفحه Puppeteer
   * @returns {boolean} - نتیجه راه‌اندازی
   */
  async setup(page) {
    try {
      console.log(`🌐 راه‌اندازی سایت ${this.name}...`);
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log(`✅ صفحه ${this.name} لود شد`);
      console.log(`عنوان صفحه: ${await page.title()}`);

      // بستن پاپ‌آپ
      console.log('🔍 در حال پیدا کردن دکمه ضربدر پاپ‌آپ...');
      await page.waitForSelector('.tutorial-v1__close-icon', { timeout: 5000 });
      await page.click('.tutorial-v1__close-icon');
      console.log('✅ پاپ‌آپ بسته شد.');

      // کلیک روی دکمه Litecoin OTC
      console.log('🔍 در حال پیدا کردن دکمه Litecoin OTC...');
      await page.waitForSelector('.currencies-block__in .pair-number-wrap', { timeout: 5000 });
      await page.click('.currencies-block__in .pair-number-wrap');
      console.log('✅ دکمه Litecoin OTC کلیک شد.');

      // صبر تا وقتی فیلد جستجو آماده بشه
      await page.waitForSelector('.search__field', { timeout: 5000 });
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
   * @param {object} page - صفحه Puppeteer
   * @param {string} currencyName - نام ارز
   * @returns {object} - نتیجه جستجو
   */
  async searchCurrency(page, currencyName) {
    const startTime = Date.now();
    try {
      console.log(`🔍 در حال جستجوی ارز: ${currencyName}`);
      await page.waitForSelector('.search__field', { timeout: 5000 });
      await page.evaluate(() => document.querySelector('.search__field').value = '');
      await page.type('.search__field', currencyName);

      // صبر تا وقتی حداقل یه آیتم لود بشه یا تایم‌اوت
      await page.waitForFunction(
        () => document.querySelector('.assets-block__alist .alist__item') !== null || document.querySelector('.assets-block__alist') !== null,
        { timeout: 5000 }
      );

      // استخراج و فرمت نتایج
      const results = await page.evaluate(() => {
        const items = document.querySelectorAll('.assets-block__alist .alist__item');
        const results = [];
        items.forEach(item => {
          try {
            const link = item.querySelector('.alist__link');
            let label = link?.querySelector('.alist__label')?.textContent || 'N/A';
            let payout = link?.querySelector('.alist__payout')?.textContent || 'N/A';
            // حذف اسلش و فرمت نام ارز
            label = label.replace('/', '');
            if (label.includes(' OTC')) {
              label = label.replace(' OTC', '-OTC');
            }
            // حذف علامت + و % از payout
            payout = payout.replace('+', '').replace('%', '');
            results.push({ currency: label, payout });
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
          success: false,
          site: this.name,
          results: [],
          currencyName: currencyName,
          timestamp: new Date()
        };
      }

      console.log(`✅ ارز ${currencyName} جستجو شد. نتایج: ${JSON.stringify(results)} (زمان: ${duration}ms)`);
      return {
        success: true,
        site: this.name,
        results: results,
        currencyName: currencyName,
        timestamp: new Date()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ خطا در جستجوی ارز ${currencyName}: ${error.message} (زمان: ${duration}ms)`);
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