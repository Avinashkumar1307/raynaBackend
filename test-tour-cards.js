const { getTourCards } = require('./dist/chat/tools/get-tour-cards.tool');

async function testTourCards() {
  console.log('🧪 Testing tour cards tool directly...\n');

  try {
    // Test different scenarios
    const tests = [
      {
        name: 'Featured Tours - Dubai',
        input: { city: 'Dubai', carouselType: 'featured', limit: 3 }
      },
      {
        name: 'Discount Tours - All Cities', 
        input: { carouselType: 'discount', limit: 4 }
      },
      {
        name: 'Desert Safari Category',
        input: { category: 'desert safari', carouselType: 'category', limit: 2 }
      }
    ];

    for (const test of tests) {
      console.log(`📋 ${test.name}:`);
      console.log('Input:', test.input);
      
      const result = await getTourCards(test.input);
      const parsed = JSON.parse(result);
      
      if (parsed.success && parsed.data?.carousel) {
        console.log('✅ Success!');
        console.log('Title:', parsed.data.carousel.title);
        console.log('Cards count:', parsed.data.carousel.cards?.length || 0);
        
        if (parsed.data.carousel.cards?.length > 0) {
          const card = parsed.data.carousel.cards[0];
          console.log('Sample card:');
          console.log('  - Title:', card.title);
          console.log('  - Price:', card.currentPrice, card.currency);
          console.log('  - Discount:', card.discountPercentage ? `${card.discountPercentage}%` : 'None');
          console.log('  - Location:', card.location);
        }
      } else {
        console.log('❌ Failed:', parsed.message || 'Unknown error');
      }
      
      console.log('─'.repeat(50));
    }

  } catch (error) {
    console.error('ERROR:', error);
  }
}

testTourCards();