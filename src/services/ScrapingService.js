const BrowserManager = require('./BrowserManager');
const CurrencyParser = require('../utils/currencyParser');
const MessageParser = require('../utils/messageParser');

// Import site modules
const { PFinanceSite, ExampleSite } = require('./sites');

class ScrapingService {
  constructor() {
    this.browserManager = new BrowserManager();
    this.initialized = false;
    this.messageParser = new MessageParser();
    
    // تعریف سایت‌ها با نام‌های مشخص
    this.sites = {
      pfinance: new PFinanceSite(),
      // example: new ExampleSite(), // برای فعال کردن، این خط رو uncomment کنید
    };
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = await this.browserManager.initialize();
      
      // راه‌اندازی سایت‌های فعال
      for (const site of Object.values(this.sites)) {
        await this.setupSite(site);
      }
    }
    return this.initialized;
  }

  async setupSite(site) {
    const page = await this.browserManager.getPage(site.name);
    if (!page) {
      throw new Error(`Failed to get page for ${site.name}`);
    }

    return await site.setup(page);
  }



  async searchCurrency(currencyName, targetSites = null) {
    const results = [];
    
    // اگر سایت‌های خاصی مشخص نشده، در همه سایت‌ها جستجو کن
    const sitesToSearch = targetSites || Object.values(this.sites);
    
    for (const site of sitesToSearch) {
      try {
        console.log(`🔍 جستجو در ${site.name} برای: ${currencyName}`);
        const siteResult = await this.searchInSite(site, currencyName);
        if (siteResult && siteResult.success) {
          results.push(siteResult);
        }
      } catch (error) {
        console.error(`❌ خطا در جستجو در ${site.name}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * جستجو بر اساس پیام تلگرام
   * @param {string} messageText - متن پیام تلگرام
   * @returns {object} - نتیجه جستجو
   */
  async searchByMessage(messageText) {
    try {
      // پردازش پیام
      const messageInfo = this.messageParser.getMessageInfo(messageText);
      
      if (!messageInfo.isValid) {
        return {
          success: false,
          error: messageInfo.error,
          originalText: messageInfo.originalText
        };
      }

      console.log(`📨 پردازش پیام: ${messageInfo.pattern} - ${messageInfo.currencyName}`);

      // انتخاب سایت‌های مناسب
      const targetSites = [];
      for (const siteName of messageInfo.sites) {
        if (this.sites[siteName]) {
          targetSites.push(this.sites[siteName]);
        }
      }

      if (targetSites.length === 0) {
        return {
          success: false,
          error: 'هیچ سایت مناسبی برای این پیام یافت نشد',
          messageInfo: messageInfo
        };
      }

      // جستجو در سایت‌های انتخاب شده
      const searchResults = await this.searchCurrency(messageInfo.searchTerm, targetSites);

      return {
        success: true,
        messageInfo: messageInfo,
        searchResults: searchResults,
        searchedSites: targetSites.map(site => site.name)
      };

    } catch (error) {
      console.error(`❌ خطا در جستجو بر اساس پیام: ${error.message}`);
      return {
        success: false,
        error: `خطا در جستجو: ${error.message}`,
        originalText: messageText
      };
    }
  }

  async searchInSite(site, currencyName) {
    const page = await this.browserManager.getPage(site.name);
    
    if (!page) {
      throw new Error(`Page not available for ${site.name}`);
    }

    return await site.searchCurrency(page, currencyName);
  }

  async close() {
    await this.browserManager.close();
  }
}

module.exports = ScrapingService; 