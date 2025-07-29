/**
 * Admin Panel JavaScript
 */

class AdminPanel {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadStats();
    this.setupRealTimeUpdates();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Delete record buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.deleteRecord(btn.dataset.id);
      });
    });

    // Settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.updateSettings();
      });
    }

    // Search and filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.debounce(() => this.filterRecords(), 300);
      });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.filterRecords();
      });
    }
  }

  async loadStats() {
    try {
      const response = await fetch('/admin/api/stats');
      const data = await response.json();
      
      if (data.success) {
        this.updateStatsDisplay(data.stats);
        this.updateSiteStats(data.siteStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  updateStatsDisplay(stats) {
    const elements = {
      'total-searches': stats.totalSearches,
      'today-searches': stats.todaySearches,
      'processed-searches': stats.processedSearches,
      'edited-messages': stats.editedMessages,
      'deleted-messages': stats.deletedMessages
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value.toLocaleString();
      }
    });
  }

  updateSiteStats(siteStats) {
    const container = document.getElementById('site-stats');
    if (!container) return;

    container.innerHTML = siteStats.map(site => `
      <div class="stat-card">
        <div class="stat-number">${site.count}</div>
        <div class="stat-label">${site._id}</div>
        <div class="text-light">میانگین payout: ${site.avgPayout ? site.avgPayout.toFixed(2) : 'N/A'}%</div>
      </div>
    `).join('');
  }

  async deleteRecord(id) {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این رکورد را حذف کنید؟')) {
      return;
    }

    try {
      const response = await fetch(`/admin/api/records/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showAlert('رکورد با موفقیت حذف شد', 'success');
        document.querySelector(`[data-id="${id}"]`).closest('tr').remove();
      } else {
        this.showAlert(data.error, 'danger');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      this.showAlert('خطا در حذف رکورد', 'danger');
    }
  }

  async updateSettings() {
    const form = document.getElementById('settings-form');
    const formData = new FormData(form);
    
    try {
      const response = await fetch('/admin/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          minPayout: formData.get('minPayout')
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showAlert('تنظیمات با موفقیت به‌روزرسانی شد', 'success');
      } else {
        this.showAlert(data.error, 'danger');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      this.showAlert('خطا در به‌روزرسانی تنظیمات', 'danger');
    }
  }

  filterRecords() {
    const search = document.getElementById('search-input')?.value || '';
    const status = document.getElementById('status-filter')?.value || '';
    const pattern = document.getElementById('pattern-filter')?.value || '';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (pattern) params.append('pattern', pattern);

    window.location.href = `/admin/records?${params.toString()}`;
  }

  setupRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
      this.loadStats();
    }, 30000);
  }

  showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container') || this.createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }

  createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Chart functions
  createChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Simple chart implementation
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // You can integrate with Chart.js or any other charting library here
    console.log('Chart data:', data);
  }

  // Export functions
  exportData(type = 'csv') {
    const table = document.querySelector('.table');
    if (!table) return;

    let csv = '';
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cols = row.querySelectorAll('td, th');
      const rowData = Array.from(cols).map(col => `"${col.textContent.trim()}"`);
      csv += rowData.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminPanel = new AdminPanel();
});

// Utility functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleString('fa-IR');
}

function formatNumber(number) {
  return number.toLocaleString('fa-IR');
}

function getStatusBadge(status) {
  const badges = {
    'processed': 'badge-success',
    'edited': 'badge-info',
    'deleted': 'badge-danger',
    'pending': 'badge-warning'
  };
  
  return `<span class="badge ${badges[status] || 'badge-info'}">${status}</span>`;
} 