const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/database');
const SearchController = require('./controllers/SearchController');

const app = express();
const PORT = process.env.PORT || 5000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'admin/views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize controller
const searchController = new SearchController();

// Admin panel static files
app.use('/admin/css', express.static(path.join(__dirname, 'admin/public/css')));
app.use('/admin/js', express.static(path.join(__dirname, 'admin/public/js')));

// Admin panel routes
const adminRoutes = require('./admin/routes/admin');
app.use('/admin', adminRoutes);

// React app static files
app.use(express.static(path.join(__dirname, '../admin-frontend/build')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/admin') && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../admin-frontend/build/index.html'));
  }
});

// API Routes
app.post('/api/search', async (req, res) => {
  await searchController.searchCurrency(req, res);
});

app.get('/api/history', async (req, res) => {
  await searchController.getSearchHistory(req, res);
});

app.get('/api/search/:id', async (req, res) => {
  await searchController.getSearchById(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'خطای داخلی سرور'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'مسیر یافت نشد'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await searchController.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await searchController.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize search controller
    await searchController.initialize();
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🎛️ Admin Panel: http://localhost:${PORT}/admin`);
      console.log(`🚀 React App: http://localhost:${PORT}`);
      
      // باز کردن React app بعد از 3 ثانیه
      setTimeout(() => {
        const { exec } = require('child_process');
        const url = `http://localhost:${PORT}`;
        
        // تشخیص سیستم عامل و باز کردن مرورگر
        if (process.platform === 'win32') {
          exec(`start ${url}`);
        } else if (process.platform === 'darwin') {
          exec(`open ${url}`);
        } else {
          exec(`xdg-open ${url}`);
        }
        
        console.log(`🌐 React app opened in browser: ${url}`);
      }, 3000);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 