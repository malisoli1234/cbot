import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  Search,
  CheckCircle,
  Edit,
  Delete,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState({
    totalSearches: 0,
    todaySearches: 0,
    processedSearches: 0,
    editedMessages: 0,
    deletedMessages: 0,
  });

  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const chartData = [
    { name: 'شنبه', searches: 45, processed: 42 },
    { name: 'یکشنبه', searches: 52, processed: 48 },
    { name: 'دوشنبه', searches: 38, processed: 35 },
    { name: 'سه‌شنبه', searches: 61, processed: 58 },
    { name: 'چهارشنبه', searches: 47, processed: 44 },
    { name: 'پنج‌شنبه', searches: 55, processed: 52 },
    { name: 'جمعه', searches: 43, processed: 40 },
  ];

  const siteStats = [
    { name: 'P.Finance', searches: 156, success: 142, color: '#40916c' },
    { name: 'Example Site', searches: 89, success: 78, color: '#52b788' },
    { name: 'Test Site', searches: 67, success: 61, color: '#74c69d' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalSearches: 1247,
        todaySearches: 43,
        processedSearches: 1189,
        editedMessages: 156,
        deletedMessages: 23,
      });

      setRecentSearches([
        {
          id: 1,
          currency: 'EUR/USD',
          site: 'P.Finance',
          status: 'success',
          time: '2 دقیقه پیش',
          result: '1.0850',
        },
        {
          id: 2,
          currency: 'GBP/JPY',
          site: 'Example Site',
          status: 'pending',
          time: '5 دقیقه پیش',
          result: 'در حال پردازش',
        },
        {
          id: 3,
          currency: 'USD/CHF',
          site: 'P.Finance',
          status: 'error',
          time: '8 دقیقه پیش',
          result: 'خطا',
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const getStatusChip = (status) => {
    const statusConfig = {
      success: { color: 'success', label: 'موفق' },
      pending: { color: 'warning', label: 'در حال پردازش' },
      error: { color: 'error', label: 'خطا' },
    };

    const config = statusConfig[status] || statusConfig.error;
    return <Chip label={config.label} color={config.color} size="small" />;
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
          داشبورد
        </Typography>
        <Typography variant="body1" color="text.secondary">
          نمای کلی سیستم مدیریت ربات‌های ارز
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="کل جستجوها"
            value={stats.totalSearches}
            icon={<Search />}
            color="primary"
            subtitle={`${stats.todaySearches} جستجوی امروز`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="پردازش شده"
            value={stats.processedSearches}
            icon={<CheckCircle />}
            color="success"
            subtitle={`${Math.round((stats.processedSearches / stats.totalSearches) * 100)}% نرخ موفقیت`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ویرایش شده"
            value={stats.editedMessages}
            icon={<Edit />}
            color="warning"
            subtitle="پیام‌های ویرایش شده"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="حذف شده"
            value={stats.deletedMessages}
            icon={<Delete />}
            color="error"
            subtitle="پیام‌های حذف شده"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                آمار هفتگی جستجوها
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="searches"
                    stroke="#40916c"
                    strokeWidth={3}
                    name="جستجوها"
                  />
                  <Line
                    type="monotone"
                    dataKey="processed"
                    stroke="#74c69d"
                    strokeWidth={3}
                    name="پردازش شده"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                آمار سایت‌ها
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={siteStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="searches" fill="#40916c" name="جستجوها" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Searches */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">جستجوهای اخیر</Typography>
            <Tooltip title="بروزرسانی">
              <IconButton>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ارز</TableCell>
                  <TableCell>سایت</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>نتیجه</TableCell>
                  <TableCell>زمان</TableCell>
                  <TableCell>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentSearches.map((search) => (
                  <TableRow key={search.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {search.currency}
                      </Typography>
                    </TableCell>
                    <TableCell>{search.site}</TableCell>
                    <TableCell>{getStatusChip(search.status)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={search.status === 'error' ? 'error.main' : 'text.primary'}
                      >
                        {search.result}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {search.time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="مشاهده جزئیات">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard; 