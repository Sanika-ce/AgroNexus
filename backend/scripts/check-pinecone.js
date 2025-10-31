// check-pinecone.js
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function checkDatabase() {
  console.log('🔍 Checking Pinecone database...');
  
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.Index(process.env.PINECONE_INDEX_NAME);

  try {
    // Get some sample vectors to see what's stored
    const stats = await index.describeIndexStats();
    console.log('📊 Database Stats:', stats);
    
    // Try to query with a test question
    const testQuery = await index.query({
      vector: Array(1024).fill(0.1), // Simple test vector
      topK: 3,
      includeMetadata: true,
    });
    
    console.log('\n🔎 Sample stored content:');
    if (testQuery.matches && testQuery.matches.length > 0) {
      testQuery.matches.forEach((match, i) => {
        console.log(`\n--- Chunk ${i + 1} ---`);
        console.log('Text:', match.metadata?.text?.substring(0, 200) + '...');
        console.log('Score:', match.score);
      });
    } else {
      console.log('❌ No data found in database!');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkDatabase();