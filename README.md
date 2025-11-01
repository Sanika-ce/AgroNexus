# 🌾 AgroNexus - Smart Agriculture Portal

Final Year Project - A comprehensive agriculture platform with AI-powered assistance and direct market access.

## 🚀 Features

### ✅ Implemented
- **User Authentication** (Login/Register)
- **Agriculture AI Chatbot** - Powered by NLP and machine learning
- **Crop Prediction System**
- **Weather Information**
- **News Portal**
- **Marketplace Backend API** (In Progress)

### 🚧 In Progress
- **Direct Market Access** - Farmers can list and sell produce directly
- **Product Listings & Orders**
- **Farmer-Buyer Communication**

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Responsive Design

### Backend
- Node.js + Express
- SQLite Database
- Hugging Face Transformers (AI Chatbot)

### APIs & Services
- Custom Agriculture Chatbot API
- Marketplace REST API
- Weather Data Integration

## 📁 Project Structure
AgroNexus/
├── backend/ # Node.js server
│ ├── src/ # Server source code
│ ├── data/ # Database files
│ └── scripts/ # Utility scripts
├── chatbot/ # AI chatbot frontend
├── images/ # Assets
└── *.html # Main application pages


## 🏃‍♂️ Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   npm start

Access the application:

Main Portal: http://localhost:3000

Chatbot: http://localhost:3000/chatbot

Marketplace: http://localhost:3000/marketplace.html

🔧 API Endpoints
GET /api/market/health - Marketplace API status

GET /api/market/products - Get all products

POST /api/chat - AI Chatbot endpoint

👨‍💻 Development Team
[Sanika Aher] - AI Chatbot & Marketplace

[Asmita Bhadane, Prerna Patil] - Frontend & UI Design + agricultural services such as crop prediction, etc.