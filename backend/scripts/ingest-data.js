// ingest-data.js - UPDATED FOR COMPREHENSIVE KNOWLEDGE
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const HF_EMBEDDING_URL = 'https://api-inference.huggingface.co/models/intfloat/multilingual-e5-large';
const HF_HEADERS = { 'Authorization': `Bearer ${process.env.HF_API_KEY}` };

console.log('Starting comprehensive data ingestion...');

// Initialize Pinecone
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.Index(process.env.PINECONE_INDEX_NAME);

async function getEmbedding(text) {
  try {
    const response = await axios.post(
      HF_EMBEDDING_URL,
      { inputs: text },
      { headers: HF_HEADERS }
    );
    return response.data;
  } catch (error) {
    console.error('Embedding error:', error.response?.data || error.message);
    throw new Error('Failed to get embedding');
  }
}

async function main() {
  try {
    // LOAD COMPREHENSIVE AGRICULTURAL KNOWLEDGE INSTEAD OF GOVERNMENT DATA
    const comprehensivePath = path.join(__dirname, '../data/comprehensive-agricultural-knowledge.json');
    console.log(`Loading comprehensive agricultural knowledge from: ${comprehensivePath}`);
    
    // Check if comprehensive data exists, if not use fallback
    let rawData = [];
    
    if (fs.existsSync(comprehensivePath)) {
      rawData = JSON.parse(fs.readFileSync(comprehensivePath, 'utf8'));
      console.log(`✅ Loaded ${rawData.length} comprehensive agricultural knowledge entries`);
    } else {
      // Fallback to old data if comprehensive doesn't exist yet
      const fallbackPath = path.join(__dirname, '../data/government-content.json');
      console.log(`❌ Comprehensive data not found, using fallback: ${fallbackPath}`);
      rawData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      console.log(`⚠️ Loaded ${rawData.length} fallback entries`);
    }

    let successCount = 0;
    let errorCount = 0;

    // Process in batches to avoid rate limits
    const batchSize = 5; // Reduced for better reliability
    
    console.log(`🔄 Processing ${rawData.length} entries in batches of ${batchSize}...`);

    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(rawData.length/batchSize)}...`);

      const vectors = [];

      for (const [batchIndex, item] of batch.entries()) {
        const globalIndex = i + batchIndex;
        try {
          console.log(`  🔍 Getting embedding for: ${item.title?.substring(0, 50)}...`);
          const embedding = await getEmbedding(item.content || item.text || item);
          
          vectors.push({
            id: `agri-knowledge-${globalIndex}`,
            values: embedding,
            metadata: {
              text: item.content || item.text || item,
              title: item.title || 'Agricultural Knowledge',
              type: item.type || 'agricultural_knowledge',
              category: item.category || 'general',
              source: item.source || 'comprehensive_knowledge',
              keywords: item.keywords || [],
              chunkIndex: item.chunkIndex || 0
            }
          });

          successCount++;
          console.log(`  ✅ Processed: ${item.title}`);
        } catch (error) {
          console.error(`  ❌ Error processing item ${globalIndex}:`, error.message);
          errorCount++;
        }

        // Small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Upsert batch to Pinecone
      if (vectors.length > 0) {
        try {
          await index.upsert(vectors);
          console.log(`  ✅ Uploaded ${vectors.length} vectors to Pinecone`);
        } catch (error) {
          console.error('  ❌ Error uploading to Pinecone:', error.message);
          errorCount += vectors.length;
        }
      }
    }

    console.log('\n🎉 COMPREHENSIVE DATA INGESTION COMPLETE!');
    console.log(`✅ Successfully processed: ${successCount} knowledge entries`);
    console.log(`❌ Errors: ${errorCount} entries`);
    console.log(`📊 Total quality agricultural knowledge in database: ${successCount} vectors`);
    console.log(`🌱 Categories ingested: ${[...new Set(rawData.map(item => item.category))].join(', ')}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

main().catch(console.error);