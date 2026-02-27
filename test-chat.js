const axios = require('axios');

async function testChat() {
  try {
    const response = await axios.post('http://localhost:3001/api/chat', {
      message: "Show me popular tours in Dubai",
      session_id: "550e8400-e29b-41d4-a716-446655440000"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.tourCarousel) {
      console.log('\n🎠 TOUR CAROUSEL FOUND!');
      console.log('Cards count:', response.data.tourCarousel.cards?.length || 0);
      console.log('Title:', response.data.tourCarousel.title);
    } else {
      console.log('\n❌ No tour carousel in response');
    }

  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}

testChat();