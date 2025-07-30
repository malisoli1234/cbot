const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const async = require('async');
const Currency = require('./models/Currency');
const connectDB = require('./config/database');
const CurrencyParser = require('./utils/currencyParser');
const MessageParser = require('./utils/messageParser');

// خواندن فایل کانفیگ
let config;
try {
  config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
} catch (e) {
  console.error('❌ خطا در خواندن config.json:', e.message);
  process.exit(1);
}

const MIN_PAYOUT = config.minPayout || 70;

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

// تنظیمات تلگرام
const TELEGRAM_BOT_TOKEN = config.telegram?.botToken || 'YOUR_BOT_TOKEN_HERE';
const CHANNEL_ID = config.telegram?.channelId || '@YOUR_CHANNEL_ID_HERE';
const API_URL = 'http://localhost:5000/api/search';

// راه‌اندازی MessageParser
const messageParser = new MessageParser();

// راه‌اندازی صف
const queue = async.queue(async (task, callback) => {
  let currencyName = 'ناشناخته';
  try {
    const { messageText, messageId } = task;
    
    // پردازش پیام با MessageParser
    const messageInfo = messageParser.getMessageInfo(messageText);
    if (!messageInfo.isValid) {
      logger.info(`⚠️ پیام نامعتبر نادیده گرفته شد: ${messageText} - ${messageInfo.error}`);
      await deleteMessage(messageId);
      callback();
      return;
    }

    currencyName = messageInfo.currencyName;
    const searchCurrency = messageInfo.searchTerm;
    logger.info(`🔍 پیام پردازش شد: ${messageInfo.pattern} - ${currencyName}, برای جستجو: ${searchCurrency}`);

    // ارسال درخواست به API با پیام کامل
    const response = await fetchWithRetry(API_URL, { 
      message: messageText,
      telegramMessageId: messageId,
      telegramChannelId: CHANNEL_ID
    });
    
    const { status, results, searchId, messageInfo: apiMessageInfo } = response.data;
    logger.info(`📤 پاسخ API: ${JSON.stringify(response.data)}`);

    // پیدا کردن نتیجه منطبق
    const matchedResult = results.find(result => {
      // تطبیق دقیق
      if (result.currency === currencyName) return true;
      
      // تطبیق با تغییرات OTCp -> OTC
      const normalizedCurrency = currencyName.replace('-OTCp', '-OTC');
      if (result.currency === normalizedCurrency) return true;
      
      // تطبیق با تغییرات OTC -> OTCp
      const normalizedResult = result.currency.replace('-OTC', '-OTCp');
      if (normalizedResult === currencyName) return true;
      
      // تطبیق با تغییرات نام ارز (مثل BTC -> Bitcoin)
      const currencyBase = currencyName.split('-')[0];
      const resultBase = result.currency.split('-')[0];
      
      // تطبیق BTC با Bitcoin
      if ((currencyBase === 'BTC' && resultBase === 'Bitcoin') ||
          (currencyBase === 'Bitcoin' && resultBase === 'BTC')) {
        return true;
      }
      
      // تطبیق ETH با Ethereum
      if ((currencyBase === 'ETH' && resultBase === 'Ethereum') ||
          (currencyBase === 'Ethereum' && resultBase === 'ETH')) {
        return true;
      }
      
      return false;
    });
    
    if (status === 'success' && matchedResult) {
      const payout = matchedResult.payout;
      
      // چک کردن N/A یا درصد کمتر از minPayout
      if (payout === 'N/A') {
        logger.info(`🚫 پیام حذف شد: ${currencyName} به دلیل payout=N/A`);
        await deleteMessage(messageId);
        if (searchId !== 'temp-id') {
          await updateCurrencyStatus(searchId, 'deleted');
        }
        callback();
        return;
      }
      
      const payoutNum = parseFloat(payout);
      if (isNaN(payoutNum) || payoutNum < MIN_PAYOUT) {
        logger.info(`🚫 پیام حذف شد: ${currencyName} به دلیل payout=${payout} کمتر از ${MIN_PAYOUT}`);
        await deleteMessage(messageId);
        if (searchId !== 'temp-id') {
          await updateCurrencyStatus(searchId, 'deleted');
        }
        callback();
        return;
      }
      
      // ویرایش پیام اصلی با درصد سبز
      const reply = `${messageText} 🟢 ${payout}`;
      try {
        await bot.editMessageText(reply, {
          chat_id: CHANNEL_ID,
          message_id: messageId,
          parse_mode: 'Markdown',
        });
        logger.info(`✏️ پیام ویرایش شد در کانال: ${reply}`);
        if (searchId !== 'temp-id') {
          await updateCurrencyStatus(searchId, 'edited');
        }
      } catch (e) {
        logger.error(`❌ خطا در ویرایش پیام ${messageText}: ${e.message}`);
      }
    } else {
      logger.info(`🚫 پیام حذف شد: ${currencyName} پیدا نشد`);
      await deleteMessage(messageId);
      if (searchId !== 'temp-id') {
        await updateCurrencyStatus(searchId, 'deleted');
      }
      callback();
      return;
    }
  } catch (e) {
    logger.error(`❌ خطا در پردازش پیام ${currencyName}: ${e.message}`);
    await deleteMessage(task.messageId);
  }
  callback();
}, 5); // حداکثر 5 درخواست همزمان

// راه‌اندازی بات تلگرام
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: { interval: 500, autoStart: true } });
const startTime = new Date();
let lastMessageId = 0; // برای tracking آخرین پیام پردازش شده

// تابع حذف پیام
async function deleteMessage(messageId) {
  try {
    await bot.deleteMessage(CHANNEL_ID, messageId);
    logger.info(`🗑️ پیام حذف شد از کانال: ${messageId}`);
  } catch (e) {
    logger.error(`❌ خطا در حذف پیام ${messageId}: ${e.message}`);
  }
}

// تابع به‌روزرسانی وضعیت در دیتابیس
async function updateCurrencyStatus(searchId, status) {
  try {
    await Currency.findByIdAndUpdate(searchId, { status });
    logger.info(`💾 وضعیت به‌روزرسانی شد: ${searchId} -> ${status}`);
  } catch (e) {
    logger.error(`❌ خطا در به‌روزرسانی وضعیت: ${e.message}`);
  }
}

// تابع تلاش مجدد برای درخواست API
async function fetchWithRetry(url, data, retries = 2, timeout = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(url, data, { timeout });
      return response;
    } catch (e) {
      if (i === retries - 1) {
        logger.error(`❌ خطا در درخواست API برای ${data.currency}: ${e.message}`);
        throw e;
      }
      logger.info(`🔄 تلاش مجدد (${i + 1}/${retries}) برای ${data.currency}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// چک کردن وضعیت بات
bot.getMe()
  .then((botInfo) => {
    logger.info(`🤖 بات فعال است: ${botInfo.username}`);
  })
  .catch((err) => {
    logger.error(`❌ خطا در چک کردن بات: ${err.message}`);
    process.exit(1);
  });

// مدیریت پیام‌های کانال
bot.on('channel_post', async (msg) => {
  // فقط پیام‌های جدید بعد از شروع ربات
  if (msg.date * 1000 >= startTime.getTime() && 
      msg.chat.id.toString() === CHANNEL_ID && 
      msg.message_id > lastMessageId) {
    
    if (!msg.text) {
      logger.info(`⚠️ پیام غیرمتنی نادیده گرفته شد: ${JSON.stringify(msg)}`);
      await deleteMessage(msg.message_id);
      return;
    }

    const messageText = msg.text.trim();
    logger.info(`📩 پیام جدید از چنل: ${messageText} (ID: ${msg.message_id})`);

    // به‌روزرسانی آخرین پیام ID
    lastMessageId = msg.message_id;

    // اضافه کردن به صف
    queue.push({ messageText, messageId: msg.message_id });
  } else {
    if (msg.message_id <= lastMessageId) {
      logger.info(`⏭️ پیام قدیمی نادیده گرفته شد: ${msg.message_id} <= ${lastMessageId}`);
    } else if (msg.date * 1000 < startTime.getTime()) {
      logger.info(`⏭️ پیام قبل از شروع ربات نادیده گرفته شد: ${msg.text || 'غیرمتنی'}`);
    } else {
      logger.info(`⏭️ پیام از چنل دیگر نادیده گرفته شد: ${msg.text || 'غیرمتنی'}`);
    }
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

// راه‌اندازی دیتابیس و شروع بات
async function startBot() {
  try {
    await connectDB();
    
    // گرفتن آخرین پیام‌های کانال برای تنظیم offset
    try {
      const updates = await bot.getUpdates({ limit: 1, timeout: 0 });
      if (updates.length > 0) {
        const lastUpdate = updates[updates.length - 1];
        if (lastUpdate.channel_post && lastUpdate.channel_post.chat.id.toString() === CHANNEL_ID) {
          lastMessageId = lastUpdate.channel_post.message_id;
          logger.info(`📊 آخرین پیام ID تنظیم شد: ${lastMessageId}`);
        }
      }
    } catch (error) {
      logger.info(`⚠️ نتوانست آخرین پیام‌ها را دریافت کند: ${error.message}`);
    }
    
    logger.info('🤖 ربات تلگرام شروع به کار کرد...');
    logger.info(`⏰ زمان شروع: ${startTime.toISOString()}`);
    logger.info(`📊 آخرین پیام ID: ${lastMessageId}`);
  } catch (error) {
    logger.error(`❌ خطا در راه‌اندازی بات: ${error.message}`);
    process.exit(1);
  }
}

startBot();