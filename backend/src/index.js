// index.js - FINAL WORKING VERSION
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
// const MaharashtraMarketPrices = require('./market-prices.js');
// const marketPrices = new MaharashtraMarketPrices();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use('/chatbot', express.static(path.join(__dirname, '../../chatbot')));
// app.use(express.static(path.join(__dirname, '../../frontend')));
// app.use('/src', express.static(path.join(__dirname, '../../frontend/src')));

// Initialize Pinecone
let index;
try {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  index = pc.Index(process.env.PINECONE_INDEX_NAME);
  console.log('✅ Pinecone connected successfully');
} catch (error) {
  console.error('❌ Pinecone connection failed:', error.message);
  process.exit(1);
}

// Hugging Face configuration for embeddings
const HF_EMBEDDING_URL = 'https://api-inference.huggingface.co/models/intfloat/multilingual-e5-large';
const HF_HEADERS = { 'Authorization': `Bearer ${process.env.HF_API_KEY}` };

// Helper function to get embeddings
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

// INTENT RECOGNITION ENGINE
function analyzeIntent(question, matches) {
    const lowerQuestion = question.toLowerCase().trim();
    const intent = {
        type: 'agricultural_query',
        confidence: 1.0,
        subType: 'general',
        entities: {
            crops: [],
            regions: [],
            practices: [],
            languages: detectLanguage(question)
        }
    };

    // Language Detection
    function detectLanguage(text) {
        const hindiRegex = /[\u0900-\u097F]/;
        const marathiRegex = /[\u0900-\u097F]/; // Shares Devanagari
        const bengaliRegex = /[\u0980-\u09FF]/;
        const tamilRegex = /[\u0B80-\u0BFF]/;
        const teluguRegex = /[\u0C00-\u0C7F]/;
        
        if (hindiRegex.test(text)) return 'hindi';
        if (bengaliRegex.test(text)) return 'bengali';
        if (tamilRegex.test(text)) return 'tamil';
        if (teluguRegex.test(text)) return 'telugu';
        return 'english';
    }

    // Basic Conversation Intent
    const basicPatterns = [
        /^(hi|hello|hey|namaste|नमस्ते|हैलो)/i,
        /^(thanks|thank you|धन्यवाद|शुक्रिया)/i,
        /^(bye|goodbye)/i,
        /^(how are you)/i
    ];
    
    if (basicPatterns.some(pattern => pattern.test(lowerQuestion))) {
        intent.type = 'basic_conversation';
        intent.confidence = 0.95;
        return intent;
    }

    // Out-of-Domain Detection
    const outOfDomainPatterns = [
        /weather|temperature|forecast/i,
        /joke|funny|entertainment/i,
        /sports|movie|music/i,
        /politics|election|minister/i,
        /technology|computer|software/i
    ];
    
    if (outOfDomainPatterns.some(pattern => pattern.test(lowerQuestion))) {
        intent.type = 'out_of_domain';
        intent.confidence = 0.9;
        return intent;
    }

    // Agricultural Sub-Intent Classification
    const agriculturalCategories = {
        crops_seasons: [/crop|फसल|पीक|বীজ|பயிர்|పంట|rabi|kharif|zaid|season|मौसम/i],
        soil_health: [/soil|मृदा|माती|মাটি|மண்|న ch|health|fertili[zs]er|खत|সার|உரம்|ఎరువు/i],
        pest_management: [/pest|कीट|कीड़ा|কীট|பூச்சி|కీటకం|disease|रोग|রোগ|நோய்|వ్యాధి|control|नियंत्रण/i],
        irrigation_water: [/water|पाणी|জল|நீர்|నీరు|irrigation|सिंचन|সেচ|பாசனம்|నీటిపారుదల|drip|sprinkler/i],
        government_schemes: [/government|सरकार|সরকার|அரசு|ప్రభుత్వం|scheme|योजना|স্কিম|திட்டம்|యోజన|subsidy|भत्ता/i],
        market_economics: [/market|बाजार|বাজার|சந்தை|మార్కెట్|price|कीमत|দাম|விலை|ధర|profit|मुनाफा|লাভ|லாபం|లాభం/i],
        organic_farming: [/organic|जैविक|সেন্দ্ৰিয়|சேதன|సేంద్రీయ|natural|प्राकृतिक|স্বাভাবিক|இயற்கை|సహజ/i]
    };

    for (const [category, patterns] of Object.entries(agriculturalCategories)) {
        if (patterns.some(pattern => pattern.test(lowerQuestion))) {
            intent.subType = category;
            intent.confidence = 0.85;
            break;
        }
    }

    // Entity Extraction
    const regions = ['maharashtra', 'madhya pradesh', 'up', 'punjab', 'haryana', 'karnataka', 'tamil nadu'];
    const detectedRegions = regions.filter(region => lowerQuestion.includes(region));
    if (detectedRegions.length > 0) {
        intent.entities.regions = detectedRegions;
    }

    return intent;
}

// CONTEXT MEMORY SYSTEM
class ConversationMemory {
    constructor() {
        this.sessions = new Map();
        this.maxSessionAge = 30 * 60 * 1000; // 30 minutes
    }

    getSession(sessionId) {
        this.cleanup();
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                history: [],
                context: {},
                lastActivity: Date.now()
            });
        }
        return this.sessions.get(sessionId);
    }

    addMessage(sessionId, role, content, intent) {
        const session = this.getSession(sessionId);
        session.history.push({ role, content, intent, timestamp: Date.now() });
        session.lastActivity = Date.now();
        
        // Update context based on conversation
        if (intent.entities.regions.length > 0) {
            session.context.region = intent.entities.regions[0];
        }
        if (intent.subType) {
            session.context.lastTopic = intent.subType;
        }
    }

    getContext(sessionId) {
        const session = this.getSession(sessionId);
        return session.context;
    }

    cleanup() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivity > this.maxSessionAge) {
                this.sessions.delete(sessionId);
            }
        }
    }
}

const conversationMemory = new ConversationMemory();

// ADAPTIVE RESPONSE GENERATOR
async function generateAdaptiveAnswer(question, matches, sessionId = 'default') {
    const intent = analyzeIntent(question, matches);
    const context = conversationMemory.getContext(sessionId);
    
    console.log('🎯 Detected Intent:', intent);
    console.log('📋 Conversation Context:', context);

    // Store in memory
    conversationMemory.addMessage(sessionId, 'user', question, intent);

    // Handle different intent types
    switch (intent.type) {
        case 'basic_conversation':
            return handleBasicConversation(question);
            
        case 'out_of_domain':
            return handleOutOfDomainQuery(question, context);
            
        case 'agricultural_query':
            return handleAgriculturalQuery(question, matches, intent, context);
            
        default:
            return handleGeneralQuery(question, matches, context);
    }
}

function handleOutOfDomainQuery(question, context) {
    const gracefulResponses = [
        "I specialize in agricultural topics like crops, soil, and farming practices. Would you like to ask about farming instead?",
        "As an agricultural assistant, I'm best at helping with farming questions. Try asking about crops, irrigation, or government schemes!",
        "I focus on agricultural guidance. Perhaps you'd like to know about crop seasons, pest control, or farming techniques?"
    ];
    
    return gracefulResponses[Math.floor(Math.random() * gracefulResponses.length)];
}

async function handleAgriculturalQuery(question, matches, intent, context) {
    // Use context to enhance responses
    let contextualEnhancement = '';
    if (context.region) {
        contextualEnhancement = `\n\n🌍 **Regional Context**: Since you mentioned ${context.region}, consider local agricultural offices for specific guidance.`;
    }

    // Filter matches by intent
    const intentMatches = matches.filter(match => 
        match.score > 0.7 && 
        match.metadata?.type === intent.subType
    );

    if (intentMatches.length > 0) {
        const bestMatch = intentMatches[0];
        const answerText = bestMatch.metadata?.content || bestMatch.metadata?.text;
        
        return `**${bestMatch.metadata?.title || 'Agricultural Information'}**\n\n${answerText}${contextualEnhancement}\n\n*Relevance: ${(bestMatch.score * 100).toFixed(1)}%*`;
    }

    // Fallback to contextual response with memory
    return generateContextualResponseWithMemory(question, intent, context);
}

function generateContextualResponseWithMemory(question, intent, context) {
    const baseResponse = generateContextualResponse(question.toLowerCase(), question);
    
    if (context.region) {
        return `${baseResponse}\n\n💡 **Regional Tip**: For ${context.region}-specific guidance, contact your local Krishi Vigyan Kendra.`;
    }
    
    if (context.lastTopic) {
        return `${baseResponse}\n\n🔗 **Related to your previous interest**: Would you like more details about ${context.lastTopic.replace('_', ' ')}?`;
    }
    
    return baseResponse;
}



// UPDATED generateAnswer FUNCTION
async function generateAnswer(question, matches, sessionId = 'default') {
    console.log('🎯 Using ENHANCED agricultural chatbot');
    console.log('📝 Question:', question);
    
    // Use the new adaptive system
    return await generateAdaptiveAnswer(question, matches, sessionId);
}

// STRICTER BASIC CONVERSATION DETECTION
function isPureBasicConversation(question) {
    const basicPhrases = [
        'hi', 'hello', 'hey', 'namaste', 'नमस्ते', 'हैलो', 'hola',
        'how are you', 'what\'s up', 'good morning', 'good evening', 
        'thanks', 'thank you', 'धन्यवाद', 'शुक्रिया', 'bye', 'goodbye',
        'ok', 'okay', 'yes', 'no', 'maybe'
    ];
    
    // Only match exact phrases or very short questions
    const words = question.split(' ');
    const isShort = words.length <= 2;
    const isExactMatch = basicPhrases.some(phrase => 
        question === phrase || question.startsWith(phrase + ' ') || question.endsWith(' ' + phrase)
    );
    
    return isShort && isExactMatch;
}

// BASIC CONVERSATION HANDLER
function isBasicConversation(question) {
    const basicPhrases = [
        'hi', 'hello', 'hey', 'namaste', 'नमस्ते', 'हैलो', 'hola',
        'how are you', 'what\'s up', 'good morning', 'good evening', 
        'thanks', 'thank you', 'धन्यवाद', 'शुक्रिया', 'bye', 'goodbye',
        'ok', 'okay', 'yes', 'no', 'maybe'
    ];
    return basicPhrases.some(phrase => question.includes(phrase));
}

function handleBasicConversation(question) {
    if (question.includes('hi') || question.includes('hello') || question.includes('hey') || question.includes('namaste') || question.includes('नमस्ते')) {
        return 'Hello! 👋 I\'m your agricultural assistant. Ask me about crops, farming, soil, irrigation, or government schemes!';
    }
    if (question.includes('how are you')) {
        return 'I\'m doing great! Ready to help with all your agricultural questions. What would you like to know?';
    }
    if (question.includes('thank') || question.includes('thanks') || question.includes('धन्यवाद')) {
        return 'You\'re welcome! 🌾 Feel free to ask more farming questions.';
    }
    if (question.includes('bye') || question.includes('goodbye')) {
        return 'Goodbye! 👋 Happy farming!';
    }
    return 'Hello! How can I assist with agriculture today?';
}

// CONTEXTUAL RESPONSE GENERATOR
function generateContextualResponse(lowerQuestion, originalQuestion) {
    // Market and economics
    if (lowerQuestion.includes('market') || lowerQuestion.includes('demand') || lowerQuestion.includes('price') || lowerQuestion.includes('profit') || 
        lowerQuestion.includes('बाजार') || lowerQuestion.includes('मागणी') || lowerQuestion.includes('किंमत')) {
        return `**Market Information**\n\nHigh-demand crops in India:\n• Basmati Rice (export demand)\n• Pulses - Chickpeas, Lentils (protein source)\n• Fruits & Vegetables - Tomato, Onion, Banana\n• Spices - Turmeric, Chili, Pepper\n• Medicinal Plants - Aloe Vera, Tulsi\n• Organic Produce (premium markets)\n\n💡 Check e-NAM portal for current prices and demand patterns.`;
    }
    
    // Crops and seasons
    if (lowerQuestion.includes('crop') || lowerQuestion.includes('rabi') || lowerQuestion.includes('kharif') || 
        lowerQuestion.includes('पीक') || lowerQuestion.includes('फसल') || lowerQuestion.includes('रबी') || lowerQuestion.includes('खरीप')) {
        return `**Seasonal Crops in India**\n\n🌾 Rabi (Winter - Oct to Dec):\n• Wheat, Barley, Mustard\n• Peas, Gram, Lentils\n• Requires cool weather & irrigation\n\n🌧️ Kharif (Monsoon - Jun to Jul):\n• Rice, Maize, Cotton\n• Soybean, Groundnut, Sugarcane\n• Depends on monsoon rains\n\n☀️ Zaid (Summer - Mar to Jun):\n• Watermelon, Muskmelon\n• Cucumber, Bitter gourd\n• Vegetables & Fruits`;
    }
    
    // Soil and fertilizers
    if (lowerQuestion.includes('soil') || lowerQuestion.includes('fertilizer') || lowerQuestion.includes('compost') || 
        lowerQuestion.includes('माती') || lowerQuestion.includes('खत') || lowerQuestion.includes('कंपोस्ट')) {
        return `**Soil Health & Fertilizers**\n\n🌱 Organic Manures:\n• Farmyard manure\n• Compost & Vermicompost\n• Green manure crops\n• Bio-fertilizers\n\n🔬 Soil Testing:\n• Get Soil Health Card every 2-3 years\n• Test for N-P-K nutrients\n• Check pH levels\n• Follow recommended fertilizer doses\n\n💡 Government provides free soil testing through Soil Health Card scheme.`;
    }
    
    // Pest and disease management
    if (lowerQuestion.includes('pest') || lowerQuestion.includes('disease') || lowerQuestion.includes('insect') || 
        lowerQuestion.includes('कीट') || lowerQuestion.includes('रोग') || lowerQuestion.includes('बुरशी')) {
        return `**Pest & Disease Management**\n\n🛡️ Prevention Methods:\n• Use resistant crop varieties\n• Practice crop rotation\n• Maintain proper plant spacing\n• Use biological controls\n\n🌿 Integrated Pest Management (IPM):\n• Cultural methods first\n• Biological controls (neem, trichoderma)\n• Chemical pesticides as last resort\n• Follow safety periods\n\n💡 Early detection and prevention are most effective.`;
    }
    
    // Irrigation and water
    if (lowerQuestion.includes('water') || lowerQuestion.includes('irrigation') || lowerQuestion.includes('drip') || 
        lowerQuestion.includes('पाणी') || lowerQuestion.includes('सिंचन') || lowerQuestion.includes('ड्रिप')) {
        return `**Water Management & Irrigation**\n\n💧 Efficient Methods:\n• Drip Irrigation (saves 30-50% water)\n• Sprinkler Systems (saves 25-35% water)\n• Rainwater Harvesting\n• Solar-powered pumps\n\n🌊 Government Support:\n• PMKSY scheme subsidies\n• Up to 55% subsidy for small farmers\n• Technical guidance available\n\n💡 Water conservation is crucial for sustainable farming.`;
    }
    
    // Government schemes
    if (lowerQuestion.includes('government') || lowerQuestion.includes('scheme') || lowerQuestion.includes('subsidy') || 
        lowerQuestion.includes('सरकार') || lowerQuestion.includes('योजना') || lowerQuestion.includes('भत्ता')) {
        return `**Government Agricultural Schemes**\n\n📋 Major Schemes:\n• PM-KISAN - ₹6000/year income support\n• PMKSY - Irrigation and water conservation\n• Soil Health Card - Free soil testing\n• Crop Insurance - Risk protection\n• Kisan Credit Card - Easy loans\n\n🏢 How to Apply:\n• Visit local agriculture office\n• Contact Krishi Vigyan Kendra (KVK)\n• Apply through Common Service Centers\n• Check farmer.gov.in for details`;
    }
    
    // Organic farming
    if (lowerQuestion.includes('organic') || lowerQuestion.includes('जैविक') || lowerQuestion.includes('सेंद्रिय')) {
        return `**Organic Farming**\n\n🌿 Organic Practices:\n• Natural fertilizers (compost, manure)\n• Biological pest control\n• Crop rotation and mixed cropping\n• No synthetic chemicals\n\n✅ Benefits:\n• Better soil health\n• Chemical-free food\n• Environment friendly\n• Premium market prices\n\n💡 Government provides organic certification support.`;
    }
    
    // Default agricultural assistance
    return `**Agricultural Assistance**\n\nI specialize in helping with:\n• Crop selection and cultivation\n• Soil health and fertilizers\n• Pest and disease control\n• Irrigation and water management\n• Government schemes and subsidies\n• Market information and prices\n\nFor "${originalQuestion}", I recommend:\n• Consulting local Krishi Vigyan Kendra (KVK)\n• Checking farmer.gov.in for schemes\n• Visiting local agriculture office\n• Getting soil testing done\n\nWhat specific aspect of farming can I help you with?`;
}

// TRANSLATION SYSTEM - FINAL VERSION
async function translateText(text, targetLanguage) {
    if (targetLanguage === 'english') {
        return text;
    }

    try {
        const languageCodes = {
            'hindi': 'hi', 'marathi': 'mr', 'bengali': 'bn',
            'tamil': 'ta', 'telugu': 'te', 'gujarati': 'gu'
        };

        const langCode = languageCodes[targetLanguage];
        if (!langCode) return text;

        // Handle long text by splitting
        if (text.length > 400) {
            const chunks = text.split(/\n\n+/);
            let translatedChunks = [];
            
            for (const chunk of chunks) {
                if (chunk.trim().length > 10) {
                    const translated = await translateChunk(chunk.trim(), langCode);
                    translatedChunks.push(translated || chunk);
                }
            }
            return translatedChunks.join('\n\n');
        }
        
        return await translateChunk(text, langCode);
    } catch (error) {
        console.log('Translation failed:', error.message);
        return text;
    }
}

async function translateChunk(text, langCode) {
    try {
        const response = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`,
            { timeout: 8000 }
        );
        
        if (response.data?.responseData?.translatedText) {
            const translated = response.data.responseData.translatedText;
            return translated.includes('QUERY LENGTH LIMIT') ? text : translated;
        }
    } catch (error) {
        console.log('MyMemory translation failed');
    }
    return text;
}

// === REPLACE YOUR EXISTING /api/chat ENDPOINT WITH THIS ===
app.post('/api/chat', async (req, res) => {
    try {
        const { message, language = 'english', sessionId = 'default' } = req.body;

        console.log('\n=== ENHANCED CHAT REQUEST ===');
        console.log('Question:', message);
        console.log('Language:', language);
        console.log('Session:', sessionId);

        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                error: 'Message is required',
                answer: "Please ask a question about agriculture."
            });
        }

        // Get embedding and query Pinecone
        console.log('🔍 Getting embedding...');
        const questionEmbedding = await getEmbedding(message);
        
        console.log('🔍 Querying Pinecone...');
        const queryResults = await index.query({
            vector: questionEmbedding,
            topK: 5, // Increased for better context
            includeMetadata: true,
        });

        console.log('📊 Found matches:', queryResults.matches.length);

        // Generate adaptive answer
        console.log('🤖 Generating adaptive answer...');
        const finalAnswer = await generateAnswer(message, queryResults.matches, sessionId);
        console.log('✅ Generated answer length:', finalAnswer.length);

        let translatedAnswer = finalAnswer;

        // Translate if needed
        if (language !== 'english') {
            console.log('🔄 Translating...');
            try {
                translatedAnswer = await translateText(finalAnswer, language);
                console.log('✅ Translated answer ready');
            } catch (error) {
                console.log('❌ Translation failed, using English');
            }
        }

        // Send enhanced response
        const responseData = { 
            answer: translatedAnswer,
            foundMatches: queryResults.matches.length,
            language: language,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        };
        
        res.json(responseData);

    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            answer: "I'm having trouble right now. Please try again in a moment."
        });
    }
});

// app.post('/api/market-prices', async (req, res) => {
//     try {
//         const { crop, market, action = 'single' } = req.body;
        
//         if (!crop) {
//             return res.status(400).json({ error: 'Crop name is required' });
//         }

//         let result;
        
//         if (action === 'compare') {
//             // Compare prices across multiple markets
//             const markets = req.body.markets || ['lasalgaon', 'pune', 'nagpur'];
//             result = await marketPrices.comparePrices(crop, markets);
//         } else if (action === 'suggest') {
//             // Get market suggestions for a crop
//             result = marketPrices.getMarketSuggestions(crop);
//         } else {
//             // Get single market price
//             const targetMarket = market || 'lasalgaon';
//             result = await marketPrices.getLivePrice(crop, targetMarket);
//         }

//         res.json(result);
        
//     } catch (error) {
//         console.error('Market price error:', error);
//         res.status(500).json({ 
//             error: 'Failed to fetch market prices',
//             message: error.message 
//         });
//     }
// });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Agricultural chatbot API is running!' });
});

// Root endpoint - serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/src/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`🌐 Frontend available at: http://localhost:${port}`);
  console.log(`🔧 API endpoints ready at: http://localhost:${port}/api/chat`);
});