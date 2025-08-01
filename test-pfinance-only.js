const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

function findChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH
  ];

  for (const chromePath of possiblePaths) {
    if (chromePath && fs.existsSync(chromePath)) {
      console.log(`✅ Chrome پیدا شد در: ${chromePath}`);
      return chromePath;
    }
  }

  console.log('⚠️ Chrome در مسیرهای معمول پیدا نشد');
  return null;
}

async function testPFinance() {
  let browser = null;
  let page = null;
  
  try {
    console.log('🚀 تست P.Finance...');
    
    const chromePath = findChromePath();
    const launchOptions = {
      headless: false, // نمایش مرورگر
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    };
    
    if (chromePath) {
      launchOptions.executablePath = chromePath;
    }
    
    // راه‌اندازی مرورگر ساده
    browser = await puppeteer.launch(launchOptions);
    
    console.log('✅ مرورگر راه‌اندازی شد');
    
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('🌐 ورود به P.Finance...');
    await page.goto('https://p.finance/en/cabinet/try-demo/', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    console.log(`✅ صفحه لود شد: ${await page.title()}`);
    
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
    
    // تست جستجو
    console.log('🔍 تست جستجوی EURUSD...');
    await page.evaluate(() => document.querySelector('.search__field').value = '');
    await page.type('.search__field', 'EURUSD');
    
    // صبر برای نتایج
    await page.waitForFunction(
      () => document.querySelector('.assets-block__alist .alist__item') !== null,
      { timeout: 5000 }
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
    
    // صبر 10 ثانیه تا کاربر ببینه
    console.log('⏳ صبر 10 ثانیه...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (browser) {
      console.log('🚫 بستن مرورگر...');
      await browser.close();
    }
  }
}

testPFinance().catch(console.error); 