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
    }
    return this.initialized;
  }

  async searchCurrency(req, res) {
    try {
      const { currency, message, telegramMessageId, telegramChannelId } = req.body;
      
      let searchResults;
      let searchTerm = currency;
      let searchId = 'temp-id';
      const startTime = Date.now();

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
        
        // محاسبه بهترین payout
        let bestPayout = 'N/A';
        let payoutReason = '';
        const allResults = searchResults.flatMap(result => result.results || []);
        
        if (allResults.length > 0) {
          const validPayouts = allResults
            .filter(r => r.payout && r.payout !== 'N/A')
            .map(r => ({ payout: parseFloat(r.payout), currency: r.currency }));
          
          if (validPayouts.length > 0) {
            const best = validPayouts.reduce((max, current) => 
              current.payout > max.payout ? current : max
            );
            bestPayout = best.payout.toString();
            payoutReason = `بهترین payout: ${best.currency} با ${bestPayout}%`;
          } else {
            payoutReason = 'هیچ payout معتبری یافت نشد';
          }
        }
        
        // ذخیره در دیتابیس با اطلاعات پیام (اگر دیتابیس در دسترس باشه)
        try {
          const currencyRecord = new Currency({
            currencyName: result.messageInfo.currencyName,
            searchTerm: searchTerm,
            results: searchResults.map(result => ({
              site: result.site,
              currency: result.currencyName || result.messageInfo.currencyName,
              payout: result.results?.[0]?.payout || 'N/A',
              originalLabel: result.results?.[0]?.originalLabel || '',
              originalPayout: result.results?.[0]?.originalPayout || ''
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
            },
            bestPayout: bestPayout,
            payoutReason: payoutReason,
            searchDuration: Date.now() - startTime
          });

          await currencyRecord.save();
          searchId = currencyRecord._id;
          console.log(`💾 نتایج در دیتابیس ذخیره شد: ${result.messageInfo.currencyName} - بهترین payout: ${bestPayout}%`);
        } catch (dbError) {
          console.log(`⚠️ Could not save to database: ${dbError.message}`);
        }

        return res.json({
          status: 'success',
          message: `جستجو برای ${result.messageInfo.currencyName} انجام شد`,
          results: searchResults.flatMap(result => result.results || []),
          searchId: searchId,
          messageInfo: result.messageInfo,
          searchedSites: result.searchedSites,
          bestPayout: bestPayout,
          payoutReason: payoutReason
        });

      } else if (currency) {
        // جستجوی ساده بر اساس نام ارز
        console.log(`🔍 درخواست جستجو برای: ${currency}`);
        searchResults = await this.scrapingService.searchCurrency(currency);
        
        // محاسبه بهترین payout
        let bestPayout = 'N/A';
        let payoutReason = '';
        const allResults = searchResults.flatMap(result => result.results || []);
        
        if (allResults.length > 0) {
          const validPayouts = allResults
            .filter(r => r.payout && r.payout !== 'N/A')
            .map(r => ({ payout: parseFloat(r.payout), currency: r.currency }));
          
          if (validPayouts.length > 0) {
            const best = validPayouts.reduce((max, current) => 
              current.payout > max.payout ? current : max
            );
            bestPayout = best.payout.toString();
            payoutReason = `بهترین payout: ${best.currency} با ${bestPayout}%`;
          } else {
            payoutReason = 'هیچ payout معتبری یافت نشد';
          }
        }
        
        // ذخیره در دیتابیس (اگر دیتابیس در دسترس باشه)
        try {
          const currencyRecord = new Currency({
            currencyName: currency,
            searchTerm: currency,
            results: searchResults.map(result => ({
              site: result.site,
              currency: result.currencyName || currency,
              payout: result.results?.[0]?.payout || 'N/A',
              originalLabel: result.results?.[0]?.originalLabel || '',
              originalPayout: result.results?.[0]?.originalPayout || ''
            })),
            telegramMessageId: telegramMessageId || 0,
            telegramChannelId: telegramChannelId || '',
            status: 'processed',
            bestPayout: bestPayout,
            payoutReason: payoutReason,
            searchDuration: Date.now() - startTime
          });

          await currencyRecord.save();
          searchId = currencyRecord._id;
          console.log(`💾 نتایج در دیتابیس ذخیره شد: ${currency} - بهترین payout: ${bestPayout}%`);
        } catch (dbError) {
          console.log(`⚠️ Could not save to database: ${dbError.message}`);
        }

        return res.json({
          status: 'success',
          message: `جستجو برای ${currency} انجام شد`,
          results: searchResults.flatMap(result => result.results || []),
          searchId: searchId,
          bestPayout: bestPayout,
          payoutReason: payoutReason
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