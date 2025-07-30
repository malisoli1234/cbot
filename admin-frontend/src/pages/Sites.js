import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Language,
  CheckCircle,
  Error,
  Settings,
  Visibility,
} from '@mui/icons-material';

function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    active: true,
    description: '',
  });

  // Mock data
  const mockSites = [
    {
      id: 1,
      name: 'P.Finance',
      url: 'https://p.finance',
      active: true,
      description: 'سایت اصلی برای جستجوی ارزها',
      status: 'online',
      lastCheck: '2024-01-15 14:30:25',
      successRate: 95,
      totalSearches: 1247,
    },
    {
      id: 2,
      name: 'Example Site',
      url: 'https://example.com',
      active: true,
      description: 'سایت نمونه برای تست',
      status: 'online',
      lastCheck: '2024-01-15 14:28:12',
      successRate: 87,
      totalSearches: 892,
    },
    {
      id: 3,
      name: 'Test Site',
      url: 'https://test.com',
      active: false,
      description: 'سایت تست غیرفعال',
      status: 'offline',
      lastCheck: '2024-01-15 14:25:45',
      successRate: 0,
      totalSearches: 0,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSites(mockSites);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      online: { color: 'success', label: 'آنلاین', icon: <CheckCircle /> },
      offline: { color: 'error', label: 'آفلاین', icon: <Error /> },
    };

    const config = statusConfig[status] || statusConfig.offline;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setFormData({
      name: '',
      url: '',
      active: true,
      description: '',
    });
    setDialogOpen(true);
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      url: site.url,
      active: site.active,
      description: site.description,
    });
    setDialogOpen(true);
  };

  const handleDeleteSite = (id) => {
    setSites(sites.filter(site => site.id !== id));
  };

  const handleSaveSite = () => {
    if (editingSite) {
      // Update existing site
      setSites(sites.map(site =>
        site.id === editingSite.id
          ? { ...site, ...formData }
          : site
      ));
    } else {
      // Add new site
      const newSite = {
        id: Date.now(),
        ...formData,
        status: 'online',
        lastCheck: new Date().toLocaleString('fa-IR'),
        successRate: 0,
        totalSearches: 0,
      };
      setSites([...sites, newSite]);
    }
    setDialogOpen(false);
  };

  const handleToggleSite = (id) => {
    setSites(sites.map(site =>
      site.id === id
        ? { ...site, active: !site.active }
        : site
    ));
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
            سایت‌ها
          </Typography>
          <Typography variant="body1" color="text.secondary">
            مدیریت سایت‌های اسکرپینگ
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddSite}
          sx={{ borderRadius: 2 }}
        >
          افزودن سایت
        </Button>
      </Box>

      {/* Sites Grid */}
      <Grid container spacing={3}>
        {sites.map((site) => (
          <Grid item xs={12} md={6} lg={4} key={site.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Language sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {site.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="تنظیمات">
                      <IconButton size="small">
                        <Settings />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ویرایش">
                      <IconButton size="small" onClick={() => handleEditSite(site)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSite(site.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {site.description}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>آدرس:</strong> {site.url}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      وضعیت
                    </Typography>
                    {getStatusChip(site.status)}
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={site.active}
                        onChange={() => handleToggleSite(site.id)}
                        color="primary"
                      />
                    }
                    label="فعال"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      نرخ موفقیت
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {site.successRate}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      کل جستجوها
                    </Typography>
                    <Typography variant="h6" color="text.primary">
                      {site.totalSearches}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  آخرین بررسی: {site.lastCheck}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSite ? 'ویرایش سایت' : 'افزودن سایت جدید'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="نام سایت"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="آدرس سایت"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="توضیحات"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  color="primary"
                />
              }
              label="فعال"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>لغو</Button>
          <Button
            variant="contained"
            onClick={handleSaveSite}
            disabled={!formData.name || !formData.url}
          >
            {editingSite ? 'ویرایش' : 'افزودن'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sites; 