const { getTourCards } = require('./dist/chat/tools/get-tour-cards.tool');

async function testDammamTours() {
  console.log('🧪 Testing Dammam tour cards...\n');

  try {
    // Test Dammam tours specifically
    const result = await getTourCards({ 
      city: 'Dammam', 
      carouselType: 'location', 
      limit: 6 
    });
    
    const parsed = JSON.parse(result);
    
    console.log('✅ Result:', JSON.stringify(parsed, null, 2));
    
    if (parsed.success && parsed.data?.carousel) {
      console.log('\n🎠 TOUR CAROUSEL SUCCESS!');
      console.log('Title:', parsed.data.carousel.title);
      console.log('Cards count:', parsed.data.carousel.cards?.length || 0);
      console.log('Data source:', parsed.data.dataSource);
      
      if (parsed.data.carousel.cards?.length > 0) {
        console.log('\n📋 Sample cards:');
        parsed.data.carousel.cards.forEach((card, index) => {
          console.log(`${index + 1}. ${card.title} | ${card.category} | ${card.currency} ${card.currentPrice} | ${card.duration}`);
          console.log(`   🔗 ${card.url}`);
        });
      }
    } else {
      console.log('❌ Failed or no carousel data');
    }

  } catch (error) {
    console.error('ERROR:', error);
  }
}

testDammamTours();