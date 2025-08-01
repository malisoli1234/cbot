const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const async = require('async');

// خواندن فایل کانفیگ
let config;
try {
  config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
} catch (e) {
  console.error('❌ خطا در خواندن config.json:', e.message);
  process.exit(1);
}
const MIN_PAYOUT = config.minPayout || 70; // پیش‌فرض 70 اگه تعریف نشده باشه

// URL پایه پلتفرم ترید (اینو با URL واقعی جایگزین کن)
const TRADING_PLATFORM_URL = 'https://trade.example.com';

// تنظیم لاگ‌گیری
const logStream = fs.createWriteStream('bot.log', { flags: 'a' });
const logger = {
  info: (msg) => {
    const logMsg = `${new Date().toISOString()} - INFO - ${msg}`;
    console.log(logMsg);
    logStream.write(logMsg + '\n');
  },
  error: (msg) => {
    const logMsg = `${new Date().toISOString()} - ERROR - ${msg}`;
    console.error(logMsg);
    logStream.write(logMsg + '\n');
  },
};

// توکن بات و آیدی چنل
const TELEGRAM_BOT_TOKEN = '7554355277:AAGFB8QuBEp9BqeZqD3xyVjZVlpzbRQ3xEg';
const CHANNEL_ID = '-1002498428726';

// تنظیم API های سایت‌ها
const SITE_APIS = {
  'PO': 'http://localhost:3002/api/search-currency', // P.Finance
  'OL': 'http://localhost:3001/api/search-currency', // Olymp Trade
};

// راه‌اندازی صف
const queue = async.queue(async (task, callback) => {
  let currencyName = 'ناشناخته';
  try {
    const { messageText, messageId } = task;
    
    // استخراج prefix و نام ارز با regex
    const match = messageText.match(/^(PO|OL|ORG):\s*([A-Z]+-OTC[p]?|[A-Z]+)/);
    if (!match) {
      logger.info(`⚠️ پیام نامعتبر نادیده گرفته شد: ${messageText}`);
      try {
        await bot.deleteMessage(CHANNEL_ID, messageId);
        logger.info(`🗑️ پیام حذف شد از کانال: ${messageText} (نامعتبر)`);
      } catch (e) {
        logger.error(`❌ خطا در حذف پیام ${messageText}: ${e.message}`);
      }
      callback();
      return;
    }

    const prefix = match[1];
    currencyName = match[2];
    if (currencyName.endsWith('-OTCp')) {
      currencyName = currencyName.slice(0, -1);
    }
    const searchCurrency = currencyName.split('-')[0];
    logger.info(`🔍 ارز استخراج‌شده: ${currencyName}, برای جستجو: ${searchCurrency}, سایت: ${prefix}`);

    let apiUrl;
    if (prefix === 'ORG') {
      // جستجو در همه سایت‌ها
      logger.info(`🔍 جستجو در همه سایت‌ها برای ${currencyName}`);
      const promises = Object.entries(SITE_APIS).map(async ([sitePrefix, url]) => {
        try {
          const response = await fetchWithRetry(url, { currency: searchCurrency });
          const { status, results } = response.data;
          if (status === 'success' && results.length > 0) {
            const matchedResult = results.find(result => result.currency === currencyName);
            if (matchedResult) {
              return { sitePrefix, payout: matchedResult.payout };
            }
          }
          return null;
        } catch (e) {
          logger.error(`❌ خطا در ${sitePrefix}: ${e.message}`);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(r => r !== null);

      if (validResults.length > 0) {
        const bestResult = validResults.reduce((best, current) =>
          parseFloat(current.payout) > parseFloat(best.payout) ? current : best
        );
        
        const payout = bestResult.payout;
        if (payout === 'N/A') {
          logger.info(`🚫 پیام حذف شد: ${currencyName} به دلیل payout=N/A`);
          try {
            await bot.deleteMessage(CHANNEL_ID, messageId);
            logger.info(`🗑️ پیام حذف شد از کانال: ${messageText} (payout=N/A)`);
          } catch (e) {
            logger.error(`❌ خطا در حذف پیام ${messageText}: ${e.message}`);
          }
          callback();
          return;
        }

        const payoutNum = parseFloat(payout);
        if (isNaN(payoutNum) || payoutNum < MIN_PAYOUT) {
          logger.info(`🚫 پیام حذف شد: ${currencyName} به دلیل payout=${payout} کمتر از ${MIN_PAYOUT}`);
          try {
            await bot.deleteMessage(CHANNEL_ID, messageId);
            logger.info(`🗑️ پیام حذف شد از کانال: ${messageText} (payout=${payout} کمتر از ${MIN_PAYOUT})`);
          } catch (e) {
            logger.error(`❌ خطا در حذف پیام ${messageText}: ${e.message}`);
          }
          callback();
          return;
        }

        const reply = `[${currencyName}](${TRADING_PLATFORM_URL}?symbol=${currencyName}) ${messageText.replace(/^(PO|OL|ORG):\s*/, '').trim()} 🟢 ${payout}% (${bestResult.sitePrefix})`;
        try {
          await bot.editMessageText(reply, {
            chat_id: CHANNEL_ID,
            message_id: messageId,
            parse_mode: 'Markdown',
          });
          logger.info(`✏️ پیام ویرایش شد در کانال: ${reply}`);
        } catch (e) {
          logger.error(`❌ خطا در ویرایش پیام ${messageText}: ${e.message}`);
        }
      } else {
        logger.info(`🚫 پیام حذف شد: ${currencyName} در هیچ سایتی پیدا نشد`);
        try {
          await bot.deleteMessage(CHANNEL_ID, messageId);
          logger.info(`🗑️ پیام حذف شد از کانال: ${messageText} (پیدا نشد)`);
        } catch (e) {
          logger.error(`❌ خطا در حذف پیام ${messageText}: ${e.message}`);
        }
      }
    } else {
      // جستجو در سایت خاص
      apiUrl = SITE_APIS[prefix];
      if (!apiUrl) {
        logger.error(`❌ API برای ${prefix} پیدا نشد`);
        callback();
        return;
      }

      const response = await fetchWithRetry(apiUrl, { currency: searchCurrency });
      const { status, results } = response.data;
      logger.info(`📤 پاسخ API: ${JSON.stringify(response.data)}`);

      const matchedResult = results.find(result => result.currency === currencyName);
      if (status === 'success' && matchedResult) {
        const payout = matchedResult.payout;
        if (payout === 'N/A') {
          logger.info(`🚫 پیام حذف شد: ${currencyName} به دلیل payout=N/A`);
          try {
            await bot.deleteMessage(CHANNEL_ID, messageId);
            logger.info(`🗑️ پیام حذف شد از کانال: ${messageText} (payout=N/A)`);
          } catch (e) {
            logger.error(`❌ خطا در حذف پیام ${messageText}: ${e.message}`);
          }
          callback();
          return;
        }

        const payoutNum = parseFloat(payout);
        if (isNaN(payoutNum) || payoutNum < MIN_PAYOUT) {
          logger.info(`🚫 پیام حذف شد: ${currencyName} به دلیل payout=${payout} کمتر از ${MIN_PAYOUT}`);
          try {
            await bot.deleteMessage(CHANNEL_ID, messageId);
            logger.info(`🗑️ پیام حذف شد از کانال: ${messageText} (payout=${payout} کمتر از ${MIN_PAYOUT})`);
          } catch (e) {
            logger.error(`❌ خطا در حذف پیام ${messageText}: ${e.message}`);
          }
          callback();
          return;
        }

        const reply = `[${currencyName}](${TRADING_PLATFORM_URL}?symbol=${currencyName}) ${messageText.replace(/^(PO|OL|ORG):\s*/, '').trim()} 🟢 ${payout}% (${prefix})`;
        try {
          await bot.editMessageText(reply, {
            chat_id: CHANNEL_ID,
            message_id: messageId,
            parse_mode: 'Markdown',
          });
          logger.info(`✏️ پیام ویرایش شد در کانال: ${reply}`);
        } catch (e) {
          logger.error(`❌ خطا در ویرایش پیام ${messageText}: ${e.message}`);
        }
      } else {
        logger.info(`🚫 پیام حذف شد: ${currencyName} پیدا نشد`);
        try {
          await bot.deleteMessage(CHANNEL_ID, messageId);
          logger.info(`🗑️ پیام حذف شد از کانال: ${messageText} (پیدا نشد)`);
        } catch (e) {
          logger.error(`❌ خطا در حذف پیام ${messageText}: ${e.message}`);
        }
      }
    }
  } catch (e) {
    logger.error(`❌ خطا در پردازش پیام ${currencyName}: ${e.message}`);
    try {
      await bot.deleteMessage(CHANNEL_ID, task.messageId);
      logger.info(`🗑️ پیام حذف شد از کانال: ${task.messageText} (خطای پردازش)`);
    } catch (deleteError) {
      logger.error(`❌ خطا در حذف پیام ${task.messageText}: ${deleteError.message}`);
    }
  }
  callback();
}, 5); // حداکثر 5 درخواست همزمان

// راه‌اندازی بات تلگرام
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: { interval: 500, autoStart: true } });
const startTime = new Date();

// چک کردن وضعیت بات
bot.getMe()
  .then((botInfo) => {
    logger.info(`🤖 بات فعال است: ${botInfo.username}`);
  })
  .catch((err) => {
    logger.error(`❌ خطا در چک کردن بات: ${err.message}`);
    process.exit(1);
  });

// تابع تلاش مجدد برای درخواست API
async function fetchWithRetry(url, data, retries = 2, timeout = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(url, data, { timeout });
      return response;
    } catch (e) {
      if (i === retries - 1) {
        logger.error(`❌ خطا در درخواست API برای ${data.currency}: ${e.message}`);
        throw e; // خطا رو پرتاب می‌کنیم تا catch بالاتر بگیره
      }
      logger.info(`🔄 تلاش مجدد (${i + 1}/${retries}) برای ${data.currency}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// مدیریت پیام‌های کانال
bot.on('channel_post', async (msg) => {
  // فقط پیام‌های متنی بعد از شروع ربات
  if (msg.date * 1000 >= startTime.getTime() && msg.chat.id.toString() === CHANNEL_ID) {
    if (!msg.text) {
      logger.info(`⚠️ پیام غیرمتنی نادیده گرفته شد: ${JSON.stringify(msg)}`);
      try {
        await bot.deleteMessage(CHANNEL_ID, msg.message_id);
        logger.info(`🗑️ پیام غیرمتنی حذف شد از کانال: ${JSON.stringify(msg)}`);
      } catch (e) {
        logger.error(`❌ خطا در حذف پیام غیرمتنی: ${e.message}`);
      }
      return;
    }

    const messageText = msg.text.trim();
    logger.info(`📩 پیام جدید از چنل: ${messageText}`);

    // اضافه کردن به صف
    queue.push({ messageText, messageId: msg.message_id });
  } else {
    logger.info(`📩 پیام قدیمی یا از چنل دیگر نادیده گرفته شد: ${msg.text || 'غیرمتنی'}`);
  }
});

// مدیریت خطای پولینگ
bot.on('polling_error', (error) => {
  logger.error(`❌ خطای پولینگ: ${error.message}`);
  if (error.message.includes('404') || error.message.includes('401')) {
    logger.error('❌ توکن بات یا تنظیمات دسترسی نادرست است. لطفاً توکن و آیدی چنل را چک کنید.');
    process.exit(1);
  }
});

// مدیریت توقف برنامه
process.on('SIGINT', async () => {
  logger.info('🛑 برنامه توسط کاربر متوقف شد.');
  await bot.stopPolling();
  logStream.end();
  process.exit(0);
});

logger.info('🤖 ربات تلگرام شروع به کار کرد...'); 