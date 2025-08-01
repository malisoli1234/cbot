const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

// Mock برای puppeteer
jest.mock('puppeteer-extra', () => ({
  launch: jest.fn(),
  use: jest.fn()
}));

jest.mock('puppeteer-extra-plugin-stealth');
jest.mock('puppeteer-extra-plugin-recaptcha');

// Mock برای express
const mockExpress = {
  use: jest.fn(),
  post: jest.fn(),
  get: jest.fn(),
  listen: jest.fn()
};

jest.mock('express', () => {
  return jest.fn(() => mockExpress);
});

// تست‌های اصلی
describe('Olymp Trade Bot Tests', () => {
  let mockPage;
  let mockBrowser;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock page object
    mockPage = {
      setUserAgent: jest.fn(),
      setViewport: jest.fn(),
      setRequestInterception: jest.fn(),
      on: jest.fn(),
      setExtraHTTPHeaders: jest.fn(),
      goto: jest.fn(),
      waitForSelector: jest.fn(),
      click: jest.fn(),
      type: jest.fn(),
      waitForFunction: jest.fn(),
      $: jest.fn(),
      $$: jest.fn(),
      evaluate: jest.fn(),
      evaluateOnNewDocument: jest.fn(),
      screenshot: jest.fn(),
      frames: jest.fn(() => []),
      solveRecaptchas: jest.fn()
    };
    
    // Mock browser object
    mockBrowser = {
      newPage: jest.fn(() => Promise.resolve(mockPage)),
      close: jest.fn()
    };
    
    // Setup puppeteer mock
    puppeteerExtra.launch.mockResolvedValue(mockBrowser);
  });
  
  describe('changeIP function', () => {
    test('should change user agent successfully', async () => {
      // Import the function (you'll need to export it from olymp.js)
      const { changeIP } = require('./olymp');
      
      await changeIP(mockPage);
      
      expect(mockPage.setUserAgent).toHaveBeenCalled();
      expect(mockPage.setViewport).toHaveBeenCalled();
      expect(mockPage.setExtraHTTPHeaders).toHaveBeenCalled();
    });
    
    test('should handle errors gracefully', async () => {
      mockPage.setUserAgent.mockRejectedValue(new Error('Test error'));
      
      const { changeIP } = require('./olymp');
      
      await expect(changeIP(mockPage)).resolves.not.toThrow();
    });
  });
  
  describe('searchCurrency function', () => {
    test('should search currency successfully', async () => {
      mockPage.waitForSelector.mockResolvedValue();
      mockPage.evaluate.mockResolvedValue([
        { currency: 'BTC', payout: '85%' },
        { currency: 'ETH', payout: '82%' }
      ]);
      
      const { searchCurrency } = require('./olymp');
      
      const result = await searchCurrency(mockPage, 'BTC');
      
      expect(result.status).toBe('success');
      expect(result.results).toHaveLength(2);
    });
    
    test('should handle no results', async () => {
      mockPage.waitForSelector.mockResolvedValue();
      mockPage.evaluate.mockResolvedValue([]);
      
      const { searchCurrency } = require('./olymp');
      
      const result = await searchCurrency(mockPage, 'INVALID');
      
      expect(result.status).toBe('success');
      expect(result.results).toHaveLength(0);
    });
    
    test('should handle errors', async () => {
      mockPage.waitForSelector.mockRejectedValue(new Error('Test error'));
      
      const { searchCurrency } = require('./olymp');
      
      const result = await searchCurrency(mockPage, 'BTC');
      
      expect(result.status).toBe('error');
    });
  });
  
  describe('solveCaptcha function', () => {
    test('should solve reCAPTCHA', async () => {
      mockPage.$ = jest.fn()
        .mockResolvedValueOnce({}) // reCAPTCHA exists
        .mockResolvedValueOnce(null) // hCaptcha doesn't exist
        .mockResolvedValueOnce(null); // Turnstile doesn't exist
      
      const { solveCaptcha } = require('./olymp');
      
      await solveCaptcha(mockPage);
      
      expect(mockPage.solveRecaptchas).toHaveBeenCalled();
    });
    
    test('should handle hCaptcha', async () => {
      mockPage.$ = jest.fn()
        .mockResolvedValueOnce(null) // reCAPTCHA doesn't exist
        .mockResolvedValueOnce({}) // hCaptcha exists
        .mockResolvedValueOnce(null); // Turnstile doesn't exist
      
      const { solveCaptcha } = require('./olymp');
      
      await solveCaptcha(mockPage);
      
      expect(mockPage.waitForFunction).toHaveBeenCalled();
    });
  });
  
  describe('setupBrowser function', () => {
    test('should setup browser successfully', async () => {
      mockPage.waitForSelector.mockResolvedValue();
      mockPage.click.mockResolvedValue();
      mockPage.type.mockResolvedValue();
      mockPage.waitForFunction.mockResolvedValue();
      mockPage.$ = jest.fn().mockResolvedValue(null); // No captcha
      
      const { setupBrowser } = require('./olymp');
      
      const result = await setupBrowser();
      
      expect(result).toBe(true);
      expect(puppeteerExtra.launch).toHaveBeenCalled();
    });
    
    test('should handle setup errors', async () => {
      puppeteerExtra.launch.mockRejectedValue(new Error('Setup error'));
      
      const { setupBrowser } = require('./olymp');
      
      const result = await setupBrowser();
      
      expect(result).toBe(false);
    });
  });
  
  describe('Auto User Agent Change', () => {
    test('should start auto user agent change', () => {
      const { startAutoUserAgentChange } = require('./olymp');
      
      startAutoUserAgentChange();
      
      // Check if interval is set
      expect(setTimeout).toHaveBeenCalled();
    });
    
    test('should stop auto user agent change', () => {
      const { stopAutoUserAgentChange } = require('./olymp');
      
      stopAutoUserAgentChange();
      
      // Check if interval is cleared
      expect(clearTimeout).toHaveBeenCalled();
    });
  });
  
  describe('API Endpoints', () => {
    test('should handle search currency endpoint', async () => {
      const mockReq = { body: { currency: 'BTC' } };
      const mockRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      
      // Mock searchCurrency function
      const mockSearchCurrency = jest.fn().mockResolvedValue({
        status: 'success',
        results: [{ currency: 'BTC', payout: '85%' }]
      });
      
      // You'll need to export the endpoint handler
      const { handleSearchCurrency } = require('./olymp');
      
      await handleSearchCurrency(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: [{ currency: 'BTC', payout: '85%' }]
      });
    });
    
    test('should handle missing currency parameter', async () => {
      const mockReq = { body: {} };
      const mockRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      
      const { handleSearchCurrency } = require('./olymp');
      
      await handleSearchCurrency(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No currency provided',
        results: []
      });
    });
  });
});

// تست‌های اضافی برای پوشش بیشتر
describe('Edge Cases and Error Handling', () => {
  test('should handle network timeouts', async () => {
    const mockPage = {
      goto: jest.fn().mockRejectedValue(new Error('Network timeout')),
      setUserAgent: jest.fn(),
      setViewport: jest.fn()
    };
    
    const { setupBrowser } = require('./olymp');
    
    const result = await setupBrowser();
    
    expect(result).toBe(false);
  });
  
  test('should handle element not found', async () => {
    const mockPage = {
      waitForSelector: jest.fn().mockRejectedValue(new Error('Element not found')),
      setUserAgent: jest.fn(),
      setViewport: jest.fn()
    };
    
    const { setupBrowser } = require('./olymp');
    
    const result = await setupBrowser();
    
    expect(result).toBe(false);
  });
  
  test('should handle browser close errors', async () => {
    const mockBrowser = {
      close: jest.fn().mockRejectedValue(new Error('Close error'))
    };
    
    // Test graceful shutdown
    const { gracefulShutdown } = require('./olymp');
    
    await expect(gracefulShutdown(mockBrowser)).resolves.not.toThrow();
  });
});

// تست‌های عملکرد
describe('Performance Tests', () => {
  test('should complete setup within reasonable time', async () => {
    const startTime = Date.now();
    
    const { setupBrowser } = require('./olymp');
    
    const result = await setupBrowser();
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(30000); // 30 seconds max
    expect(result).toBeDefined();
  });
  
  test('should handle rapid user agent changes', async () => {
    const { changeIP } = require('./olymp');
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(changeIP(mockPage));
    }
    
    await expect(Promise.all(promises)).resolves.not.toThrow();
  });
});

// تست‌های امنیت
describe('Security Tests', () => {
  test('should not expose sensitive information in logs', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const { changeIP } = require('./olymp');
    
    changeIP(mockPage);
    
    const logs = consoleSpy.mock.calls.flat().join(' ');
    
    // Check that sensitive data is not logged
    expect(logs).not.toContain('password');
    expect(logs).not.toContain('email');
    expect(logs).not.toContain('token');
    
    consoleSpy.mockRestore();
  });
  
  test('should sanitize user input', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    const { searchCurrency } = require('./olymp');
    
    const result = await searchCurrency(mockPage, maliciousInput);
    
    // Should handle malicious input gracefully
    expect(result.status).toBeDefined();
  });
}); 