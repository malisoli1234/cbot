/**
 * کلاس پایه برای تمام سایت‌های اسکرپینگ
 */

class BaseSite {
  constructor(name, url, selectors, setupSteps = []) {
    this.name = name;
    this.url = url;
    this.selectors = selectors;
    this.setupSteps = setupSteps;
    this.isInitialized = false;
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

      // اجرای مراحل setup
      for (const step of this.setupSteps) {
        await this.executeSetupStep(page, step);
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
   * اجرای مرحله setup
   * @param {object} page - صفحه Puppeteer
   * @param {object} step - مرحله setup
   */
  async executeSetupStep(page, step) {
    try {
      switch (step.action) {
        case 'waitForSelector':
          await page.waitForSelector(step.selector, { timeout: step.timeout || 5000 });
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
   * جستجوی ارز در سایت (تابع پایه - باید در کلاس‌های فرزند override شود)
   * @param {object} page - صفحه Puppeteer
   * @param {string} currencyName - نام ارز
   * @returns {object} - نتیجه جستجو
   */
  async searchCurrency(page, currencyName) {
    throw new Error('searchCurrency باید در کلاس فرزند پیاده‌سازی شود');
  }
}

module.exports = BaseSite; 