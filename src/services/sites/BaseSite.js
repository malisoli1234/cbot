/**
 * کلاس پایه برای تمام سایت‌های اسکرپینگ
 */

class BaseSite {
  constructor(name, url, selectors, setupSteps = [], fallbackSelectors = {}) {
    this.name = name;
    this.url = url;
    this.selectors = selectors;
    this.setupSteps = setupSteps;
    this.fallbackSelectors = fallbackSelectors;
    this.isInitialized = false;
  }

  /**
   * راه‌اندازی سایت (باید در کلاس فرزند override شود)
   * @param {object} page - صفحه Puppeteer
   * @returns {boolean} - نتیجه راه‌اندازی
   */
  async setup(page) {
    try {
      console.log(`🌐 راه‌اندازی سایت ${this.name}...`);
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log(`✅ صفحه ${this.name} لود شد`);

      // اجرای مراحل setup با retry
      for (const step of this.setupSteps) {
        await this.executeSetupStepWithRetry(page, step);
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
   * اجرای مرحله setup با retry
   * @param {object} page - صفحه Puppeteer
   * @param {object} step - مرحله setup
   */
  async executeSetupStepWithRetry(page, step) {
    const maxRetries = 2;
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.executeSetupStep(page, step);
        return; // موفقیت
      } catch (error) {
        lastError = error;
        console.log(`⚠️ تلاش ${i + 1}/${maxRetries} برای ${step.action} ناموفق: ${error.message}`);
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // اگر همه retry ها ناموفق بودند
    console.error(`❌ خطا در اجرای step ${step.action}: ${lastError.message}`);
    throw lastError;
  }

  /**
   * اجرای مرحله setup
   * @param {object} page - صفحه Puppeteer
   * @param {object} step - مرحله setup
   */
  async executeSetupStep(page, step) {
    try {
      switch (step.action) {
        case 'waitForSelector':
          await page.waitForSelector(step.selector, { timeout: step.timeout || 10000 });
          break;
        case 'click':
          await page.click(step.selector);
          break;
        case 'type':
          await page.type(step.selector, step.text);
          break;
        case 'wait':
          await new Promise(resolve => setTimeout(resolve, step.delay || 1000));
          break;
        default:
          console.warn(`⚠️ Action ناشناخته: ${step.action}`);
      }
    } catch (error) {
      console.error(`❌ خطا در اجرای step ${step.action}: ${error.message}`);
      throw error;
    }
  }

  /**
   * پیدا کردن selector با fallback
   * @param {string} selectorType - نوع selector
   * @returns {string} - selector مناسب
   */
  getSelector(selectorType) {
    const primarySelector = this.selectors[selectorType];
    const fallbackSelectors = this.fallbackSelectors[selectorType] || [];
    
    return [primarySelector, ...fallbackSelectors];
  }

  /**
   * جستجوی ارز در سایت (باید در کلاس فرزند override شود)
   * @param {object} page - صفحه Puppeteer
   * @param {string} currencyName - نام ارز
   * @returns {object} - نتیجه جستجو
   */
  async searchCurrency(page, currencyName) {
    throw new Error('searchCurrency method must be implemented in child class');
  }

  /**
   * اعتبارسنجی نتایج (پیش‌فرض)
   * @param {array} results - نتایج جستجو
   * @returns {array} - نتایج معتبر
   */
  validateResults(results) {
    return results.filter(result => {
      return result.currency && 
             result.currency !== 'N/A' && 
             result.payout && 
             result.payout !== 'N/A';
    });
  }

  /**
   * فرمت کردن نتایج برای ذخیره (پیش‌فرض)
   * @param {array} results - نتایج خام
   * @returns {array} - نتایج فرمت شده
   */
  formatResults(results) {
    return results.map(result => ({
      site: this.name,
      currency: result.currency,
      payout: result.payout,
      originalData: result.originalData || {}
    }));
  }

  /**
   * بررسی آماده بودن سایت
   * @returns {boolean} - آیا سایت آماده است
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * دریافت اطلاعات سایت
   * @returns {object} - اطلاعات سایت
   */
  getInfo() {
    return {
      name: this.name,
      url: this.url,
      isInitialized: this.isInitialized,
      selectors: this.selectors,
      setupSteps: this.setupSteps
    };
  }
}

module.exports = BaseSite; 