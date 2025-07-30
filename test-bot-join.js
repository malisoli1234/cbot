const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// تنظیم توکن ربات
const TELEGRAM_BOT_TOKEN = '7554355277:AAGFB8QuBEp9BqeZqD3xyVjZVlpzbRQ3xEg';

// راه‌اندازی ربات
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

async function testBotJoin() {
  try {
    console.log('🤖 راه‌اندازی ربات برای تست...');
    
    // دریافت اطلاعات ربات
    const botInfo = await bot.getMe();
    console.log('✅ اطلاعات ربات:');
    console.log(`   نام: ${botInfo.first_name}`);
    console.log(`   یوزرنیم: @${botInfo.username}`);
    console.log(`   ID: ${botInfo.id}`);
    
    // کانال‌های هدف
    const channels = [
      {
        name: 'Fateh Signal Filter',
        link: 'https://t.me/fatehsignalfilter',
        id: '@fatehsignalfilter'
      },
      {
        name: 'Fateh Signal Bot',
        link: 'https://t.me/fatehsignalbot',
        id: '@fatehsignalbot'
      }
    ];
    
    console.log('\n🔗 تلاش برای پیوستن به کانال‌ها...');
    
    for (const channel of channels) {
      console.log(`\n📋 کانال: ${channel.name}`);
      console.log(`🔗 لینک: ${channel.link}`);
      
      try {
        // تلاش برای دریافت اطلاعات کانال
        const chatInfo = await bot.getChat(channel.id);
        
        console.log('✅ اطلاعات کانال:');
        console.log(`   نام: ${chatInfo.title}`);
        console.log(`   نوع: ${chatInfo.type}`);
        console.log(`   ID: ${chatInfo.id}`);
        
        // بررسی دسترسی‌های ربات
        const botMember = await bot.getChatMember(chatInfo.id, botInfo.id);
        console.log(`🤖 وضعیت ربات در کانال:`);
        console.log(`   وضعیت: ${botMember.status}`);
        
        if (botMember.status === 'left' || botMember.status === 'kicked') {
          console.log('⚠️ ربات در کانال نیست یا اخراج شده');
          console.log('💡 برای اضافه کردن ربات:');
          console.log('   1. ربات رو به کانال اضافه کنید');
          console.log('   2. دسترسی ارسال پیام بدید');
          console.log('   3. این اسکریپت رو دوباره اجرا کنید');
        } else {
          console.log('✅ ربات در کانال هست و آماده کار');
          
          // نمایش دسترسی‌های ربات
          if (botMember.can_send_messages) {
            console.log('✅ دسترسی ارسال پیام: دارد');
          } else {
            console.log('❌ دسترسی ارسال پیام: ندارد');
          }
          
          if (botMember.can_delete_messages) {
            console.log('✅ دسترسی حذف پیام: دارد');
          } else {
            console.log('❌ دسترسی حذف پیام: ندارد');
          }
          
          if (botMember.can_edit_messages) {
            console.log('✅ دسترسی ویرایش پیام: دارد');
          } else {
            console.log('❌ دسترسی ویرایش پیام: ندارد');
          }
        }
        
      } catch (error) {
        console.error('❌ خطا در دریافت اطلاعات کانال:', error.message);
        
        if (error.response && error.response.statusCode === 400) {
          console.log('💡 راهنمایی:');
          console.log('   1. مطمئن شوید کانال public هست');
          console.log('   2. ربات رو به کانال اضافه کنید');
          console.log('   3. دسترسی‌های لازم رو بدید');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطا در راه‌اندازی ربات:', error.message);
  }
}

// اجرای تست
testBotJoin().then(() => {
  console.log('\n🏁 تست تمام شد');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطا:', error);
  process.exit(1);
}); 