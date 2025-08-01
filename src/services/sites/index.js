/**
 * فایل index برای export کردن تمام ماژول‌های سایت
 */

const PFinanceSite = require('./PFinanceSite');
const OlympTradeSite = require('./OlympTradeSite');

// لیست تمام سایت‌های موجود
const availableSites = {
  pfinance: PFinanceSite,
  olymp: OlympTradeSite
};

/**
 * ایجاد instance از سایت بر اساس نام
 * @param {string} siteName - نام سایت
 * @returns {object} - instance سایت
 */
function createSite(siteName) {
  const SiteClass = availableSites[siteName];
  if (!SiteClass) {
    throw new Error(`Site ${siteName} not found`);
  }
  return new SiteClass();
}

/**
 * دریافت لیست تمام سایت‌های موجود
 * @returns {array} - آرایه نام سایت‌ها
 */
function getAvailableSites() {
  return Object.keys(availableSites);
}

/**
 * بررسی وجود سایت
 * @param {string} siteName - نام سایت
 * @returns {boolean} - آیا سایت وجود دارد
 */
function hasSite(siteName) {
  return availableSites.hasOwnProperty(siteName);
}

module.exports = {
  PFinanceSite,
  OlympTradeSite,
  availableSites,
  createSite,
  getAvailableSites,
  hasSite
}; 