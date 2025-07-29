const express = require('express');
const DashboardController = require('../controllers/DashboardController');

const router = express.Router();
const dashboardController = new DashboardController();

// صفحه اصلی داشبورد
router.get('/', dashboardController.getDashboard.bind(dashboardController));

// مدیریت رکوردها
router.get('/records', dashboardController.getRecords.bind(dashboardController));

// مدیریت سایت‌ها
router.get('/sites', dashboardController.getSites.bind(dashboardController));

// تنظیمات
router.get('/settings', dashboardController.getSettings.bind(dashboardController));

// API ها
router.get('/api/stats', dashboardController.getStatsAPI.bind(dashboardController));
router.post('/api/settings', dashboardController.updateSettings.bind(dashboardController));
router.delete('/api/records/:id', dashboardController.deleteRecord.bind(dashboardController));

module.exports = router; 