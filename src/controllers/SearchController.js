const ScrapingService = require('../services/ScrapingService');
const Currency = require('../models/Currency');

class SearchController {
  constructor() {
    this.scrapingService = new ScrapingService();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = await this.scrapingService.initialize();
      
      // راه‌اندازی سایت‌های فعال
      for (const site of Object.values(this.scrapingService.sites)) {
        await this.scrapingService.setupSite(site);
      }
    }
    return this.initialized;
  }

  async searchCurrency(req, res) {
    try {
      const { currency, message, telegramMessageId, telegramChannelId } = req.body;
      
      let searchResults;
      let searchTerm = currency;

      // اگر پیام کامل ارسال شده، از MessageParser استفاده کن
      if (message) {
        console.log(`📨 درخواست جستجو بر اساس پیام: ${message}`);
        const result = await this.scrapingService.searchByMessage(message);
        
        if (!result.success) {
          return res.status(400).json({
            status: 'error',
            message: result.error,
            results: []
          });
        }

        searchResults = result.searchResults;
        searchTerm = result.messageInfo.searchTerm;
        
        // ذخیره در دیتابیس با اطلاعات پیام (اگر دیتابیس در دسترس باشه)
        try {
          const currencyRecord = new Currency({
            currencyName: result.messageInfo.currencyName,
            searchTerm: searchTerm,
            results: searchResults.map(result => ({
              site: result.site,
              currency: result.currencyName || result.messageInfo.currencyName,
              payout: result.results?.[0]?.payout || 'N/A'
            })),
            telegramMessageId: telegramMessageId || 0,
            telegramChannelId: telegramChannelId || '',
            status: 'processed',
            messageInfo: {
              pattern: result.messageInfo.pattern,
              timeFrame: result.messageInfo.timeFrame,
              direction: result.messageInfo.direction,
              network: result.messageInfo.network,
              messageType: result.messageInfo.messageType
            }
          });

          await currencyRecord.save();
          console.log(`💾 نتایج در دیتابیس ذخیره شد: ${result.messageInfo.currencyName}`);
        } catch (dbError) {
          console.log(`⚠️ Could not save to database: ${dbError.message}`);
        }

        return res.json({
          status: 'success',
          message: `جستجو برای ${result.messageInfo.currencyName} انجام شد`,
          results: searchResults.flatMap(result => result.results || []),
          searchId: 'temp-id',
          messageInfo: result.messageInfo,
          searchedSites: result.searchedSites
        });

      } else if (currency) {
        // جستجوی ساده بر اساس نام ارز
        console.log(`🔍 درخواست جستجو برای: ${currency}`);
        searchResults = await this.scrapingService.searchCurrency(currency);
        
        // ذخیره در دیتابیس (اگر دیتابیس در دسترس باشه)
        try {
          const currencyRecord = new Currency({
            currencyName: currency,
            searchTerm: currency,
            results: searchResults.map(result => ({
              site: result.site,
              currency: result.currencyName || currency,
              payout: result.results?.[0]?.payout || 'N/A'
            })),
            telegramMessageId: telegramMessageId || 0,
            telegramChannelId: telegramChannelId || '',
            status: 'processed'
          });

          await currencyRecord.save();
          console.log(`💾 نتایج در دیتابیس ذخیره شد: ${currency}`);
        } catch (dbError) {
          console.log(`⚠️ Could not save to database: ${dbError.message}`);
        }

        return res.json({
          status: 'success',
          message: `جستجو برای ${currency} انجام شد`,
          results: searchResults.flatMap(result => result.results || []),
          searchId: currencyRecord._id
        });

      } else {
        return res.status(400).json({
          status: 'error',
          message: 'نام ارز یا پیام الزامی است',
          results: []
        });
      }

    } catch (error) {
      console.error(`❌ خطا در جستجو: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: `خطا در جستجو: ${error.message}`,
        results: []
      });
    }
  }

  async getSearchHistory(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const history = await Currency.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      return res.json({
        status: 'success',
        data: history,
        total: await Currency.countDocuments()
      });

    } catch (error) {
      console.error(`❌ خطا در دریافت تاریخچه: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: `خطا در دریافت تاریخچه: ${error.message}`
      });
    }
  }

  async getSearchById(req, res) {
    try {
      const { id } = req.params;
      
      const search = await Currency.findById(id);
      if (!search) {
        return res.status(404).json({
          status: 'error',
          message: 'جستجو یافت نشد'
        });
      }

      return res.json({
        status: 'success',
        data: search
      });

    } catch (error) {
      console.error(`❌ خطا در دریافت جستجو: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: `خطا در دریافت جستجو: ${error.message}`
      });
    }
  }

  async close() {
    await this.scrapingService.close();
  }
}

module.exports = SearchController; 