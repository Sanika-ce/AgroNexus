// scrape-data.js - CORRECTED VERSION
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Target government agriculture websites + NEW agricultural sources
const TARGET_URLS = [
  // Your existing government sites
  'https://pmksy.gov.in/',
  'https://agriculture.gov.in/',
  'https://soilhealth.dac.gov.in/Home',
  
  // NEW: Agricultural knowledge websites
  'https://farmer.gov.in/',
  'https://www.ikisan.com/',
  'https://www.agrifarming.in/',
  'https://krishijagran.com/',
  'https://www.agriplexindia.com/learning-center'
];

// NEW: Agricultural knowledge base - add this even if scraping fails
const AGRICULTURAL_KNOWLEDGE = [
  {
    title: "Winter Crops (Rabi Season)",
    content: "Rabi crops are winter crops sown in October-December and harvested in March-April. Major crops: Wheat, Barley, Mustard, Peas, Gram, Lentils, Chickpeas. These require cool weather for growth and irrigation for development.",
    type: "crops_seasons",
    source: "agricultural_knowledge"
  },
  {
    title: "Summer Crops (Kharif Season)", 
    content: "Kharif crops are monsoon crops sown with the onset of rains in June-July and harvested in September-October. Major crops: Rice, Maize, Cotton, Soybean, Groundnut, Sugarcane, Turmeric. These depend heavily on monsoon rains.",
    type: "crops_seasons",
    source: "agricultural_knowledge"
  },
  {
    title: "Organic Farming Methods",
    content: "Organic farming avoids synthetic chemicals and uses natural methods: Crop rotation, green manure, compost, biological pest control, and mechanical cultivation. Benefits: Improves soil health, reduces pollution, and produces chemical-free food.",
    type: "farming_practices",
    source: "agricultural_knowledge"
  },
  {
    title: "Crop Rotation Benefits",
    content: "Crop rotation involves growing different crops sequentially on the same land. Benefits: Prevents soil depletion, controls pests and diseases, improves soil structure, and increases fertility. Example: Rice-Wheat-Pulses rotation.",
    type: "farming_practices",
    source: "agricultural_knowledge"
  },
  {
    title: "Modern Irrigation Methods",
    content: "Efficient irrigation methods: Drip irrigation (water directly to roots), sprinkler systems (simulated rainfall), and subsurface irrigation. Benefits: Water conservation, reduced evaporation, and better crop yield.",
    type: "soil_irrigation",
    source: "agricultural_knowledge"
  },
  {
    title: "Soil Preparation Techniques",
    content: "Proper soil preparation includes: Plowing to loosen soil, leveling for even water distribution, adding organic matter/compost, and soil testing for nutrient analysis. Different crops require different soil pH levels.",
    type: "soil_irrigation", 
    source: "agricultural_knowledge"
  },
  {
    title: "PMKSY - Per Drop More Crop",
    content: "Micro Irrigation component of PMKSY focuses on water use efficiency through drip and sprinkler irrigation. Subsidy: 55% for small farmers, 45% for others. Benefits: 30-50% water saving, 20-30% yield increase.",
    type: "government_schemes",
    source: "government_knowledge"
  },
  {
    title: "Soil Health Card Scheme",
    content: "Provides farmers with soil health cards every 3 years. Shows nutrient status and recommends appropriate fertilizer dosage. Helps in balanced fertilizer use and improved soil health.",
    type: "government_schemes", 
    source: "government_knowledge"
  }
];

async function scrapeWebsite(url) {
  try {
    console.log(`Scraping: ${url}`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script, style, nav, footer, header').remove();

    // Get clean text content
    let text = $('body').text();
    
    // Clean up the text
    text = text
      .replace(/\s+/g, ' ') // Replace multiple spaces/newlines
      .replace(/[^\w\s.,;:!?()-]/g, ' ') // Remove special characters
      .trim()
      .substring(0, 5000); // Limit length to avoid huge chunks

    return {
      content: text,
      source: url,
      type: 'scraped_website',
      title: url.split('/')[2] // Get domain name
    };

  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error.message);
    return null;
  }
}

function chunkText(text, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

// NEW: Process agricultural knowledge into chunks
function processAgriculturalKnowledge() {
  let knowledgeChunks = [];
  
  AGRICULTURAL_KNOWLEDGE.forEach(item => {
    const chunks = chunkText(item.content);
    chunks.forEach((chunk, index) => {
      knowledgeChunks.push({
        content: chunk,
        source: item.source,
        type: item.type,
        title: item.title,
        chunkIndex: index
      });
    });
  });
  
  return knowledgeChunks;
}

async function main() {
  console.log('Starting enhanced data scraping (Government + Agriculture)...');
  
  let allChunks = [];

  // 1. Scrape websites (your existing functionality)
  for (const url of TARGET_URLS) {
    const content = await scrapeWebsite(url);
    if (content && content.content) {
      const chunks = chunkText(content.content);
      const chunkObjects = chunks.map((chunk, index) => ({
        content: chunk,
        source: content.source,
        type: content.type,
        title: content.title,
        chunkIndex: index
      }));
      
      allChunks = [...allChunks, ...chunkObjects];
      console.log(`→ Got ${chunks.length} chunks from ${url}`);
    }
    
    // Be polite to servers
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 2. ADD AGRICULTURAL KNOWLEDGE (NEW)
  console.log('\n📚 Adding agricultural knowledge base...');
  const agriculturalChunks = processAgriculturalKnowledge();
  allChunks = [...allChunks, ...agriculturalChunks];
  console.log(`→ Added ${agriculturalChunks.length} agricultural knowledge chunks`);

  // FIXED: Correct path to data folder
  const outputPath = path.join(__dirname, '../data', 'government-content.json');
  
  // Ensure data directory exists
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save to file
  fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2));
  
  console.log(`\n✅ ENHANCED DATA COLLECTION COMPLETE!`);
  console.log(`📊 Total chunks: ${allChunks.length}`);
  console.log(`🏛️  Government websites: ${allChunks.filter(c => c.type === 'scraped_website').length}`);
  console.log(`🌱 Agricultural knowledge: ${allChunks.filter(c => c.type !== 'scraped_website').length}`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log('\nNext step: Run "node scripts/ingest-data.js" to add this content to Pinecone');
}

main().catch(console.error);