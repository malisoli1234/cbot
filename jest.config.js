module.exports = {
  // تنظیمات Jest
  testEnvironment: 'node',
  
  // مسیرهای تست
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // مسیرهای نادیده گرفته شده
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // تنظیمات coverage
  collectCoverageFrom: [
    '*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js',
    '!test.js'
  ],
  
  // گزارش‌های coverage
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // آستانه coverage
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // تنظیمات timeout
  testTimeout: 30000,
  
  // تنظیمات verbose
  verbose: true,
  
  // تنظیمات setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // تنظیمات module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // تنظیمات transform
  transform: {},
  
  // تنظیمات extensions
  moduleFileExtensions: ['js', 'json'],
  
  // تنظیمات globals
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
}; 