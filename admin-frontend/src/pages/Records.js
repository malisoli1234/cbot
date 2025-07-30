import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  LinearProgress,
  Grid,
  Alert,
} from '@mui/material';
import {
  Search,
  Delete,
  Visibility,
  FilterList,
  Refresh,
  Download,
  CheckCircle,
  Error,
  Pending,
  Info,
  Edit,
} from '@mui/icons-material';

function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [botActionFilter, setBotActionFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const recordsPerPage = 10;

  // دریافت رکوردها از API
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/history');
      const data = await response.json();
      
      if (data.status === 'success') {
        setRecords(data.data || []);
      } else {
        setError('خطا در دریافت رکوردها');
      }
    } catch (error) {
      console.error('خطا در دریافت رکوردها:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // فیلتر کردن رکوردها
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.currencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.searchTerm?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesBotAction = botActionFilter === 'all' || record.botAction === botActionFilter;
    const matchesSite = siteFilter === 'all' || record.searchedSites?.includes(siteFilter);
    
    return matchesSearch && matchesStatus && matchesBotAction && matchesSite;
  });

  // محاسبه رکوردهای قابل نمایش
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage
  );

  const getStatusChip = (status) => {
    const statusConfig = {
      success: { color: 'success', icon: <CheckCircle />, label: 'موفق' },
      error: { color: 'error', icon: <Error />, label: 'خطا' },
      pending: { color: 'warning', icon: <Pending />, label: 'در انتظار' },
      deleted: { color: 'default', icon: <Delete />, label: 'حذف شده' },
      edited: { color: 'info', icon: <CheckCircle />, label: 'ویرایش شده' },
      processed: { color: 'success', icon: <CheckCircle />, label: 'پردازش شده' },
    };

    const config = statusConfig[status] || statusConfig.error;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getBotActionChip = (botAction) => {
    const actionConfig = {
      none: { color: 'default', icon: <Info />, label: 'هیچ عملی' },
      deleted: { color: 'error', icon: <Delete />, label: 'حذف شد' },
      edited: { color: 'info', icon: <Edit />, label: 'ویرایش شد' },
      kept: { color: 'success', icon: <CheckCircle />, label: 'نگه داشته شد' },
    };

    const config = actionConfig[botAction] || actionConfig.none;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'نامشخص';
    const date = new Date(timestamp);
    return date.toLocaleString('fa-IR');
  };

  const formatResults = (results) => {
    if (!results || results.length === 0) return 'هیچ نتیجه‌ای';
    
    return results.map(result => 
      `${result.currency}: ${result.payout}%`
    ).join(', ');
  };

  const formatPayoutInfo = (record) => {
    if (record.bestPayout && record.bestPayout !== 'N/A') {
      return `${record.bestPayout}%`;
    }
    return 'N/A';
  };

  const formatSearchedSites = (record) => {
    if (record.searchedSites && Array.isArray(record.searchedSites)) {
      return record.searchedSites.join(', ');
    }
    if (record.results && Array.isArray(record.results)) {
      const sites = [...new Set(record.results.map(r => r.site))];
      return sites.join(', ');
    }
    return 'نامشخص';
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    // TODO: پیاده‌سازی حذف رکورد
    console.log('حذف رکورد:', id);
  };

  const handleExport = () => {
    // TODO: پیاده‌سازی export
    console.log('Export records');
  };

  const handleRefresh = () => {
    fetchRecords();
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
          رکوردها
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مدیریت و مشاهده تمام جستجوهای انجام شده
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="جستجو در رکوردها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>وضعیت</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="وضعیت"
              >
                <MenuItem value="all">همه</MenuItem>
                <MenuItem value="processed">پردازش شده</MenuItem>
                <MenuItem value="deleted">حذف شده</MenuItem>
                <MenuItem value="edited">ویرایش شده</MenuItem>
                <MenuItem value="pending">در انتظار</MenuItem>
                <MenuItem value="error">خطا</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>عملیات ربات</InputLabel>
              <Select
                value={botActionFilter}
                onChange={(e) => setBotActionFilter(e.target.value)}
                label="عملیات ربات"
              >
                <MenuItem value="all">همه</MenuItem>
                <MenuItem value="none">هیچ عملی</MenuItem>
                <MenuItem value="deleted">حذف شد</MenuItem>
                <MenuItem value="edited">ویرایش شد</MenuItem>
                <MenuItem value="kept">نگه داشته شد</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>سایت</InputLabel>
              <Select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                label="سایت"
              >
                <MenuItem value="all">همه</MenuItem>
                <MenuItem value="P.Finance">P.Finance</MenuItem>
                <MenuItem value="Example Site">Example Site</MenuItem>
                <MenuItem value="Test Site">Test Site</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Tooltip title="بروزرسانی">
                <IconButton onClick={handleRefresh}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="خروجی">
                <IconButton onClick={handleExport}>
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ارز</TableCell>
                  <TableCell>سایت</TableCell>
                  <TableCell>بهترین Payout</TableCell>
                  <TableCell>عملیات ربات</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>نتیجه</TableCell>
                  <TableCell>زمان پردازش</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {record.currencyName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.searchTerm}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatSearchedSites(record)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={record.bestPayout && record.bestPayout !== 'N/A' ? 'success.main' : 'text.secondary'}
                        sx={{ fontWeight: 600 }}
                      >
                        {formatPayoutInfo(record)}
                      </Typography>
                      {record.payoutReason && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {record.payoutReason}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getBotActionChip(record.botAction)}</TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={record.status === 'error' ? 'error.main' : 'text.primary'}
                      >
                        {formatResults(record.results)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {record.searchDuration ? `${record.searchDuration}ms` : 'نامشخص'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatTimestamp(record.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="مشاهده جزئیات">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(record)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(filteredRecords.length / recordsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>جزئیات رکورد</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ارز
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.currencyName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    عبارت جستجو
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.searchTerm}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    سایت‌های جستجو شده
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatSearchedSites(selectedRecord)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    بهترین Payout
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, color: 'success.main', fontWeight: 600 }}>
                    {formatPayoutInfo(selectedRecord)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    وضعیت
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {getStatusChip(selectedRecord.status)}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    عملیات ربات
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {getBotActionChip(selectedRecord.botAction)}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    زمان پردازش
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.searchDuration ? `${selectedRecord.searchDuration}ms` : 'نامشخص'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    تاریخ ایجاد
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatTimestamp(selectedRecord.createdAt)}
                  </Typography>
                </Grid>
                {selectedRecord.payoutReason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      دلیل Payout
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedRecord.payoutReason}
                    </Typography>
                  </Grid>
                )}
                {selectedRecord.messageInfo && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      اطلاعات پیام
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      الگو: {selectedRecord.messageInfo.pattern || 'نامشخص'}<br/>
                      بازه زمانی: {selectedRecord.messageInfo.timeFrame || 'نامشخص'}<br/>
                      جهت: {selectedRecord.messageInfo.direction || 'نامشخص'}<br/>
                      شبکه: {selectedRecord.messageInfo.network || 'نامشخص'}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    نتایج جستجو
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatResults(selectedRecord.results)}
                  </Typography>
                </Grid>
                {selectedRecord.telegramMessageId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      اطلاعات تلگرام
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      ID پیام: {selectedRecord.telegramMessageId}<br/>
                      ID کانال: {selectedRecord.telegramChannelId}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Records; 