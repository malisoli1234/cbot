const ScrapingService = require('./src/services/ScrapingService');
const MessageParser = require('./src/utils/messageParser');

async function testScraping() {
  console.log('🧪 تست ScrapingService با پیام جدید...\n');

  try {
    // ایجاد instance از services
    const scrapingService = new ScrapingService();
    const messageParser = new MessageParser();

    // راه‌اندازی ScrapingService
    console.log('🚀 راه‌اندازی ScrapingService...');
    const initialized = await scrapingService.initialize();
    
    if (!initialized) {
      console.error('❌ خطا در راه‌اندازی ScrapingService');
      return;
    }

    // تست پیام جدید
    const testMessage = 'EURRUB-OTCp 1min BUY trc';
    console.log(`📝 پیام تست: "${testMessage}"`);

    // پردازش پیام
    const parsedMessage = messageParser.parseMessage(testMessage);
    console.log('📊 نتیجه پردازش پیام:');
    console.log(JSON.stringify(parsedMessage, null, 2));

    if (parsedMessage.success) {
      console.log('\n🔍 شروع جستجو در سایت‌ها...');
      
      // جستجو در سایت‌ها
      const searchResults = await scrapingService.searchByMessage(testMessage);
      
      console.log('\n📈 نتایج جستجو:');
      console.log(JSON.stringify(searchResults, null, 2));
      
      if (searchResults.success) {
        console.log(`\n✅ جستجو موفق: ${searchResults.message}`);
        console.log(`🔍 ارز جستجو شده: ${searchResults.messageInfo.currencyName}`);
        console.log(`📊 سایت‌های جستجو شده: ${searchResults.searchedSites.join(', ')}`);
        
        if (searchResults.results && searchResults.results.length > 0) {
          console.log('\n💰 نتایج پرداخت:');
          searchResults.results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.currency} - ${result.payout}%`);
          });
        } else {
          console.log('\n⚠️ هیچ نتیجه‌ای پیدا نشد');
        }
      } else {
        console.log(`\n❌ خطا در جستجو: ${searchResults.error}`);
      }
    } else {
      console.log(`\n❌ خطا در پردازش پیام: ${parsedMessage.error}`);
    }

    // بستن ScrapingService
    await scrapingService.close();

  } catch (error) {
    console.error('❌ خطا در تست:', error.message);
  }
}

// اجرای تست
testScraping(); 