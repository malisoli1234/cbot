const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testPFinanceWithSelenium() {
  let driver = null;
  
  try {
    console.log('🚀 تست P.Finance با Selenium...');
    
    // تنظیمات Chrome
    const options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-gpu');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-web-security');
    options.addArguments('--disable-features=VizDisplayCompositor');
    
    // راه‌اندازی درایور
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('✅ درایور Selenium راه‌اندازی شد');
    
    // تنظیم window size
    await driver.manage().window().setRect({ width: 1280, height: 720 });
    
    console.log('🌐 ورود به P.Finance...');
    await driver.get('https://p.finance/en/cabinet/try-demo/');
    
    const title = await driver.getTitle();
    console.log(`✅ صفحه لود شد: ${title}`);
    
    // بستن پاپ‌آپ
    console.log('🔍 در حال پیدا کردن دکمه ضربدر پاپ‌آپ...');
    const closeButton = await driver.wait(until.elementLocated(By.css('.tutorial-v1__close-icon')), 10000);
    await closeButton.click();
    console.log('✅ پاپ‌آپ بسته شد.');
    
    // کلیک روی دکمه Litecoin OTC
    console.log('🔍 در حال پیدا کردن دکمه Litecoin OTC...');
    const litecoinButton = await driver.wait(until.elementLocated(By.css('.currencies-block__in .pair-number-wrap')), 10000);
    await litecoinButton.click();
    console.log('✅ دکمه Litecoin OTC کلیک شد.');
    
    // صبر تا وقتی فیلد جستجو آماده بشه
    console.log('🔍 در حال پیدا کردن فیلد جستجو...');
    const searchField = await driver.wait(until.elementLocated(By.css('.search__field')), 10000);
    console.log('✅ فیلد جستجو آماده شد');
    
    // تست جستجو
    console.log('🔍 تست جستجوی EURUSD...');
    await searchField.clear();
    await searchField.sendKeys('EURUSD');
    
    // صبر برای نتایج
    console.log('⏳ منتظر نتایج...');
    await driver.wait(until.elementLocated(By.css('.assets-block__alist .alist__item')), 10000);
    
    // استخراج نتایج
    console.log('📊 استخراج نتایج...');
    const items = await driver.findElements(By.css('.assets-block__alist .alist__item'));
    const results = [];
    
    for (const item of items) {
      try {
        const link = await item.findElement(By.css('.alist__link'));
        const labelElement = await link.findElement(By.css('.alist__label'));
        const payoutElement = await link.findElement(By.css('.alist__payout'));
        
        let label = await labelElement.getText();
        let payout = await payoutElement.getText();
        
        label = label.replace('/', '');
        if (label.includes(' OTC')) {
          label = label.replace(' OTC', '-OTC');
        }
        payout = payout.replace('+', '').replace('%', '');
        
        results.push({ currency: label, payout });
      } catch (e) {
        console.error('خطا در استخراج آیتم:', e.message);
      }
    }
    
    console.log('✅ نتایج جستجو:', results);
    
    // صبر 15 ثانیه تا کاربر ببینه
    console.log('⏳ صبر 15 ثانیه...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (driver) {
      console.log('🚫 بستن درایور...');
      await driver.quit();
    }
  }
}

testPFinanceWithSelenium().catch(console.error); 