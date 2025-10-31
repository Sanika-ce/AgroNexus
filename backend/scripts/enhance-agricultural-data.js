// enhance-agricultural-data.js
const fs = require('fs');
const path = require('path');

// Comprehensive agricultural knowledge base
const EXTENDED_AGRICULTURAL_KNOWLEDGE = [
    // CROPS AND SEASONS
    {
        title: "Winter Crops (Rabi Season)",
        content: "Rabi crops are winter crops sown in October-December and harvested in March-April. Major crops: Wheat, Barley, Mustard, Peas, Gram, Lentils, Chickpeas. These require cool weather for growth and irrigation for development.",
        type: "crops_seasons",
        source: "agricultural_knowledge",
        keywords: ["winter", "rabi", "wheat", "barley", "mustard", "harvest", "season", "october", "december", "march", "april"]
    },
    {
        title: "Summer Crops (Kharif Season)", 
        content: "Kharif crops are monsoon crops sown with the onset of rains in June-July and harvested in September-October. Major crops: Rice, Maize, Cotton, Soybean, Groundnut, Sugarcane, Turmeric. These depend heavily on monsoon rains.",
        type: "crops_seasons",
        source: "agricultural_knowledge",
        keywords: ["summer", "kharif", "monsoon", "rice", "maize", "cotton", "rainy", "june", "july", "september", "october"]
    },

    // MARKET DEMAND AND ECONOMICS
    {
        title: "High Demand Crops in Indian Market",
        content: "Crops with consistently high market demand in India: Basmati Rice (export demand), Wheat (staple food), Pulses (protein source), Fruits & Vegetables (daily consumption), Spices (turmeric, chili for export), Medicinal Plants (growing demand), Organic Produce (premium markets). Market demand varies by region and season.",
        type: "market_economics",
        source: "agricultural_knowledge", 
        keywords: ["market demand", "high demand", "profitable", "price", "market", "economics", "business", "income"]
    },
    {
        title: "Export Oriented Crops",
        content: "Major export crops from India: Basmati Rice, Spices (turmeric, chili, pepper), Tea, Coffee, Cashew, Sugarcane products, Fruits (mango, banana), Vegetables (onion, potato). These have good international market demand and fetch premium prices.",
        type: "market_economics",
        source: "agricultural_knowledge",
        keywords: ["export", "international", "foreign", "premium", "price", "demand", "market"]
    },

    // FARMING PRACTICES
    {
        title: "Organic Farming Methods",
        content: "Organic farming avoids synthetic chemicals and uses natural methods: Crop rotation, green manure, compost, biological pest control, and mechanical cultivation. Benefits: Improves soil health, reduces pollution, and produces chemical-free food.",
        type: "farming_practices",
        source: "agricultural_knowledge",
        keywords: ["organic", "natural", "compost", "pest control", "soil health", "chemical-free"]
    },
    {
        title: "Crop Rotation Benefits",
        content: "Crop rotation involves growing different crops sequentially on the same land. Benefits: Prevents soil depletion, controls pests and diseases, improves soil structure, and increases fertility. Example: Rice-Wheat-Pulses rotation.",
        type: "farming_practices",
        source: "agricultural_knowledge",
        keywords: ["crop rotation", "soil fertility", "pest control", "sequential cropping", "rotation"]
    },

    // SOIL AND IRRIGATION
    {
        title: "Modern Irrigation Methods",
        content: "Efficient irrigation methods: Drip irrigation (water directly to roots), sprinkler systems (simulated rainfall), and subsurface irrigation. Benefits: Water conservation, reduced evaporation, and better crop yield.",
        type: "soil_irrigation",
        source: "agricultural_knowledge",
        keywords: ["irrigation", "drip", "sprinkler", "water conservation", "watering", "water management"]
    },
    {
        title: "Soil Preparation Techniques",
        content: "Proper soil preparation includes: Plowing to loosen soil, leveling for even water distribution, adding organic matter/compost, and soil testing for nutrient analysis. Different crops require different soil pH levels.",
        type: "soil_irrigation", 
        source: "agricultural_knowledge",
        keywords: ["soil preparation", "plowing", "compost", "soil testing", "pH", "fertilizer"]
    },

    // GOVERNMENT SCHEMES
    {
        title: "PMKSY - Per Drop More Crop",
        content: "Micro Irrigation component of PMKSY focuses on water use efficiency through drip and sprinkler irrigation. Subsidy: 55% for small farmers, 45% for others. Benefits: 30-50% water saving, 20-30% yield increase.",
        type: "government_schemes",
        source: "government_knowledge",
        keywords: ["pmksy", "irrigation", "subsidy", "water efficiency", "drip", "sprinkler", "government scheme"]
    },
    {
        title: "Soil Health Card Scheme",
        content: "Provides farmers with soil health cards every 3 years. Shows nutrient status and recommends appropriate fertilizer dosage. Helps in balanced fertilizer use and improved soil health.",
        type: "government_schemes", 
        source: "government_knowledge",
        keywords: ["soil health", "fertilizer", "nutrient", "government scheme", "soil card"]
    },

    // CROP SPECIFIC GUIDES
    {
        title: "Wheat Cultivation Guide",
        content: "Wheat is a major Rabi crop. Best soil: Well-drained loamy soil. Sowing: October-November. Harvesting: March-April. Water requirements: 4-6 irrigations. Major varieties: HD-2967, PBW-550, DBW-17. Average yield: 4-5 tons/hectare.",
        type: "crop_guides",
        source: "agricultural_knowledge",
        keywords: ["wheat", "cultivation", "rabi", "cereal", "staple", "food grain"]
    },
    {
        title: "Rice Cultivation Guide", 
        content: "Rice is a major Kharif crop. Best soil: Clayey loam with good water retention. Sowing: June-July. Harvesting: September-October. Water requirements: Standing water. Major varieties: Pusa Basmati, Samba Mahsuri. Average yield: 3-4 tons/hectare.",
        type: "crop_guides",
        source: "agricultural_knowledge",
        keywords: ["rice", "paddy", "kharif", "staple", "food grain", "basmati"]
    },

    // ADD MORE COMMON QUESTIONS
    {
        title: "Pest Control Methods",
        content: "Integrated Pest Management (IPM) includes: Cultural methods (crop rotation), biological control (natural predators), mechanical methods (traps), and chemical pesticides as last resort. Always follow recommended dosage and safety periods.",
        type: "farming_practices",
        source: "agricultural_knowledge",
        keywords: ["pest control", "insects", "diseases", "ipm", "pesticides", "crop protection"]
    },
    {
        title: "Fertilizer Management",
        content: "Balanced fertilizer use based on soil testing. Nitrogen (N), Phosphorus (P), Potassium (K) in right proportions. Organic fertilizers: Farmyard manure, compost. Inorganic: Urea, DAP, MOP. Split application improves efficiency.",
        type: "farming_practices",
        source: "agricultural_knowledge",
        keywords: ["fertilizer", "nutrients", "npk", "manure", "compost", "soil fertility"]
    }
];

// Add these modern farming topics to your knowledge base
const MODERN_FARMING_KNOWLEDGE = [
    {
        title: "Modern Farming Technology",
        content: "Modern farming technologies include: Precision agriculture using GPS and sensors, Drip irrigation for water efficiency, Solar powered systems, Drone technology for crop monitoring, Automated machinery, Mobile apps for market prices and weather updates, Soil testing kits, and Greenhouse farming. These technologies help increase yield, reduce costs, and make farming sustainable.",
        type: "modern_farming",
        source: "agricultural_knowledge",
        keywords: ["technology", "modern", "precision", "drone", "sensor", "automation", "digital", "smart farming"]
    },
    {
        title: "Digital Agriculture",
        content: "Digital agriculture uses technology like Mobile apps for crop advice, Weather forecasting apps, Online marketplaces for produce, E-NAM for online trading, Soil health mobile apps, Crop insurance apps, and Farmer helpline apps. Benefits include better decision making, access to real-time information, and direct market connectivity.",
        type: "modern_farming", 
        source: "agricultural_knowledge",
        keywords: ["digital", "mobile", "app", "online", "e-nam", "technology", "smartphone"]
    },
    {
        title: "Precision Farming",
        content: "Precision farming uses GPS, sensors and data analytics for: Site-specific crop management, Optimal fertilizer use, Efficient water management, Pest control targeting, Yield monitoring. This reduces input costs by 20-30% and increases yield by 15-25%.",
        type: "modern_farming",
        source: "agricultural_knowledge",
        keywords: ["precision", "gps", "sensor", "data", "analytics", "efficient", "smart"]
    }
];

function enhanceData() {
    const dataPath = path.join(__dirname, '../data/government-content.json');
    
    // Load existing data
    let existingData = [];
    try {
        existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log(`📁 Loaded ${existingData.length} existing chunks`);
    } catch (error) {
        console.log('No existing data found, creating new file');
    }

    // Process new agricultural knowledge
    let newChunks = [];
    EXTENDED_AGRICULTURAL_KNOWLEDGE.forEach(item => {
        // Split content into chunks if too long
        const content = item.content;
        const chunks = [];
        
        if (content.length > 500) {
            // Split into smaller chunks
            for (let i = 0; i < content.length; i += 500) {
                chunks.push(content.substring(i, i + 500));
            }
        } else {
            chunks.push(content);
        }
        
        chunks.forEach((chunk, index) => {
            newChunks.push({
                content: chunk,
                source: item.source,
                type: item.type,
                title: item.title,
                keywords: item.keywords,
                chunkIndex: index
            });
        });
    });

    // Combine data
    const enhancedData = [...existingData, ...newChunks];
    
    // Save enhanced data
    fs.writeFileSync(dataPath, JSON.stringify(enhancedData, null, 2));
    
    console.log(`✅ Enhanced data collection complete!`);
    console.log(`📊 Total chunks: ${enhancedData.length}`);
    console.log(`🏛️  Original data: ${existingData.length}`);
    console.log(`🌱 New agricultural knowledge: ${newChunks.length}`);
    console.log(`💾 Saved to: ${dataPath}`);
    
    return enhancedData;
}

enhanceData();

module.exports = { EXTENDED_AGRICULTURAL_KNOWLEDGE };