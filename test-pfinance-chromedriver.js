const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromedriver = require('chromedriver');

puppeteer.use(StealthPlugin());

async function testPFinanceWithChromeDriver() {
  let browser = null;
  let page = null;
  
  try {
    console.log('🚀 تست P.Finance با ChromeDriver...');
    console.log(`📍 ChromeDriver path: ${chromedriver.path}`);
    
    // راه‌اندازی مرورگر با ChromeDriver
    browser = await puppeteer.launch({
      headless: false, // نمایش مرورگر
      executablePath: chromedriver.path,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    console.log('✅ مرورگر با ChromeDriver راه‌اندازی شد');
    
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('🌐 ورود به P.Finance...');
    await page.goto('https://p.finance/en/cabinet/try-demo/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log(`✅ صفحه لود شد: ${await page.title()}`);
    
    // بستن پاپ‌آپ
    console.log('🔍 در حال پیدا کردن دکمه ضربدر پاپ‌آپ...');
    await page.waitForSelector('.tutorial-v1__close-icon', { timeout: 10000 });
    await page.click('.tutorial-v1__close-icon');
    console.log('✅ پاپ‌آپ بسته شد.');
    
    // کلیک روی دکمه Litecoin OTC
    console.log('🔍 در حال پیدا کردن دکمه Litecoin OTC...');
    await page.waitForSelector('.currencies-block__in .pair-number-wrap', { timeout: 10000 });
    await page.click('.currencies-block__in .pair-number-wrap');
    console.log('✅ دکمه Litecoin OTC کلیک شد.');
    
    // صبر تا وقتی فیلد جستجو آماده بشه
    await page.waitForSelector('.search__field', { timeout: 10000 });
    console.log('✅ فیلد جستجو آماده شد');
    
    // تست جستجو
    console.log('🔍 تست جستجوی EURUSD...');
    await page.evaluate(() => document.querySelector('.search__field').value = '');
    await page.type('.search__field', 'EURUSD');
    
    // صبر برای نتایج
    await page.waitForFunction(
      () => document.querySelector('.assets-block__alist .alist__item') !== null,
      { timeout: 10000 }
    );
    
    // استخراج نتایج
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.assets-block__alist .alist__item');
      const results = [];
      items.forEach(item => {
        try {
          const link = item.querySelector('.alist__link');
          let label = link?.querySelector('.alist__label')?.textContent || 'N/A';
          let payout = link?.querySelector('.alist__payout')?.textContent || 'N/A';
          label = label.replace('/', '');
          if (label.includes(' OTC')) {
            label = label.replace(' OTC', '-OTC');
          }
          payout = payout.replace('+', '').replace('%', '');
          results.push({ currency: label, payout });
        } catch (e) {
          console.error('خطا در استخراج:', e);
        }
      });
      return results;
    });
    
    console.log('✅ نتایج جستجو:', results);
    
    // صبر 15 ثانیه تا کاربر ببینه
    console.log('⏳ صبر 15 ثانیه...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (browser) {
      console.log('🚫 بستن مرورگر...');
      await browser.close();
    }
  }
}

testPFinanceWithChromeDriver().catch(console.error); 