/**
 * فایل تست برای MessageParser
 * این فایل نشان می‌دهد که چگونه MessageParser کار می‌کند
 */

const MessageParser = require('./messageParser');

// تست MessageParser
const parser = new MessageParser();

// تست پیام‌های مختلف
const testMessages = [
  'EURRUB-OTCp 1min BUY trc',
  'PO: EURRUB-OTCp 1min BUY trc',
  'QU: EURRUB-OTCp 1min BUY trc',
  'OL: EURRUB-OTCp 1min BUY trc',
  'ORG: EURRUB-OTCp 1min BUY trc',
  'EURRUB-OTC 1min BUY trc',
  'BTC-OTCp 5min SELL eth',
  'Invalid message'
];

console.log('🧪 تست MessageParser:\n');

testMessages.forEach((message, index) => {
  console.log(`📝 تست ${index + 1}: "${message}"`);
  const result = parser.parseMessage(message);
  
  if (result.success) {
    console.log(`✅ موفق: ${result.pattern}`);
    console.log(`   ارز: ${result.currencyName}`);
    console.log(`   زمان: ${result.timeFrame}`);
    console.log(`   جهت: ${result.direction}`);
    console.log(`   شبکه: ${result.network}`);
    console.log(`   سایت‌ها: ${result.sites.join(', ')}`);
    console.log(`   جستجو: ${result.searchTerm}`);
  } else {
    console.log(`❌ ناموفق: ${result.error}`);
  }
  console.log('');
}); 