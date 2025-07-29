const Currency = require('../../models/Currency');
const MessageParser = require('../../utils/messageParser');

class DashboardController {
  /**
   * صفحه اصلی داشبورد
   */
  async getDashboard(req, res) {
    try {
      // آمار کلی
      const stats = await this.getStats();
      
      // آخرین جستجوها
      const recentSearches = await Currency.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      // آمار سایت‌ها
      const siteStats = await this.getSiteStats();

      res.render('dashboard', {
        title: 'داشبورد مدیریت',
        path: '/',
        stats,
        recentSearches,
        siteStats
      });
    } catch (error) {
      console.error('❌ خطا در لود داشبورد:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * دریافت آمار کلی
   */
  async getStats() {
    const totalSearches = await Currency.countDocuments();
    const todaySearches = await Currency.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const processedSearches = await Currency.countDocuments({ status: 'processed' });
    const editedMessages = await Currency.countDocuments({ status: 'edited' });
    const deletedMessages = await Currency.countDocuments({ status: 'deleted' });

    return {
      totalSearches,
      todaySearches,
      processedSearches,
      editedMessages,
      deletedMessages
    };
  }

  /**
   * دریافت آمار سایت‌ها
   */
  async getSiteStats() {
    const pipeline = [
      { $unwind: '$results' },
      {
        $group: {
          _id: '$results.site',
          count: { $sum: 1 },
          avgPayout: {
            $avg: {
              $cond: [
                { $ne: ['$results.payout', 'N/A'] },
                { $toDouble: '$results.payout' },
                null
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await Currency.aggregate(pipeline);
  }

  /**
   * صفحه مدیریت رکوردها
   */
  async getRecords(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const status = req.query.status;
      const pattern = req.query.pattern;
      const search = req.query.search;

      // ساخت فیلتر
      const filter = {};
      if (status) filter.status = status;
      if (pattern) filter['messageInfo.pattern'] = pattern;
      if (search) {
        filter.$or = [
          { currencyName: { $regex: search, $options: 'i' } },
          { searchTerm: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await Currency.countDocuments(filter);
      const records = await Currency.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const totalPages = Math.ceil(total / limit);

      res.render('records', {
        title: 'مدیریت رکوردها',
        path: '/records',
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages
        },
        filters: { status, pattern, search }
      });
    } catch (error) {
      console.error('❌ خطا در لود رکوردها:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * صفحه مدیریت سایت‌ها
   */
  async getSites(req, res) {
    try {
      const sites = [
        {
          name: 'P.Finance',
          key: 'pfinance',
          url: 'https://p.finance/en/cabinet/try-demo/',
          status: 'active',
          patterns: ['PO', 'QU', 'OL', 'ORG', 'SIMPLE']
        },
        {
          name: 'Example Site',
          key: 'example',
          url: 'https://example.com',
          status: 'inactive',
          patterns: ['ORG']
        }
      ];

      res.render('sites', {
        title: 'مدیریت سایت‌ها',
        path: '/sites',
        sites
      });
    } catch (error) {
      console.error('❌ خطا در لود سایت‌ها:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * صفحه تنظیمات
   */
  async getSettings(req, res) {
    try {
      const config = require('../../../config.json');
      
      res.render('settings', {
        title: 'تنظیمات',
        path: '/settings',
        config
      });
    } catch (error) {
      console.error('❌ خطا در لود تنظیمات:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  /**
   * به‌روزرسانی تنظیمات
   */
  async updateSettings(req, res) {
    try {
      const { minPayout } = req.body;
      
      // به‌روزرسانی فایل config.json
      const fs = require('fs');
      const configPath = './config.json';
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      config.minPayout = parseInt(minPayout) || 70;
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      res.json({ success: true, message: 'تنظیمات با موفقیت به‌روزرسانی شد' });
    } catch (error) {
      console.error('❌ خطا در به‌روزرسانی تنظیمات:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * حذف رکورد
   */
  async deleteRecord(req, res) {
    try {
      const { id } = req.params;
      
      const record = await Currency.findByIdAndDelete(id);
      if (!record) {
        return res.status(404).json({ success: false, error: 'رکورد یافت نشد' });
      }
      
      res.json({ success: true, message: 'رکورد با موفقیت حذف شد' });
    } catch (error) {
      console.error('❌ خطا در حذف رکورد:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * دریافت آمار API
   */
  async getStatsAPI(req, res) {
    try {
      const stats = await this.getStats();
      const siteStats = await this.getSiteStats();
      
      res.json({
        success: true,
        stats,
        siteStats
      });
    } catch (error) {
      console.error('❌ خطا در دریافت آمار:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = DashboardController; 