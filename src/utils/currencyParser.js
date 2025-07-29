/**
 * ماژول پردازش و فیلتر کردن نام ارزها
 */

class CurrencyParser {
  /**
   * استخراج نام ارز از متن پیام
   * @param {string} messageText - متن پیام
   * @returns {object} - نتیجه پردازش
   */
  static extractCurrency(messageText) {
    try {
      // الگوهای مختلف برای تشخیص نام ارز
      const patterns = [
        /^([A-Z]+-OTC[p]?|[A-Z]+)/,  // BTC-OTC, BTC-OTCp, BTC
        /^([A-Z]+)\s*$/,              // BTC (فقط حروف بزرگ)
        /^([A-Z]+)\s*[-_]\s*([A-Z]+)/, // BTC-USDT
      ];

      for (const pattern of patterns) {
        const match = messageText.trim().match(pattern);
        if (match) {
          let currencyName = match[1];
          
          // پردازش پسوندهای خاص
          if (currencyName.endsWith('-OTCp')) {
            currencyName = currencyName.slice(0, -1); // حذف p از انتها
          }
          
          // جداسازی نام اصلی برای جستجو
          const searchCurrency = currencyName.split('-')[0];
          
          return {
            success: true,
            originalName: currencyName,
            searchTerm: searchCurrency,
            fullName: currencyName
          };
        }
      }

      return {
        success: false,
        error: 'نام ارز معتبر یافت نشد',
        originalText: messageText
      };
    } catch (error) {
      return {
        success: false,
        error: `خطا در پردازش نام ارز: ${error.message}`,
        originalText: messageText
      };
    }
  }

  /**
   * اعتبارسنجی نام ارز
   * @param {string} currencyName - نام ارز
   * @returns {boolean} - آیا نام ارز معتبر است
   */
  static isValidCurrency(currencyName) {
    if (!currencyName || typeof currencyName !== 'string') {
      return false;
    }

    // حذف فاصله‌ها و کاراکترهای اضافی
    const cleanName = currencyName.trim().toUpperCase();
    
    // چک کردن طول نام ارز
    if (cleanName.length < 2 || cleanName.length > 10) {
      return false;
    }

    // چک کردن اینکه فقط حروف و اعداد باشد
    if (!/^[A-Z0-9-]+$/.test(cleanName)) {
      return false;
    }

    return true;
  }

  /**
   * فرمت کردن نام ارز برای نمایش
   * @param {string} currencyName - نام ارز
   * @returns {string} - نام فرمت شده
   */
  static formatCurrencyName(currencyName) {
    if (!currencyName) return '';
    
    let formatted = currencyName.trim().toUpperCase();
    
    // حذف اسلش و فرمت نام ارز
    formatted = formatted.replace('/', '');
    
    // تبدیل OTC به فرمت استاندارد
    if (formatted.includes(' OTC')) {
      formatted = formatted.replace(' OTC', '-OTC');
    }
    
    return formatted;
  }

  /**
   * استخراج اطلاعات اضافی از نام ارز
   * @param {string} currencyName - نام ارز
   * @returns {object} - اطلاعات استخراج شده
   */
  static parseCurrencyInfo(currencyName) {
    const info = {
      base: '',
      quote: '',
      type: 'spot', // spot, otc, futures
      isOTC: false,
      isFutures: false
    };

    if (!currencyName) return info;

    const upperName = currencyName.toUpperCase();
    
    // تشخیص نوع ارز
    if (upperName.includes('-OTC')) {
      info.type = 'otc';
      info.isOTC = true;
      info.base = upperName.replace('-OTC', '');
    } else if (upperName.includes('-FUTURES') || upperName.includes('-FUT')) {
      info.type = 'futures';
      info.isFutures = true;
      info.base = upperName.replace(/-FUTURES?/i, '');
    } else if (upperName.includes('-')) {
      // جفت ارز مثل BTC-USDT
      const parts = upperName.split('-');
      info.base = parts[0];
      info.quote = parts[1];
    } else {
      // ارز تکی
      info.base = upperName;
    }

    return info;
  }

  /**
   * تولید نام‌های مختلف برای جستجو
   * @param {string} currencyName - نام اصلی ارز
   * @returns {array} - آرایه نام‌های مختلف برای جستجو
   */
  static generateSearchTerms(currencyName) {
    const terms = [];
    
    if (!currencyName) return terms;

    const info = this.parseCurrencyInfo(currencyName);
    
    // نام اصلی
    terms.push(currencyName);
    
    // نام پایه
    if (info.base && info.base !== currencyName) {
      terms.push(info.base);
    }
    
    // نام بدون پسوند
    const cleanName = currencyName.replace(/-OTC|-FUTURES?/gi, '');
    if (cleanName !== currencyName) {
      terms.push(cleanName);
    }
    
    // حذف موارد تکراری
    return [...new Set(terms)];
  }
}

module.exports = CurrencyParser; 