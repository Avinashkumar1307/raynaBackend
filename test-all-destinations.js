const { getTourCards } = require('./dist/chat/tools/get-tour-cards.tool');

async function testAllDestinations() {
  console.log('🧪 Testing all destinations with tour cards...\n');

  const destinations = [
    // Middle East
    { name: 'Dubai', country: 'UAE' },
    { name: 'Abu Dhabi', country: 'UAE' },
    { name: 'Ras Al Khaimah', country: 'UAE' },
    { name: 'Jeddah', country: 'Saudi Arabia' },
    { name: 'Riyadh', country: 'Saudi Arabia' },
    { name: 'Makkah', country: 'Saudi Arabia' },
    { name: 'Dammam', country: 'Saudi Arabia' },
    { name: 'Muscat', country: 'Oman' },
    { name: 'Khasab', country: 'Oman' },
    
    // Southeast Asia
    { name: 'Bangkok', country: 'Thailand' },
    { name: 'Phuket', country: 'Thailand' },
    { name: 'Krabi', country: 'Thailand' },
    { name: 'Koh Samui', country: 'Thailand' },
    { name: 'Pattaya', country: 'Thailand' },
    { name: 'Bali', country: 'Indonesia' },
    { name: 'Kuala Lumpur', country: 'Malaysia' },
    { name: 'Langkawi', country: 'Malaysia' },
    { name: 'Penang', country: 'Malaysia' },
    { name: 'Singapore', country: 'Singapore' }
  ];

  const results = [];

  for (const destination of destinations) {
    try {
      console.log(`🌍 Testing ${destination.name}, ${destination.country}...`);
      
      const result = await getTourCards({ 
        city: destination.name, 
        carouselType: 'location', 
        limit: 4 
      });
      
      const parsed = JSON.parse(result);
      
      const testResult = {
        destination: destination.name,
        country: destination.country,
        success: parsed.success,
        cardsCount: parsed.data?.carousel?.cards?.length || 0,
        dataSource: parsed.data?.dataSource || 'unknown',
        onlyTransfers: false
      };

      // Check if only transfers
      if (parsed.data?.carousel?.cards) {
        testResult.onlyTransfers = parsed.data.carousel.cards.every(card => 
          card.category?.toLowerCase().includes('transfer') ||
          card.title?.toLowerCase().includes('transfer') ||
          card.title?.toLowerCase().includes('pickup') ||
          card.title?.toLowerCase().includes('drop')
        );
      }

      results.push(testResult);

      if (parsed.success && parsed.data?.carousel?.cards?.length > 0) {
        console.log(`  ✅ ${testResult.cardsCount} cards | Source: ${testResult.dataSource} | Transfers only: ${testResult.onlyTransfers}`);
        
        // Show first card as sample
        const firstCard = parsed.data.carousel.cards[0];
        console.log(`  📋 Sample: ${firstCard.title} | ${firstCard.category} | ${firstCard.currency} ${firstCard.currentPrice}`);
      } else {
        console.log(`  ❌ Failed or no cards`);
      }

    } catch (error) {
      console.log(`  💥 Error: ${error.message}`);
      results.push({
        destination: destination.name,
        country: destination.country,
        success: false,
        cardsCount: 0,
        dataSource: 'error',
        error: error.message
      });
    }

    // Brief pause between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 SUMMARY:');
  console.log('=====================================');
  
  const successful = results.filter(r => r.success && r.cardsCount > 0);
  const transfersOnly = results.filter(r => r.success && r.onlyTransfers);
  const staticDataUsed = results.filter(r => r.dataSource === 'static');
  const apiDataUsed = results.filter(r => r.dataSource === 'api');

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`🚚 Transfers Only: ${transfersOnly.length} destinations`);
  console.log(`📦 Static Data Used: ${staticDataUsed.length} destinations`);
  console.log(`🌐 API Data Used: ${apiDataUsed.length} destinations`);

  console.log('\n🚚 Destinations with only transfers (should use static fallback):');
  transfersOnly.forEach(r => {
    console.log(`  - ${r.destination}, ${r.country} (${r.cardsCount} cards, source: ${r.dataSource})`);
  });

  console.log('\n📦 Destinations using static data:');
  staticDataUsed.forEach(r => {
    console.log(`  - ${r.destination}, ${r.country} (${r.cardsCount} cards)`);
  });

  console.log('\n❌ Failed destinations:');
  const failed = results.filter(r => !r.success || r.cardsCount === 0);
  failed.forEach(r => {
    console.log(`  - ${r.destination}, ${r.country} (${r.error || 'No cards'})`);
  });
}

testAllDestinations();