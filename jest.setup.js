// تنظیمات Jest setup
global.console = {
  ...console,
  // غیرفعال کردن console.log در تست‌ها
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

// Mock برای setTimeout و clearTimeout
global.setTimeout = jest.fn((callback, delay) => {
  return setTimeout(callback, delay);
});

global.clearTimeout = jest.fn((id) => {
  return clearTimeout(id);
});

// Mock برای setInterval و clearInterval
global.setInterval = jest.fn((callback, delay) => {
  return setInterval(callback, delay);
});

global.clearInterval = jest.fn((id) => {
  return clearInterval(id);
});

// Mock برای process.exit
process.exit = jest.fn();

// تنظیمات محیط تست
process.env.NODE_ENV = 'test';

// Mock برای Date.now
const originalDateNow = Date.now;
Date.now = jest.fn(() => 1640995200000); // 2022-01-01 00:00:00 UTC

// Restore original Date.now after tests
afterAll(() => {
  Date.now = originalDateNow;
});

// تنظیمات global variables
global.__TEST__ = true; 