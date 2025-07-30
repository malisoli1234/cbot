import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  LinearProgress,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save,
  Refresh,
  Settings as SettingsIcon,
  Notifications,
  Security,
  Speed,
  Storage,
} from '@mui/icons-material';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'پنل مدیریت ارزها',
      adminEmail: 'admin@example.com',
      timezone: 'Asia/Tehran',
      language: 'fa',
    },
    scraping: {
      maxConcurrentSearches: 5,
      searchTimeout: 30,
      retryAttempts: 3,
      enableAutoRetry: true,
      enableProxy: false,
      proxyUrl: '',
    },
    telegram: {
      botToken: 'YOUR_BOT_TOKEN_HERE',
      channelId: '@YOUR_CHANNEL_ID_HERE',
      enabled: false,
      enableNotifications: true,
      notificationTypes: ['success', 'error', 'warning'],
      messageFormat: 'detailed',
    },
    database: {
      connectionString: 'mongodb://localhost:27017/currencies',
      maxConnections: 10,
      enableLogging: true,
      backupEnabled: true,
      backupInterval: 24,
    },
    performance: {
      cacheEnabled: true,
      cacheTTL: 300,
      enableCompression: true,
      maxMemoryUsage: 512,
    },
    server: {
      port: 5000,
      autoOpenBrowser: true,
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (data.status === 'success') {
          setSettings({
            general: {
              siteName: 'پنل مدیریت ارزها',
              adminEmail: 'admin@example.com',
              timezone: 'Asia/Tehran',
              language: 'fa',
            },
            scraping: {
              maxConcurrentSearches: 5,
              searchTimeout: 30,
              retryAttempts: 3,
              enableAutoRetry: true,
              enableProxy: false,
              proxyUrl: '',
            },
            telegram: {
              botToken: data.data.telegram?.botToken || 'YOUR_BOT_TOKEN_HERE',
              channelId: data.data.telegram?.channelId || '@YOUR_CHANNEL_ID_HERE',
              enabled: data.data.telegram?.enabled || false,
              enableNotifications: true,
              notificationTypes: ['success', 'error', 'warning'],
              messageFormat: 'detailed',
            },
            database: {
              connectionString: data.data.database?.uri || 'mongodb://localhost:27017/currencies',
              maxConnections: 10,
              enableLogging: true,
              backupEnabled: true,
              backupInterval: 24,
            },
            performance: {
              cacheEnabled: true,
              cacheTTL: 300,
              enableCompression: true,
              maxMemoryUsage: 512,
            },
            server: {
              port: data.data.server?.port || 5000,
              autoOpenBrowser: data.data.server?.autoOpenBrowser !== false,
            },
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram: {
            botToken: settings.telegram.botToken,
            channelId: settings.telegram.channelId,
            enabled: settings.telegram.enabled,
          },
          server: {
            autoOpenBrowser: settings.server.autoOpenBrowser,
          },
        }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        // Show success message
        console.log('Settings saved successfully');
      } else {
        console.error('Error saving settings:', data.message);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default settings
    setSettings({
      general: {
        siteName: 'پنل مدیریت ارزها',
        adminEmail: 'admin@example.com',
        timezone: 'Asia/Tehran',
        language: 'fa',
      },
      scraping: {
        maxConcurrentSearches: 5,
        searchTimeout: 30,
        retryAttempts: 3,
        enableAutoRetry: true,
        enableProxy: false,
        proxyUrl: '',
      },
      telegram: {
        botToken: 'your-bot-token-here',
        channelId: '@your-channel',
        enableNotifications: true,
        notificationTypes: ['success', 'error', 'warning'],
        messageFormat: 'detailed',
      },
      database: {
        connectionString: 'mongodb://localhost:27017/currencies',
        maxConnections: 10,
        enableLogging: true,
        backupEnabled: true,
        backupInterval: 24,
      },
      performance: {
        cacheEnabled: true,
        cacheTTL: 300,
        enableCompression: true,
        maxMemoryUsage: 512,
      },
    });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
          تنظیمات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مدیریت تنظیمات سیستم
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          تغییرات اعمال شده پس از ذخیره‌سازی فعال خواهند شد.
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  تنظیمات عمومی
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="نام سایت"
                value={settings.general.siteName}
                onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="ایمیل مدیر"
                value={settings.general.adminEmail}
                onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>منطقه زمانی</InputLabel>
                <Select
                  value={settings.general.timezone}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  label="منطقه زمانی"
                >
                  <MenuItem value="Asia/Tehran">تهران (UTC+3:30)</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="Europe/London">لندن (UTC+0)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>زبان</InputLabel>
                <Select
                  value={settings.general.language}
                  onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                  label="زبان"
                >
                  <MenuItem value="fa">فارسی</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Scraping Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Speed sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  تنظیمات اسکرپینگ
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                حداکثر جستجوهای همزمان
              </Typography>
              <Slider
                value={settings.scraping.maxConcurrentSearches}
                onChange={(e, value) => handleSettingChange('scraping', 'maxConcurrentSearches', value)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="تایم‌اوت جستجو (ثانیه)"
                type="number"
                value={settings.scraping.searchTimeout}
                onChange={(e) => handleSettingChange('scraping', 'searchTimeout', parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="تعداد تلاش مجدد"
                type="number"
                value={settings.scraping.retryAttempts}
                onChange={(e) => handleSettingChange('scraping', 'retryAttempts', parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.scraping.enableAutoRetry}
                    onChange={(e) => handleSettingChange('scraping', 'enableAutoRetry', e.target.checked)}
                    color="primary"
                  />
                }
                label="تلاش مجدد خودکار"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.scraping.enableProxy}
                    onChange={(e) => handleSettingChange('scraping', 'enableProxy', e.target.checked)}
                    color="primary"
                  />
                }
                label="استفاده از پروکسی"
              />

              {settings.scraping.enableProxy && (
                <TextField
                  fullWidth
                  label="آدرس پروکسی"
                  value={settings.scraping.proxyUrl}
                  onChange={(e) => handleSettingChange('scraping', 'proxyUrl', e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Telegram Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  تنظیمات تلگرام
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="توکن ربات"
                value={settings.telegram.botToken}
                onChange={(e) => handleSettingChange('telegram', 'botToken', e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="شناسه کانال"
                value={settings.telegram.channelId}
                onChange={(e) => handleSettingChange('telegram', 'channelId', e.target.value)}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.telegram.enableNotifications}
                    onChange={(e) => handleSettingChange('telegram', 'enableNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="فعال کردن اعلان‌ها"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth>
                <InputLabel>فرمت پیام</InputLabel>
                <Select
                  value={settings.telegram.messageFormat}
                  onChange={(e) => handleSettingChange('telegram', 'messageFormat', e.target.value)}
                  label="فرمت پیام"
                >
                  <MenuItem value="simple">ساده</MenuItem>
                  <MenuItem value="detailed">مفصل</MenuItem>
                  <MenuItem value="compact">فشرده</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Database Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Storage sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  تنظیمات دیتابیس
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="رشته اتصال"
                value={settings.database.connectionString}
                onChange={(e) => handleSettingChange('database', 'connectionString', e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="حداکثر اتصالات"
                type="number"
                value={settings.database.maxConnections}
                onChange={(e) => handleSettingChange('database', 'maxConnections', parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.database.enableLogging}
                    onChange={(e) => handleSettingChange('database', 'enableLogging', e.target.checked)}
                    color="primary"
                  />
                }
                label="فعال کردن لاگ"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.database.backupEnabled}
                    onChange={(e) => handleSettingChange('database', 'backupEnabled', e.target.checked)}
                    color="primary"
                  />
                }
                label="فعال کردن پشتیبان‌گیری"
                sx={{ mb: 2 }}
              />

              {settings.database.backupEnabled && (
                <TextField
                  fullWidth
                  label="فاصله پشتیبان‌گیری (ساعت)"
                  type="number"
                  value={settings.database.backupInterval}
                  onChange={(e) => handleSettingChange('database', 'backupInterval', parseInt(e.target.value))}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Speed sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  تنظیمات عملکرد
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performance.cacheEnabled}
                        onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="فعال کردن کش"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="زمان زنده ماندن کش (ثانیه)"
                    type="number"
                    value={settings.performance.cacheTTL}
                    onChange={(e) => handleSettingChange('performance', 'cacheTTL', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performance.enableCompression}
                        onChange={(e) => handleSettingChange('performance', 'enableCompression', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="فعال کردن فشرده‌سازی"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="حداکثر استفاده حافظه (MB)"
                    type="number"
                    value={settings.performance.maxMemoryUsage}
                    onChange={(e) => handleSettingChange('performance', 'maxMemoryUsage', parseInt(e.target.value))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleResetSettings}
        >
          بازنشانی
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </Button>
      </Box>
    </Box>
  );
}

export default Settings; 