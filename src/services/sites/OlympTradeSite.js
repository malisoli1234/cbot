const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const express = require('express');
const BaseSite = require('./BaseSite');

puppeteer.use(StealthPlugin());

class OlympTradeSite extends BaseSite {
  constructor() {
    super('Olymp Trade', 'https://olymptrade.com/platform');
    this.apiPort = 3001;
    this.browser = null;
    this.page = null;
    this.startApiServer();
  }

  startApiServer() {
    const app = express();
    app.use(express.json());

    app.get('/api/currencies', async (req, res) => {
      try {
        console.log('Request for all currencies from Olymp Trade');
        
        if (!this.page) {
          return res.status(500).json({ 
            status: 'error', 
            message: 'Olymp Trade browser not initialized' 
          });
        }

        await this.page.waitForSelector('.asset-selector', { timeout: 5000 });
        await this.page.click('.asset-selector');
        
        await this.page.waitForSelector('.asset-list', { timeout: 5000 });
        
        const currencies = await this.page.evaluate(() => {
          const items = document.querySelectorAll('.asset-list .asset-item');
          const results = [];
          
          items.forEach(item => {
            try {
              const name = item.querySelector('.asset-name')?.textContent?.trim() || 'N/A';
              const payout = item.querySelector('.asset-payout')?.textContent?.trim() || 'N/A';
              
              results.push({
                currency: name,
                payout: payout.replace('+', '').replace('%', '')
              });
            } catch (e) {
              console.error('Error extracting currency:', e);
            }
          });
          
          return results;
        });

        console.log(`${currencies.length} currencies extracted from Olymp Trade`);
        res.json({ status: 'success', results: currencies });
        
      } catch (e) {
        console.error('Error getting currencies:', e.message);
        res.status(500).json({ 
          status: 'error', 
          message: `Error getting currencies: ${e.message}` 
        });
      }
    });

    app.post('/api/search-currency', async (req, res) => {
      try {
        const { currency } = req.body;
        console.log(`Currency search request: ${currency}`);
        
        if (!currency) {
          return res.status(400).json({ 
            status: 'error', 
            message: 'Currency name not provided' 
          });
        }

        if (!this.page) {
          return res.status(500).json({ 
            status: 'error', 
            message: 'Olymp Trade browser not initialized' 
          });
        }

        await this.page.waitForSelector('.asset-selector', { timeout: 5000 });
        await this.page.click('.asset-selector');
        
        await this.page.waitForSelector('.asset-search', { timeout: 5000 });
        
        await this.page.evaluate(() => {
          const searchField = document.querySelector('.asset-search');
          if (searchField) searchField.value = '';
        });
        
        await this.page.type('.asset-search', currency);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const results = await this.page.evaluate(() => {
          const items = document.querySelectorAll('.asset-list .asset-item');
          const results = [];
          
          items.forEach(item => {
            try {
              const name = item.querySelector('.asset-name')?.textContent?.trim() || 'N/A';
              const payout = item.querySelector('.asset-payout')?.textContent?.trim() || 'N/A';
              
              results.push({
                currency: name,
                payout: payout.replace('+', '').replace('%', ''),
                originalLabel: name,
                originalPayout: payout
              });
            } catch (e) {
              console.error('Error extracting result:', e);
            }
          });
          
          return results;
        });

        console.log(`Search for ${currency} in Olymp Trade: ${results.length} results`);
        res.json({ 
          status: 'success', 
          message: `Search completed for ${currency}`,
          results 
        });
        
      } catch (e) {
        console.error('Error searching currency:', e.message);
        res.status(500).json({ 
          status: 'error', 
          message: `Error searching currency: ${e.message}` 
        });
      }
    });

    this.apiServer = app.listen(this.apiPort, '0.0.0.0', () => {
      console.log(`Olymp Trade API server started on port ${this.apiPort}`);
    });
  }

  async setup() {
    try {
      console.log('Setting up Olymp Trade...');
      
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-webgl',
          '--disable-accelerated-2d-canvas',
          '--blink-settings=imagesEnabled=false',
          '--disable-extensions',
          '--disable-logging',
          '--log-level=3',
          '--silent-launch',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        ],
      });

      this.page = await this.browser.newPage();
      
      await this.page.setViewport({ width: 1280, height: 720 });
      
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log('Navigating to Olymp Trade...');
      await this.page.goto('https://olymptrade.com/platform', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      console.log(`Page title: ${await this.page.title()}`);

      const loginButton = await this.page.$('.login-button');
      if (loginButton) {
        console.log('Login required detected');
        await this.handleLogin();
      } else {
        console.log('User already logged in');
      }

      console.log('Looking for Asset button...');
      await this.page.waitForSelector('.asset-selector', { timeout: 10000 });
      await this.page.click('.asset-selector');
      
      console.log('Olymp Trade setup completed');
      return true;
      
    } catch (e) {
      console.error(`Error setting up Olymp Trade: ${e.message}`);
      
      if (e.message.includes('ERR_CONNECTION_REFUSED') || e.message.includes('ERR_CONNECTION_TIMED_OUT')) {
        console.log('Connection troubleshooting suggestions:');
        console.log('1. Use VPN');
        console.log('2. Change DNS to 8.8.8.8 or 1.1.1.1');
        console.log('3. Use proxy');
      }
      
      return false;
    }
  }

  async handleLogin() {
    try {
      console.log('Logging in...');
      
      await this.page.waitForSelector('.login-button', { timeout: 5000 });
      await this.page.click('.login-button');
      
      await this.page.waitForSelector('.login-form', { timeout: 5000 });
      
      await this.page.waitForSelector('.email-input', { timeout: 5000 });
      await this.page.type('.email-input', 'your-email@example.com');
      
      await this.page.waitForSelector('.password-input', { timeout: 5000 });
      await this.page.type('.password-input', 'your-password');
      
      await this.page.waitForSelector('.submit-button', { timeout: 5000 });
      await this.page.click('.submit-button');
      
      const captchaElement = await this.page.$('.captcha-container');
      if (captchaElement) {
        console.log('CAPTCHA detected. Please solve manually.');
        console.log('Waiting for CAPTCHA solution...');
        
        await this.page.waitForFunction(() => {
          return !document.querySelector('.captcha-container') || 
                 document.querySelector('.captcha-container').style.display === 'none';
        }, { timeout: 60000 });
        
        console.log('CAPTCHA solved');
      }
      
      console.log('Login successful');
      
    } catch (e) {
      console.error(`Login error: ${e.message}`);
      throw e;
    }
  }

  async search(currencyName) {
    try {
      console.log(`Searching ${currencyName} in Olymp Trade...`);
      
      const response = await fetch(`http://localhost:${this.apiPort}/api/search-currency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency: currencyName })
      });
      
      const result = await response.json();
      console.log(`Search result: ${JSON.stringify(result)}`);
      return result;
      
    } catch (e) {
      console.error(`Error searching ${currencyName}: ${e.message}`);
      return {
        status: 'error',
        message: `Search error: ${e.message}`,
        results: []
      };
    }
  }

  async getAllCurrencies() {
    try {
      console.log('Getting all currencies from Olymp Trade...');
      
      const response = await fetch(`http://localhost:${this.apiPort}/api/currencies`);
      const result = await response.json();
      
      console.log(`${result.results?.length || 0} currencies received`);
      return result;
      
    } catch (e) {
      console.error(`Error getting currencies: ${e.message}`);
      return {
        status: 'error',
        message: `Error getting currencies: ${e.message}`,
        results: []
      };
    }
  }

  async close() {
    try {
      console.log('Closing Olymp Trade...');
      
      if (this.browser) {
        await this.browser.close();
        console.log('Browser closed');
      }
      
      if (this.apiServer) {
        this.apiServer.close();
        console.log('API server closed');
      }
      
    } catch (e) {
      console.error(`Error closing Olymp Trade: ${e.message}`);
    }
  }
}

module.exports = OlympTradeSite; 