/**
 * ماژول پردازش پیام‌های تلگرام
 * تشخیص نوع پیام و مسیریابی به سایت‌های مناسب
 */

class MessageParser {
  constructor() {
    // تعریف الگوهای مختلف پیام
    this.patterns = {
      // پیام‌های با کدهای مختلف
      PO: /^PO:\s*([A-Z]+-OTC[p]?)\s+(\d+min)\s+(BUY|SELL)\s+(\w+)/i,
      QU: /^QU:\s*([A-Z]+-OTC[p]?)\s+(\d+min)\s+(BUY|SELL)\s+(\w+)/i,
      OL: /^OL:\s*([A-Z]+-OTC[p]?)\s+(\d+min)\s+(BUY|SELL)\s+(\w+)/i,
      ORG: /^ORG:\s*([A-Z]+-OTC[p]?)\s+(\d+min)\s+(BUY|SELL)\s+(\w+)/i,
      
      // پیام‌های ساده بدون prefix
      SIMPLE_FORMAT: /^([A-Z]+-OTC[p]?)\s+(\d+min)\s+(BUY|SELL)\s+(\w+)/i,
      
      // پیام‌های ساده
      SIMPLE: /^([A-Z]+-OTC[p]?|[A-Z]+)/,
      
      // پیام‌های با فرمت خاص
      FORMATTED: /^([A-Z]{2,4}):\s*([A-Z]+-OTC[p]?)\s+(\d+min)\s+(BUY|SELL)\s+(\w+)/i
    };

    // تعریف سایت‌های مربوط به هر کد
    this.siteMapping = {
      PO: ['pfinance'], // پیام‌های PO فقط در P.Finance
      QU: ['pfinance'], // پیام‌های QU فقط در P.Finance
      OL: ['pfinance'], // پیام‌های OL فقط در P.Finance
      ORG: ['pfinance', 'example'], // پیام‌های ORG در همه سایت‌ها
      SIMPLE_FORMAT: ['pfinance'], // پیام‌های ساده بدون prefix در P.Finance
      SIMPLE: ['pfinance'], // پیام‌های ساده در P.Finance
      DEFAULT: ['pfinance'] // پیش‌فرض
    };
  }

  /**
   * پردازش پیام تلگرام
   * @param {string} messageText - متن پیام
   * @returns {object} - نتیجه پردازش
   */
  parseMessage(messageText) {
    try {
      const cleanMessage = messageText.trim();
      
      // بررسی الگوهای مختلف
      for (const [patternName, pattern] of Object.entries(this.patterns)) {
        const match = cleanMessage.match(pattern);
        if (match) {
          return this.processMatch(patternName, match, cleanMessage);
        }
      }

      // اگر هیچ الگویی پیدا نشد
      return {
        success: false,
        error: 'فرمت پیام شناخته نشد',
        originalText: cleanMessage
      };

    } catch (error) {
      return {
        success: false,
        error: `خطا در پردازش پیام: ${error.message}`,
        originalText: messageText
      };
    }
  }

  /**
   * پردازش match پیدا شده
   * @param {string} patternName - نام الگو
   * @param {array} match - نتیجه match
   * @param {string} originalText - متن اصلی
   * @returns {object} - نتیجه پردازش
   */
  processMatch(patternName, match, originalText) {
    let currencyName, timeFrame, direction, network, sites;

    switch (patternName) {
      case 'PO':
      case 'QU':
      case 'OL':
        currencyName = match[1];
        timeFrame = match[2];
        direction = match[3];
        network = match[4];
        sites = this.siteMapping[patternName] || this.siteMapping.DEFAULT;
        break;

      case 'ORG':
        currencyName = match[1];
        timeFrame = match[2];
        direction = match[3];
        network = match[4];
        sites = this.siteMapping.ORG; // در همه سایت‌ها
        break;

      case 'SIMPLE_FORMAT':
        currencyName = match[1];
        timeFrame = match[2];
        direction = match[3];
        network = match[4];
        sites = this.siteMapping.SIMPLE_FORMAT;
        break;

      case 'FORMATTED':
        const code = match[1];
        currencyName = match[2];
        timeFrame = match[3];
        direction = match[4];
        network = match[5];
        sites = this.siteMapping[code] || this.siteMapping.DEFAULT;
        break;

      case 'SIMPLE':
        currencyName = match[1];
        timeFrame = null;
        direction = null;
        network = null;
        sites = this.siteMapping.SIMPLE;
        break;

      default:
        return {
          success: false,
          error: 'الگوی ناشناخته',
          originalText: originalText
        };
    }

    return {
      success: true,
      pattern: patternName,
      currencyName: currencyName,
      timeFrame: timeFrame,
      direction: direction,
      network: network,
      sites: sites,
      originalText: originalText,
      searchTerm: this.extractSearchTerm(currencyName)
    };
  }

  /**
   * استخراج عبارت جستجو از نام ارز
   * @param {string} currencyName - نام ارز
   * @returns {string} - عبارت جستجو
   */
  extractSearchTerm(currencyName) {
    if (!currencyName) return '';
    
    // حذف پسوندهای خاص
    let searchTerm = currencyName;
    if (searchTerm.endsWith('-OTCp')) {
      searchTerm = searchTerm.slice(0, -1);
    }
    
    // جداسازی نام اصلی
    return searchTerm.split('-')[0];
  }

  /**
   * اعتبارسنجی پیام
   * @param {object} parsedMessage - پیام پردازش شده
   * @returns {boolean} - آیا پیام معتبر است
   */
  validateMessage(parsedMessage) {
    if (!parsedMessage.success) return false;
    
    // بررسی وجود نام ارز
    if (!parsedMessage.currencyName) return false;
    
    // بررسی وجود سایت‌های مناسب
    if (!parsedMessage.sites || parsedMessage.sites.length === 0) return false;
    
    return true;
  }

  /**
   * دریافت اطلاعات کامل پیام
   * @param {string} messageText - متن پیام
   * @returns {object} - اطلاعات کامل پیام
   */
  getMessageInfo(messageText) {
    const parsed = this.parseMessage(messageText);
    
    if (!parsed.success) {
      return {
        isValid: false,
        error: parsed.error,
        originalText: messageText
      };
    }

    const isValid = this.validateMessage(parsed);
    
    return {
      isValid,
      pattern: parsed.pattern,
      currencyName: parsed.currencyName,
      timeFrame: parsed.timeFrame,
      direction: parsed.direction,
      network: parsed.network,
      sites: parsed.sites,
      searchTerm: parsed.searchTerm,
      originalText: parsed.originalText,
      messageType: this.getMessageType(parsed.pattern)
    };
  }

  /**
   * تشخیص نوع پیام
   * @param {string} pattern - نام الگو
   * @returns {string} - نوع پیام
   */
  getMessageType(pattern) {
    const typeMap = {
      PO: 'payout',
      QU: 'quote',
      OL: 'order',
      ORG: 'organization',
      SIMPLE: 'simple',
      FORMATTED: 'formatted'
    };
    
    return typeMap[pattern] || 'unknown';
  }

  /**
   * اضافه کردن الگوی جدید
   * @param {string} patternName - نام الگو
   * @param {regex} pattern - الگوی regex
   * @param {array} sites - سایت‌های مربوطه
   */
  addPattern(patternName, pattern, sites) {
    this.patterns[patternName] = pattern;
    this.siteMapping[patternName] = sites;
  }

  /**
   * به‌روزرسانی mapping سایت‌ها
   * @param {string} patternName - نام الگو
   * @param {array} sites - سایت‌های جدید
   */
  updateSiteMapping(patternName, sites) {
    this.siteMapping[patternName] = sites;
  }
}

module.exports = MessageParser; 