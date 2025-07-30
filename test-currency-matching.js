// تست منطق تطبیق ارز
function testCurrencyMatching() {
  console.log('🧪 تست منطق تطبیق ارز...\n');

  const testCases = [
    {
      messageCurrency: 'AUDUSD-OTCp',
      results: [
        { currency: 'AUDUSD-OTC', payout: '91' },
        { currency: 'AUDUSD', payout: '63' }
      ]
    },
    {
      messageCurrency: 'EURRUB-OTCp',
      results: [
        { currency: 'EURRUB-OTC', payout: '92' }
      ]
    },
    {
      messageCurrency: 'BTC-OTCp',
      results: [
        { currency: 'Bitcoin-OTC', payout: '71' },
        { currency: 'Bitcoin', payout: '23' }
      ]
    },
    {
      messageCurrency: 'ETH-OTCp',
      results: [
        { currency: 'Ethereum-OTC', payout: '61' },
        { currency: 'Ethereum', payout: 'N/A' }
      ]
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`📝 تست ${index + 1}: "${testCase.messageCurrency}"`);
    
    const matchedResult = testCase.results.find(result => {
      // تطبیق دقیق
      if (result.currency === testCase.messageCurrency) return true;
      
      // تطبیق با تغییرات OTCp -> OTC
      const normalizedCurrency = testCase.messageCurrency.replace('-OTCp', '-OTC');
      if (result.currency === normalizedCurrency) return true;
      
      // تطبیق با تغییرات OTC -> OTCp
      const normalizedResult = result.currency.replace('-OTC', '-OTCp');
      if (normalizedResult === testCase.messageCurrency) return true;
      
      // تطبیق با تغییرات نام ارز (مثل BTC -> Bitcoin)
      const currencyBase = testCase.messageCurrency.split('-')[0];
      const resultBase = result.currency.split('-')[0];
      
      // تطبیق BTC با Bitcoin
      if ((currencyBase === 'BTC' && resultBase === 'Bitcoin') ||
          (currencyBase === 'Bitcoin' && resultBase === 'BTC')) {
        return true;
      }
      
      // تطبیق ETH با Ethereum
      if ((currencyBase === 'ETH' && resultBase === 'Ethereum') ||
          (currencyBase === 'Ethereum' && resultBase === 'ETH')) {
        return true;
      }
      
      return false;
    });

    if (matchedResult) {
      console.log(`✅ تطبیق پیدا شد: ${matchedResult.currency} (${matchedResult.payout}%)`);
    } else {
      console.log(`❌ تطبیق پیدا نشد`);
      console.log(`   نتایج موجود:`);
      testCase.results.forEach(result => {
        console.log(`   - ${result.currency} (${result.payout}%)`);
      });
    }
    console.log('');
  });
}

testCurrencyMatching(); 