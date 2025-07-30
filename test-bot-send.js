const TelegramBot = require('node-telegram-bot-api');

// تنظیم توکن ربات
const TELEGRAM_BOT_TOKEN = '7554355277:AAGFB8QuBEp9BqeZqD3xyVjZVlpzbRQ3xEg';

// راه‌اندازی ربات
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

async function testBotSend() {
  try {
    console.log('🤖 راه‌اندازی ربات برای تست ارسال پیام...');
    
    // دریافت اطلاعات ربات
    const botInfo = await bot.getMe();
    console.log('✅ اطلاعات ربات:');
    console.log(`   نام: ${botInfo.first_name}`);
    console.log(`   یوزرنیم: @${botInfo.username}`);
    
    // کانال‌های هدف
    const channels = [
      {
        name: 'Fateh Signal Filter',
        id: '@fatehsignalfilter'
      },
      {
        name: 'Fateh Signal Bot',
        id: '@fatehsignalbot'
      }
    ];
    
    console.log('\n📤 تست ارسال پیام به کانال‌ها...');
    
    for (const channel of channels) {
      console.log(`\n📋 کانال: ${channel.name}`);
      console.log(`🔗 ID: ${channel.id}`);
      
      try {
        // تست پیام ساده
        const testMessage = `🤖 تست ربات Currency Bot

📊 اطلاعات تست:
• زمان: ${new Date().toLocaleString('fa-IR')}
• وضعیت: فعال
• نسخه: 1.0

✅ ربات آماده دریافت سیگنال‌هاست!`;

        const sentMessage = await bot.sendMessage(channel.id, testMessage, {
          parse_mode: 'HTML',
          disable_web_page_preview: true
        });
        
        console.log('✅ پیام ساده با موفقیت ارسال شد!');
        console.log(`   پیام ID: ${sentMessage.message_id}`);
        console.log(`   تاریخ: ${new Date(sentMessage.date * 1000).toLocaleString('fa-IR')}`);
        
        // تست پیام با فرمت HTML (سیگنال ارز)
        const htmlMessage = `🎯 <b>سیگنال ارز</b>

💱 <b>EURUSD-OTC</b>
📈 <b>Payout: 85%</b>
⏰ <b>Timeframe: 1min</b>
📊 <b>Direction: BUY</b>

✅ <i>تایید شده توسط ربات</i>`;

        const sentHtmlMessage = await bot.sendMessage(channel.id, htmlMessage, {
          parse_mode: 'HTML',
          disable_web_page_preview: true
        });
        
        console.log('✅ پیام HTML با موفقیت ارسال شد!');
        console.log(`   پیام ID: ${sentHtmlMessage.message_id}`);
        
      } catch (error) {
        console.error('❌ خطا در ارسال پیام:', error.message);
        
        if (error.response && error.response.statusCode === 403) {
          console.log('💡 راهنمایی:');
          console.log('   1. ربات رو به کانال اضافه کنید');
          console.log('   2. دسترسی ارسال پیام بدید');
          console.log('   3. مطمئن شوید ربات admin هست');
        } else if (error.response && error.response.statusCode === 400) {
          console.log('💡 راهنمایی:');
          console.log('   1. ID کانال رو چک کنید');
          console.log('   2. مطمئن شوید کانال public هست');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطا در راه‌اندازی ربات:', error.message);
  }
}

// اجرای تست
testBotSend().then(() => {
  console.log('\n🏁 تست ارسال پیام تمام شد');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطا:', error);
  process.exit(1);
}); 