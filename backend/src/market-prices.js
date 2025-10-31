// market-prices.js - Maharashtra Market Price System
const axios = require('axios');

class MaharashtraMarketPrices {
    constructor() {
        this.baseURL = 'https://enam.gov.in/webapi/api/CommonAPI';
        this.maharashtraMarkets = this.getMaharashtraMarkets();
        this.maharashtraCrops = this.getMaharashtraCrops();
    }

    // Maharashtra-specific agricultural markets
    getMaharashtraMarkets() {
        return {
            // Major markets for price data
            'lasalgaon': { id: '536', name: 'Lasalgaon', district: 'Nashik', specialty: 'Onion' },
            'pune': { id: '519', name: 'Pune', district: 'Pune', specialty: 'General' },
            'nagpur': { id: '527', name: 'Nagpur', district: 'Nagpur', specialty: 'Orange, Cotton' },
            'amravati': { id: '501', name: 'Amravati', district: 'Amravati', specialty: 'Cotton, Soybean' },
            'nashik': { id: '525', name: 'Nashik', district: 'Nashik', specialty: 'Grapes, Onion' },
            'jalgaon': { id: '515', name: 'Jalgaon', district: 'Jalgaon', specialty: 'Banana, Cotton' },
            'kolhapur': { id: '518', name: 'Kolhapur', district: 'Kolhapur', specialty: 'Sugarcane' },
            'solapur': { id: '533', name: 'Solapur', district: 'Solapur', specialty: 'Pomegranate' },
            'latur': { id: '522', name: 'Latur', district: 'Latur', specialty: 'Pulses' },
            'akola': { id: '499', name: 'Akola', district: 'Akola', specialty: 'Cotton' },
            'aurangabad': { id: '503', name: 'Aurangabad', district: 'Aurangabad', specialty: 'General' },
            'yavatmal': { id: '540', name: 'Yavatmal', district: 'Yavatmal', specialty: 'Cotton' },
            'sangli': { id: '531', name: 'Sangli', district: 'Sangli', specialty: 'Grapes, Turmeric' },
            'satara': { id: '532', name: 'Satara', district: 'Satara', specialty: 'Potato' },
            'thane': { id: '535', name: 'Thane', district: 'Thane', specialty: 'Rice, Fruits' }
        };
    }

    // Maharashtra-specific crops with commodity codes
    getMaharashtraCrops() {
        return {
            // Food Grains
            'jowar': { id: '11', name: 'Jowar', marathi: 'ज्वारी', category: 'foodgrains' },
            'bajra': { id: '4', name: 'Bajra', marathi: 'बाजरी', category: 'foodgrains' },
            'rice': { id: '21', name: 'Rice', marathi: 'तांदूळ', category: 'foodgrains' },
            'wheat': { id: '24', name: 'Wheat', marathi: 'गहू', category: 'foodgrains' },
            'maize': { id: '8', name: 'Maize', marathi: 'मका', category: 'foodgrains' },
            
            // Pulses
            'tur': { id: '17', name: 'Tur/Arhar', marathi: 'तूर', category: 'pulses' },
            'chana': { id: '3', name: 'Chana', marathi: 'हरभरा', category: 'pulses' },
            'moong': { id: '10', name: 'Moong', marathi: 'मूग', category: 'pulses' },
            'udid': { id: '23', name: 'Urad', marathi: 'उडीद', category: 'pulses' },
            
            // Cash Crops
            'cotton': { id: '6', name: 'Cotton', marathi: 'कापूस', category: 'cashcrops' },
            'sugarcane': { id: '22', name: 'Sugarcane', marathi: 'ऊस', category: 'cashcrops' },
            'soybean': { id: '20', name: 'Soybean', marathi: 'सोयाबीन', category: 'cashcrops' },
            'groundnut': { id: '7', name: 'Groundnut', marathi: 'भुईमूग', category: 'cashcrops' },
            'sunflower': { id: '41', name: 'Sunflower', marathi: 'सूर्यफूल', category: 'cashcrops' },
            
            // Vegetables
            'onion': { id: '13', name: 'Onion', marathi: 'कांदा', category: 'vegetables' },
            'tomato': { id: '47', name: 'Tomato', marathi: 'टोमॅटो', category: 'vegetables' },
            'potato': { id: '15', name: 'Potato', marathi: 'बटाटा', category: 'vegetables' },
            'brinjal': { id: '37', name: 'Brinjal', marathi: 'वांगे', category: 'vegetables' },
            
            // Fruits
            'grapes': { id: '84', name: 'Grapes', marathi: 'द्राक्षे', category: 'fruits' },
            'pomegranate': { id: '85', name: 'Pomegranate', marathi: 'डाळिंब', category: 'fruits' },
            'orange': { id: '83', name: 'Orange', marathi: 'संत्रा', category: 'fruits' },
            'banana': { id: '82', name: 'Banana', marathi: 'केळी', category: 'fruits' },
            'mango': { id: '12', name: 'Mango', marathi: 'आंबा', category: 'fruits' }
        };
    }

    async getLivePrice(crop, market = 'lasalgaon') {
        try {
            const cropInfo = this.maharashtraCrops[crop.toLowerCase()];
            const marketInfo = this.maharashtraMarkets[market.toLowerCase()];
            
            if (!cropInfo) {
                throw new Error(`Crop '${crop}' not found in Maharashtra database`);
            }
            
            if (!marketInfo) {
                throw new Error(`Market '${market}' not found in Maharashtra`);
            }

            // Simulated API call - we'll replace with actual e-NAM API
            const mockPrice = this.getMockPrice(crop, market);
            
            return {
                crop: cropInfo.name,
                cropMarathi: cropInfo.marathi,
                market: marketInfo.name,
                district: marketInfo.district,
                price: mockPrice,
                unit: 'Quintal',
                lastUpdated: new Date().toISOString(),
                marketSpecialty: marketInfo.specialty,
                category: cropInfo.category
            };
            
        } catch (error) {
            console.error('Error fetching market price:', error);
            throw error;
        }
    }

    // Mock data generator - Replace with actual e-NAM API
    getMockPrice(crop, market) {
        const basePrices = {
            'onion': { min: 800, max: 2500, volatility: 'high' },
            'cotton': { min: 5500, max: 7500, volatility: 'medium' },
            'soybean': { min: 3500, max: 5500, volatility: 'medium' },
            'sugarcane': { min: 280, max: 350, volatility: 'low' },
            'grapes': { min: 2000, max: 5000, volatility: 'high' },
            'pomegranate': { min: 3000, max: 6000, volatility: 'medium' },
            'jowar': { min: 1800, max: 2800, volatility: 'low' },
            'rice': { min: 1500, max: 2500, volatility: 'low' },
            'wheat': { min: 1600, max: 2200, volatility: 'low' },
            'tomato': { min: 500, max: 2000, volatility: 'high' },
            'potato': { min: 800, max: 1500, volatility: 'medium' },
            'banana': { min: 1000, max: 2000, volatility: 'low' },
            'tur': { min: 4500, max: 6500, volatility: 'medium' },
            'chana': { min: 4000, max: 5500, volatility: 'medium' },
            'maize': { min: 1200, max: 1800, volatility: 'low' },
            'groundnut': { min: 4500, max: 6000, volatility: 'medium' },
            'sunflower': { min: 4000, max: 5500, volatility: 'medium' },
            'bajra': { min: 1500, max: 2200, volatility: 'low' },
            'moong': { min: 5000, max: 7000, volatility: 'high' },
            'orange': { min: 2000, max: 4000, volatility: 'medium' },
            'mango': { min: 1500, max: 4000, volatility: 'high' },
            'brinjal': { min: 800, max: 2000, volatility: 'medium' }
        };

        const priceRange = basePrices[crop] || { min: 1000, max: 3000, volatility: 'medium' };
        const price = Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) + priceRange.min;
        
        return price;
    }

    async comparePrices(crop, markets = ['lasalgaon', 'pune', 'nagpur']) {
        const prices = [];
        
        for (const market of markets) {
            try {
                const priceData = await this.getLivePrice(crop, market);
                prices.push(priceData);
            } catch (error) {
                console.error(`Error getting price for ${market}:`, error);
            }
        }
        
        // Sort by price (highest first)
        prices.sort((a, b) => b.price - a.price);
        
        return {
            crop: this.maharashtraCrops[crop].name,
            comparison: prices,
            bestMarket: prices[0]?.market,
            bestPrice: prices[0]?.price,
            priceRange: {
                min: prices[prices.length - 1]?.price,
                max: prices[0]?.price,
                difference: prices[0]?.price - prices[prices.length - 1]?.price
            }
        };
    }

    getMarketSuggestions(crop) {
        const cropInfo = this.maharashtraCrops[crop.toLowerCase()];
        if (!cropInfo) return [];
        
        const suggestions = [];
        
        for (const [marketKey, marketInfo] of Object.entries(this.maharashtraMarkets)) {
            if (marketInfo.specialty.toLowerCase().includes(cropInfo.name.toLowerCase()) ||
                cropInfo.name.toLowerCase().includes(marketInfo.specialty.toLowerCase())) {
                suggestions.push(marketInfo);
            }
        }
        
        return suggestions.length > 0 ? suggestions : Object.values(this.maharashtraMarkets).slice(0, 3);
    }
}

module.exports = MaharashtraMarketPrices;