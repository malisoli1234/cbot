const MessageParser = require('./src/utils/messageParser');
const ScrapingService = require('./src/services/ScrapingService');

// تنظیمات
const MIN_PAYOUT = 70; // حداقل درصد پرداخت

async function testTelegramBotProcessing() {
  console.log('🧪 تست پردازش ربات تلگرام با پیام جدید...\n');

  try {
    // راه‌اندازی services
    const messageParser = new MessageParser();
    const scrapingService = new ScrapingService();
    
    console.log('🚀 راه‌اندازی ScrapingService...');
    const initialized = await scrapingService.initialize();
    
    if (!initialized) {
      console.error('❌ خطا در راه‌اندازی ScrapingService');
      return;
    }

    // تست پیام‌های مختلف
    const testMessages = [
      'EURRUB-OTCp 1min BUY trc',
      'BTC-OTCp 5min SELL eth',
      'ETH-OTC 10min BUY bnb'
    ];

    for (const messageText of testMessages) {
      console.log(`\n📝 پردازش پیام: "${messageText}"`);
      
      // پردازش پیام
      const messageInfo = messageParser.getMessageInfo(messageText);
      if (!messageInfo.isValid) {
        console.log(`❌ پیام نامعتبر: ${messageInfo.error}`);
        continue;
      }

      console.log(`✅ پیام معتبر: ${messageInfo.pattern} - ${messageInfo.currencyName}`);
      console.log(`🔍 عبارت جستجو: ${messageInfo.searchTerm}`);

      // جستجو در سایت‌ها
      const searchResults = await scrapingService.searchByMessage(messageText);
      
      if (searchResults.success && searchResults.searchResults.length > 0) {
        console.log('📊 نتایج جستجو:');
        
        for (const siteResult of searchResults.searchResults) {
          if (siteResult.success && siteResult.results.length > 0) {
            console.log(`\n🏦 ${siteResult.site}:`);
            
            for (const result of siteResult.results) {
              const payout = result.payout;
              console.log(`   ${result.currency}: ${payout}%`);
              
              // شبیه‌سازی منطق ربات تلگرام
              if (payout === 'N/A') {
                console.log(`   🚫 حذف می‌شود: payout=N/A`);
              } else {
                const payoutNum = parseFloat(payout);
                if (isNaN(payoutNum) || payoutNum < MIN_PAYOUT) {
                  console.log(`   🚫 حذف می‌شود: ${payout}% < ${MIN_PAYOUT}%`);
                } else {
                  console.log(`   ✅ ویرایش می‌شود: ${messageText} 🟢 ${payout}%`);
                }
              }
            }
          } else {
            console.log(`❌ خطا در ${siteResult.site}: ${siteResult.error}`);
          }
        }
      } else {
        console.log('⚠️ هیچ نتیجه‌ای پیدا نشد');
      }
    }

    // بستن ScrapingService
    await scrapingService.close();

  } catch (error) {
    console.error('❌ خطا در تست:', error.message);
  }
}

// اجرای تست
testTelegramBotProcessing(); 