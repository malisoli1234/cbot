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
} from '@mui/material';
import {
  Search,
  Delete,
  Visibility,
  FilterList,
  Refresh,
  Download,
} from '@mui/icons-material';

function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const recordsPerPage = 10;

  // Mock data
  const mockRecords = [
    {
      id: 1,
      currency: 'EUR/USD',
      site: 'P.Finance',
      status: 'success',
      result: '1.0850',
      timestamp: '2024-01-15 14:30:25',
      messageInfo: 'PO: EURUSD-OTCp 1min BUY trc',
      processingTime: '2.3s',
    },
    {
      id: 2,
      currency: 'GBP/JPY',
      site: 'Example Site',
      status: 'error',
      result: 'خطا در اتصال',
      timestamp: '2024-01-15 14:28:12',
      messageInfo: 'QU: GBPJPY-OTCp 5min SELL trc',
      processingTime: '5.1s',
    },
    {
      id: 3,
      currency: 'USD/CHF',
      site: 'P.Finance',
      status: 'success',
      result: '0.8920',
      timestamp: '2024-01-15 14:25:45',
      messageInfo: 'OL: USDCHF-OTCp 1min BUY trc',
      processingTime: '1.8s',
    },
    {
      id: 4,
      currency: 'AUD/CAD',
      site: 'Test Site',
      status: 'pending',
      result: 'در حال پردازش',
      timestamp: '2024-01-15 14:22:18',
      messageInfo: 'ORG: AUDCAD-OTCp 1min BUY trc',
      processingTime: '0.0s',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRecords(mockRecords);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      success: { color: 'success', label: 'موفق' },
      error: { color: 'error', label: 'خطا' },
      pending: { color: 'warning', label: 'در حال پردازش' },
    };

    const config = statusConfig[status] || statusConfig.error;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.messageInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesSite = siteFilter === 'all' || record.site === siteFilter;
    
    return matchesSearch && matchesStatus && matchesSite;
  });

  const paginatedRecords = filteredRecords.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage
  );

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    setRecords(records.filter(record => record.id !== id));
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting records...');
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
                <MenuItem value="success">موفق</MenuItem>
                <MenuItem value="error">خطا</MenuItem>
                <MenuItem value="pending">در حال پردازش</MenuItem>
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
                <IconButton>
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
                        {record.currency}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.messageInfo}
                      </Typography>
                    </TableCell>
                    <TableCell>{record.site}</TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={record.status === 'error' ? 'error.main' : 'text.primary'}
                      >
                        {record.result}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {record.processingTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {record.timestamp}
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
                    {selectedRecord.currency}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    سایت
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.site}
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
                    زمان پردازش
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.processingTime}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    پیام اصلی
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.messageInfo}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    نتیجه
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.result}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    تاریخ و زمان
                  </Typography>
                  <Typography variant="body1">
                    {selectedRecord.timestamp}
                  </Typography>
                </Grid>
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