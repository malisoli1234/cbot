/**
 * فایل تست برای MessageParser
 * این فایل نشان می‌دهد که چگونه MessageParser کار می‌کند
 */

const MessageParser = require('./messageParser');

// ایجاد instance از MessageParser
const parser = new MessageParser();

// نمونه پیام‌های مختلف
const testMessages = [
  'PO: EURRUB-OTCp 1min BUY trc',
  'QU: EURRUB-OTCp 1min BUY trc',
  'OL: EURRUB-OTCp 1min BUY trc',
  'ORG: EURRUB-OTCp 1min BUY trc',
  'BTC-OTC',
  'ETH',
  'INVALID MESSAGE',
  'TEST: BTC-OTC 5min SELL eth'
];

console.log('🧪 تست MessageParser\n');

// تست کردن هر پیام
testMessages.forEach((message, index) => {
  console.log(`📝 تست ${index + 1}: "${message}"`);
  
  const result = parser.getMessageInfo(message);
  
  if (result.isValid) {
    console.log(`✅ پیام معتبر:`);
    console.log(`   الگو: ${result.pattern}`);
    console.log(`   نام ارز: ${result.currencyName}`);
    console.log(`   عبارت جستجو: ${result.searchTerm}`);
    console.log(`   تایم فریم: ${result.timeFrame || 'N/A'}`);
    console.log(`   جهت: ${result.direction || 'N/A'}`);
    console.log(`   شبکه: ${result.network || 'N/A'}`);
    console.log(`   نوع پیام: ${result.messageType}`);
    console.log(`   سایت‌ها: ${result.sites.join(', ')}`);
  } else {
    console.log(`❌ پیام نامعتبر: ${result.error}`);
  }
  
  console.log(''); // خط خالی
});

// تست اضافه کردن الگوی جدید
console.log('🔧 تست اضافه کردن الگوی جدید:');
parser.addPattern('CUSTOM', /^CUSTOM:\s*([A-Z]+-OTC[p]?)\s+(\d+min)\s+(BUY|SELL)\s+(\w+)/i, ['pfinance', 'example']);

const customMessage = 'CUSTOM: BTC-OTC 10min SELL bnb';
const customResult = parser.getMessageInfo(customMessage);

console.log(`📝 پیام جدید: "${customMessage}"`);
if (customResult.isValid) {
  console.log(`✅ پیام معتبر:`);
  console.log(`   الگو: ${customResult.pattern}`);
  console.log(`   نام ارز: ${customResult.currencyName}`);
  console.log(`   سایت‌ها: ${customResult.sites.join(', ')}`);
} else {
  console.log(`❌ پیام نامعتبر: ${customResult.error}`);
}

console.log('\n✅ تست MessageParser کامل شد!'); 